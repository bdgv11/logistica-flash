// Resolves a shortened Google Maps / Waze share link (maps.app.goo.gl/xxx,
// waze.com/ul/xxx — the default a phone's "Share location" button produces)
// to the full URL it redirects to. js/app.js can only read coordinates out
// of a link's own text (extractLatLng() never fetches anything), and a
// shortened link carries no coordinates at all, just an opaque code — this
// follows the redirect once, at save time, so what actually gets stored is
// the long link with real coordinates in it. Deployed with Supabase's
// default JWT verification — only a signed-in app user can call this — so
// there's no auth code here beyond that.
//
// Unlike optimize-route, this needs no Google Cloud account, API key, or
// billing at all: it's a plain public HTTP redirect follow, nothing
// Google-specific about the code itself.

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

// This function fetches whatever URL it's handed — without an allowlist
// it'd be an open "fetch any URL from our server" proxy for anyone with a
// session in the app. Restricted to the actual Google Maps / Waze
// shortener + map hosts this is meant for.
const ALLOWED_HOSTS = new Set([
  'maps.app.goo.gl', 'goo.gl', 'g.co',
  'google.com', 'www.google.com', 'maps.google.com',
  'waze.com', 'www.waze.com', 'ul.waze.com',
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  let url: unknown;
  try {
    const payload = await req.json();
    url = payload.url;
  } catch {
    return json({ error: 'Cuerpo de la solicitud inválido — se esperaba JSON.' }, 400);
  }
  if (typeof url !== 'string' || !url.trim()) {
    return json({ error: 'Se espera { url: "..." }.' }, 400);
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return json({ error: 'Ese texto no es un link válido.' }, 400);
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return json({ error: 'Solo se aceptan links http(s).' }, 400);
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return json({ error: `Este servicio solo resuelve links de Google Maps o Waze (recibido: ${parsed.hostname}).` }, 400);
  }

  try {
    // fetch() follows redirects by default and exposes the final landing
    // URL as response.url — no manual Location-header juggling needed. The
    // body (the destination page's HTML) isn't used at all, only the URL it
    // landed on, so it's cancelled immediately instead of being read.
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    res.body?.cancel();
    return json({ resolvedUrl: res.url });
  } catch (err) {
    return json({ error: 'No se pudo seguir ese link: ' + String((err as Error)?.message || err) }, 502);
  }
});
