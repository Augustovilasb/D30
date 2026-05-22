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
      .maybeSingle();
    if (error) { console.error('[D30] getProfile error:', error); throw error; }
    if (!data)  { console.warn('[D30] getProfile: nenhuma linha encontrada para', userId); }
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
    return window.sb.auth.onAuthStateChange((event, session) => {
      callback(event, session?.user ?? null);
    });
  },

  /* ── GDPR Art. 17 — Direito ao apagamento ─────────────────────────── */
  async deleteAccount(userId) {
    const tables = [
      ['forum_votes',         'user_id'],
      ['forum_activity',      'user_id'],
      ['study_sessions',      'user_id'],
      ['roadmap_progress',    'user_id'],
      ['palestra_attendance', 'user_id'],
      ['talk_rsvp',           'user_id'],
      ['speaker_suggestions', 'user_id'],
    ];

    for (const [table, col] of tables) {
      await window.sb.from(table).delete().eq(col, userId).then(() => {}).catch(() => {});
    }

    /* Anonimiza posts do fórum: preserva o conteúdo comunitário, remove identidade */
    await window.sb.from('forum_messages')
      .update({ author_name: '[usuário excluído]', author_id: null })
      .eq('author_id', userId).then(() => {}).catch(() => {});
    await window.sb.from('forum_topics')
      .update({ author_name: '[usuário excluído]', author_id: null })
      .eq('author_id', userId).then(() => {}).catch(() => {});

    /* Remove avatar do Storage */
    await window.sb.storage.from('avatars').remove([`${userId}.jpg`]).then(() => {}).catch(() => {});

    /* Exclui o perfil */
    await window.sb.from('profiles').delete().eq('id', userId).then(() => {}).catch(() => {});

    /* Exclui auth.users via endpoint server-side (service role) */
    try {
      const { data: { session } } = await window.sb.auth.getSession();
      if (session?.access_token) {
        await fetch('/api/delete-user', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
      }
    } catch {}

    /* Limpa localStorage */
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('d30_'))
        .forEach(k => localStorage.removeItem(k));
    } catch {}

    await window.sb.auth.signOut().catch(() => {});
  },

  /* ── GDPR Art. 20 — Portabilidade dos dados ───────────────────────── */
  async exportUserData(userId) {
    const [
      { data: profile },
      { data: sessions },
      { data: topics },
      { data: messages },
      { data: roadmap },
      { data: rsvp },
      { data: votes },
    ] = await Promise.all([
      window.sb.from('profiles').select('id,full_name,username,bio,profession,created_at').eq('id', userId).single(),
      window.sb.from('study_sessions').select('*').eq('user_id', userId),
      window.sb.from('forum_topics').select('id,title,tag,created_at').eq('author_id', userId),
      window.sb.from('forum_messages').select('id,text,created_at,topic_id').eq('author_id', userId),
      window.sb.from('roadmap_progress').select('course_id,created_at').eq('user_id', userId),
      window.sb.from('talk_rsvp').select('talk_id,created_at').eq('user_id', userId),
      window.sb.from('forum_votes').select('message_id,vote_type,created_at').eq('user_id', userId),
    ]);

    return {
      exported_at:  new Date().toISOString(),
      gdpr_basis:   'Art. 20 GDPR — Direito à portabilidade dos dados',
      profile:      profile  || {},
      study_sessions:    sessions  || [],
      forum_topics:      topics    || [],
      forum_messages:    messages  || [],
      roadmap_progress:  roadmap   || [],
      talk_rsvp:         rsvp      || [],
      forum_votes:       votes     || [],
    };
  },
};

window.Auth = Auth;
