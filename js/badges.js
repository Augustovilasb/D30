/* badges.js — detecção automática de badges */

const Badges = {
  KEY: 'd30_earned_badges',

  init(userId) {
    Badges.KEY = userId ? `d30_earned_badges_${userId}` : 'd30_earned_badges';
  },

  /* SVG inner HTML for each badge (24×24 viewBox, stroke/fill use currentColor) */
  ICONS: {
    primeira_sessao:  '<polygon points="5,3 19,12 5,21" fill="currentColor"/>',
    consistente:      '<rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="1.8"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="1.8"/>',
    maratonista:      '<polyline points="17,1 21,5 17,9" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" stroke-width="1.8" fill="none"/><polyline points="7,23 3,19 7,15" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    primeiros_passos: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8" fill="none"/><polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    dedicado:         '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    dev_formacao:     '<polyline points="16,18 22,12 16,6" stroke="currentColor" stroke-width="1.8" fill="none"/><polyline points="8,6 2,12 8,18" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    dev_serio:        '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    primeira_chama:   '<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    em_chamas:        '<polygon points="13,2 3,14 12,14 11,22 21,10 12,10" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    imparavel:        '<polyline points="22,17 13,8 8,13 2,7" stroke="currentColor" stroke-width="1.8" fill="none"/><polyline points="16,17 22,17 22,11" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    lendario:         '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>',
    quebrou_gelo:     '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    participativo:    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.8" fill="none"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    presente:         '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="1.8"/>',
    palestrante_fiel: '<circle cx="12" cy="8" r="6" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    fundador:         '<path d="M2 4l3 12h14l3-12-6 4-4-8-4 8-6-4z" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" stroke-width="1.8"/>',
  },

  DEFS: [
    { slug: 'fundador',         name: 'Fundador',          icon: '👑', color: '#f59e0b', type: 'founding_member', value: 0 },
    { slug: 'primeira_sessao',  name: 'Primeira Sessão',   icon: '🎯', color: '#6366f1', type: 'sessions',        value: 1   },
    { slug: 'consistente',      name: 'Consistente',       icon: '📅', color: '#6366f1', type: 'sessions',        value: 10  },
    { slug: 'maratonista',      name: 'Maratonista',       icon: '🔁', color: '#6366f1', type: 'sessions',        value: 50  },
    { slug: 'primeiros_passos', name: 'Primeiros Passos',  icon: '⏱️', color: '#3b82f6', type: 'hours',           value: 10  },
    { slug: 'dedicado',         name: 'Dedicado',          icon: '📚', color: '#3b82f6', type: 'hours',           value: 50  },
    { slug: 'dev_formacao',     name: 'Dev em Formação',   icon: '🚀', color: '#3b82f6', type: 'hours',           value: 100 },
    { slug: 'dev_serio',        name: 'Dev Sério',         icon: '💎', color: '#3b82f6', type: 'hours',           value: 200 },
    { slug: 'primeira_chama',   name: 'Primeira Chama',    icon: '🔥', color: '#f97316', type: 'streak',          value: 3   },
    { slug: 'em_chamas',        name: 'Em Chamas',         icon: '⚡', color: '#f97316', type: 'streak',          value: 7   },
    { slug: 'imparavel',        name: 'Imparável',         icon: '💪', color: '#ef4444', type: 'streak',          value: 15  },
    { slug: 'lendario',         name: 'Lendário',          icon: '🏆', color: '#ef4444', type: 'streak',          value: 30  },
    { slug: 'quebrou_gelo',     name: 'Quebrou o Gelo',    icon: '💬', color: '#22c55e', type: 'forum',           value: 1   },
    { slug: 'participativo',    name: 'Participativo',     icon: '🗣️', color: '#22c55e', type: 'forum',           value: 10  },
    { slug: 'presente',         name: 'Presente',          icon: '🎤', color: '#a855f7', type: 'palestras',       value: 1   },
    { slug: 'palestrante_fiel', name: 'Palestrante Fiel',  icon: '🌟', color: '#a855f7', type: 'palestras',       value: 5   },
  ],

  getEarned() {
    try { return JSON.parse(localStorage.getItem(Badges.KEY) || '[]'); } catch { return []; }
  },

  check() {
    const earned = new Set(Badges.getEarned().map(b => b.slug));
    const newOnes = [];

    const totalSessions = window.Data.load().length;
    const totalHours    = window.Data.getTotalSeconds() / 3600;
    const streak        = window.Data.getCurrentStreak();

    for (const def of Badges.DEFS) {
      if (earned.has(def.slug)) continue;
      if (def.type === 'founding_member') continue; // awarded via profile
      let met = false;
      if (def.type === 'sessions')  met = totalSessions >= def.value;
      if (def.type === 'hours')     met = totalHours    >= def.value;
      if (def.type === 'streak')    met = streak        >= def.value;
      if (met) { newOnes.push(def); earned.add(def.slug); }
    }

    if (newOnes.length) {
      const all = Badges.getEarned();
      newOnes.forEach(b => all.push({ ...b, earnedAt: new Date().toISOString() }));
      localStorage.setItem(Badges.KEY, JSON.stringify(all));
    }

    return newOnes;
  },
};

window.Badges = Badges;
