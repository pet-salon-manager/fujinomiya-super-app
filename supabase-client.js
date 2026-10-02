(() => {
  const cfg = window.FM_CONFIG || {};
  const url = String(cfg.SUPABASE_URL || '').trim();
  const key = String(cfg.SUPABASE_ANON_KEY || '').trim();
  const configured = Boolean(url && key && window.supabase?.createClient);

  let client = null;
  if (configured) {
    client = window.supabase.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  window.FM_DB = { configured, client };
})();
