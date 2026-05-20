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

/* Simple read-only activity heatmap — last 16 weeks */
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
    if (h < 1) return '#bbf7d0';
    if (h < 2) return '#4ade80';
    if (h < 4) return '#16a34a';
    return '#15803d';
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

function ProfilePage({ user, onSignOut, onNavigate }) {
  const sessions  = React.useMemo(() => window.Data.load(), []);
  const earned    = React.useMemo(() => window.Badges.getEarned(), []);
  const earnedSet = React.useMemo(() => new Set(earned.map(b => b.slug)), [earned]);

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

  const earnedBadges = React.useMemo(() => {
    const list = window.Badges.DEFS.filter(b => {
      if (b.type === 'founding_member') return user.is_founding_member === true;
      return earnedSet.has(b.slug);
    });
    // fundador always first if earned
    list.sort((a, b) => (a.type === 'founding_member' ? -1 : b.type === 'founding_member' ? 1 : 0));
    return list;
  }, [earnedSet, user]);
  const lockedBadges = React.useMemo(() =>
    window.Badges.DEFS.filter(b => !earnedBadges.find(e => e.slug === b.slug)),
  [earnedBadges]);

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
            <div className="pub-hero-top">
              <h1 className="pub-name">{user.name}</h1>
              {user.username && <span className="pub-username">@{user.username}</span>}
            </div>
            {user.profession && <p className="pub-profession">{user.profession}</p>}
            {user.bio && <p className="pub-bio">{user.bio}</p>}

            <div className="pub-socials">
              {user.github_url   && <a href={user.github_url}   target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><GithubIcon /><span>GitHub</span></a>}
              {user.linkedin_url && <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><LinkedinIcon /><span>LinkedIn</span></a>}
              {user.twitter_url  && <a href={user.twitter_url}  target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><TwitterIcon /><span>Twitter</span></a>}
              {user.website_url  && <a href={user.website_url}  target="_blank" rel="noopener noreferrer" className="pub-social" data-cursor="hover"><WebIcon /><span>Site</span></a>}
            </div>
          </div>

          <button className="pub-edit-btn" data-cursor="hover" onClick={() => onNavigate('settings')}>
            Editar perfil
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div className="pub-stats-strip">
          <div className="pub-stat-item">
            <span className="pub-stat-val">{totalHours}h</span>
            <span className="pub-stat-lbl">estudadas</span>
          </div>
          <div className="pub-stat-sep" />
          <div className="pub-stat-item">
            <span className="pub-stat-val">{sessions.length}</span>
            <span className="pub-stat-lbl">sessões</span>
          </div>
          <div className="pub-stat-sep" />
          <div className="pub-stat-item">
            <span className="pub-stat-val">{streak}</span>
            <span className="pub-stat-lbl">streak atual</span>
          </div>
          <div className="pub-stat-sep" />
          <div className="pub-stat-item">
            <span className="pub-stat-val">{bestStreak}</span>
            <span className="pub-stat-lbl">recorde</span>
          </div>
          <div className="pub-stat-sep" />
          <div className="pub-stat-item">
            <span className="pub-stat-val">{earnedBadges.length}</span>
            <span className="pub-stat-lbl">badges</span>
          </div>
          {totalCourses > 0 && (
            <React.Fragment>
              <div className="pub-stat-sep" />
              <div className="pub-stat-item">
                <span className="pub-stat-val">{doneCourses}/{totalCourses}</span>
                <span className="pub-stat-lbl">cursos</span>
              </div>
            </React.Fragment>
          )}
        </div>

        {/* ── Activity ── */}
        {sessions.length > 0 && (
          <div className="pub-section">
            <p className="pub-section-label">Atividade — últimas 16 semanas</p>
            <ActivityGrid sessions={sessions} />
            <div className="pub-activity-legend">
              <span>Menos</span>
              {['var(--bg3)', '#bbf7d0', '#4ade80', '#16a34a', '#15803d'].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c, flexShrink: 0 }} />
              ))}
              <span>Mais</span>
            </div>
          </div>
        )}

        {/* ── Badges conquistadas ── */}
        {earnedBadges.length > 0 && (
          <div className="pub-section">
            <p className="pub-section-label">Badges conquistadas</p>
            <div className="pub-badges-earned">
              {earnedBadges.map(b => (
                <div key={b.slug} className="pub-badge-earned" title={b.name}
                  style={b.type === 'founding_member' ? { borderColor: '#f59e0b44', background: '#fef3c720' } : {}}>
                  <div className="pub-badge-earned-icon">
                    <BadgeIcon slug={b.slug} color={b.color} size={22} />
                  </div>
                  <span className="pub-badge-earned-name">{b.name}</span>
                </div>
              ))}
            </div>
            {lockedBadges.length > 0 && (
              <div className="pub-badges-locked">
                {lockedBadges.map(b => (
                  <div key={b.slug} className="pub-badge-locked" title={b.name}>
                    <BadgeIcon slug={b.slug} color="currentColor" size={16} />
                  </div>
                ))}
              </div>
            )}
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
