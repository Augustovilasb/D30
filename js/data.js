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
  }
};

window.Data = Data;
