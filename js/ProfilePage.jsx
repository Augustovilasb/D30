/* ProfilePage.jsx — public user profile */

function BadgeIcon({ slug, color, size = 22 }) {
  const inner = (window.Badges.ICONS || {})[slug] || '';
  if (!inner) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ color: color || 'var(--muted)', flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

function GithubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function WebIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  );
}

/* Stat card com ícone SVG */
function StatCard({ iconSlug, value, label, color }) {
  return (
    <div className="pub-stat-card">
      <div className="pub-stat-card-icon" style={{ color: color || 'var(--muted)' }}>
        <BadgeIcon slug={iconSlug} color={color || 'var(--muted)'} size={18} />
      </div>
      <span className="pub-stat-card-val">{value}</span>
      <span className="pub-stat-card-lbl">{label}</span>
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

/* Read-only activity heatmap — full-width, 16 weeks */
function ActivityGrid({ sessions }) {
  const sessMap = React.useMemo(() => {
    const m = {};
    sessions.forEach(s => { m[s.date] = (m[s.date] || 0) + (s.duration || 0); });
    return m;
  }, [sessions]);

  const weeks = React.useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const cells = [];
    for (let i = 111; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      cells.push({ date: key, secs: sessMap[key] || 0 });
    }
    const pad = new Date(cells[0].date).getDay();
    const padded = [...Array(pad).fill(null), ...cells];
    const w = [];
    for (let i = 0; i < padded.length; i += 7) w.push(padded.slice(i, i + 7));
    return w;
  }, [sessMap]);

  function color(secs) {
    if (!secs) return 'var(--bg3)';
    const h = secs / 3600;
    if (h < 1) return '#444';
    if (h < 2) return '#666';
    if (h < 4) return '#999';
    return '#ccc';
  }

  return (
    <div className="pub-activity-grid">
      {weeks.map((week, wi) => (
        <div key={wi} className="pub-activity-week">
          {Array.from({ length: 7 }, (_, di) => {
            const day = week[di];
            return (
              <div
                key={di}
                className="pub-activity-cell"
                style={{ background: day ? color(day.secs) : 'transparent' }}
                title={day ? `${day.date}${day.secs ? ': ' + (day.secs/3600).toFixed(1) + 'h' : ''}` : ''}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SharePopup({ url, onClose }) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const close = (e) => {
      if (!e.target.closest('.pub-share-popup-wrap')) onClose();
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); onClose(); }, 1800);
    });
  };

  const text = encodeURIComponent('Veja meu perfil no D30 👇');
  const enc  = encodeURIComponent(url);

  const options = [
    {
      label: copied ? 'Copiado ✓' : 'Copiar link',
      icon: '<rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.8" fill="none"/>',
      action: copy,
      href: null,
    },
    {
      label: 'WhatsApp',
      icon: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="1.8" fill="none"/>',
      href: `https://wa.me/?text=${text}%20${enc}`,
    },
    {
      label: 'Twitter / X',
      icon: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>',
      href: `https://twitter.com/intent/tweet?url=${enc}&text=${text}`,
    },
    {
      label: 'LinkedIn',
      icon: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="1.8" fill="none"/><rect x="2" y="9" width="4" height="12" stroke="currentColor" stroke-width="1.8" fill="none"/><circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="1.8" fill="none"/>',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`,
    },
    {
      label: 'Instagram',
      icon: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" stroke-width="2"/>',
      action: () => {
        navigator.clipboard.writeText(url).then(() => {
          window.open('https://www.instagram.com/', '_blank');
          setCopied(true);
          setTimeout(() => { setCopied(false); onClose(); }, 2000);
        });
      },
      href: null,
      hint: 'Abre o Instagram com o link copiado',
    },
  ];

  return (
    <div className="pub-share-popup">
      <p className="pub-share-popup-url">{url}</p>
      {options.map((opt, i) => {
        const inner = (
          <React.Fragment>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: opt.icon }} />
            <span>{opt.label}</span>
          </React.Fragment>
        );
        const el = opt.href ? (
          <a key={i} href={opt.href} target="_blank" rel="noopener noreferrer" className="pub-share-option" data-cursor="hover">{inner}</a>
        ) : (
          <button key={i} className={'pub-share-option' + (opt.hint ? ' has-hint' : '')} data-cursor="hover" onClick={opt.action}>
            {inner}
            {opt.hint && <span className="pub-share-hint">{opt.hint}</span>}
          </button>
        );
        return el;
      })}
    </div>
  );
}

function ProfilePage({ user, onSignOut, onNavigate }) {
  const [showShare,      setShowShare]      = React.useState(false);
  const [forumCount,     setForumCount]     = React.useState(null);
  const [palestrasCount, setPalestrasCount] = React.useState(null);

  const profileUrl = user.username
    ? `${window.location.origin}/perfil/${user.username}`
    : null;

  const openShare = () => setShowShare(v => !v);

  const sessions  = React.useMemo(() => window.Data.load(), []);

  const totalSecs  = sessions.reduce((a, s) => a + (s.duration || 0), 0);
  const totalHours = (totalSecs / 3600).toFixed(1);
  const streak     = window.Data.getCurrentStreak();
  const bestStreak = window.Data.getBestStreak();

  const rmDone = React.useMemo(() => {
    try { return new Set(JSON.parse(localStorage.getItem('d30_roadmap_v3') || '[]')); } catch { return new Set(); }
  }, []);
  const totalCourses = typeof COURSES !== 'undefined' && COURSES ? COURSES.length : 0;
  const doneCourses  = typeof COURSES !== 'undefined' && COURSES ? COURSES.filter(c => rmDone.has(c.id)).length : rmDone.size;
  const rmPct        = totalCourses > 0 ? Math.round(doneCourses / totalCourses * 100) : 0;

  React.useEffect(() => {
    if (!window.sb || !user.id) return;
    Promise.all([
      window.sb.from('forum_activity').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'topic'),
      window.sb.from('palestra_attendance').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]).then(([{ count: fc }, { count: pc }]) => {
      setForumCount(fc || 0);
      setPalestrasCount(pc || 0);
    }).catch(() => { setForumCount(0); setPalestrasCount(0); });
  }, [user.id]);

  return (
    <div className="page active fade-in">
      <div className="pub-profile">

        {/* ── Hero ── */}
        <div className="pub-hero">
          <div className="pub-avatar-wrap">
            {user.avatar_url
              ? <img src={user.avatar_url} alt={user.name} className="pub-avatar-img" />
              : <div className="pub-avatar-init" style={{ background: user.color || '#6d5ce6' }}>{user.initials}</div>
            }
          </div>

          <div className="pub-hero-body">
            <h1 className="pub-name">{user.name}</h1>

            {(user.is_founding_member || user.username || user.profession || user.email === 'augustovilasb@hotmail.com') && (
              <div className="pub-identity-row">
                <div className="pub-identity-text">
                  {user.username   && <span className="pub-username">@{user.username}</span>}
                  {user.profession && <span className="pub-profession">{user.profession}</span>}
                </div>
                {user.email === 'augustovilasb@hotmail.com' && (
                  <div className="pub-pioneer-badge pub-founder-badge">
                    <svg width="30" height="34" viewBox="0 0 34 38" fill="none" style={{ color: '#6d5ce6' }}>
                      <path d="M17 1.5L32.5 10V28L17 36.5L1.5 28V10Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M17 6L28 12.5V25.5L17 32L6 25.5V12.5Z" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.4"/>
                      <g transform="rotate(-38, 17, 19)">
                        <rect x="9" y="12" width="14" height="5.5" rx="1.5" fill="currentColor"/>
                        <rect x="14" y="17.5" width="3.5" height="9" rx="1.5" fill="currentColor"/>
                      </g>
                    </svg>
                    <span className="pub-pioneer-label">FOUNDER</span>
                  </div>
                )}
                {user.is_founding_member && (
                  <div className="pub-pioneer-badge">
                    <svg width="30" height="34" viewBox="0 0 34 38" fill="none" style={{ color: '#999' }}>
                      <path d="M17 1.5L32.5 10V28L17 36.5L1.5 28V10Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M17 6L28 12.5V25.5L17 32L6 25.5V12.5Z" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.4"/>
                      {/* </> */}
                      <path d="M13 16l-4 3 4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 16l4 3-4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="19" y1="14" x2="15" y2="25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    <span className="pub-pioneer-label">DEV 00</span>
                  </div>
                )}
              </div>
            )}

            {user.bio && <p className="pub-bio">{user.bio}</p>}
          </div>

          <div className="pub-hero-side pub-share-popup-wrap">
            <div className="pub-hero-actions">
              <button className="pub-edit-btn" data-cursor="hover" onClick={() => onNavigate('edit-profile')}>Editar perfil</button>
              <button className="pub-share-btn" data-cursor="hover" onClick={openShare} title="Compartilhar perfil">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
              {showShare && (
                profileUrl
                  ? <SharePopup url={profileUrl} onClose={() => setShowShare(false)} />
                  : <div className="pub-share-popup">
                      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 8px 8px', lineHeight: 1.5 }}>
                        Defina um <strong>username</strong> nas configurações para ter um link de perfil compartilhável.
                      </p>
                      <button className="pub-share-option" data-cursor="hover" onClick={() => { setShowShare(false); onNavigate('settings'); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        <span>Ir para Configurações</span>
                      </button>
                    </div>
              )}
            </div>
            <div className="pub-socials">
              {user.github_url    && <a href={user.github_url}    target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><GithubIcon /><span>GitHub</span></a>}
              {user.linkedin_url  && <a href={user.linkedin_url}  target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><LinkedinIcon /><span>LinkedIn</span></a>}
              {user.instagram_url && <a href={user.instagram_url} target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><InstagramIcon /><span>Instagram</span></a>}
              {user.twitter_url   && <a href={user.twitter_url}   target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><TwitterIcon /><span>Twitter</span></a>}
              {user.website_url   && <a href={user.website_url}   target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><WebIcon /><span>Site</span></a>}
            </div>
          </div>
        </div>

        {/* ── Stats com ícones SVG ── */}
        <div className="pub-stats-row">
          <StatCard iconSlug="primeiros_passos" value={`${totalHours}h`}   label="estudadas"    />
          <StatCard iconSlug="consistente"      value={sessions.length}     label="sessões"      />
          <StatCard iconSlug="primeira_chama"   value={streak}              label="streak atual" />
          <StatCard iconSlug="lendario"         value={bestStreak}          label="recorde"      />
          <StatCard iconSlug="palestrante_fiel" value={palestrasCount === null ? '—' : palestrasCount} label="palestras" />
          <StatCard iconSlug="primeira_sessao"  value={forumCount === null ? '—' : forumCount}         label="tópicos"   />
          {totalCourses > 0 && (
            <StatCard iconSlug="dedicado" value={`${doneCourses}/${totalCourses}`} label="cursos" />
          )}
        </div>

        {/* ── Atividade full-width ── */}
        {sessions.length > 0 && (
          <div className="pub-section">
            <p className="pub-section-label">Atividade — últimas 16 semanas</p>
            <ActivityGrid sessions={sessions} />
            <div className="pub-activity-legend">
              <span>Menos</span>
              {['var(--bg3)', '#444', '#666', '#999', '#ccc'].map((c, i) => (
                <div key={i} style={{ width: 11, height: 11, borderRadius: 3, background: c, flexShrink: 0 }} />
              ))}
              <span>Mais</span>
            </div>
          </div>
        )}

        {/* ── Roadmap ── */}
        {totalCourses > 0 && (
          <div className="pub-section">
            <p className="pub-section-label">Roadmap</p>
            <div className="pub-roadmap-card">
              <div className="pub-roadmap-top">
                <span className="pub-roadmap-pct">{rmPct}%</span>
                <span className="pub-roadmap-sub">{doneCourses} de {totalCourses} cursos concluídos</span>
              </div>
              <div className="pub-roadmap-track">
                <div className="pub-roadmap-fill" style={{ width: rmPct + '%' }} />
              </div>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { ProfilePage });
