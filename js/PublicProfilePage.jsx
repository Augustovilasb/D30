/* PublicProfilePage.jsx — read-only profile for any user, no auth required */

function PublicProfilePage({ username, onSignIn }) {
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      if (!username) { setNotFound(true); setLoading(false); return; }
      const byId = username.startsWith('~');
      const val  = byId ? username.slice(1) : username;
      const { data } = await window.sb
        .from('profiles')
        .select('id, full_name, username, bio, profession, avatar_url, color, github_url, linkedin_url, instagram_url, twitter_url, website_url, total_hours, current_streak, best_streak, total_sessions, is_founding_member, dev_number')
        .eq(byId ? 'id' : 'username', val)
        .single();

      if (!data) { setNotFound(true); } else { setProfile(data); }
      setLoading(false);
    }
    load();
  }, [username]);

  /* update OG / page title when profile loads */
  React.useEffect(() => {
    if (!profile) return;
    document.title = `${profile.full_name || profile.username} — D30`;
    const metas = {
      'og:title':       `${profile.full_name || profile.username} no D30`,
      'og:description': profile.bio || 'Perfil público na comunidade D30',
      'og:image':       profile.avatar_url || '',
      'og:url':         window.location.href,
    };
    Object.entries(metas).forEach(([prop, content]) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
      el.setAttribute('content', content);
    });
    return () => { document.title = 'D30'; };
  }, [profile]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--muted)', fontSize: 14 }}>
      Carregando perfil…
    </div>
  );

  if (notFound) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center', padding: '0 24px' }}>
      <span style={{ fontSize: 32 }}>404</span>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Perfil não encontrado</p>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>@{username} não existe ou ainda não configurou o username.</p>
      {onSignIn && (
        <button className="settings-save-btn" style={{ marginTop: 8 }} data-cursor="hover" onClick={() => onSignIn('signup')}>
          Entrar na comunidade
        </button>
      )}
    </div>
  );

  const isPrivate = !profile.username;
  const name = profile.full_name || profile.username || 'Membro D30';
  const initials = name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase();
  const totalHours = ((profile.total_hours || 0)).toFixed(1);

  return (
    <div className="page active fade-in">
      <div className="pub-profile">

        {/* Hero */}
        <div className="pub-hero">
          <div className="pub-avatar-wrap">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={name} className="pub-avatar-img" />
              : <div className="pub-avatar-init" style={{ background: profile.color || '#6d5ce6' }}>{initials}</div>
            }
          </div>
          <div className="pub-hero-body">
            <div className="pub-hero-top">
              <h1 className="pub-name">
                {name}
                {profile.dev_number !== null && profile.dev_number !== undefined && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: 10, verticalAlign: 'middle' }}>
                    <svg width="22" height="25" viewBox="0 0 34 38" fill="none" style={{ color: '#888' }}>
                      <path d="M17 1.5L32.5 10V28L17 36.5L1.5 28V10Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M17 6L28 12.5V25.5L17 32L6 25.5V12.5Z" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.35"/>
                      <path d="M12 15L8 19L12 23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="20" y1="13.5" x2="14" y2="24.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M22 15L26 19L22 23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ color: '#888', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em' }}>
                      {'DEV ' + String(profile.dev_number).padStart(2, '0')}
                    </span>
                  </span>
                )}
              </h1>
              {profile.username && <span className="pub-username">@{profile.username}</span>}
            </div>
            {!isPrivate && profile.profession && <p className="pub-profession">{profile.profession}</p>}
            {!isPrivate && profile.bio && <p className="pub-bio">{profile.bio}</p>}
            {!isPrivate && (
              <div className="pub-socials">
                {profile.github_url    && <a href={profile.github_url}    target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><GithubIcon /><span>GitHub</span></a>}
                {profile.linkedin_url  && <a href={profile.linkedin_url}  target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><LinkedinIcon /><span>LinkedIn</span></a>}
                {profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><InstagramIcon /><span>Instagram</span></a>}
                {profile.twitter_url   && <a href={profile.twitter_url}   target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><TwitterIcon /><span>Twitter</span></a>}
                {profile.website_url   && <a href={profile.website_url}   target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><WebIcon /><span>Site</span></a>}
              </div>
            )}
          </div>
        </div>

        {/* Perfil privado */}
        {isPrivate && (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--muted)', fontSize: 13 }}>
            <p style={{ margin: 0 }}>Este perfil ainda não foi configurado.</p>
          </div>
        )}

        {/* Stats */}
        {!isPrivate && (profile.total_hours > 0 || profile.total_sessions > 0) && (
          <div className="pub-stats-strip">
            {profile.total_hours > 0 && (
              <React.Fragment>
                <div className="pub-stat-item">
                  <span className="pub-stat-val">{totalHours}h</span>
                  <span className="pub-stat-lbl">estudadas</span>
                </div>
                <div className="pub-stat-sep" />
              </React.Fragment>
            )}
            {profile.total_sessions > 0 && (
              <React.Fragment>
                <div className="pub-stat-item">
                  <span className="pub-stat-val">{profile.total_sessions}</span>
                  <span className="pub-stat-lbl">sessões</span>
                </div>
                <div className="pub-stat-sep" />
              </React.Fragment>
            )}
            {profile.current_streak > 0 && (
              <React.Fragment>
                <div className="pub-stat-item">
                  <span className="pub-stat-val">{profile.current_streak}</span>
                  <span className="pub-stat-lbl">streak atual</span>
                </div>
                <div className="pub-stat-sep" />
              </React.Fragment>
            )}
            {profile.best_streak > 0 && (
              <div className="pub-stat-item">
                <span className="pub-stat-val">{profile.best_streak}</span>
                <span className="pub-stat-lbl">recorde</span>
              </div>
            )}
          </div>
        )}

        {/* CTA para não-membros */}
        {onSignIn && (
          <div className="pub-join-cta">
            <p className="pub-join-text">Faça parte da comunidade D30 e acompanhe sua evolução.</p>
            <button className="settings-save-btn" data-cursor="hover" onClick={() => onSignIn('signup')}>Entrar na comunidade</button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { PublicProfilePage });
