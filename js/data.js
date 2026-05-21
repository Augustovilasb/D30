/* data.js — localStorage + Supabase sync para sessões de estudo */

const Data = {
  KEY: 'd30_sessions_v1',

  saveSession(session) {
    const all = Data.load();
    const s = { ...session, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    all.push(s);
    try { localStorage.setItem(Data.KEY, JSON.stringify(all)); } catch {}
    return s;
  },

  load() {
    try { return JSON.parse(localStorage.getItem(Data.KEY) || '[]'); } catch { return []; }
  },

  getByDate(dateStr) {
    return Data.load().filter(s => s.date === dateStr);
  },

  getByWeek() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    cutoff.setHours(0, 0, 0, 0);
    return Data.load().filter(s => new Date(s.date) >= cutoff);
  },

  getByMonth(month, year) {
    return Data.load().filter(s => {
      const d = new Date(s.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  },

  delete(id) {
    const all = Data.load().filter(s => s.id !== id);
    try { localStorage.setItem(Data.KEY, JSON.stringify(all)); } catch {}
  },

  getTotalSeconds() {
    return Data.load().reduce((sum, s) => sum + (s.duration || 0), 0);
  },

  getCurrentStreak() {
    const days = [...new Set(Data.load().map(s => s.date))].sort().reverse();
    if (!days.length) return 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const last  = new Date(days[0]); last.setHours(0,0,0,0);
    if ((today - last) / 86400000 > 1) return 0;
    let streak = 1, cur = last;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i]); prev.setHours(0,0,0,0);
      if (Math.round((cur - prev) / 86400000) === 1) { streak++; cur = prev; }
      else break;
    }
    return streak;
  },

  getBestStreak() {
    const days = [...new Set(Data.load().map(s => s.date))].sort();
    if (!days.length) return 0;
    let best = 1, cur = 1;
    for (let i = 1; i < days.length; i++) {
      const diff = Math.round((new Date(days[i]) - new Date(days[i-1])) / 86400000);
      cur = diff === 1 ? cur + 1 : 1;
      if (cur > best) best = cur;
    }
    return best;
  },

  seedDemo() {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const sessions = [];
    for (let i = 8; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const date = d.toISOString().split('T')[0];
      const count = i === 0 ? 1 : Math.random() > 0.25 ? (Math.random() > 0.5 ? 2 : 1) : 0;
      for (let j = 0; j < count; j++) {
        const goodDay = Math.random() > 0.4;
        sessions.push({
          id: crypto.randomUUID(),
          date,
          duration: Math.floor((i === 0 ? 35 + Math.random() * 40 : goodDay ? 45 + Math.random() * 75 : 20 + Math.random() * 40) * 60),
          period:          pick(['Manhã','Tarde','Noite']),
          subject:         pick(['Spring Boot — controllers REST','Git — rebase e merge','SQL — joins e índices','Java — generics','Docker — containers','Testes de API com Postman','Lógica de programação']),
          studyType:       pick(['Vídeo','Prática/Código','Leitura','Exercícios']),
          energy:          goodDay ? pick(['Disposto','Disposto','Neutro']) : pick(['Neutro','Cansado']),
          performance:     goodDay ? pick(['Rendeu muito','Rendeu muito','Médio']) : pick(['Médio','Não rendeu']),
          mood:            goodDay ? pick(['Motivado','Motivado','Neutro']) : pick(['Neutro','Ansioso']),
          focus:           goodDay ? pick(['Focado','Focado']) : pick(['Focado','Distraído']),
          subjectFeeling:  pick(['Amei','Ok','Ok','Não curti']),
          goalStatus:      pick(['Bateu','Parcialmente','Bateu','Sem meta']),
          sleep:           goodDay ? pick(['Dormi muito bem','Dormi ok']) : pick(['Dormi pouco','Não dormi direito','Dormi ok']),
          hydration:       pick(['Bebi bastante','Normal','Normal','Bebi pouco']),
          nutrition:       goodDay ? pick(['Me alimentei bem','Normal']) : pick(['Normal','Me alimentei mal']),
          activity:        pick(['Me exercitei','Caminhei','Fiquei parado','Fiquei parado']),
          caffeine:        pick(['Sim, café/energético','Não tomei']),
          createdAt:       d.toISOString(),
        });
      }
    }
    try {
      localStorage.setItem(Data.KEY, JSON.stringify(sessions));
      ['daily','weekly','monthly'].forEach(t => localStorage.removeItem(`d30_ai_last_${t}`));
    } catch {}
    return sessions.length;
  },

  async syncToSupabase(session, userId) {
    if (!userId || !window.sb) return;
    try {
      await window.sb.from('study_sessions').insert({
        user_id:         userId,
        date:            session.date,
        duration:        session.duration,
        period:          session.period,
        subject:         session.subject,
        study_type:      session.studyType,
        energy:          session.energy,
        performance:     session.performance,
        mood:            session.mood,
        focus:           session.focus,
        subject_feeling: session.subjectFeeling,
        goal_status:     session.goalStatus,
        sleep:           session.sleep,
        hydration:       session.hydration,
        nutrition:       session.nutrition,
        activity:        session.activity,
        caffeine:        session.caffeine,
      });
    } catch (e) {
      console.warn('[Data] Supabase sync failed:', e.message);
    }
    Data.updateProfileStats(userId);
  },

  async updateProfileStats(userId) {
    if (!userId || !window.sb) return;
    try {
      const livrosLidos = (() => { try { return JSON.parse(localStorage.getItem('d30_livros_lidos') || '[]').length; } catch { return 0; } })();
      const coursesDone = (() => { try { return JSON.parse(localStorage.getItem('d30_roadmap_v3') || '[]').length; } catch { return 0; } })();

      const [{ count: talks }, { count: forum }] = await Promise.all([
        window.sb.from('palestra_attendance').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        window.sb.from('forum_activity').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('type', 'topic'),
      ]);

      await window.sb.from('profiles').update({
        total_hours:         Math.round(Data.getTotalSeconds() / 3600 * 10) / 10,
        current_streak:      Data.getCurrentStreak(),
        best_streak:         Data.getBestStreak(),
        total_sessions:      Data.load().length,
        total_livros_lidos:  livrosLidos,
        total_courses_done:  coursesDone,
        total_talks:         talks  || 0,
        total_forum_topics:  forum  || 0,
      }).eq('id', userId);
    } catch (e) {
      console.warn('[Data] profile stats update failed:', e.message);
    }
  },
};

window.Data = Data;
