/* auth.js — lógica de autenticação via Supabase */

const Auth = {
  async signUp({ email, password, fullName, username }) {
    const { data, error } = await window.sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, username } }
    });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await window.sb
        .from('profiles')
        .insert({
          id:        data.user.id,
          username,
          full_name: fullName,
        });
      if (profileError && profileError.code !== '23505') throw profileError;
    }
    return data;
  },

  async signIn({ email, password }) {
    const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await window.sb.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data } = await window.sb.auth.getSession();
    return data.session;
  },

  async getUser() {
    const { data } = await window.sb.auth.getUser();
    return data.user;
  },

  async getProfile(userId) {
    const { data, error } = await window.sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async getProfileByUsername(username) {
    const { data, error } = await window.sb
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId, updates) {
    const { data, error } = await window.sb
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  onAuthChange(callback) {
    return window.sb.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  }
};

window.Auth = Auth;
