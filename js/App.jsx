/* App.jsx — entry. Wires together Nav, pages, modals, toasts, cursor. */

const PROTECTED = ['forum', 'roadmap', 'palestras', 'profile', 'tracker', 'settings', 'edit-profile', 'ranking', 'vagas', 'livros'];

async function buildUserObj(supabaseUser) {
  let profile = null;
  try {
    profile = await window.Auth.getProfile(supabaseUser.id);
    console.log('[D30] getProfile result:', profile);
    if (profile) {
      try { localStorage.setItem('d30_profile_v2', JSON.stringify(profile)); } catch {}
    }
  } catch (e) {
    console.error('[D30] getProfile threw:', e?.message || e);
  }

  if (!profile) {
    try {
      const cached = JSON.parse(localStorage.getItem('d30_profile_v2') || 'null');
      if (cached) { console.warn('[D30] Supabase sem dados — usando cache local'); profile = cached; }
    } catch {}
  }

  const name = profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0];
  const initials = name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase();
  return { id: supabaseUser.id, email: supabaseUser.email, name, initials, username: profile?.username || '', color: '#6d5ce6', avatar_url: profile?.avatar_url || null, bio: profile?.bio || null, profession: profile?.profession || null, github_url: profile?.github_url || null, linkedin_url: profile?.linkedin_url || null, instagram_url: profile?.instagram_url || null, twitter_url: profile?.twitter_url || null, website_url: profile?.website_url || null, is_founding_member: profile?.is_founding_member || false, is_admin: profile?.is_admin || false };
}

function App() {
  const [indicCount, setIndicCount] = React.useState(0);

  const [loaded, setLoaded] = React.useState(() => {
    try { return sessionStorage.getItem('d30-pre-played') === '1'; } catch { return false; }
  });
  const finishPreload = () => {
    setLoaded(true);
    try { sessionStorage.setItem('d30-pre-played', '1'); } catch {}
  };

  /* Detect /perfil/:username path — public profile, no auth needed */
  const publicUsername = React.useMemo(() => {
    const m = window.location.pathname.match(/^\/perfil\/([^/\s]+)$/);
    return m ? m[1] : null;
  }, []);

  const [page, setPage] = React.useState(() => {
    if (publicUsername) return 'public-profile';
    const hash = window.location.hash.replace('#', '') || 'home';
    return hash; // não força home aqui — authReady cuida disso
  });
  const [navKey,    setNavKey]    = React.useState(0);
  const [fading,    setFading]    = React.useState(false);
  const [user,      setUser]      = React.useState(null);
  const [authReady, setAuthReady] = React.useState(false);
  const [modal,     setModal]     = React.useState(null);
  const [toasts,    pushToast]    = useToasts();

  React.useEffect(() => {
    if (publicUsername) return; // don't mess with URL for public profile
    window.history.replaceState({ page }, '', page === 'home' ? '#' : '#' + page);
  }, []);

  const navigate = (p, authedUser) => {
    const target = p === 'about' ? 'home' : p;
    if (PROTECTED.includes(target) && !(authedUser || user)) { setModal('login'); return; }
    window.history.pushState({ page: target }, '', target === 'home' ? '#' : '#' + target);
    setFading(true);
    setTimeout(function () {
      setPage(target);
      setNavKey(k => k + 1);
      setFading(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (window.motionScan) setTimeout(window.motionScan, 60);
    }, 160);
  };

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

  /* Redireciona assim que o auth resolve */
  React.useEffect(() => {
    if (!authReady) return;
    if (user && page === 'home') {
      navigate('forum', user);
    } else if (!user && PROTECTED.includes(page)) {
      setPage('home');
      window.history.replaceState({ page: 'home' }, '', '#');
    }
  }, [authReady]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const { data } = window.Auth.onAuthChange(async (event, supabaseUser) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setAuthReady(true);
        return;
      }
      if (event === 'TOKEN_REFRESHED') return;

      if (supabaseUser) {
        buildUserObj(supabaseUser).then(u => {
          setUser(u);
          setAuthReady(true);
          if (window.Data) window.Data.updateProfileStats(supabaseUser.id);
          if (u?.is_admin && window.DB) {
            window.DB.talks.getSuggestions().then(list => setIndicCount(list.length)).catch(() => {});
          }
        });
      } else {
        setAuthReady(true);
      }
    });
    return () => data?.subscription?.unsubscribe();
  }, []);

  const signIn = (u) => {
    setUser(u);
    if (u?.is_admin && window.DB) {
      window.DB.talks.getSuggestions().then(list => setIndicCount(list.length)).catch(() => {});
    }
    if (!publicUsername) navigate('forum', u);
  };

  const signOut = async () => {
    try { await window.Auth.signOut(); } catch {}
    setUser(null);
    pushToast('info', 'Até a próxima.');
  };

  const openModal = (which) => {
    if (which === 'newPost' && !user) { setModal('login'); return; }
    setModal(which);
  };

  /* Public profile — minimal shell, no preloader, no protected nav */
  if (publicUsername && page === 'public-profile') {
    return (
      <React.Fragment>
        <div className="kit-shell">
          <CustomCursor />
          <Nav page="home" onNavigate={navigate} onNavigateTo={navigate} user={user} onSignIn={(which) => setModal(which)} onSignOut={signOut} indicCount={0} onNavigateProfile={() => navigate('profile')} />
          <div className="page-shell">
            <PublicProfilePage username={publicUsername} onSignIn={user ? null : (which) => setModal(which)} />
          </div>
          <LoginModal  open={modal === 'login'}  onClose={() => setModal(null)} onSignIn={signIn} onSwitch={setModal} toast={pushToast} />
          <SignupModal open={modal === 'signup'} onClose={() => setModal(null)} onSignIn={signIn} onSwitch={setModal} toast={pushToast} />
          <ToastStack toasts={toasts} />
        </div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {!loaded && <Preloader onDone={finishPreload} />}
      <div className="kit-shell">
        <CustomCursor />
        <Nav page={page} onNavigate={navigate} onNavigateTo={navigate} user={user} onSignIn={(which) => setModal(which)} onSignOut={signOut} indicCount={user?.is_admin ? indicCount : 0} onNavigateProfile={() => navigate('profile')} />
        <SideRail visible={false} page={page} onNavigate={navigate} />

        <div className="page-shell" style={{ opacity: fading ? 0 : 1 }}>
          {page === 'home'      && <HomePage      key={navKey} onNavigate={navigate} onSignIn={() => setModal(user ? null : 'signup')} />}
          {page === 'forum'     && user && <ForumPage     key={navKey} user={user} onSignIn={(which) => setModal(which)} toast={pushToast} />}
          {page === 'roadmap'   && user && <RoadmapPage   key={navKey} user={user} />}
          {page === 'palestras' && user && <PalestrasPage key={navKey} toast={pushToast} user={user} onIndicCountChange={setIndicCount} />}
          {page === 'profile'   && user && <ProfilePage   key={navKey} user={user} onSignOut={signOut} onNavigate={navigate} />}
          {page === 'tracker'   && user && <StudyTracker  key={navKey} user={user} />}
          {page === 'settings'     && user && <SettingsPage     key={navKey} user={user} onSignOut={signOut} onNavigate={navigate} />}
          {page === 'edit-profile' && user && <EditProfilePage  key={navKey} user={user} onUpdate={(u) => setUser(u)} onNavigate={navigate} />}
          {page === 'ranking'   && user && <RankingPage   key={navKey} user={user} />}
          {page === 'vagas'     && user && <VagasPage     key={navKey} user={user} toast={pushToast} />}
          {page === 'livros'    && user && <LivrosPage    key={navKey} user={user} toast={pushToast} />}
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
