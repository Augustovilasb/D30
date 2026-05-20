/* PublicProfilePage.jsx — read-only profile for any user, no auth required */

function PublicProfilePage({ username, onSignIn }) {
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      if (!username) { setNotFound(true); setLoading(false); return; }
      const { data } = await window.sb
        .from('profiles')
        .select('id, full_name, username, bio, profession, avatar_url, color, github_url, linkedin_url, instagram_url, twitter_url, website_url, total_hours, current_streak, best_streak, total_sessions, is_founding_member')
        .eq('username', username)
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

  const name = profile.full_name || profile.username || 'Anônimo';
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
                {profile.is_founding_member && (
                  <span title="Membro Fundador" style={{ color: '#f59e0b', marginLeft: 8, fontSize: 18 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                      <path d="M2 4l4 8 6-10 6 10 4-8-2 14H4z"/>
                    </svg>
                  </span>
                )}
              </h1>
              {profile.username && <span className="pub-username">@{profile.username}</span>}
            </div>
            {profile.profession && <p className="pub-profession">{profile.profession}</p>}
            {profile.bio && <p className="pub-bio">{profile.bio}</p>}
            <div className="pub-socials">
              {profile.github_url    && <a href={profile.github_url}    target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><GithubIcon /><span>GitHub</span></a>}
              {profile.linkedin_url  && <a href={profile.linkedin_url}  target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><LinkedinIcon /><span>LinkedIn</span></a>}
              {profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><InstagramIcon /><span>Instagram</span></a>}
              {profile.twitter_url   && <a href={profile.twitter_url}   target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><TwitterIcon /><span>Twitter</span></a>}
              {profile.website_url   && <a href={profile.website_url}   target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><WebIcon /><span>Site</span></a>}
            </div>
          </div>
        </div>

        {/* Stats */}
        {(profile.total_hours > 0 || profile.total_sessions > 0) && (
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
