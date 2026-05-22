/* ProfilePage.jsx — public user profile */

function BadgeIcon({ slug, color, size = 22 }) {
  const inner = (window.Badges.ICONS || {})[slug] || '';
  if (!inner) return null;
  if (!inner.startsWith('<')) {
    return <span style={{ fontSize: size * 0.9, lineHeight: 1, flexShrink: 0 }}>{inner}</span>;
  }
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
function StatCard({ iconSlug, value, label, color, onClick }) {
  return (
    <div className="pub-stat-card" onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined} data-cursor={onClick ? 'hover' : undefined}>
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

function ShareCardModal({ user, onClose }) {
  const cardRef = React.useRef(null);
  const [downloading, setDownloading] = React.useState(false);

  const devLabel   = user.dev_number !== null && user.dev_number !== undefined ? 'DEV ' + String(user.dev_number).padStart(2, '0') : null;
  const badgeLabel = user.email === 'augustovilasb@hotmail.com' ? 'FOUNDER' : devLabel || 'MEMBRO';
  const badgeColor = user.email === 'augustovilasb@hotmail.com' ? '#6d5ce6' : devLabel ? '#888' : '#555';

  const handleDownload = async () => {
    if (!cardRef.current || !window.html2canvas) return;
    setDownloading(true);
    try {
      const canvas = await window.html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null, logging: false });
      const link = document.createElement('a');
      link.download = `d30-${(user.username || user.name).toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(e) { console.error(e); }
    setDownloading(false);
  };

  return (
    <div className="share-card-overlay" onClick={onClose}>
      <div className="share-card-modal" onClick={e => e.stopPropagation()}>
        <div className="share-card-modal-head">
          <span className="share-card-modal-title">Seu card D30</span>
          <button className="share-card-close" data-cursor="hover" onClick={onClose}>✕</button>
        </div>

        <div ref={cardRef} className="d30-share-card">
          {/* dot grid */}
          <div className="d30-card-dots" />
          {/* decorative curves */}
          <svg className="d30-card-curves" viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M280 60 Q320 130 300 200 Q280 270 340 320" stroke="#6d5ce6" strokeWidth="1.2" strokeOpacity="0.35" fill="none"/>
            <path d="M300 40 Q350 120 320 210 Q295 280 360 340" stroke="#6d5ce6" strokeWidth="0.7" strokeOpacity="0.2" fill="none"/>
            <path d="M240 300 Q270 330 310 340 Q340 348 355 360" stroke="#6d5ce6" strokeWidth="1" strokeOpacity="0.25" fill="none"/>
          </svg>

          {/* top bar */}
          <div className="d30-card-top">
            <span className="d30-card-logo"><em>D</em>30</span>
            <span className="d30-card-tag" style={{ color: badgeColor, borderColor: badgeColor + '80' }}>{badgeLabel}</span>
          </div>

          {/* hero name */}
          <div className="d30-card-center">
            <div className="d30-card-avatar">
              {user.avatar_url
                ? <img src={user.avatar_url} alt={user.name} crossOrigin="anonymous" />
                : <span>{user.initials}</span>}
            </div>
            <div className="d30-card-name">{user.name}</div>
            <div className="d30-card-handle">{user.username ? `@${user.username}` : user.email.split('@')[0]}</div>
            <div className="d30-card-badges">
              {user.email === 'augustovilasb@hotmail.com' && (
                <div className="d30-card-badge-item">
                  <svg width="22" height="25" viewBox="0 0 34 38" fill="none" style={{ color: '#6d5ce6' }}>
                    <path d="M17 1.5L32.5 10V28L17 36.5L1.5 28V10Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M17 6L28 12.5V25.5L17 32L6 25.5V12.5Z" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.4"/>
                    <g transform="rotate(-38, 17, 19)">
                      <rect x="9" y="12" width="14" height="5.5" rx="1.5" fill="currentColor"/>
                      <rect x="14" y="17.5" width="3.5" height="9" rx="1.5" fill="currentColor"/>
                    </g>
                  </svg>
                  <span style={{ color: '#6d5ce6' }}>FOUNDER</span>
                </div>
              )}
              {devLabel && (
                <div className="d30-card-badge-item">
                  <svg width="22" height="25" viewBox="0 0 34 38" fill="none" style={{ color: '#888' }}>
                    <path d="M17 1.5L32.5 10V28L17 36.5L1.5 28V10Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M17 6L28 12.5V25.5L17 32L6 25.5V12.5Z" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.4"/>
                    <path d="M13 16l-4 3 4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 16l4 3-4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="19" y1="14" x2="15" y2="25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  <span style={{ color: '#888' }}>{devLabel}</span>
                </div>
              )}
            </div>
          </div>

          {/* bottom */}
          <div className="d30-card-bottom">
            <div className="d30-card-tagline-wrap">
              <div className="d30-card-divider" />
              <p className="d30-card-tagline">Faço parte<br/>da <em>D30.</em></p>
            </div>
            <div className="d30-card-footer">
              <span className="d30-card-url">D30.DEV</span>
              <span className="d30-card-ig">@dev.aos30</span>
            </div>
          </div>
        </div>

        <button className="share-card-download-btn" data-cursor="hover" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Gerando...' : 'Baixar imagem →'}
        </button>
        <p className="share-card-hint">1080×1080 · pronto para Instagram e WhatsApp</p>
      </div>
    </div>
  );
}

function StatsDetailModal({ type, user, onClose, onNavigate }) {
  const [items, setItems] = React.useState(null);

  React.useEffect(() => {
    if (type === 'livros') {
      try { setItems(JSON.parse(localStorage.getItem('d30_livros_lidos_v2') || '[]')); }
      catch { setItems([]); }
    } else if (type === 'cursos') {
      DB.roadmap.getProgress(user.id).then(done => {
        const list = typeof COURSES !== 'undefined' && COURSES ? COURSES.filter(c => done.has(c.id)) : [];
        setItems(list);
      }).catch(() => setItems([]));
    } else if (type === 'sessoes') {
      const s = window.Data ? [...window.Data.load()].reverse().slice(0, 30) : [];
      setItems(s);
    } else if (type === 'talks') {
      if (!window.sb) { setItems([]); return; }
      window.sb.from('talk_rsvp')
        .select('id, talk_id, created_at, talks(title, when_text, guest_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setItems(data || []));
    } else if (type === 'forum') {
      if (!window.sb) { setItems({ topics: [], replies: [] }); return; }
      Promise.all([
        window.sb.from('forum_topics').select('id, title, created_at').eq('author_id', user.id).order('created_at', { ascending: false }),
        window.sb.from('forum_messages').select('id, text, created_at, topic_id').eq('author_id', user.id).order('created_at', { ascending: false }),
      ]).then(([{ data: topics }, { data: msgs }]) => {
        setItems({ topics: topics || [], replies: msgs || [] });
      }).catch(() => setItems({ topics: [], replies: [] }));
    }
  }, [type]);

  const titles = {
    livros: 'Livros Lidos', cursos: 'Cursos Finalizados',
    sessoes: 'Sessões de Estudo', talks: 'Talks: Presença', forum: 'Tópicos no Fórum',
  };

  function fmtDur(secs) {
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h${m > 0 ? m + 'm' : ''}` : `${m}m`;
  }

  return (
    <div className="stats-detail-overlay" onClick={onClose}>
      <div className="stats-detail-panel" onClick={e => e.stopPropagation()}>
        <div className="stats-detail-head">
          <span>{titles[type]}</span>
          <button className="stats-detail-close" data-cursor="hover" onClick={onClose}>✕</button>
        </div>
        <div className="stats-detail-body">
          {items === null && <p className="stats-detail-empty">Carregando…</p>}
          {type !== 'forum' && items !== null && items.length === 0 && <p className="stats-detail-empty">Nenhum item ainda.</p>}
          {type === 'forum'  && items !== null && items.topics?.length === 0 && items.replies?.length === 0 && <p className="stats-detail-empty">Nenhum item ainda.</p>}

          {type !== 'forum' && items !== null && items.length > 0 && (
            <ul className="stats-detail-list">
              {type === 'livros' && items.map((b, i) => (
                <li key={b.id || i}
                  className={'stats-detail-item' + (b.id ? ' stats-detail-item--link' : '')}
                  data-cursor={b.id ? 'hover' : undefined}
                  onClick={b.id ? () => { window.__livrosHighlight = b.id; onNavigate('livros'); onClose(); } : undefined}
                >
                  <span className="stats-detail-item-title">{b.title || '-'}</span>
                  {b.author && <span className="stats-detail-item-sub">{b.author}</span>}
                </li>
              ))}
              {type === 'cursos' && items.map((c, i) => (
                <li key={c.id || i}
                  className="stats-detail-item stats-detail-item--link"
                  data-cursor="hover"
                  onClick={() => { window.__roadmapHighlight = c.id; onNavigate('roadmap'); onClose(); }}
                >
                  <span className="stats-detail-item-title">{c.title || c.name || '-'}</span>
                  {c.subtitle && <span className="stats-detail-item-sub">{c.subtitle}</span>}
                </li>
              ))}
              {type === 'sessoes' && items.map((s, i) => (
                <li key={i} className="stats-detail-item">
                  <span className="stats-detail-item-title">{s.subject || 'Sessão'}</span>
                  <span className="stats-detail-item-sub">{s.date} · {fmtDur(s.duration || 0)}</span>
                </li>
              ))}
              {type === 'talks' && items.map((t, i) => (
                <li key={t.id || i}
                  className="stats-detail-item stats-detail-item--link"
                  data-cursor="hover"
                  onClick={() => { window.__palestrasHighlight = t.talk_id; onNavigate && onNavigate('palestras'); onClose(); }}
                >
                  <span className="stats-detail-item-title">{t.talks?.title || `Talk #${i + 1}`}</span>
                  {t.talks?.when_text && <span className="stats-detail-item-sub">{t.talks.when_text}</span>}
                </li>
              ))}
            </ul>
          )}

          {type === 'forum' && items !== null && (
            <React.Fragment>
              {items.topics?.length > 0 && (
                <React.Fragment>
                  <p className="stats-detail-section">Tópicos criados</p>
                  <ul className="stats-detail-list">
                    {items.topics.map((f, i) => (
                      <li key={f.id || i} className="stats-detail-item stats-detail-item--link" data-cursor="hover"
                        onClick={() => { window.__forumOpenTopic = f.id; onNavigate && onNavigate('forum'); onClose(); }}
                      >
                        <span className="stats-detail-item-title">{f.title || `Tópico #${i + 1}`}</span>
                        {f.created_at && <span className="stats-detail-item-sub">{f.created_at.slice(0, 10)}</span>}
                      </li>
                    ))}
                  </ul>
                </React.Fragment>
              )}
              {items.replies?.length > 0 && (
                <React.Fragment>
                  <p className="stats-detail-section">Respostas</p>
                  <ul className="stats-detail-list">
                    {items.replies.map((m, i) => (
                      <li key={m.id || i} className="stats-detail-item stats-detail-item--link" data-cursor="hover"
                        onClick={() => { window.__forumOpenTopic = m.topic_id; onNavigate && onNavigate('forum'); onClose(); }}
                      >
                        <span className="stats-detail-item-title">{m.text?.slice(0, 80) || `Resposta #${i + 1}`}</span>
                        {m.created_at && <span className="stats-detail-item-sub">{m.created_at.slice(0, 10)}</span>}
                      </li>
                    ))}
                  </ul>
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ user, onSignOut, onNavigate }) {
  const devLabel = user.dev_number !== null && user.dev_number !== undefined ? 'DEV ' + String(user.dev_number).padStart(2, '0') : null;

  const [showShare,      setShowShare]      = React.useState(false);
  const [showCard,       setShowCard]       = React.useState(false);
  const [forumCount,     setForumCount]     = React.useState(null);
  const [palestrasCount, setPalestrasCount] = React.useState(null);
  const [rankPos,        setRankPos]        = React.useState(null);
  const [detailModal,    setDetailModal]    = React.useState(null);

  const profileUrl = user.username
    ? `${window.location.origin}/perfil/${user.username}`
    : null;

  const openShare = () => setShowShare(v => !v);

  const sessions  = React.useMemo(() => window.Data.load(), []);

  const totalSecs   = sessions.reduce((a, s) => a + (s.duration || 0), 0);
  const totalHours  = (totalSecs / 3600).toFixed(1);
  const bestStreak  = window.Data.getBestStreak();
  const livrosLidos = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('d30_livros_lidos_v2') || '[]').length; } catch { return 0; }
  }, []);

  const rmDone = React.useMemo(() => {
    try { return new Set(JSON.parse(localStorage.getItem('d30_roadmap_v3') || '[]')); } catch { return new Set(); }
  }, []);
  const totalCourses = typeof COURSES !== 'undefined' && COURSES ? COURSES.length : 0;
  const doneCourses  = typeof COURSES !== 'undefined' && COURSES ? COURSES.filter(c => rmDone.has(c.id)).length : rmDone.size;
  const rmPct        = totalCourses > 0 ? Math.round(doneCourses / totalCourses * 100) : 0;

  React.useEffect(() => {
    if (!window.sb || !user.id) return;
    Promise.all([
      window.sb.from('forum_topics').select('id', { count: 'exact', head: true }).eq('author_id', user.id),
      window.sb.from('forum_messages').select('id', { count: 'exact', head: true }).eq('author_id', user.id),
      window.sb.from('talk_rsvp').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      window.sb.from('profiles').select('total_hours').eq('id', user.id).single(),
    ]).then(([{ count: tc }, { count: rc }, { count: pc }, { data: myProf }]) => {
      setForumCount((tc || 0) + (rc || 0));
      setPalestrasCount(pc || 0);
      const myHours = myProf?.total_hours || 0;
      return window.sb.from('profiles').select('id', { count: 'exact', head: true }).gt('total_hours', myHours)
        .then(({ count: above }) => setRankPos((above || 0) + 1));
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

            {(devLabel || user.username || user.profession || user.email === 'augustovilasb@hotmail.com') && (
              <div className="pub-identity-row">
                <div className="pub-identity-text">
                  {user.username   && <span className="pub-username">@{user.username}</span>}
                  {user.profession && <span className="pub-profession">{user.profession}</span>}
                </div>
                {user.email === 'augustovilasb@hotmail.com' && (
                  <div className="pub-pioneer-badge pub-founder-badge">
                    <svg width="30" height="34" viewBox="0 0 34 38" fill="none" style={{ color: '#6d5ce6' }}>
                      <path d="M17 1.5L32.5 10V28L17 36.5L1.5 28V10Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M17 6L28 12.5V25.5L17 32L6 25.5V12.5Z" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.35"/>
                      <path d="M9 25V16L13.5 20L17 13L20.5 20L25 16V25H9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="none"/>
                      <circle cx="9" cy="15.5" r="1.4" fill="currentColor"/>
                      <circle cx="17" cy="12.5" r="1.4" fill="currentColor"/>
                      <circle cx="25" cy="15.5" r="1.4" fill="currentColor"/>
                    </svg>
                    <span className="pub-pioneer-label">FOUNDER</span>
                  </div>
                )}
                {devLabel && (
                  <div className="pub-pioneer-badge">
                    <svg width="30" height="34" viewBox="0 0 34 38" fill="none" style={{ color: '#888' }}>
                      <path d="M17 1.5L32.5 10V28L17 36.5L1.5 28V10Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M17 6L28 12.5V25.5L17 32L6 25.5V12.5Z" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.35"/>
                      <path d="M12 15L8 19L12 23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="20" y1="13.5" x2="14" y2="24.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M22 15L26 19L22 23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="pub-pioneer-label">{devLabel}</span>
                  </div>
                )}
              </div>
            )}

            {user.bio && <p className="pub-bio">{user.bio}</p>}
          </div>

          <div className="pub-hero-side pub-share-popup-wrap">
            <div className="pub-hero-actions">
              <button className="pub-edit-btn" data-cursor="hover" onClick={() => onNavigate('edit-profile')} title="Editar perfil">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button className="pub-card-btn" data-cursor="hover" onClick={() => setShowCard(true)} title="Gerar card">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/><path d="M9 21V9"/>
                </svg>
              </button>
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
          <StatCard iconSlug="primeiros_passos" value={`${totalHours}h`}   label="estudadas"                />
          <StatCard iconSlug="consistente"      value={sessions.length}     label="sessões de estudo"        />
          <StatCard iconSlug="lendario"         value={livrosLidos}         label="livros lidos"             onClick={() => setDetailModal('livros')}  />
          <StatCard iconSlug="palestrante_fiel" value={palestrasCount === null ? '-' : palestrasCount} label="talks presença"          onClick={() => setDetailModal('talks')}   />
          <StatCard iconSlug="primeira_sessao"  value={forumCount === null ? '-' : forumCount}         label="no fórum" onClick={() => setDetailModal('forum')}   />
          {totalCourses > 0 && (
            <StatCard iconSlug="dedicado" value={`${doneCourses}/${totalCourses}`} label="cursos finalizados" onClick={() => setDetailModal('cursos')} />
          )}
          <StatCard iconSlug="primeira_chama" value={rankPos === null ? '-' : `#${rankPos}`} label="posição no ranking" onClick={() => { window.__rankingTab = 'hours'; onNavigate('ranking'); }} />
        </div>

        {/* ── Atividade full-width ── */}
        {sessions.length > 0 && (
          <div className="pub-section">
            <p className="pub-section-label">Atividade: últimas 16 semanas</p>
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
      {showCard && <ShareCardModal user={user} onClose={() => setShowCard(false)} />}
      {detailModal && <StatsDetailModal type={detailModal} user={user} onClose={() => setDetailModal(null)} onNavigate={onNavigate} />}
    </div>
  );
}

Object.assign(window, { ProfilePage });
