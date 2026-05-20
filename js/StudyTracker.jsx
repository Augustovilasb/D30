/* StudyTracker.jsx — timer, formulário, dashboard integrados */

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

function PillGroup({ label, options, value, onChange }) {
  return (
    <div className="trk-pill-group">
      <span className="trk-pill-label">{label}</span>
      <div className="trk-pill-options">
        {options.map(opt => (
          <button key={opt} type="button" data-cursor="hover"
            className={'trk-pill' + (value === opt ? ' active' : '')}
            onClick={() => onChange(opt)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Badge toast ── */
function BadgeToast({ badge, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, []);
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

/* ── AI Analysis ── */
const AI_LAST_KEY = type => `d30_ai_last_${type}`;
const MIN_DAILY_SECS = 30 * 60; // 30 minutos

function AiAnalysis({ sessions, type, apiKey }) {
  const [text,    setText]    = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error,   setError]   = React.useState('');

  const today = new Date().toISOString().split('T')[0];

  const todayStudiedSecs = React.useMemo(() =>
    sessions.filter(s => s.date === today).reduce((a, s) => a + (s.duration || 0), 0),
    [sessions, today]
  );

  const alreadyUsedToday = React.useMemo(() => {
    try { return localStorage.getItem(AI_LAST_KEY(type)) === today; } catch { return false; }
  }, [type, today]);

  const hasWeekOfData = React.useMemo(() => {
    if (!sessions.length) return false;
    const oldest = sessions.reduce((min, s) => s.date < min ? s.date : min, sessions[0].date);
    const daysAgo = Math.floor((Date.now() - new Date(oldest).getTime()) / 86400000);
    return daysAgo >= 7;
  }, [sessions]);

  const hasEnoughTime = todayStudiedSecs >= MIN_DAILY_SECS;
  const canAnalyze    = hasWeekOfData && hasEnoughTime && !alreadyUsedToday;

  const daysRegistered = React.useMemo(() => {
    if (!sessions.length) return 0;
    const oldest = sessions.reduce((min, s) => s.date < min ? s.date : min, sessions[0].date);
    return Math.floor((Date.now() - new Date(oldest).getTime()) / 86400000);
  }, [sessions]);

  const blockReason = !hasWeekOfData
    ? `Você tem ${daysRegistered} dia${daysRegistered !== 1 ? 's' : ''} de dados. É necessário pelo menos 7 dias para gerar análises.`
    : !hasEnoughTime
    ? `Estude pelo menos 30 min hoje (${Math.round(todayStudiedSecs / 60)}min registrados).`
    : alreadyUsedToday
    ? 'Você já gerou essa análise hoje. Volte amanhã.'
    : null;

  const buildPrompt = () => {
    if (type === 'daily') {
      const today     = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const todayS    = sessions.filter(s => s.date === today);
      const yestS     = sessions.filter(s => s.date === yesterday);
      return `Você é um coach de estudos objetivo e direto. Compare as sessões de hoje com as de ontem e dê um feedback curto (3-4 frases máximo) em português.

HOJE: ${JSON.stringify(todayS.map(s => ({ duration: Math.round(s.duration/60)+'min', performance: s.performance, energy: s.energy, sleep: s.sleep, nutrition: s.nutrition })))}
ONTEM: ${JSON.stringify(yestS.map(s => ({ duration: Math.round(s.duration/60)+'min', performance: s.performance, energy: s.energy, sleep: s.sleep, nutrition: s.nutrition })))}

Seja específico: mencione o delta de tempo e rendimento, identifique diferenças nos dados físicos como possível causa. Seja direto, sem rodeios.`;
    }
    if (type === 'weekly') {
      return `Coach de estudos, analise esses dados da semana em português (5-6 frases): ${JSON.stringify(sessions.slice(-7).map(s => ({ date: s.date, duration: Math.round(s.duration/60)+'min', performance: s.performance, period: s.period, sleep: s.sleep })))}. Identifique: melhor dia, pior dia, padrão de horário mais produtivo, impacto do sono.`;
    }
    return `Coach de estudos, analise esse mês em português (6-8 frases): ${JSON.stringify(sessions.slice(-30).map(s => ({ date: s.date, duration: Math.round(s.duration/60)+'min', performance: s.performance, period: s.period, studyType: s.studyType, sleep: s.sleep, nutrition: s.nutrition })))}. Inclua: perfil ideal do estudante (melhor turno + tipo + condições), 3 dicas práticas, meta sugerida.`;
  };

  const run = async () => {
    if (!apiKey) { setError('Configure sua API key da Anthropic no perfil.'); return; }
    setLoading(true); setText(''); setError('');
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
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          stream: true,
          messages: [{ role: 'user', content: buildPrompt() }],
        }),
      });
      if (!res.ok) throw new Error('Erro na API: ' + res.status);
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6);
          if (raw === '[DONE]') break;
          try {
            const json = JSON.parse(raw);
            if (json.type === 'content_block_delta' && json.delta?.text) {
              setText(t => t + json.delta.text);
            }
          } catch {}
        }
      }
    } catch (e) {
      setError('Não foi possível gerar a análise. Verifique sua API key.');
    }
    setLoading(false);
  };

  const labels = { daily: 'Análise do dia', weekly: 'Análise da semana', monthly: 'Análise do mês' };

  return (
    <div className="trk-ai-block">
      <div className="trk-ai-head">
        <span className="trk-ai-label">✦ IA — {labels[type]}</span>
        <button
          className="trk-ai-btn"
          data-cursor="hover"
          onClick={run}
          disabled={loading || !canAnalyze}
        >
          {loading ? 'Analisando...' : alreadyUsedToday ? 'Usado hoje ✓' : 'Gerar análise'}
        </button>
      </div>
      {blockReason && <p className="trk-ai-warn">{blockReason}</p>}
      {error && <p className="trk-ai-error">{error}</p>}
      {text && (
        <div className="trk-ai-text">
          {text}
          {loading && <span className="trk-ai-cursor">▌</span>}
        </div>
      )}
    </div>
  );
}

/* ── Tela idle ── */
function TrackerIdle({ onStart }) {
  return (
    <div className="trk-idle">
      <div className="trk-idle-icon">⏱</div>
      <h1 className="trk-idle-title">Pronto para estudar?</h1>
      <p className="trk-idle-sub">Inicie a sessão e registre seu progresso.</p>
      <button className="trk-start-btn" data-cursor="hover" onClick={onStart}>Iniciar Sessão</button>
    </div>
  );
}

/* ── Timer ativo ── */
function TrackerActive({ elapsed, paused, onPause, onResume, onEnd }) {
  return (
    <div className="trk-active">
      <span className="trk-status-badge">{paused ? 'Pausado' : 'Sessão em andamento'}</span>
      <div className={'trk-clock' + (paused ? ' paused' : '')}>{formatTime(elapsed)}</div>
      <div className="trk-active-actions">
        {paused
          ? <button className="trk-btn trk-btn--resume" data-cursor="hover" onClick={onResume}>▶ Retomar</button>
          : <button className="trk-btn trk-btn--pause"  data-cursor="hover" onClick={onPause}>⏸ Pausar</button>
        }
        <button className="trk-btn trk-btn--end" data-cursor="hover" onClick={onEnd}>Encerrar Sessão</button>
      </div>
    </div>
  );
}

/* ── Formulário ── */
function TrackerForm({ elapsed, form, setField, isComplete, onSave, saving }) {
  return (
    <div className="trk-form-wrap">
      <div className="trk-form-header">
        <h2 className="trk-form-title">Como foi a sessão?</h2>
        <div className="trk-form-duration">
          <span className="trk-form-duration-val">{formatTime(elapsed)}</span>
          <span className="trk-form-duration-label">duração</span>
        </div>
      </div>
      <div className="trk-form-body">
        <div className="trk-form-section">
          <p className="trk-section-title">Sessão</p>
          <div className="trk-field">
            <label className="trk-field-label">O que você estudou?</label>
            <input className="trk-input" type="text" placeholder="Ex: Spring Boot — injeção de dependência"
              value={form.subject} onChange={e => setField('subject')(e.target.value)} maxLength={120} />
          </div>
          <PillGroup label="Tipo de estudo"    options={['Vídeo','Leitura','Prática/Código','Exercícios']} value={form.studyType}      onChange={setField('studyType')} />
          <PillGroup label="Período"           options={['Manhã','Tarde','Noite','Madrugada']}             value={form.period}          onChange={setField('period')} />
        </div>

        <div className="trk-form-section">
          <p className="trk-section-title">Estado Mental</p>
          <PillGroup label="Nível de energia"       options={['Disposto','Neutro','Cansado']}                         value={form.energy}         onChange={setField('energy')} />
          <PillGroup label="Rendimento percebido"   options={['Rendeu muito','Médio','Não rendeu']}                   value={form.performance}    onChange={setField('performance')} />
          <PillGroup label="Humor"                  options={['Motivado','Neutro','Ansioso']}                         value={form.mood}           onChange={setField('mood')} />
          <PillGroup label="Foco"                   options={['Focado','Distraído']}                                  value={form.focus}          onChange={setField('focus')} />
          <PillGroup label="Gostou do assunto?"     options={['Amei','Ok','Não curti']}                               value={form.subjectFeeling} onChange={setField('subjectFeeling')} />
          <PillGroup label="Meta do dia"            options={['Bateu','Parcialmente','Sem meta','Não bateu']}          value={form.goalStatus}     onChange={setField('goalStatus')} />
        </div>

        <div className="trk-form-section">
          <p className="trk-section-title">Estado Físico</p>
          <PillGroup label="Qualidade do sono"  options={['Dormi muito bem','Dormi ok','Dormi pouco','Não dormi direito']} value={form.sleep}      onChange={setField('sleep')} />
          <PillGroup label="Hidratação"         options={['Bebi bastante','Normal','Bebi pouco']}                          value={form.hydration}  onChange={setField('hydration')} />
          <PillGroup label="Alimentação"        options={['Me alimentei bem','Normal','Me alimentei mal']}                 value={form.nutrition}  onChange={setField('nutrition')} />
          <PillGroup label="Atividade física"   options={['Me exercitei','Caminhei','Fiquei parado']}                      value={form.activity}   onChange={setField('activity')} />
          <PillGroup label="Cafeína"            options={['Sim, café/energético','Não tomei']}                             value={form.caffeine}   onChange={setField('caffeine')} />
        </div>

        <button
          className={'trk-save-btn' + (isComplete ? ' active' : '') + (saving ? ' saving' : '')}
          data-cursor="hover"
          disabled={!isComplete || saving}
          onClick={isComplete && !saving ? onSave : undefined}
        >
          {saving ? 'Salvando...' : isComplete ? 'Salvar Sessão ✓' : 'Preencha todos os campos'}
        </button>
      </div>
    </div>
  );
}

/* ── Sucesso ── */
function TrackerSuccess({ session, newBadges, onNew, onDashboard, apiKey }) {
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

      <AiAnalysis sessions={allSessions} type="daily" apiKey={apiKey} />

      <div className="trk-success-actions">
        <button className="trk-btn" data-cursor="hover" onClick={onNew}>Nova Sessão</button>
        <button className="trk-btn trk-btn--end" data-cursor="hover" onClick={onDashboard}>Ver Dashboard</button>
      </div>
    </div>
  );
}

/* ── Sessões recentes (no dashboard da semana) ── */
function RecentSessions() {
  const sessions = window.Data.load().slice(-5).reverse();
  if (!sessions.length) return null;
  return (
    <div className="trk-recent">
      <p className="trk-chart-title">Últimas sessões</p>
      {sessions.map(s => (
        <div key={s.id} className="trk-recent-item">
          <span className="trk-recent-subject">{s.subject || '—'}</span>
          <span className="trk-recent-meta">{s.date} · {Math.round((s.duration||0)/60)}min · {s.performance}</span>
        </div>
      ))}
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
  const [tab,     setTab]     = React.useState('timer');   // 'timer' | 'dashboard'
  const [view,    setView]    = React.useState('idle');    // idle|running|paused|form|success
  const [elapsed, setElapsed] = React.useState(0);
  const [saving,  setSaving]  = React.useState(false);
  const [form,    setForm]    = React.useState(EMPTY_FORM);
  const [lastSession, setLastSession] = React.useState(null);
  const [newBadges,   setNewBadges]   = React.useState([]);
  const [badgeQueue,  setBadgeQueue]  = React.useState([]);

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

  const handleStart = () => {
    startRef.current  = Date.now();
    pausedRef.current = 0;
    setElapsed(0);
    setForm(f => ({ ...f, period: getPeriod(new Date()) }));
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
    setView('form');
  };

  const handleSave = async () => {
    setSaving(true);
    const session = {
      ...form,
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
    setView('success');
  };

  const isComplete = React.useMemo(() => Object.values(form).every(v => v !== ''), [form]);
  const setField   = key => val => setForm(f => ({ ...f, [key]: val }));

  const isTimerActive = ['running', 'paused', 'form'].includes(view);

  return (
    <div className="page active fade-in">
      <div className="trk-wrap">

        {/* Tab nav — hidden while timer is running */}
        {!isTimerActive && (
          <div className="trk-tabs">
            <button className={'trk-tab' + (tab === 'timer'     ? ' active' : '')} data-cursor="hover" onClick={() => setTab('timer')}>⏱ Timer</button>
            <button className={'trk-tab' + (tab === 'dashboard' ? ' active' : '')} data-cursor="hover" onClick={() => setTab('dashboard')}>📊 Dashboard</button>
          </div>
        )}

        {/* Timer tab */}
        {tab === 'timer' && (
          <>
            {view === 'idle'    && <TrackerIdle onStart={handleStart} />}
            {(view === 'running' || view === 'paused') && (
              <TrackerActive elapsed={elapsed} paused={view === 'paused'}
                onPause={handlePause} onResume={handleResume} onEnd={handleEnd} />
            )}
            {view === 'form' && (
              <TrackerForm elapsed={elapsed} form={form} setField={setField}
                isComplete={isComplete} onSave={handleSave} saving={saving} />
            )}
            {view === 'success' && (
              <TrackerSuccess
                session={lastSession}
                newBadges={newBadges}
                apiKey={apiKey}
                onNew={() => { setForm(EMPTY_FORM); setElapsed(0); setView('idle'); }}
                onDashboard={() => { setView('idle'); setTab('dashboard'); }}
              />
            )}
          </>
        )}

        {/* Dashboard tab */}
        {tab === 'dashboard' && (
          <>
            <TrackerDashboard onStartTimer={() => setTab('timer')} />
            <RecentSessions />
            <div className="trk-ai-section">
              <p className="trk-section-title" style={{ marginBottom: 12 }}>Análise com IA</p>
              <AiAnalysis sessions={window.Data.load()} type="daily"   apiKey={apiKey} />
              <AiAnalysis sessions={window.Data.load()} type="weekly"  apiKey={apiKey} />
              <AiAnalysis sessions={window.Data.load()} type="monthly" apiKey={apiKey} />
            </div>
          </>
        )}

      </div>

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

Object.assign(window, { StudyTracker });
