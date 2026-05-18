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

function Nav({ page, onNavigate, user, onSignIn, onSignOut }) {
  // Only two nav links: Home (top) and About (anchor to #sobre section).
  // Centered between logo (left) and CTAs/user-chip (right).
  const goAnchor = (anchorId) => {
    const doScroll = () => {
      if (anchorId === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      const el = document.getElementById(anchorId);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
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
    <nav className={floating ? 'nav--floating' : ''}>
      <div className="nav-slot nav-slot--left">
        <Logo onClick={() => goAnchor('top')} />
      </div>
      <div className="nav-slot nav-slot--center">
        <div className="nav-links">
          <button className="nav-link" data-cursor="hover" onClick={() => goAnchor('top')}>Home</button>
          <button className="nav-link" data-cursor="hover" onClick={() => goAnchor('sobre')}>About</button>
        </div>
      </div>
      <div className="nav-slot nav-slot--right">
        <div className="nav-right">
          {user ? (
            <UserChip user={user} onSignOut={onSignOut} />
          ) : (
            <React.Fragment>
              <button className="nav-cta ghost" data-cursor="hover" onClick={() => onSignIn('login')}>
                <LockIcon />
                <span>Entrar</span>
              </button>
              <button className="nav-cta" data-cursor="hover" onClick={() => onSignIn('signup')}>Entrar na comunidade</button>
            </React.Fragment>
          )}
        </div>
      </div>
    </nav>
  );
}

function UserChip({ user, onSignOut }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const close = () => setOpen(false);
    if (open) {
      setTimeout(() => document.addEventListener('click', close, { once: true }));
    }
  }, [open]);
  return (
    <div className={'user-chip' + (open ? ' open' : '')} data-cursor="hover" onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}>
      <div className="user-chip-avatar" style={{ background: user.color || '#6d5ce6' }}>{user.initials}</div>
      <div className="user-chip-name">{user.name}</div>
      <div className="user-menu" onClick={(e) => e.stopPropagation()}>
        <div className="user-menu-info">Conectado como<br/><strong style={{ color: 'var(--text)' }}>{user.email}</strong></div>
        <div className="user-menu-divider"></div>
        <button className="user-menu-item" data-cursor="hover">Meu perfil</button>
        <button className="user-menu-item" data-cursor="hover">Configurações</button>
        <div className="user-menu-divider"></div>
        <button className="user-menu-item danger" data-cursor="hover" onClick={onSignOut}>Sair</button>
      </div>
    </div>
  );
}

Object.assign(window, { Nav, Logo, UserChip, LockIcon });
