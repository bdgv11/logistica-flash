// Optimizes the visiting order of a mensajero's stops using Google's Routes
// API (real streets, not the straight-line fallback js/app.js already uses
// when this isn't configured or fails). Deployed with Supabase's default JWT
// verification — only a signed-in app user can call this — so there's no
// auth code here beyond that.
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

// Google's Routes API caps the total origin+destination+intermediates at
// 25 waypoints. Reject early with a clear message instead of forwarding a
// too-large request and surfacing Google's raw (much less clear) error.
const MAX_STOPS = 23;

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
    return json({ error: `Esta ruta tiene ${stops.length} paradas — Google Routes API solo optimiza hasta ${MAX_STOPS} a la vez. Dividí la ruta en grupos más pequeños.` }, 400);
  }

  // No fixed final destination for a delivery route — only the order of the
  // intermediate stops matters, not the return leg — so origin and
  // destination are the same point. Google only reorders `intermediates`.
  const routesBody = {
    origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
    destination: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
    intermediates: stops.map((s) => ({ location: { latLng: { latitude: s.lat, longitude: s.lng } } })),
    travelMode: 'DRIVE',
    optimizeWaypointOrder: true,
  };

  let res: Response;
  try {
    res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // Routes API requires an explicit field mask — the default response
        // is otherwise huge (full turn-by-turn geometry we don't need).
        'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex',
      },
      body: JSON.stringify(routesBody),
    });
  } catch (err) {
    return json({ error: 'No se pudo contactar la Routes API de Google: ' + String((err as Error)?.message || err) }, 502);
  }

  if (!res.ok) {
    const errText = await res.text();
    return json({ error: `Google Routes API respondió ${res.status}: ${errText}` }, 502);
  }

  const data = await res.json();
  const order = data?.routes?.[0]?.optimizedIntermediateWaypointIndex;
  if (!Array.isArray(order)) {
    return json({ error: 'Google no devolvió un orden optimizado para estos puntos.' }, 502);
  }

  return json({ order });
});
