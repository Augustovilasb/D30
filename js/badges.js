/* badges.js — detecção automática de badges */

const Badges = {
  KEY: 'd30_earned_badges',

  DEFS: [
    { slug: 'primeira_sessao',  name: 'Primeira Sessão',   icon: '🎯', type: 'sessions', value: 1   },
    { slug: 'consistente',      name: 'Consistente',        icon: '📅', type: 'sessions', value: 10  },
    { slug: 'maratonista',      name: 'Maratonista',        icon: '🔁', type: 'sessions', value: 50  },
    { slug: 'primeiros_passos', name: 'Primeiros Passos',   icon: '⏱️', type: 'hours',   value: 10  },
    { slug: 'dedicado',         name: 'Dedicado',           icon: '📚', type: 'hours',   value: 50  },
    { slug: 'dev_formacao',     name: 'Dev em Formação',    icon: '🚀', type: 'hours',   value: 100 },
    { slug: 'dev_serio',        name: 'Dev Sério',          icon: '💎', type: 'hours',   value: 200 },
    { slug: 'primeira_chama',   name: 'Primeira Chama',     icon: '🔥', type: 'streak',  value: 3   },
    { slug: 'em_chamas',        name: 'Em Chamas',          icon: '⚡', type: 'streak',  value: 7   },
    { slug: 'imparavel',        name: 'Imparável',          icon: '💪', type: 'streak',  value: 15  },
    { slug: 'lendario',         name: 'Lendário',           icon: '🏆', type: 'streak',  value: 30  },
    { slug: 'quebrou_gelo',     name: 'Quebrou o Gelo',     icon: '💬', type: 'forum',   value: 1   },
    { slug: 'participativo',    name: 'Participativo',      icon: '🗣️', type: 'forum',   value: 10  },
    { slug: 'presente',         name: 'Presente',           icon: '🎤', type: 'palestras', value: 1 },
    { slug: 'palestrante_fiel', name: 'Palestrante Fiel',   icon: '🌟', type: 'palestras', value: 5 },
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
