/* db.js — unified data layer (Supabase primary, localStorage fallback) */

const DB = {

  /* ── Helpers ─────────────────────────────────────────────────────────── */

  _timeAgo(isoStr) {
    if (!isoStr) return '';
    const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
    if (diff < 60)    return 'agora';
    if (diff < 3600)  return Math.floor(diff / 60) + 'min atrás';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
    return Math.floor(diff / 86400) + 'd atrás';
  },

  _initials(name) {
    if (!name) return '?';
    return name.trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
  },

  _color(str) {
    const palette = ['#7c3aed','#059669','#b45309','#be185d','#0284c7','#dc2626','#6d5ce6','#0ea5e9'];
    if (!str) return palette[0];
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    return palette[Math.abs(h) % palette.length];
  },

  /* ── Forum ───────────────────────────────────────────────────────────── */

  forum: {
    async getTopics() {
      const { data, error } = await window.sb
        .from('forum_topics')
        .select('*, forum_messages(count)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(t => ({
        ...t,
        reply_count: t.forum_messages?.[0]?.count ?? 0,
        time:        DB._timeAgo(t.created_at),
        tagLabel:    DB.forum._tagLabel(t.tag),
      }));
    },

    async getMessages(topicId) {
      const { data, error } = await window.sb
        .from('forum_messages')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data.map(m => ({
        ...m,
        avatar: DB._initials(m.author_name),
        color:  DB._color(m.author_id || m.author_name),
        time:   DB._timeAgo(m.created_at),
      }));
    },

    async createTopic({ title, tag, userId, authorName }) {
      const { data, error } = await window.sb
        .from('forum_topics')
        .insert({ title, tag, author_id: userId, author_name: authorName })
        .select()
        .single();
      if (error) throw error;

      // record forum activity for stats
      await window.sb.from('forum_activity').insert({ user_id: userId, type: 'topic' }).then(() => {}).catch(() => {});

      return {
        ...data,
        reply_count: 0,
        time:        'agora',
        tagLabel:    DB.forum._tagLabel(data.tag),
      };
    },

    async createMessage({ topicId, text, userId, authorName }) {
      const { data, error } = await window.sb
        .from('forum_messages')
        .insert({ topic_id: topicId, text, author_id: userId, author_name: authorName })
        .select()
        .single();
      if (error) throw error;
      return {
        ...data,
        avatar: DB._initials(authorName),
        color:  DB._color(userId || authorName),
        time:   'agora',
      };
    },

    async closeTopic(topicId) {
      const { error } = await window.sb
        .from('forum_topics')
        .update({ closed: true })
        .eq('id', topicId);
      if (error) throw error;
    },

    async deleteTopic(topicId) {
      const { error } = await window.sb
        .from('forum_topics')
        .delete()
        .eq('id', topicId);
      if (error) throw error;
    },

    async getVoteCounts(messageIds) {
      if (!messageIds.length) return {};
      const { data, error } = await window.sb
        .from('forum_votes')
        .select('message_id, vote_type')
        .in('message_id', messageIds);
      if (error) return {};
      const counts = {};
      messageIds.forEach(id => { counts[id] = { up: 0, down: 0 }; });
      data.forEach(v => { counts[v.message_id][v.vote_type]++; });
      return counts;
    },

    async getMyVotes(userId) {
      if (!userId) return {};
      const { data, error } = await window.sb
        .from('forum_votes')
        .select('message_id, vote_type')
        .eq('user_id', userId);
      if (error) return {};
      const map = {};
      data.forEach(v => { map[v.message_id] = v.vote_type; });
      return map;
    },

    async vote({ userId, messageId, voteType }) {
      const { data: existing } = await window.sb
        .from('forum_votes')
        .select('id, vote_type')
        .eq('user_id', userId)
        .eq('message_id', messageId)
        .maybeSingle();

      if (existing) {
        if (existing.vote_type === voteType) {
          await window.sb.from('forum_votes').delete().eq('id', existing.id);
          return null; // toggled off
        }
        await window.sb.from('forum_votes').update({ vote_type: voteType }).eq('id', existing.id);
        return voteType;
      }
      await window.sb.from('forum_votes').insert({ user_id: userId, message_id: messageId, vote_type: voteType });
      return voteType;
    },

    _tagLabel(tag) {
      const map = { duvida: 'Dúvidas & Estudo', recurso: 'Dicas', conquista: 'Conquistas', tech: 'Tecnologias', carreira: 'Carreira' };
      return map[tag] || tag;
    },
  },

  /* ── Talks ───────────────────────────────────────────────────────────── */

  talks: {
    async getUpcoming() {
      const { data, error } = await window.sb
        .from('talks')
        .select('*')
        .eq('is_past', false)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },

    async getPast() {
      const { data, error } = await window.sb
        .from('talks')
        .select('*')
        .eq('is_past', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    async create(talkData) {
      const { data, error } = await window.sb
        .from('talks')
        .insert({ ...talkData, is_past: false, rsvp_count: 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async toggleRsvp(talkId, userId) {
      const { data: existing } = await window.sb
        .from('talk_rsvp')
        .select('id')
        .eq('talk_id', talkId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        await window.sb.from('talk_rsvp').delete().eq('id', existing.id);
        const { count } = await window.sb
          .from('talk_rsvp')
          .select('id', { count: 'exact', head: true })
          .eq('talk_id', talkId);
        await window.sb.from('talks').update({ rsvp_count: count || 0 }).eq('id', talkId);
        return false;
      }
      await window.sb.from('talk_rsvp').insert({ talk_id: talkId, user_id: userId });
      const { count } = await window.sb
        .from('talk_rsvp')
        .select('id', { count: 'exact', head: true })
        .eq('talk_id', talkId);
      await window.sb.from('talks').update({ rsvp_count: count || 0 }).eq('id', talkId);

      // record palestra attendance for stats
      await window.sb.from('palestra_attendance').upsert({ user_id: userId, talk_id: talkId }).then(() => {}).catch(() => {});

      return true;
    },

    async hasRsvp(talkId, userId) {
      if (!userId) return false;
      const { data } = await window.sb
        .from('talk_rsvp')
        .select('id')
        .eq('talk_id', talkId)
        .eq('user_id', userId)
        .maybeSingle();
      return !!data;
    },

    async getUserRsvps(userId) {
      if (!userId) return {};
      const { data } = await window.sb
        .from('talk_rsvp')
        .select('talk_id')
        .eq('user_id', userId);
      const map = {};
      (data || []).forEach(r => { map[r.talk_id] = true; });
      return map;
    },

    async suggestSpeaker({ name, why, userId, suggestedBy }) {
      const { data, error } = await window.sb
        .from('speaker_suggestions')
        .insert({ name, why, user_id: userId, suggested_by: suggestedBy })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async getSuggestions() {
      const { data, error } = await window.sb
        .from('speaker_suggestions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async acceptSuggestion(id) {
      const { error } = await window.sb
        .from('speaker_suggestions')
        .update({ status: 'accepted' })
        .eq('id', id);
      if (error) throw error;
    },

    async rejectSuggestion(id) {
      const { error } = await window.sb
        .from('speaker_suggestions')
        .update({ status: 'rejected' })
        .eq('id', id);
      if (error) throw error;
    },
  },

  /* ── Roadmap ─────────────────────────────────────────────────────────── */

  roadmap: {
    LS_KEY: 'd30_roadmap_v3',

    async getProgress(userId) {
      if (userId) {
        const { data, error } = await window.sb
          .from('roadmap_progress')
          .select('course_id')
          .eq('user_id', userId);
        if (!error && data) {
          const fromDb = new Set(data.map(r => r.course_id));
          // merge with localStorage so nothing gets lost
          const fromLs = DB.roadmap._loadLocal();
          fromLs.forEach(id => fromDb.add(id));
          return fromDb;
        }
      }
      return DB.roadmap._loadLocal();
    },

    async markDone(userId, courseId) {
      const s = DB.roadmap._loadLocal();
      s.add(courseId);
      DB.roadmap._saveLocal(s);
      if (userId) {
        await window.sb.from('roadmap_progress')
          .upsert({ user_id: userId, course_id: courseId })
          .then(() => {}).catch(e => console.warn('[DB] roadmap markDone:', e.message));
      }
    },

    async markUndone(userId, courseId) {
      const s = DB.roadmap._loadLocal();
      s.delete(courseId);
      DB.roadmap._saveLocal(s);
      if (userId) {
        await window.sb.from('roadmap_progress')
          .delete()
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .then(() => {}).catch(e => console.warn('[DB] roadmap markUndone:', e.message));
      }
    },

    _loadLocal() {
      try { const r = localStorage.getItem(this.LS_KEY); return r ? new Set(JSON.parse(r)) : new Set(); }
      catch { return new Set(); }
    },

    _saveLocal(s) {
      try { localStorage.setItem(this.LS_KEY, JSON.stringify([...s])); } catch {}
    },
  },
};

window.DB = DB;
