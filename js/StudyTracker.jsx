/* StudyTracker.jsx — timer + formulário pós-sessão */

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
          <button
            key={opt}
            type="button"
            className={'trk-pill' + (value === opt ? ' active' : '')}
            data-cursor="hover"
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Tela inicial ── */
function TrackerIdle({ onStart }) {
  return (
    <div className="trk-idle">
      <div className="trk-idle-icon">⏱</div>
      <h1 className="trk-idle-title">Pronto para estudar?</h1>
      <p className="trk-idle-sub">Inicie a sessão e registre seu progresso.</p>
      <button className="trk-start-btn" data-cursor="hover" onClick={onStart}>
        Iniciar Sessão
      </button>
    </div>
  );
}

/* ── Timer rodando / pausado ── */
function TrackerActive({ elapsed, paused, onPause, onResume, onEnd }) {
  return (
    <div className="trk-active">
      <span className="trk-status-badge">{paused ? 'Pausado' : 'Sessão em andamento'}</span>
      <div className={'trk-clock' + (paused ? ' paused' : '')}>
        {formatTime(elapsed)}
      </div>
      <div className="trk-active-actions">
        {paused ? (
          <button className="trk-btn trk-btn--resume" data-cursor="hover" onClick={onResume}>
            ▶ Retomar
          </button>
        ) : (
          <button className="trk-btn trk-btn--pause" data-cursor="hover" onClick={onPause}>
            ⏸ Pausar
          </button>
        )}
        <button className="trk-btn trk-btn--end" data-cursor="hover" onClick={onEnd}>
          Encerrar Sessão
        </button>
      </div>
    </div>
  );
}

/* ── Formulário pós-sessão ── */
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

        {/* Sessão */}
        <div className="trk-form-section">
          <p className="trk-section-title">Sessão</p>

          <div className="trk-field">
            <label className="trk-field-label">O que você estudou?</label>
            <input
              className="trk-input"
              type="text"
              placeholder="Ex: Spring Boot — injeção de dependência"
              value={form.subject}
              onChange={e => setField('subject')(e.target.value)}
              maxLength={120}
            />
          </div>

          <PillGroup
            label="Tipo de estudo"
            options={['Vídeo', 'Leitura', 'Prática/Código', 'Exercícios']}
            value={form.studyType}
            onChange={setField('studyType')}
          />

          <PillGroup
            label="Período"
            options={['Manhã', 'Tarde', 'Noite', 'Madrugada']}
            value={form.period}
            onChange={setField('period')}
          />
        </div>

        {/* Estado Mental */}
        <div className="trk-form-section">
          <p className="trk-section-title">Estado Mental</p>

          <PillGroup
            label="Nível de energia"
            options={['Disposto', 'Neutro', 'Cansado']}
            value={form.energy}
            onChange={setField('energy')}
          />
          <PillGroup
            label="Rendimento percebido"
            options={['Rendeu muito', 'Médio', 'Não rendeu']}
            value={form.performance}
            onChange={setField('performance')}
          />
          <PillGroup
            label="Humor"
            options={['Motivado', 'Neutro', 'Ansioso']}
            value={form.mood}
            onChange={setField('mood')}
          />
          <PillGroup
            label="Foco"
            options={['Focado', 'Distraído']}
            value={form.focus}
            onChange={setField('focus')}
          />
          <PillGroup
            label="Gostou do assunto?"
            options={['Amei', 'Ok', 'Não curti']}
            value={form.subjectFeeling}
            onChange={setField('subjectFeeling')}
          />
          <PillGroup
            label="Meta do dia"
            options={['Bateu', 'Parcialmente', 'Sem meta', 'Não bateu']}
            value={form.goalStatus}
            onChange={setField('goalStatus')}
          />
        </div>

        {/* Estado Físico */}
        <div className="trk-form-section">
          <p className="trk-section-title">Estado Físico</p>

          <PillGroup
            label="Qualidade do sono"
            options={['Dormi muito bem', 'Dormi ok', 'Dormi pouco', 'Não dormi direito']}
            value={form.sleep}
            onChange={setField('sleep')}
          />
          <PillGroup
            label="Hidratação"
            options={['Bebi bastante', 'Normal', 'Bebi pouco']}
            value={form.hydration}
            onChange={setField('hydration')}
          />
          <PillGroup
            label="Alimentação"
            options={['Me alimentei bem', 'Normal', 'Me alimentei mal']}
            value={form.nutrition}
            onChange={setField('nutrition')}
          />
          <PillGroup
            label="Atividade física"
            options={['Me exercitei', 'Caminhei', 'Fiquei parado']}
            value={form.activity}
            onChange={setField('activity')}
          />
          <PillGroup
            label="Cafeína"
            options={['Sim, café/energético', 'Não tomei']}
            value={form.caffeine}
            onChange={setField('caffeine')}
          />
        </div>

        <button
          className={'trk-save-btn' + (isComplete ? ' active' : '') + (saving ? ' saving' : '')}
          data-cursor="hover"
          onClick={isComplete && !saving ? onSave : undefined}
          disabled={!isComplete || saving}
        >
          {saving ? 'Salvando...' : isComplete ? 'Salvar Sessão ✓' : 'Preencha todos os campos'}
        </button>

      </div>
    </div>
  );
}

/* ── Sucesso ── */
function TrackerSuccess({ session, onNew, onDashboard }) {
  const hrs  = Math.floor((session?.duration || 0) / 3600);
  const mins = Math.floor(((session?.duration || 0) % 3600) / 60);
  const label = hrs > 0 ? `${hrs}h ${mins}min` : `${mins}min`;

  return (
    <div className="trk-success">
      <div className="trk-success-icon">✓</div>
      <h2 className="trk-success-title">Sessão registrada!</h2>
      <p className="trk-success-sub">{label} de estudo salvos.</p>
      <div className="trk-success-actions">
        <button className="trk-btn trk-btn--new" data-cursor="hover" onClick={onNew}>
          Nova Sessão
        </button>
        <button className="trk-btn trk-btn--dash" data-cursor="hover" onClick={onDashboard}>
          Ver Dashboard
        </button>
      </div>
    </div>
  );
}

/* ── Container principal ── */
function StudyTracker({ user }) {
  const [view,    setView]    = React.useState('idle');
  const [elapsed, setElapsed] = React.useState(0);
  const [saving,  setSaving]  = React.useState(false);
  const [lastSession, setLastSession] = React.useState(null);

  const startTimeRef   = React.useRef(null);
  const totalPausedRef = React.useRef(0);
  const pauseStartRef  = React.useRef(null);
  const tickRef        = React.useRef(null);

  const EMPTY_FORM = {
    subject: '', studyType: '', period: '',
    energy: '', performance: '', mood: '', focus: '', subjectFeeling: '', goalStatus: '',
    sleep: '', hydration: '', nutrition: '', activity: '', caffeine: '',
  };
  const [form, setForm] = React.useState(EMPTY_FORM);

  const tick = React.useCallback(() => {
    setElapsed(Math.floor((Date.now() - startTimeRef.current - totalPausedRef.current) / 1000));
  }, []);

  React.useEffect(() => () => clearInterval(tickRef.current), []);

  const handleStart = () => {
    startTimeRef.current  = Date.now();
    totalPausedRef.current = 0;
    setElapsed(0);
    setForm(f => ({ ...f, period: getPeriod(new Date()) }));
    tickRef.current = setInterval(tick, 1000);
    setView('running');
  };

  const handlePause = () => {
    clearInterval(tickRef.current);
    pauseStartRef.current = Date.now();
    setView('paused');
  };

  const handleResume = () => {
    totalPausedRef.current += Date.now() - pauseStartRef.current;
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
      date:      new Date(startTimeRef.current).toISOString().split('T')[0],
      startedAt: new Date(startTimeRef.current).toISOString(),
    };
    const saved = window.Data.saveSession(session);
    await window.Data.syncToSupabase(saved, user?.id);
    setLastSession(saved);
    setSaving(false);
    setView('success');
  };

  const isComplete = React.useMemo(
    () => Object.values(form).every(v => v !== ''),
    [form]
  );

  const setField = key => val => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="page active fade-in">
      <div className="trk-wrap">
        {view === 'idle' && (
          <TrackerIdle onStart={handleStart} />
        )}
        {(view === 'running' || view === 'paused') && (
          <TrackerActive
            elapsed={elapsed}
            paused={view === 'paused'}
            onPause={handlePause}
            onResume={handleResume}
            onEnd={handleEnd}
          />
        )}
        {view === 'form' && (
          <TrackerForm
            elapsed={elapsed}
            form={form}
            setField={setField}
            isComplete={isComplete}
            onSave={handleSave}
            saving={saving}
          />
        )}
        {view === 'success' && (
          <TrackerSuccess
            session={lastSession}
            onNew={() => { setForm(EMPTY_FORM); setElapsed(0); setView('idle'); }}
            onDashboard={() => setView('idle')}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { StudyTracker });
