/* ProfilePage.jsx — user profile, stats and account settings */

const PROFILE_OWNER_EMAIL = 'augustovilasb@hotmail.com';

function ProfilePage({ user, onSignOut, onNavigate }) {
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

        {/* ── Danger zone ── */}
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
