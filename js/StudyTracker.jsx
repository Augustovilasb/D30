/* StudyTracker.jsx */

/* ─── Helpers ─── */
function getPeriod(date) {
  const h = date.getHours();
  if (h >= 5  && h < 12) return 'Manhã';
  if (h >= 12 && h < 18) return 'Tarde';
  if (h >= 18 && h < 24) return 'Noite';
  return 'Madrugada';
}
function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}
function perfScore(s)   { return ({ 'Rendeu muito': 100, 'Médio': 50, 'Não rendeu': 0 })[s.performance] ?? 50; }
function energyScore(s) { return ({ 'Disposto': 100, 'Neutro': 50, 'Cansado': 0 })[s.energy] ?? 50; }
function avg(arr)       { return arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0; }
function pct(n, t)      { return t ? Math.round(n / t * 100) : 0; }

function computeMetrics(sessions) {
  if (!sessions.length) return {};
  const totalMins   = Math.round(sessions.reduce((a, s) => a + (s.duration || 0), 0) / 60);
  const avgPerf     = avg(sessions.map(perfScore));
  const avgEnergy   = avg(sessions.map(energyScore));
  const highPerf    = pct(sessions.filter(s => s.performance === 'Rendeu muito').length, sessions.length);
  const byPeriod    = ['Manhã','Tarde','Noite','Madrugada'].map(p => {
    const g = sessions.filter(s => s.period === p);
    return { period: p, sessoes: g.length, rendimento: avg(g.map(perfScore)), horas: +(g.reduce((a,s)=>a+(s.duration||0),0)/3600).toFixed(1) };
  }).filter(p => p.sessoes > 0);
  const byType      = ['Vídeo','Leitura','Prática/Código','Exercícios'].map(t => {
    const g = sessions.filter(s => s.studyType === t);
    return { tipo: t, sessoes: g.length, rendimento: avg(g.map(perfScore)) };
  }).filter(t => t.sessoes > 0);
  const sleepImpact = ['Dormi muito bem','Dormi ok','Dormi pouco','Não dormi direito'].map(sl => {
    const g = sessions.filter(s => s.sleep === sl);
    return { sono: sl, rendimento: avg(g.map(perfScore)), sessoes: g.length };
  }).filter(s => s.sessoes > 0);
  const streak     = window.Data.getCurrentStreak();
  const bestStreak = window.Data.getBestStreak();
  const days       = [...new Set(sessions.map(s => s.date))].length;
  return { totalMins, avgPerf, avgEnergy, highPerf, byPeriod, byType, sleepImpact, streak, bestStreak, days, total: sessions.length };
}

/* ─── AI history ─── */
const AI_HISTORY_KEY = 'd30_ai_history';
const AI_LAST_KEY    = type => `d30_ai_last_${type}`;
const AI_TEXT_KEY    = type => `d30_ai_text_${type}`;
const MIN_DAILY_SECS = 30 * 60;

function loadAiHistory() {
  try { return JSON.parse(localStorage.getItem(AI_HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveToAiHistory(entry) {
  try {
    const h = loadAiHistory();
    h.unshift(entry);
    localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(h.slice(0, 120)));
  } catch {}
}

/* ─── Question definitions ─── */
const PRE_QUESTIONS = [
  { key: 'sleep',     label: 'Como foi seu sono?',        options: ['Dormi muito bem','Dormi ok','Dormi pouco','Não dormi direito'] },
  { key: 'hydration', label: 'Hidratação hoje?',          options: ['Bebi bastante','Normal','Bebi pouco'] },
  { key: 'nutrition', label: 'Alimentação hoje?',         options: ['Me alimentei bem','Normal','Me alimentei mal'] },
  { key: 'activity',  label: 'Atividade física hoje?',    options: ['Me exercitei','Caminhei','Fiquei parado'] },
  { key: 'caffeine',  label: 'Tomou cafeína?',            options: ['Sim, café/energético','Não tomei'] },
  { key: 'energy',    label: 'Nível de energia agora?',   options: ['Disposto','Neutro','Cansado'] },
  { key: 'mood',      label: 'Como está o humor?',        options: ['Motivado','Neutro','Ansioso'] },
  { key: 'period',    label: 'Qual turno é esse estudo?', options: ['Manhã','Tarde','Noite','Madrugada'] },
];

const POST_QUESTIONS = [
  { key: 'subject',        label: 'O que você estudou?',  type: 'text', placeholder: 'Ex: React Hooks, Spring Boot…' },
  { key: 'studyType',      label: 'Como foi o estudo?',   options: ['Vídeo','Leitura','Prática/Código','Exercícios'] },
  { key: 'performance',    label: 'Como rendeu?',         options: ['Rendeu muito','Médio','Não rendeu'] },
  { key: 'focus',          label: 'Nível de foco?',       options: ['Focado','Distraído'] },
  { key: 'subjectFeeling', label: 'Curtiu o assunto?',    options: ['Amei','Ok','Não curti'] },
  { key: 'goalStatus',     label: 'Bateu a meta do dia?', options: ['Bateu','Parcialmente','Sem meta','Não bateu'] },
];

/* ─── Markdown renderer ─── */
function MdRenderer({ text, loading }) {
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType  = null;

  const flushList = () => {
    if (!listItems.length) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    elements.push(
      <Tag key={`list-${elements.length}`} className={listType === 'ol' ? 'ai-md-olist' : 'ai-md-list'}>
        {listItems.map((li, i) => <li key={i} className="ai-md-li">{renderInline(li)}</li>)}
      </Tag>
    );
    listItems = []; listType = null;
  };

  const renderInline = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="ai-md-bold">{p.slice(2, -2)}</strong>
        : p
    );
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (line.startsWith('# ')) {
      flushList();
      elements.push(<h2 key={i} className="ai-md-h1">{line.slice(2)}</h2>);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h3 key={i} className="ai-md-h2">{line.slice(3)}</h3>);
    } else if (line.startsWith('### ')) {
      flushList();
      elements.push(<h4 key={i} className="ai-md-h3">{line.slice(4)}</h4>);
    } else if (trimmed === '---') {
      flushList();
      elements.push(<hr key={i} className="ai-md-divider" />);
    } else if (/^\d+\.\s/.test(line)) {
      if (listType === 'ul') flushList();
      listType = 'ol';
      listItems.push(line.replace(/^\d+\.\s/, ''));
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      if (listType === 'ol') flushList();
      listType = 'ul';
      listItems.push(line.slice(2));
    } else if (trimmed === '') {
      flushList();
      elements.push(<div key={i} className="ai-md-spacer" />);
    } else {
      flushList();
      elements.push(<p key={i} className="ai-md-p">{renderInline(line)}</p>);
    }
  });
  flushList();
  return (
    <div className="ai-md">
      {elements}
      {loading && <span className="trk-ai-cursor">▌</span>}
    </div>
  );
}

/* ─── AiAnalysis ─── */
function AiAnalysis({ sessions, type, apiKey, autoRun }) {
  const [text,    setText]    = React.useState(() => { try { return localStorage.getItem(AI_TEXT_KEY(type)) || ''; } catch { return ''; } });
  const [loading, setLoading] = React.useState(false);
  const [error,   setError]   = React.useState('');
  const accRef    = React.useRef('');
  const autoRanRef = React.useRef(false);

  const today = new Date().toISOString().split('T')[0];

  const todayStudiedSecs = React.useMemo(() =>
    sessions.filter(s => s.date === today).reduce((a, s) => a + (s.duration || 0), 0),
  [sessions, today]);

  const alreadyUsedToday = React.useMemo(() => {
    try { return localStorage.getItem(AI_LAST_KEY(type)) === today; } catch { return false; }
  }, [type, today]);

  const hasWeekOfData = React.useMemo(() => {
    if (!sessions.length) return false;
    const oldest = sessions.reduce((min, s) => s.date < min ? s.date : min, sessions[0].date);
    return Math.floor((Date.now() - new Date(oldest)) / 86400000) >= 7;
  }, [sessions]);

  const daysRegistered = React.useMemo(() => {
    if (!sessions.length) return 0;
    const oldest = sessions.reduce((min, s) => s.date < min ? s.date : min, sessions[0].date);
    return Math.floor((Date.now() - new Date(oldest)) / 86400000);
  }, [sessions]);

  const hasEnoughTime = todayStudiedSecs >= MIN_DAILY_SECS;
  const canAnalyze    = hasWeekOfData && hasEnoughTime && !alreadyUsedToday;

  const blockReason = !hasWeekOfData
    ? `${daysRegistered} dia${daysRegistered !== 1 ? 's' : ''} de dados registrados, mínimo 7 para análise.`
    : !hasEnoughTime
    ? `Hoje: ${Math.round(todayStudiedSecs / 60)}min estudados, mínimo 30min para análise.`
    : alreadyUsedToday
    ? 'Análise gerada hoje. Volte amanhã para a próxima.'
    : null;

  const buildPrompt = () => {
    const fmt = (d) => new Date(d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    if (type === 'daily') {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const todayS  = sessions.filter(s => s.date === today);
      const yestS   = sessions.filter(s => s.date === yesterday);
      const weekS   = sessions.filter(s => s.date >= new Date(Date.now() - 7*86400000).toISOString().split('T')[0]);
      const mHoje   = computeMetrics(todayS);
      const mOntem  = computeMetrics(yestS);
      const mSemana = computeMetrics(weekS);
      return `Você é um coach de performance para devs em formação. Analise os dados e gere um relatório diário em português com markdown.

MÉTRICAS DE HOJE (${fmt(today)}):
- Tempo total: ${mHoje.totalMins}min | Sessões: ${mHoje.total}
- Score rendimento: ${mHoje.avgPerf}/100 | Score energia: ${mHoje.avgEnergy}/100
- Distribuição por turno: ${JSON.stringify(mHoje.byPeriod)}
- Estado físico hoje: sono=${todayS[0]?.sleep}, hidratação=${todayS[0]?.hydration}, alimentação=${todayS[0]?.nutrition}, atividade=${todayS[0]?.activity}

MÉTRICAS DE ONTEM:
- Tempo: ${mOntem.totalMins || 0}min | Rendimento: ${mOntem.avgPerf || 'sem dados'}/100

MÉDIA DA SEMANA: ${mSemana.totalMins ? Math.round(mSemana.totalMins / 7) : 0}min/dia | ${mSemana.avgPerf}/100

FORMATO OBRIGATÓRIO:
## Desempenho de Hoje
## O que influenciou
## Padrão identificado
## Ação para amanhã

Use **negrito** nos números. Máximo 4 linhas por seção.`;
    }
    if (type === 'weekly') {
      const weekS  = sessions.filter(s => s.date >= new Date(Date.now() - 7*86400000).toISOString().split('T')[0]);
      const prevS  = sessions.filter(s => { const d = new Date(s.date); const now = Date.now(); return d >= new Date(now - 14*86400000) && d < new Date(now - 7*86400000); });
      const mW  = computeMetrics(weekS);
      const mP  = computeMetrics(prevS);
      const byDay = [...new Set(weekS.map(s => s.date))].sort().map(d => {
        const g = weekS.filter(s => s.date === d);
        return { dia: fmt(d), mins: Math.round(g.reduce((a,s)=>a+(s.duration||0),0)/60), rend: avg(g.map(perfScore)) };
      });
      return `Coach de performance para devs. Relatório semanal em português com markdown.

SEMANA ATUAL: ${mW.totalMins}min em ${mW.days} dias | ${mW.total} sessões | Rendimento: ${mW.avgPerf}/100
Streak: ${mW.streak} dias | Por turno: ${JSON.stringify(mW.byPeriod)} | Sono: ${JSON.stringify(mW.sleepImpact)}
Evolução diária: ${JSON.stringify(byDay)}
SEMANA ANTERIOR: ${mP.totalMins || 0}min | ${mP.avgPerf || 0}/100

FORMATO:
## Resumo da Semana
## Melhor e Pior Momento
## Correlações da Semana
## Seu Perfil Esta Semana
## Foco para a Próxima Semana

Use **negrito** nos números. Máximo 5 linhas por seção.`;
    }
    const mM = computeMetrics(sessions.filter(s => s.date >= new Date(Date.now() - 30*86400000).toISOString().split('T')[0]));
    const mP = computeMetrics(sessions.filter(s => { const d = new Date(s.date); const now = Date.now(); return d >= new Date(now - 60*86400000) && d < new Date(now - 30*86400000); }));
    return `Coach de performance para devs. Relatório mensal em português com markdown.

MÊS ATUAL: ${mM.totalMins}min (${(mM.totalMins/60).toFixed(1)}h) em ${mM.days} dias | Rendimento: ${mM.avgPerf}/100
Streak: ${mM.streak} | Por turno: ${JSON.stringify(mM.byPeriod)} | Por tipo: ${JSON.stringify(mM.byType)} | Sono: ${JSON.stringify(mM.sleepImpact)}
MÊS ANTERIOR: ${mP.totalMins||0}min | ${mP.avgPerf||0}/100

FORMATO:
## Visão Geral do Mês
## Seu Perfil Ideal Identificado
## Correlações do Mês
## Evolução e Tendência
## O que Sabotou Você
## Meta para o Próximo Mês

Use **negrito** nos números. Máximo 5 linhas por seção.`;
  };

  const run = React.useCallback(async () => {
    if (!apiKey) { setError('Configure sua API key em Meu Perfil.'); return; }
    setLoading(true); setText(''); setError(''); accRef.current = '';
    try { localStorage.setItem(AI_LAST_KEY(type), today); } catch {}
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1200, stream: true, messages: [{ role: 'user', content: buildPrompt() }] }),
      });
      if (!res.ok) throw new Error('Erro ' + res.status);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6);
          if (raw === '[DONE]') break;
          try {
            const j = JSON.parse(raw);
            if (j.type === 'content_block_delta' && j.delta?.text) {
              accRef.current += j.delta.text;
              setText(accRef.current);
            }
          } catch {}
        }
      }
      try { localStorage.setItem(AI_TEXT_KEY(type), accRef.current); } catch {}
      saveToAiHistory({ id: Date.now().toString(), type, date: today, generatedAt: new Date().toISOString(), text: accRef.current });
    } catch (e) {
      try { localStorage.removeItem(AI_LAST_KEY(type)); } catch {}
      setError('Não foi possível gerar a análise. Verifique sua API key.');
    }
    setLoading(false);
  }, [apiKey, type, sessions]);

  React.useEffect(() => {
    if (autoRun && canAnalyze && apiKey && !autoRanRef.current) {
      autoRanRef.current = true;
      run();
    }
  }, []);

  const LABELS = { daily: 'Análise do Dia', weekly: 'Análise da Semana', monthly: 'Análise do Mês' };

  return (
    <div className="trk-ai-block">
      <div className="trk-ai-block-top">
        <span className="trk-ai-label">
          <span className="trk-ai-label-text">{LABELS[type]}</span>
        </span>
        <button className={'trk-ai-btn' + (alreadyUsedToday && !loading ? ' generated' : '')}
          data-cursor="hover" onClick={run} disabled={loading || !canAnalyze}>
          {loading ? 'Gerando...' : alreadyUsedToday ? 'Gerado hoje ✓' : 'Gerar relatório'}
        </button>
      </div>
      {blockReason && !text && <p className="trk-ai-warn">{blockReason}</p>}
      {error && <p className="trk-ai-error">{error}</p>}
      {loading && !text && (
        <div className="trk-ai-body">
          <div className="trk-ai-skeleton">
            <div className="trk-ai-sk-line w70" /><div className="trk-ai-sk-line w100" />
            <div className="trk-ai-sk-line w85" /><div className="trk-ai-sk-line w60" />
          </div>
        </div>
      )}
      {text && <div className="trk-ai-body"><MdRenderer text={text} loading={loading} /></div>}
    </div>
  );
}

/* ─── AI History Tab ─── */
function AiHistoryTab({ onOpenModal }) {
  const [history, setHistory] = React.useState(() => loadAiHistory());
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    setHistory(loadAiHistory());
  }, [tick]);

  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const LABELS = { daily: 'Análise do Dia', weekly: 'Análise da Semana', monthly: 'Análise do Mês' };
  const TYPE_COLOR = { daily: '#6366f1', weekly: '#0ea5e9', monthly: '#10b981' };

  if (!history.length) {
    return (
      <div className="trk-ai-history-empty">
        <div className="trk-ai-history-empty-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" /><path d="M7 16v-5" /><path d="M11 16V8" /><path d="M15 16v-2" /><path d="M19 16v-9" />
          </svg>
        </div>
        <p className="trk-ai-history-empty-title">Nenhuma análise gerada ainda</p>
        <p className="trk-ai-history-empty-sub">Estude por 7 dias e registre ao menos 30min para a análise ser gerada automaticamente após cada sessão.</p>
      </div>
    );
  }

  return (
    <div className="trk-ai-history">
      {history.map(entry => (
        <div key={entry.id} className="trk-ai-hist-card" data-cursor="hover" onClick={() => onOpenModal({ title: `${LABELS[entry.type] || 'Análise'} · ${new Date(entry.generatedAt).toLocaleDateString('pt-BR')}`, text: entry.text })}>
          <div className="trk-ai-hist-head">
            <span className="trk-ai-hist-type" style={{ color: TYPE_COLOR[entry.type] || '#6366f1' }}>
              {LABELS[entry.type] || 'Análise'}
            </span>
            <span className="trk-ai-hist-date">{new Date(entry.generatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <p className="trk-ai-hist-preview">{entry.text.replace(/[#*\-_`]/g, '').trim().slice(0, 140)}…</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Badge toast ─── */
function BadgeToast({ badge, onDone }) {
  React.useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, []);
  return (
    <div className="trk-badge-toast">
      <span className="trk-badge-toast-icon">{badge.icon}</span>
      <div>
        <p className="trk-badge-toast-title">Badge desbloqueada!</p>
        <p className="trk-badge-toast-name">{badge.name}</p>
      </div>
    </div>
  );
}

/* ─── Question Panel ─── */
function QuestionPanel({ questions, step, form, onAnswer, onTextAdvance, onBack, phase }) {
  const done = step >= questions.length;

  if (done && phase === 'pre') {
    return (
      <div className="trk-qpanel">
        <div className="trk-qpanel-done">
          <div className="trk-qpanel-done-check">✓</div>
          <h3 className="trk-qpanel-done-title">Tudo anotado!</h3>
          <p className="trk-qpanel-done-sub">Clique em <strong>Iniciar Timer</strong> para começar sua sessão.</p>
        </div>
      </div>
    );
  }

  if (done && phase === 'post') {
    return (
      <div className="trk-qpanel">
        <div className="trk-qpanel-done saving">
          <div className="trk-qpanel-done-check trk-qpanel-done-check--saving" />
          <h3 className="trk-qpanel-done-title">Salvando sessão…</h3>
        </div>
      </div>
    );
  }

  const q = questions[step];

  return (
    <div className="trk-qpanel">
      {step > 0 && (
        <button className="trk-qpanel-back" data-cursor="hover" onClick={onBack}>← Voltar</button>
      )}
      <div className="trk-qpanel-progress">
        {questions.map((_, i) => (
          <div key={i} className={'trk-qpanel-dot' + (i < step ? ' done' : i === step ? ' active' : '')} />
        ))}
      </div>
      <p className="trk-qpanel-counter">{step + 1} de {questions.length}</p>

      <div key={`${phase}-${step}`} className="trk-qpanel-body">
        <h3 className="trk-qpanel-question">{q.label}</h3>
        {q.type === 'text' ? (
          <div className="trk-qpanel-text-row">
            <input
              className="trk-input trk-qpanel-input"
              type="text"
              placeholder={q.placeholder}
              value={form[q.key] || ''}
              onChange={e => onAnswer(q.key, e.target.value, false)}
              onKeyDown={e => { if (e.key === 'Enter' && (form[q.key] || '').trim()) onTextAdvance(); }}
              autoFocus
            />
            <button className="trk-qpanel-next" data-cursor="hover"
              disabled={!(form[q.key] || '').trim()}
              onClick={onTextAdvance}>→</button>
          </div>
        ) : (
          <div className="trk-qpanel-opts">
            {q.options.map(opt => (
              <button key={opt} data-cursor="hover"
                className={'trk-qpanel-opt' + (form[q.key] === opt ? ' selected' : '')}
                onClick={() => onAnswer(q.key, opt, true)}>
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Session Running Panel ─── */
function SessionRunningPanel({ preAnswers }) {
  const items = PRE_QUESTIONS.map(q => ({ label: q.label, value: preAnswers[q.key] })).filter(i => i.value);
  return (
    <div className="trk-qpanel trk-qpanel--running">
      <p className="trk-qpanel-running-title">Sessão em andamento</p>
      <div className="trk-qpanel-running-items">
        {items.map(item => (
          <div key={item.label} className="trk-qpanel-running-item">
            <span className="trk-qpanel-running-key">{item.label}</span>
            <span className="trk-qpanel-running-val">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Idle screen ─── */
function TrackerIdle({ preStep, onBeginPre, onStartTimer }) {
  const preDone    = preStep >= PRE_QUESTIONS.length;
  const preStarted = preStep >= 0;
  return (
    <div className="trk-idle">
      <div className="trk-idle-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5" /><path d="M10 2h4" /><path d="M19.07 4.93l-1.41 1.41" />
        </svg>
      </div>
      <h1 className="trk-idle-title">Pronto para estudar?</h1>
      <p className="trk-idle-sub">
        {!preStarted
          ? 'Responda algumas perguntas rápidas antes de começar.'
          : preDone
          ? 'Perguntas respondidas. Pode iniciar!'
          : `Respondendo... ${preStep} de ${PRE_QUESTIONS.length}`}
      </p>
      {!preStarted && (
        <button className="trk-start-btn" data-cursor="hover" onClick={onBeginPre}>
          Iniciar Sessão →
        </button>
      )}
      {preStarted && !preDone && (
        <button className="trk-start-btn" disabled style={{ opacity: 0.35 }}>
          Respondendo…
        </button>
      )}
      {preDone && (
        <button className="trk-start-btn trk-start-btn--ready" data-cursor="hover" onClick={onStartTimer}>
          Iniciar Timer
        </button>
      )}
    </div>
  );
}

/* ─── Active timer ─── */
function TrackerActive({ elapsed, paused, onPause, onResume, onEnd }) {
  return (
    <div className="trk-active">
      <span className="trk-status-badge">{paused ? 'Pausado' : 'Sessão em andamento'}</span>
      <div className={'trk-clock' + (paused ? ' paused' : '')}>{formatTime(elapsed)}</div>
      <div className="trk-active-actions">
        {paused
          ? <button className="trk-btn trk-btn--resume" data-cursor="hover" onClick={onResume}>Retomar</button>
          : <button className="trk-btn trk-btn--pause"  data-cursor="hover" onClick={onPause}>Pausar</button>
        }
        <button className="trk-btn trk-btn--end" data-cursor="hover" onClick={onEnd}>Encerrar Sessão</button>
      </div>
    </div>
  );
}

/* ─── Post-session time display ─── */
function TrackerEnded({ elapsed }) {
  return (
    <div className="trk-idle">
      <div className="trk-idle-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" />
        </svg>
      </div>
      <h1 className="trk-idle-title">Sessão encerrada</h1>
      <div className="trk-ended-time">{formatTime(elapsed)}</div>
      <p className="trk-idle-sub">Responda as perguntas ao lado para salvar.</p>
    </div>
  );
}

/* ─── Success ─── */
function TrackerSuccess({ session, newBadges, onNew, onDashboard, onAnalises, apiKey }) {
  const allSessions = window.Data.load();
  const hrs  = Math.floor((session?.duration || 0) / 3600);
  const mins = Math.floor(((session?.duration || 0) % 3600) / 60);
  const label = hrs > 0 ? `${hrs}h ${mins}min` : `${mins}min`;

  return (
    <div className="trk-success">
      <div className="trk-success-icon">✓</div>
      <h2 className="trk-success-title">Sessão registrada!</h2>
      <p className="trk-success-sub">{label} de estudo salvos.</p>
      {newBadges.length > 0 && (
        <div className="trk-new-badges">
          <p className="trk-new-badges-label">Badges desbloqueadas</p>
          {newBadges.map(b => (
            <div key={b.slug} className="trk-new-badge-item">
              <span className="trk-new-badge-icon">{b.icon}</span>
              <span className="trk-new-badge-name">{b.name}</span>
            </div>
          ))}
        </div>
      )}
      <AiAnalysis sessions={allSessions} type="daily" apiKey={apiKey} autoRun />
      <div className="trk-success-actions">
        <button className="trk-btn" data-cursor="hover" onClick={onNew}>Nova Sessão</button>
        <button className="trk-btn trk-btn--ghost" data-cursor="hover" onClick={onDashboard}>Dashboard</button>
        <button className="trk-btn trk-btn--ghost" data-cursor="hover" onClick={onAnalises}>Ver Análises</button>
      </div>
    </div>
  );
}

/* ─── Calendar Day Detail (flip-forward card) ─── */
function CalDayDetail({ dateStr, sessions, onClose }) {
  const PERF_COLOR   = { 'Rendeu muito': '#10b981', 'Médio': '#f59e0b', 'Não rendeu': '#ef4444' };
  const ENERGY_COLOR = { 'Disposto': '#10b981', 'Neutro': '#f59e0b', 'Cansado': '#ef4444' };

  const date = new Date(dateStr + 'T12:00:00');
  const dayLabel = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const totalMins = Math.round(sessions.reduce((a, s) => a + (s.duration || 0), 0) / 60);
  const durLabel  = totalMins >= 60
    ? `${Math.floor(totalMins / 60)}h${totalMins % 60 ? String(totalMins % 60).padStart(2, '0') : ''}`
    : `${totalMins}min`;
  const first = sessions[0] || {};

  return (
    <div className="trk-cal-overlay" onClick={onClose}>
      <div className="trk-cal-detail-card" onClick={e => e.stopPropagation()}>

        <div className="trk-cal-detail-head">
          <div>
            <p className="trk-cal-detail-date">{dayLabel}</p>
            <p className="trk-cal-detail-summary">
              {sessions.length} {sessions.length !== 1 ? 'sessões' : 'sessão'} · {durLabel} estudados
            </p>
          </div>
          <button className="trk-cal-detail-close" data-cursor="hover" onClick={onClose}>✕</button>
        </div>

        <div className="trk-cal-detail-body">

          {sessions.map((s, idx) => {
            const startT = s.startedAt
              ? new Date(s.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : null;
            const mins = Math.round((s.duration || 0) / 60);
            const pc   = PERF_COLOR[s.performance];
            return (
              <div key={idx} className="trk-cal-sess-block" style={pc ? { borderLeftColor: pc } : {}}>
                <div className="trk-cal-sess-head">
                  {startT && <span className="trk-cal-sess-time">{startT}</span>}
                  <span className="trk-cal-sess-dur">{mins}min</span>
                  {sessions.length > 1 && <span className="trk-cal-sess-idx">sessão {idx + 1}</span>}
                </div>
                <p className="trk-cal-sess-subj">{s.subject || '-'}</p>
                <div className="trk-cal-sess-tags">
                  {s.studyType   && <span className="trk-cal-tag">{s.studyType}</span>}
                  {s.period      && <span className="trk-cal-tag">{s.period}</span>}
                  {s.performance && (
                    <span className="trk-cal-tag" style={pc ? { color: pc, borderColor: pc + '44', background: pc + '12' } : {}}>
                      {s.performance}
                    </span>
                  )}
                  {s.focus && <span className="trk-cal-tag">{s.focus}</span>}
                  {s.goalStatus && s.goalStatus !== 'Sem meta' && (
                    <span className="trk-cal-tag"
                      style={s.goalStatus === 'Bateu' ? { color: '#10b981', borderColor: '#10b98144', background: '#10b98112' } : {}}>
                      Meta: {s.goalStatus}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {(first.sleep || first.energy || first.mood || first.hydration || first.nutrition || first.activity) && (
            <div className="trk-cal-context">
              <p className="trk-cal-context-title">Estado do dia</p>
              <div className="trk-cal-context-grid">
                {first.energy     && <div className="trk-cal-context-item"><span className="trk-cal-context-key">Energia</span><span className="trk-cal-context-val" style={{ color: ENERGY_COLOR[first.energy] || 'var(--text)' }}>{first.energy}</span></div>}
                {first.sleep      && <div className="trk-cal-context-item"><span className="trk-cal-context-key">Sono</span><span className="trk-cal-context-val">{first.sleep}</span></div>}
                {first.mood       && <div className="trk-cal-context-item"><span className="trk-cal-context-key">Humor</span><span className="trk-cal-context-val">{first.mood}</span></div>}
                {first.hydration  && <div className="trk-cal-context-item"><span className="trk-cal-context-key">Hidratação</span><span className="trk-cal-context-val">{first.hydration}</span></div>}
                {first.nutrition  && <div className="trk-cal-context-item"><span className="trk-cal-context-key">Alimentação</span><span className="trk-cal-context-val">{first.nutrition}</span></div>}
                {first.activity   && <div className="trk-cal-context-item"><span className="trk-cal-context-key">Atividade</span><span className="trk-cal-context-val">{first.activity}</span></div>}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ─── Full Calendar ─── */
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAY_NAMES   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

function FullCalendar({ sessions, highlightDates }) {
  const now = new Date();
  const [year,         setYear]         = React.useState(now.getFullYear());
  const [month,        setMonth]        = React.useState(now.getMonth());
  const [expandedDate, setExpandedDate] = React.useState(null);

  const sessMap = React.useMemo(() => {
    const m = {};
    sessions.forEach(s => {
      if (!m[s.date]) m[s.date] = [];
      m[s.date].push(s);
    });
    return m;
  }, [sessions]);

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); };

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = now.toISOString().split('T')[0];

  const monthTotal = React.useMemo(() => {
    const prefix = `${year}-${String(month+1).padStart(2,'0')}`;
    return Object.entries(sessMap)
      .filter(([d]) => d.startsWith(prefix))
      .reduce((a, [, arr]) => a + arr.reduce((b, s) => b + (s.duration||0), 0), 0);
  }, [sessMap, year, month]);

  return (
    <div className="trk-full-cal">
      <div className="trk-full-cal-head">
        <button className="trk-month-nav" data-cursor="hover" onClick={prevMonth}>‹</button>
        <div className="trk-full-cal-title">
          <span className="trk-full-cal-name">{MONTH_NAMES[month]} {year}</span>
          {monthTotal > 0 && <span className="trk-full-cal-total">{(monthTotal/3600).toFixed(1)}h estudadas</span>}
        </div>
        <button className="trk-month-nav" data-cursor="hover" onClick={nextMonth} disabled={isCurrentMonth}>›</button>
      </div>

      <div className="trk-full-cal-grid">
        {DAY_NAMES.map(d => <div key={d} className="trk-full-cal-day-name">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="trk-full-cal-cell trk-full-cal-cell--empty" />;
          const dateStr     = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const daySessions = sessMap[dateStr] || [];
          const isToday     = dateStr === todayStr;
          const totalMins   = Math.round(daySessions.reduce((a, s) => a + (s.duration||0), 0) / 60);
          const topPerf     = daySessions.length
            ? daySessions.reduce((best, s) => perfScore(s) > perfScore(best) ? s : best, daySessions[0]).performance
            : null;
          const perfColor   = topPerf === 'Rendeu muito' ? '#10b981' : topPerf === 'Não rendeu' ? '#ef4444' : topPerf ? '#f59e0b' : null;
          const firstSubj   = daySessions[0]?.subject   || '';
          const studyType   = daySessions[0]?.studyType || '';
          const typeShort   = studyType === 'Prática/Código' ? 'Prática' : studyType;
          const period      = daySessions[0]?.period    || '';
          const totalSess   = daySessions.length;
          const durLabel    = totalMins >= 60
            ? `${Math.floor(totalMins/60)}h${totalMins%60 ? String(totalMins%60).padStart(2,'0') : ''}`
            : `${totalMins}min`;

          const isDimmed = highlightDates && daySessions.length > 0 && !highlightDates.has(dateStr);

          return (
            <div key={i}
              className={'trk-full-cal-cell' + (isToday ? ' today' : '') + (daySessions.length ? ' has-session' : '') + (isDimmed ? ' dimmed' : '')}
              style={perfColor ? { borderTop: `3px solid ${perfColor}` } : {}}
              data-cursor={daySessions.length ? 'hover' : undefined}
              onClick={daySessions.length ? () => setExpandedDate(dateStr) : undefined}>

              <div className="trk-full-cal-cell-top">
                <span className="trk-full-cal-day-num">{day}</span>
                {daySessions.length > 0 && <span className="trk-full-cal-mins">{durLabel}</span>}
              </div>

              {daySessions.length > 0 && (
                <React.Fragment>
                  <div className="trk-full-cal-divider" />
                  <span className="trk-full-cal-subj" title={firstSubj}>
                    {firstSubj.length > 15 ? firstSubj.slice(0, 15) + '…' : firstSubj || '-'}
                    {totalSess > 1 && <span className="trk-full-cal-more">{' +' + (totalSess - 1)}</span>}
                  </span>
                  <div className="trk-full-cal-meta">
                    {typeShort && <span className="trk-full-cal-type">{typeShort}</span>}
                    {period    && <span className="trk-full-cal-period">{period}</span>}
                  </div>
                </React.Fragment>
              )}
            </div>
          );
        })}
      </div>

      {expandedDate && sessMap[expandedDate] && (
        <CalDayDetail
          dateStr={expandedDate}
          sessions={sessMap[expandedDate]}
          onClose={() => setExpandedDate(null)}
        />
      )}
    </div>
  );
}

/* ─── Dual-month heatmap calendar ─── */
function HeatCalendar({ sessions, highlightDates }) {
  const now = new Date();
  const [offset, setOffset] = React.useState(0);
  const [expandedDate, setExpandedDate] = React.useState(null);

  const sessMap = React.useMemo(() => {
    const m = {};
    sessions.forEach(s => {
      if (!m[s.date]) m[s.date] = [];
      m[s.date].push(s);
    });
    return m;
  }, [sessions]);

  // Two consecutive months: [now-offset-1, now-offset]
  const d0 = new Date(now.getFullYear(), now.getMonth() - offset - 1, 1);
  const d1 = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const months = [
    { year: d0.getFullYear(), month: d0.getMonth() },
    { year: d1.getFullYear(), month: d1.getMonth() },
  ];

  function cellColor(secs) {
    if (!secs) return 'var(--bg3)';
    const h = secs / 3600;
    if (h < 1) return '#bbf7d0';
    if (h < 2) return '#4ade80';
    if (h < 4) return '#16a34a';
    return '#15803d';
  }

  const todayStr = now.toISOString().split('T')[0];

  const navLabel = (() => {
    const a = MONTH_NAMES[months[0].month] + (months[0].year !== now.getFullYear() ? ` ${months[0].year}` : '');
    const b = MONTH_NAMES[months[1].month] + ` ${months[1].year}`;
    return `${a} · ${b}`;
  })();

  return (
    <div className="trk-heat-cal">
      <div className="trk-heat-cal-nav">
        <button className="trk-month-nav" data-cursor="hover" onClick={() => setOffset(o => o + 1)}>‹</button>
        <span className="trk-heat-cal-nav-label">{navLabel}</span>
        <button className="trk-month-nav" data-cursor="hover" disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - 1))}>›</button>
      </div>

      <div className="trk-heat-cal-months">
        {months.map(({ year, month }) => {
          const monthKey  = `${year}-${String(month + 1).padStart(2, '0')}`;
          const firstDow  = new Date(year, month, 1).getDay();
          const daysCount = new Date(year, month + 1, 0).getDate();
          const cells     = [...Array(firstDow).fill(null), ...Array.from({ length: daysCount }, (_, i) => i + 1)];
          while (cells.length % 7 !== 0) cells.push(null);

          const monthSecs = Object.entries(sessMap)
            .filter(([d]) => d.startsWith(monthKey))
            .reduce((a, [, arr]) => a + arr.reduce((b, s) => b + (s.duration || 0), 0), 0);

          return (
            <div key={monthKey} className="trk-heat-month">
              <div className="trk-heat-month-head">
                <span className="trk-heat-month-name">{MONTH_NAMES[month]} {year}</span>
                {monthSecs > 0 && <span className="trk-heat-month-total">{(monthSecs / 3600).toFixed(1)}h</span>}
              </div>
              <div className="trk-heat-month-dow">
                {DAY_NAMES.map(d => <span key={d}>{d}</span>)}
              </div>
              <div className="trk-heat-month-grid">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} className="trk-heat-cell trk-heat-cell--empty" />;
                  const dateStr    = `${monthKey}-${String(day).padStart(2, '0')}`;
                  const daySess    = sessMap[dateStr] || [];
                  const totalSecs  = daySess.reduce((a, s) => a + (s.duration || 0), 0);
                  const isToday    = dateStr === todayStr;
                  const isDimmed   = highlightDates && daySess.length > 0 && !highlightDates.has(dateStr);
                  const isHl       = highlightDates && highlightDates.has(dateStr);
                  return (
                    <div
                      key={i}
                      className={'trk-heat-cell' + (daySess.length ? ' has-data' : '') + (isToday ? ' today' : '') + (isDimmed ? ' dimmed' : '') + (isHl ? ' highlighted' : '')}
                      style={{ background: cellColor(totalSecs) }}
                      data-cursor={daySess.length ? 'hover' : undefined}
                      title={`${dateStr}${daySess.length ? ': ' + (totalSecs / 3600).toFixed(1) + 'h' : ''}`}
                      onClick={daySess.length ? () => setExpandedDate(dateStr) : undefined}
                    >
                      <span className="trk-heat-day-num">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="trk-heat-legend">
        <span>Menos</span>
        {['var(--bg3)', '#bbf7d0', '#4ade80', '#16a34a', '#15803d'].map((c, i) => (
          <div key={i} className="trk-heat-legend-cell" style={{ background: c }} />
        ))}
        <span>Mais</span>
      </div>

      {expandedDate && sessMap[expandedDate] && (
        <CalDayDetail
          dateStr={expandedDate}
          sessions={sessMap[expandedDate]}
          onClose={() => setExpandedDate(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════
   Container principal
═══════════════════════════ */
const EMPTY_FORM = {
  subject: '', studyType: '', period: '',
  energy: '', performance: '', mood: '', focus: '', subjectFeeling: '', goalStatus: '',
  sleep: '', hydration: '', nutrition: '', activity: '', caffeine: '',
};

function StudyTracker({ user }) {
  const [tab,        setTab]        = React.useState('timer');
  const [view,       setView]       = React.useState('idle');
  const [preStep,    setPreStep]    = React.useState(-1);
  const [postStep,   setPostStep]   = React.useState(0);
  const [elapsed,    setElapsed]    = React.useState(0);
  const [saving,     setSaving]     = React.useState(false);
  const [form,       setForm]       = React.useState(EMPTY_FORM);
  const [lastSession, setLastSession] = React.useState(null);
  const [newBadges,   setNewBadges]   = React.useState([]);
  const [badgeQueue,  setBadgeQueue]  = React.useState([]);
  const [dataTick,    setDataTick]    = React.useState(0);
  const [aiModal,     setAiModal]     = React.useState(null);

  const sessions  = React.useMemo(() => window.Data.load(), [dataTick]);
  const reloadData = React.useCallback(() => setDataTick(t => t + 1), []);

  const startRef   = React.useRef(null);
  const pausedRef  = React.useRef(0);
  const pauseStart = React.useRef(null);
  const tickRef    = React.useRef(null);

  const apiKey = React.useMemo(() => {
    try { return localStorage.getItem('d30_ai_key') || ''; } catch { return ''; }
  }, []);

  React.useEffect(() => () => clearInterval(tickRef.current), []);

  const tick = React.useCallback(() => {
    setElapsed(Math.floor((Date.now() - startRef.current - pausedRef.current) / 1000));
  }, []);

  const handleBeginPre = () => setPreStep(0);

  const handleStartTimer = () => {
    startRef.current  = Date.now();
    pausedRef.current = 0;
    setElapsed(0);
    tickRef.current = setInterval(tick, 1000);
    setView('running');
  };

  const handlePause = () => {
    clearInterval(tickRef.current);
    pauseStart.current = Date.now();
    setView('paused');
  };

  const handleResume = () => {
    pausedRef.current += Date.now() - pauseStart.current;
    tickRef.current = setInterval(tick, 1000);
    setView('running');
  };

  const handleEnd = () => {
    clearInterval(tickRef.current);
    setPostStep(0);
    setView('post');
  };

  const handleSave = async (formData) => {
    setSaving(true);
    const session = {
      ...formData,
      duration:  elapsed,
      date:      new Date(startRef.current).toISOString().split('T')[0],
      startedAt: new Date(startRef.current).toISOString(),
    };
    const saved = window.Data.saveSession(session);
    await window.Data.syncToSupabase(saved, user?.id);
    const earned = window.Badges.check();
    setNewBadges(earned);
    if (earned.length) setBadgeQueue(q => [...q, ...earned]);
    setLastSession(saved);
    setSaving(false);
    reloadData();
    setView('success');
  };

  const handlePreBack  = () => setPreStep(s => Math.max(0, s - 1));
  const handlePostBack = () => setPostStep(s => Math.max(0, s - 1));

  const handlePreAnswer = (key, val, autoAdvance) => {
    setForm(f => ({ ...f, [key]: val }));
    if (autoAdvance) setPreStep(s => s + 1);
  };

  const handlePostAnswer = (key, val, autoAdvance) => {
    const newForm = { ...form, [key]: val };
    setForm(newForm);
    if (autoAdvance) {
      const nextStep = postStep + 1;
      if (nextStep >= POST_QUESTIONS.length) {
        handleSave(newForm);
      } else {
        setPostStep(nextStep);
      }
    }
  };

  const handleTextAdvance = (phase) => {
    if (phase === 'pre') {
      setPreStep(s => s + 1);
    } else {
      const nextStep = postStep + 1;
      if (nextStep >= POST_QUESTIONS.length) {
        handleSave(form);
      } else {
        setPostStep(nextStep);
      }
    }
  };

  const handleNew = () => {
    setForm(EMPTY_FORM);
    setElapsed(0);
    setPreStep(-1);
    setPostStep(0);
    setView('idle');
  };

  const isTimerActive = ['running', 'paused'].includes(view);

  return (
    <div className="page active fade-in">
      <div className="trk-wrap">

        {/* Tab nav */}
        {!isTimerActive && (
          <div className="trk-tabs">
            <button className={'trk-tab' + (tab === 'timer'     ? ' active' : '')} data-cursor="hover" onClick={() => setTab('timer')}>Timer</button>
            <button className={'trk-tab' + (tab === 'dashboard' ? ' active' : '')} data-cursor="hover" onClick={() => setTab('dashboard')}>Dashboard</button>
            <button className={'trk-tab' + (tab === 'analises'  ? ' active' : '')} data-cursor="hover" onClick={() => setTab('analises')}>Análises</button>
          </div>
        )}

        {/* Timer tab */}
        {tab === 'timer' && (
          <>
            {view === 'success' ? (
              <TrackerSuccess
                session={lastSession} newBadges={newBadges} apiKey={apiKey}
                onNew={handleNew}
                onDashboard={() => { setView('idle'); setTab('dashboard'); }}
                onAnalises={() => { setView('idle'); setTab('analises'); }}
              />
            ) : (
              <div className="trk-two-col">
                {/* Left: timer states */}
                <div className="trk-left-card">
                  {(view === 'idle' || view === 'pre') && (
                    <TrackerIdle preStep={preStep} onBeginPre={handleBeginPre} onStartTimer={handleStartTimer} />
                  )}
                  {(view === 'running' || view === 'paused') && (
                    <TrackerActive elapsed={elapsed} paused={view === 'paused'}
                      onPause={handlePause} onResume={handleResume} onEnd={handleEnd} />
                  )}
                  {view === 'post' && <TrackerEnded elapsed={elapsed} />}
                </div>

                {/* Right: question panel or running summary */}
                <div className="trk-right-panel">
                  {(view === 'idle' || view === 'pre') && preStep < 0 && (
                    <div className="trk-qpanel trk-qpanel--hint">
                      <div className="trk-qpanel-hint-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <p className="trk-qpanel-hint-text">Clique em <strong>Iniciar Sessão</strong> para responder algumas perguntas rápidas sobre seu estado antes de começar.</p>
                    </div>
                  )}
                  {(view === 'idle' || view === 'pre') && preStep >= 0 && (
                    <QuestionPanel
                      questions={PRE_QUESTIONS} step={preStep} form={form}
                      onAnswer={handlePreAnswer}
                      onTextAdvance={() => handleTextAdvance('pre')}
                      onBack={handlePreBack}
                      phase="pre"
                    />
                  )}
                  {(view === 'running' || view === 'paused') && <SessionRunningPanel preAnswers={form} />}
                  {view === 'post' && (
                    <QuestionPanel
                      questions={POST_QUESTIONS} step={postStep} form={form}
                      onAnswer={handlePostAnswer}
                      onTextAdvance={() => handleTextAdvance('post')}
                      onBack={handlePostBack}
                      phase="post"
                    />
                  )}
                </div>
              </div>
            )}

          </>
        )}

        {/* Dashboard tab */}
        {tab === 'dashboard' && (
          <TrackerDashboard onStartTimer={() => setTab('timer')} onDemoLoad={reloadData} />
        )}

        {/* Análises tab */}
        {tab === 'analises' && (
          <div>
            <AiHistoryTab onOpenModal={setAiModal} />
          </div>
        )}

      </div>

      {/* AI modal */}
      {aiModal && (
        <div className="trk-ai-modal-overlay" onClick={() => setAiModal(null)}>
          <div className="trk-ai-modal" onClick={e => e.stopPropagation()}>
            <div className="trk-ai-modal-head">
              <span className="trk-ai-modal-title">{aiModal.title}</span>
              <button className="trk-ai-modal-close" data-cursor="hover" onClick={() => setAiModal(null)}>✕</button>
            </div>
            <div className="trk-ai-modal-body">
              <MdRenderer text={aiModal.text} loading={false} />
            </div>
          </div>
        </div>
      )}

      {/* Badge toasts */}
      <div className="trk-badge-queue">
        {badgeQueue.slice(0, 1).map(b => (
          <BadgeToast key={b.slug} badge={b} onDone={() => setBadgeQueue(q => q.slice(1))} />
        ))}
      </div>

      <Footer />
    </div>
  );
}

Object.assign(window, { StudyTracker, FullCalendar, HeatCalendar });
