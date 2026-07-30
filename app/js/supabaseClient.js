window.LF = window.LF || {};

// Nothing in here is allowed to throw. Every failure mode used to end as a
// blank page or an endless "Cargando…": if the CDN script was missing,
// `window.supabase.createClient` threw a TypeError before app.js ever ran, and
// unconfigured credentials only produced a console warning nobody sees. Now we
// record what went wrong in LF.setupError so boot() can put it on screen with
// a retry button.
(function () {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG || {};

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    LF.setupError = 'No se pudo cargar la librería de Supabase. La app la descarga de un CDN (cdn.jsdelivr.net), así que revisa tu conexión a internet o si alguna red o bloqueador la está bloqueando.';
    return;
  }

  const missing = !SUPABASE_URL || !SUPABASE_ANON_KEY;
  const placeholder = String(SUPABASE_URL).includes('YOUR-PROJECT-REF') || String(SUPABASE_ANON_KEY).includes('YOUR-ANON');
  if (missing || placeholder) {
    LF.setupError = 'Falta configurar las credenciales de Supabase en js/config.js (SUPABASE_URL y SUPABASE_ANON_KEY). Ver SETUP.md, paso 4.';
    return;
  }

  try {
    LF.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    LF.setupError = 'No se pudo inicializar la conexión con Supabase: ' + ((err && err.message) || 'error desconocido');
  }
})();
