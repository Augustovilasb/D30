/* ProfilePage.jsx — user profile, stats and account settings */

const PROFILE_OWNER_EMAIL = 'augustovilasb@hotmail.com';

function ProfilePage({ user, onSignOut, onNavigate }) {
  const [aiKey,    setAiKey]    = React.useState(() => { try { return localStorage.getItem('d30_ai_key') || ''; } catch { return ''; } });
  const [aiSaved,  setAiSaved]  = React.useState(false);
  const [showKey,  setShowKey]  = React.useState(false);

  const saveAiKey = () => {
    try { localStorage.setItem('d30_ai_key', aiKey.trim()); } catch {}
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 2000);
  };

  const rmDone  = React.useMemo(() => {
    try { return new Set(JSON.parse(localStorage.getItem('d30_roadmap_v3') || '[]')); } catch { return new Set(); }
  }, []);

  const totalCourses = COURSES ? COURSES.length : 12;
  const doneCourses  = COURSES ? COURSES.filter(c => rmDone.has(c.id)).length : rmDone.size;
  const rmPct        = totalCourses > 0 ? Math.round(doneCourses / totalCourses * 100) : 0;

  const indicCount = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('d30_indicacoes') || '[]').length; } catch { return 0; }
  }, []);

  const isOwner = user && user.email === PROFILE_OWNER_EMAIL;

  return (
    <div className="page active fade-in">
      <div className="profile-wrap">

        {/* ── Avatar hero ── */}
        <div className="profile-hero">
          <div className="profile-avatar" style={{ background: user.color || '#6d5ce6' }}>
            {user.initials}
          </div>
          <div className="profile-hero-info">
            <h1 className="profile-name">{user.name}</h1>
            <p  className="profile-email">{user.email}</p>
            {isOwner && <span className="profile-owner-badge">Fundador</span>}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="profile-section">
          <p className="profile-section-label">Progresso</p>
          <div className="profile-stats">
            <div className="profile-stat-card" data-cursor="hover" onClick={() => onNavigate && onNavigate('roadmap')}>
              <span className="profile-stat-value">{rmPct}%</span>
              <span className="profile-stat-key">Roadmap</span>
              <div className="profile-stat-bar">
                <div className="profile-stat-bar-fill" style={{ width: rmPct + '%' }} />
              </div>
              <span className="profile-stat-sub">{doneCourses}/{totalCourses} cursos</span>
            </div>

            {isOwner && indicCount > 0 && (
              <div className="profile-stat-card" data-cursor="hover" onClick={() => onNavigate && onNavigate('palestras')}>
                <span className="profile-stat-value">{indicCount}</span>
                <span className="profile-stat-key">Indicações</span>
                <span className="profile-stat-sub">palestras enviadas</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Account ── */}
        <div className="profile-section">
          <p className="profile-section-label">Conta</p>
          <div className="profile-account-card">
            <div className="profile-account-row">
              <span className="profile-account-key">Nome</span>
              <span className="profile-account-val">{user.name}</span>
            </div>
            <div className="profile-account-divider" />
            <div className="profile-account-row">
              <span className="profile-account-key">E-mail</span>
              <span className="profile-account-val">{user.email}</span>
            </div>
            <div className="profile-account-divider" />
            <div className="profile-account-row">
              <span className="profile-account-key">Membro desde</span>
              <span className="profile-account-val">2025</span>
            </div>
          </div>
        </div>

        {/* ── IA ── */}
        <div className="profile-section">
          <p className="profile-section-label">Análise com IA</p>
          <div className="profile-account-card">
            <div className="profile-account-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
              <span className="profile-account-key">API Key da Anthropic</span>
              <p style={{ fontSize: 12, color: 'var(--muted2)', margin: 0 }}>
                Necessária para gerar análises com IA no Tracker. Obtida em{' '}
                <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>console.anthropic.com</a>.
              </p>
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  className="trk-input"
                  placeholder="sk-ant-..."
                  value={aiKey}
                  onChange={e => setAiKey(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="profile-key-toggle" data-cursor="hover" onClick={() => setShowKey(v => !v)}>
                  {showKey ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              <button className="profile-key-save" data-cursor="hover" onClick={saveAiKey}>
                {aiSaved ? 'Salvo ✓' : 'Salvar chave'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Sair ── */}
        <div className="profile-section">
          <button className="profile-signout-btn" data-cursor="hover" onClick={onSignOut}>
            Sair da conta
          </button>
        </div>

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { ProfilePage });
