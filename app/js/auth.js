window.LF = window.LF || {};

LF.auth = {
  async getSession() {
    const { data, error } = await LF.supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(callback) {
    const { data } = LF.supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return data.subscription;
  },

  async signIn(email, password) {
    const { data, error } = await LF.supabase.auth.signInWithPassword({ email, password });
    if (error) return { session: null, error };
    return { session: data.session, error: null };
  },

  async signOut() {
    await LF.supabase.auth.signOut();
  },
};
