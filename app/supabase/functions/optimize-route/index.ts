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

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

type LatLng = { lat: number; lng: number };

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
