// Orders a mensajero's stops from nearest to farthest — by real road
// distance from their starting point (Google's Routes API), not the
// straight-line fallback js/app.js already uses when this isn't configured
// or fails. Deployed with Supabase's default JWT verification — only a
// signed-in app user can call this — so there's no auth code here beyond
// that.
//
// This is a plain nearest-to-farthest sort *from the origin point*, not a
// full route optimization: the mensajero starts at their origin, visits
// stops in that order, and doesn't need to come back through them — the
// farthest stop is the last one, and whatever's left is just the trip home,
// not part of the delivery route. That's what was actually asked for, and
// it's also a much simpler (and cheaper) Google API call than solving "best
// loop through every stop and back" would be: one Route Matrix request (one
// origin, N destinations) instead of a waypoint-optimized route.
//
// Required secret: GOOGLE_MAPS_API_KEY (a Google Cloud API key with the
// Routes API enabled). Set it with:
//   supabase secrets set GOOGLE_MAPS_API_KEY=xxxxx
// See SETUP.md for the full walkthrough (Google Cloud project, enabling the
// API, deploying this function).

// '*' by default so this works out of the box before anyone's picked a
// hosting domain — this endpoint is still gated by Supabase's JWT
// verification either way (a request needs a valid session token,
// regardless of origin), so this alone was never the access control. Set
// the ALLOWED_ORIGIN secret once you know your real domain to tighten it:
//   supabase secrets set ALLOWED_ORIGIN=https://tu-dominio.com
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

type LatLng = { lat: number; lng: number };

// A single origin against up to this many destinations keeps the request
// (origins × destinations elements) comfortably under Google's 625-element
// cap for this API — real routes for one mensajero's day are nowhere close
// to this, so it only exists to fail fast with a clear message instead of
// forwarding an unreasonably large request.
const MAX_STOPS = 100;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!apiKey) return json({ error: 'GOOGLE_MAPS_API_KEY no está configurada como secret de esta función.' }, 500);

  let origin: LatLng, stops: LatLng[];
  try {
    const payload = await req.json();
    origin = payload.origin;
    stops = payload.stops;
  } catch {
    return json({ error: 'Cuerpo de la solicitud inválido — se esperaba JSON.' }, 400);
  }

  const isLatLng = (v: unknown): v is LatLng =>
    !!v && typeof (v as LatLng).lat === 'number' && typeof (v as LatLng).lng === 'number';
  if (!isLatLng(origin) || !Array.isArray(stops) || stops.length === 0 || !stops.every(isLatLng)) {
    return json({ error: 'Se espera { origin: {lat,lng}, stops: [{lat,lng}, ...] }.' }, 400);
  }
  if (stops.length > MAX_STOPS) {
    return json({ error: `Esta ruta tiene ${stops.length} paradas — esta función solo maneja hasta ${MAX_STOPS} a la vez. Dividí la ruta en grupos más pequeños.` }, 400);
  }

  const matrixBody = {
    origins: [{ waypoint: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } } }],
    destinations: stops.map((s) => ({ waypoint: { location: { latLng: { latitude: s.lat, longitude: s.lng } } } })),
    travelMode: 'DRIVE',
  };

  let res: Response;
  try {
    res = await fetch('https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // Routes API requires an explicit field mask — the default response
        // is otherwise huge (full turn-by-turn geometry we don't need).
        'X-Goog-FieldMask': 'originIndex,destinationIndex,distanceMeters,condition',
      },
      body: JSON.stringify(matrixBody),
    });
  } catch (err) {
    return json({ error: 'No se pudo contactar la Routes API de Google: ' + String((err as Error)?.message || err) }, 502);
  }

  if (!res.ok) {
    const errText = await res.text();
    return json({ error: `Google Routes API respondió ${res.status}: ${errText}` }, 502);
  }

  type MatrixElement = { originIndex?: number; destinationIndex?: number; distanceMeters?: number; condition?: string };
  let elements: MatrixElement[];
  try {
    elements = await res.json();
  } catch {
    return json({ error: 'Google no devolvió una respuesta válida para la matriz de distancias.' }, 502);
  }
  if (!Array.isArray(elements) || elements.length !== stops.length) {
    return json({ error: 'Respuesta inválida del servicio de rutas.' }, 502);
  }

  const unreachable = elements.filter((el) => el.condition && el.condition !== 'ROUTE_EXISTS');
  if (unreachable.length > 0) {
    return json({ error: `Google no encontró una ruta por calle a ${unreachable.length} de las paradas — revisa esas ubicaciones.` }, 502);
  }

  // Nearest to farthest from the origin, by real road distance — not the
  // order Google happened to return the matrix elements in.
  const order = [...elements]
    .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0))
    .map((el) => el.destinationIndex ?? 0);

  return json({ order });
});
