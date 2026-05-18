/* App.jsx — entry. Wires together Nav, pages, modals, toasts, cursor. */

function App() {
  // Preloader plays once per session. Skip on subsequent reloads within the tab.
  const [loaded, setLoaded] = React.useState(() => {
    try { return sessionStorage.getItem('d30-pre-played') === '1'; } catch { return false; }
  });
  const finishPreload = () => {
    setLoaded(true);
    try { sessionStorage.setItem('d30-pre-played', '1'); } catch {}
  };

  const [page, setPage] = React.useState('home');
  const [fading, setFading] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [modal, setModal] = React.useState(null);   // 'login' | 'signup' | 'newPost' | null
  const [toasts, pushToast] = useToasts();

  const PROTECTED = ['forum', 'roadmap', 'palestras'];

  const navigate = (p) => {
    if (PROTECTED.includes(p) && !user) {
      setModal('login');
      return;
    }
    setFading(true);
    setTimeout(function () {
      setPage(p);
      setFading(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (window.motionScan) setTimeout(window.motionScan, 60);
    }, 160);
  };

  React.useEffect(() => {
    if (!user && PROTECTED.includes(page)) setPage('home');
  }, [user, page]);

  const signIn = (u) => setUser(u);
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
        <Nav page={page} onNavigate={navigate} user={user} onSignIn={(which) => setModal(which)} onSignOut={signOut} />
        <SideRail visible={!!user} page={page} onNavigate={navigate} />

        <div className="page-shell" style={{ opacity: fading ? 0 : 1 }}>
          {page === 'home'      && <HomePage      onNavigate={navigate} onSignIn={() => setModal(user ? null : 'signup')} />}
          {page === 'about'     && <HomePage      onNavigate={navigate} onSignIn={() => setModal(user ? null : 'signup')} />}
          {page === 'forum'     && user && <ForumPage     user={user} onSignIn={(which) => setModal(which)} onNewPost={() => openModal('newPost')} />}
          {page === 'roadmap'   && user && <RoadmapPage />}
          {page === 'palestras' && user && <PalestrasPage />}
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
