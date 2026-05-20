/* App.jsx — entry. Wires together Nav, pages, modals, toasts, cursor. */

const PROTECTED = ['forum', 'roadmap', 'palestras', 'profile', 'tracker', 'settings'];

async function buildUserObj(supabaseUser) {
  try {
    const profile = await window.Auth.getProfile(supabaseUser.id);
    const name = profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0];
    const initials = name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase();
    return { id: supabaseUser.id, email: supabaseUser.email, name, initials, username: profile?.username || '', color: '#6d5ce6', avatar_url: profile?.avatar_url || null, bio: profile?.bio || null, profession: profile?.profession || null, github_url: profile?.github_url || null, linkedin_url: profile?.linkedin_url || null, twitter_url: profile?.twitter_url || null, website_url: profile?.website_url || null };
  } catch {
    const name = supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0];
    const initials = name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase();
    return { id: supabaseUser.id, email: supabaseUser.email, name, initials, username: '', color: '#6d5ce6', avatar_url: null };
  }
}

function App() {
  // Preloader plays once per session. Skip on subsequent reloads within the tab.
  const [indicCount, setIndicCount] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('d30_indicacoes') || '[]').length; } catch { return 0; }
  });

  const [loaded, setLoaded] = React.useState(() => {
    try { return sessionStorage.getItem('d30-pre-played') === '1'; } catch { return false; }
  });
  const finishPreload = () => {
    setLoaded(true);
    try { sessionStorage.setItem('d30-pre-played', '1'); } catch {}
  };

  // Initialize page from URL hash; fall back to 'home' for protected routes.
  const [page, setPage] = React.useState(() => {
    const hash = window.location.hash.replace('#', '') || 'home';
    return PROTECTED.includes(hash) ? 'home' : hash;
  });
  const [fading, setFading] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [modal, setModal] = React.useState(null);   // 'login' | 'signup' | 'newPost' | null
  const [toasts, pushToast] = useToasts();

  // Stamp the current page into the history entry on first load.
  React.useEffect(() => {
    window.history.replaceState({ page }, '', page === 'home' ? '#' : '#' + page);
  }, []);

  const navigate = (p) => {
    // 'about' is an anchor section inside HomePage — map it to home.
    const target = p === 'about' ? 'home' : p;
    if (PROTECTED.includes(target) && !user) {
      setModal('login');
      return;
    }
    window.history.pushState({ page: target }, '', target === 'home' ? '#' : '#' + target);
    setFading(true);
    setTimeout(function () {
      setPage(target);
      setFading(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (window.motionScan) setTimeout(window.motionScan, 60);
    }, 160);
  };

  // Keep the URL in sync when the user hits browser back / forward.
  React.useEffect(() => {
    const onPop = (e) => {
      const p = (e.state && e.state.page) || window.location.hash.replace('#', '') || 'home';
      if (PROTECTED.includes(p) && !user) {
        setPage('home');
        window.history.replaceState({ page: 'home' }, '', '#');
        return;
      }
      setPage(p);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [user]);

  // If the user logs out while on a protected page, kick them home.
  React.useEffect(() => {
    if (!user && PROTECTED.includes(page)) {
      setPage('home');
      window.history.replaceState({ page: 'home' }, '', '#');
    }
  }, [user, page]);

  React.useEffect(() => {
    const { data } = window.Auth.onAuthChange(async (supabaseUser) => {
      if (supabaseUser) {
        const u = await buildUserObj(supabaseUser);
        setUser(u);
      } else {
        setUser(null);
      }
    });
    return () => data?.subscription?.unsubscribe();
  }, []);

  const signIn = (u) => setUser(u);

  // Redireciona para o fórum assim que o login é confirmado
  React.useEffect(() => {
    if (user) navigate('forum');
  }, [user]);
  const signOut = () => { setUser(null); pushToast('info', 'Até a próxima.'); };

  const openModal = (which) => {
    if (which === 'newPost' && !user) { setModal('login'); return; }
    setModal(which);
  };

  return (
    <React.Fragment>
      {!loaded && <Preloader onDone={finishPreload} />}
      <div className="kit-shell">
        <CustomCursor />
        <Nav page={page} onNavigate={navigate} onNavigateTo={navigate} user={user} onSignIn={(which) => setModal(which)} onSignOut={signOut} indicCount={user && user.email === 'augustovilasb@hotmail.com' ? indicCount : 0} onNavigateProfile={() => navigate('profile')} />
        <SideRail visible={false} page={page} onNavigate={navigate} />

        <div className="page-shell" style={{ opacity: fading ? 0 : 1 }}>
          {page === 'home'      && <HomePage      onNavigate={navigate} onSignIn={() => setModal(user ? null : 'signup')} />}
          {page === 'forum'     && user && <ForumPage     user={user} onSignIn={(which) => setModal(which)} toast={pushToast} />}
          {page === 'roadmap'   && user && <RoadmapPage />}
          {page === 'palestras' && user && <PalestrasPage toast={pushToast} user={user} onIndicCountChange={setIndicCount} />}
          {page === 'profile'   && user && <ProfilePage   user={user} onSignOut={signOut} onNavigate={navigate} />}
          {page === 'tracker'   && user && <StudyTracker  user={user} />}
          {page === 'settings'  && user && <SettingsPage user={user} onUpdate={(u) => setUser(u)} onSignOut={signOut} onNavigate={navigate} />}
        </div>

        <LoginModal   open={modal === 'login'}   onClose={() => setModal(null)} onSignIn={signIn} onSwitch={setModal} toast={pushToast} />
        <SignupModal  open={modal === 'signup'}  onClose={() => setModal(null)} onSignIn={signIn} onSwitch={setModal} toast={pushToast} />
        <NewPostModal open={modal === 'newPost'} onClose={() => setModal(null)} toast={pushToast} />

        <ToastStack toasts={toasts} />
      </div>
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);