/* Nav.jsx — the fixed top navigation */

function Logo({ onClick }) {
  return (
    <div className="nav-logo" data-cursor="hover" onClick={onClick}>
      D<span>30</span>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"  />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ThemeToggle() {
  const [dark, setDark] = React.useState(() => {
    try { return localStorage.getItem('d30-theme') === 'dark'; } catch { return false; }
  });

  // Apply theme on mount and whenever dark changes.
  React.useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('d30-theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  return (
    <button
      className="nav-theme-toggle"
      data-cursor="hover"
      onClick={() => setDark(v => !v)}
      title={dark ? 'Modo claro' : 'Modo escuro'}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function Nav({ page, onNavigate, user, onSignIn, onSignOut, indicCount, onNavigateTo, onNavigateProfile }) {
  const goAnchor = (anchorId) => {
    const doScroll = () => {
      const id = anchorId === 'top' ? 'fp-hero' : anchorId;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
    if (page !== 'home') {
      onNavigate('home');
      setTimeout(doScroll, 80);
    } else {
      doScroll();
    }
  };

  // Floating-pill on scroll: collapse from full-width dark bar into a
  // centred white "cloud" pill once the user passes ~80px of scroll.
  const [floating, setFloating] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <React.Fragment>
      <nav className={[floating ? 'nav--floating' : '', user ? 'nav--app' : ''].filter(Boolean).join(' ')}>
        <div className="nav-slot nav-slot--left">
          <Logo onClick={() => user ? onNavigate('forum') : goAnchor('top')} />
        </div>
        <div className={'nav-slot nav-slot--center' + (user ? ' nav-slot--app' : '')}>
          <div className="nav-links">
            {user ? (
              <React.Fragment>
                <button className={'nav-link' + (page === 'forum'     ? ' active' : '')} data-cursor="hover" onClick={() => onNavigate('forum')}>Fórum</button>
                <button className={'nav-link' + (page === 'roadmap'   ? ' active' : '')} data-cursor="hover" onClick={() => onNavigate('roadmap')}>Roadmap</button>
                <button className={'nav-link' + (page === 'palestras' ? ' active' : '')} data-cursor="hover" onClick={() => onNavigate('palestras')}>Palestras</button>
                <button className={'nav-link' + (page === 'tracker'   ? ' active' : '')} data-cursor="hover" onClick={() => (onNavigateTo || onNavigate)('tracker')}>Tracker</button>
                <button className={'nav-link' + (page === 'ranking'   ? ' active' : '')} data-cursor="hover" onClick={() => (onNavigateTo || onNavigate)('ranking')}>Ranking</button>
                <button className={'nav-link' + (page === 'profile'   ? ' active' : '')} data-cursor="hover" onClick={() => (onNavigateTo || onNavigate)('profile')}>Perfil</button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <button className="nav-link" data-cursor="hover" onClick={() => goAnchor('top')}>Home</button>
                <button className="nav-link" data-cursor="hover" onClick={() => goAnchor('fp-about')}>About</button>
                <button className="nav-link" data-cursor="hover" onClick={() => goAnchor('fp-founder')}>Fundador</button>
              </React.Fragment>
            )}
          </div>
        </div>
        <div className="nav-slot nav-slot--right">
          <div className="nav-right">
            <ThemeToggle />
            {user && <NotificationsBell onNavigate={onNavigateTo || onNavigate} />}
            {user ? (
              <UserChip user={user} onSignOut={onSignOut} indicCount={indicCount} onNavigateProfile={onNavigateProfile} onNavigate={onNavigateTo || onNavigate} />
            ) : (
              <React.Fragment>
                <button className="nav-cta ghost" data-cursor="hover" onClick={() => onSignIn('login')}>
                  <LockIcon />
                  <span>Entrar</span>
                </button>
                <button className="nav-cta nav-cta--signup" data-cursor="hover" onClick={() => onSignIn('signup')}>Entrar na comunidade</button>
              </React.Fragment>
            )}
          </div>
        </div>
      </nav>
      {user && <MobileNav page={page} onNavigate={onNavigateTo || onNavigate} />}
    </React.Fragment>
  );
}

function UserChip({ user, onSignOut, indicCount, onNavigateProfile, onNavigate }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const close = () => setOpen(false);
    if (open) {
      setTimeout(() => document.addEventListener('click', close, { once: true }));
    }
  }, [open]);
  return (
    <div className={'user-chip' + (open ? ' open' : '')} data-cursor="hover" onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}>
      <div className="user-chip-avatar-wrap">
        <div className="user-chip-avatar" style={{ background: user.color || '#6d5ce6' }}>{user.initials}</div>
        {indicCount > 0 && <span className="user-chip-badge">{indicCount}</span>}
      </div>
      <div className="user-chip-name">{user.name}</div>
      <div className="user-menu" onClick={(e) => e.stopPropagation()}>
        <div className="user-menu-info">Conectado como<br/><strong style={{ color: 'var(--text)' }}>{user.email}</strong></div>
        <div className="user-menu-divider"></div>
        <button className="user-menu-item" data-cursor="hover" onClick={() => { setOpen(false); onNavigateProfile && onNavigateProfile(); }}>Meu Perfil</button>
        <button className="user-menu-item" data-cursor="hover" onClick={() => { setOpen(false); onNavigate && onNavigate('settings'); }}>Configurações</button>
        <div className="user-menu-divider"></div>
        <button className="user-menu-item danger" data-cursor="hover" onClick={onSignOut}>Sair</button>
      </div>
    </div>
  );
}

function MobileNav({ page, onNavigate }) {
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 768);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);
  if (!isMobile) return null;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const navBg    = isDark ? '#0d0d0d' : '#ffffff';
  const navBorder= isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const colActive= isDark ? '#f0f0f0' : '#111111';
  const colInact = isDark ? '#555555' : '#999999';

  const tabs = [
    { id: 'forum',     label: 'Fórum',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { id: 'roadmap',   label: 'Road',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg> },
    { id: 'palestras', label: 'Talks',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
    { id: 'tracker',   label: 'Tracker',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { id: 'ranking',   label: 'Ranking',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { id: 'profile',   label: 'Perfil',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 60, display: 'flex', alignItems: 'stretch',
      background: navBg, borderTop: `1px solid ${navBorder}`,
      zIndex: 9000, paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      boxSizing: 'border-box',
    }}>
      {tabs.map(t => {
        const active = page === t.id;
        return (
          <button key={t.id}
            onClick={() => onNavigate(t.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              background: 'none', border: 'none', padding: '6px 2px',
              fontSize: 9, fontWeight: 600, color: active ? colActive : colInact,
              fontFamily: "'Inter', sans-serif", cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              opacity: active ? 1 : 0.7,
            }}
          >
            <span style={{ opacity: active ? 1 : 0.5 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { Nav, Logo, UserChip, LockIcon, ThemeToggle });