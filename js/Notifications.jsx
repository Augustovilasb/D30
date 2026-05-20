/* Notifications.jsx — bell icon + dropdown panel + hook */

const NOTIF_KEY = 'd30_notifs';

function getIconColor() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#111';
}

const NOTIF_ICONS = {
  talk:     () => { const c = getIconColor(); return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ stroke: c, fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ); },
  reply:    () => { const c = getIconColor(); return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ stroke: c, fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ); },
  mention:  () => { const c = getIconColor(); return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ stroke: c, fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}>
      <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
    </svg>
  ); },
  reminder: () => { const c = getIconColor(); return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ stroke: c, fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ); },
};

const SEED_NOTIFS = [
  {
    id: 'n1', type: 'talk', read: false,
    title: 'Palestra em 30 minutos',
    body: 'Renata Linhares — "O que recrutador realmente lê num currículo júnior" começa às 20h.',
    time: 'agora', link: 'palestras',
  },
  {
    id: 'n2', type: 'reply', read: false,
    title: 'Responderam seu post',
    body: 'MR respondeu: "Cara, eu passei pela mesma situação. O que me ajudou foi..."',
    time: '5 min', link: 'forum',
  },
  {
    id: 'n3', type: 'reminder', read: false,
    title: 'Faz 5 dias sem estudar',
    body: 'Você parou no curso de Git e GitHub. Só falta 1 aula pra completar a fase.',
    time: 'hoje', link: 'roadmap',
  },
  {
    id: 'n4', type: 'mention', read: true,
    title: 'Você foi mencionado',
    body: 'LS te marcou: "@você tem alguma dica de como organizar o tempo de estudo?"',
    time: 'ontem', link: 'forum',
  },
];

function loadNotifs() {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) return JSON.parse(raw);
    // primeira vez — salva as seeds
    localStorage.setItem(NOTIF_KEY, JSON.stringify(SEED_NOTIFS));
    return SEED_NOTIFS;
  } catch { return SEED_NOTIFS; }
}

function saveNotifs(list) {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(list)); } catch {}
}

function useNotifications() {
  const [notifs, setNotifs] = React.useState(() => loadNotifs());

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = React.useCallback(() => {
    setNotifs(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      saveNotifs(next);
      return next;
    });
  }, []);

  const markRead = React.useCallback((id) => {
    setNotifs(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifs(next);
      return next;
    });
  }, []);

  const addNotif = React.useCallback((notif) => {
    setNotifs(prev => {
      const next = [{ ...notif, id: Math.random().toString(36).slice(2), read: false }, ...prev];
      saveNotifs(next);
      return next;
    });
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifs([]);
    saveNotifs([]);
  }, []);

  return { notifs, unread, markRead, markAllRead, addNotif, clearAll };
}

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function NotificationsBell({ onNavigate }) {
  const { notifs, unread, markRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(v => !v);
  };

  const handleClick = (n) => {
    markRead(n.id);
    setOpen(false);
    if (n.link && onNavigate) onNavigate(n.link);
  };

  return (
    <div className="notif-wrap" ref={ref}>
      <button className={'nav-theme-toggle notif-bell' + (open ? ' open' : '')} data-cursor="hover" onClick={handleOpen} title="Notificações">
        <BellIcon />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-head">
            <span className="notif-panel-title">Notificações</span>
            <div className="notif-panel-actions">
              {unread > 0 && <button className="notif-action-btn" data-cursor="hover" onClick={markAllRead}>Marcar tudo como lido</button>}
              {notifs.length > 0 && <button className="notif-action-btn" data-cursor="hover" onClick={clearAll}>Limpar</button>}
            </div>
          </div>

          <div className="notif-list">
            {notifs.length === 0 && (
              <div className="notif-empty">Nenhuma notificação.</div>
            )}
            {notifs.map(n => (
              <button key={n.id} className={'notif-item' + (n.read ? ' read' : '')} data-cursor="hover" onClick={() => handleClick(n)}>
                <div className={'notif-icon notif-icon--' + n.type}>
                  {NOTIF_ICONS[n.type] ? NOTIF_ICONS[n.type]() : null}
                </div>
                <div className="notif-body">
                  <span className="notif-title">{n.title}</span>
                  <span className="notif-text">{n.body}</span>
                  <span className="notif-time">{n.time}</span>
                </div>
                {!n.read && <span className="notif-dot" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { NotificationsBell, useNotifications });
