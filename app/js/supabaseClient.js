window.LF = window.LF || {};

(function () {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG || {};
  if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR-PROJECT-REF')) {
    console.warn('Logística Flash: config.js still has placeholder Supabase credentials. Edit js/config.js before using the app.');
  }
  LF.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
