/* ForumPage.jsx — topic list + thread split, minimal */

const CATEGORIES = [
  { id: 'all',       label: 'Todos' },
  { id: 'hot',       label: 'Em alta' },
  { id: 'duvida',    label: 'Dúvidas & Estudo' },
  { id: 'recurso',   label: 'Dicas' },
  { id: 'conquista', label: 'Conquistas' },
  { id: 'tech',      label: 'Tecnologias' },
  { id: 'carreira',  label: 'Carreira' },
  { id: 'closed',    label: 'Encerradas' },
];

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '');
}

function ForumPage({ user, onSignIn, onNewPost }) {
  const [cat, setCat]       = React.useState('all');
  const [query, setQuery]   = React.useState('');
  const [activeId, setActiveId] = React.useState(FORUM_TOPICS[0].id);
  // lifted: { [topicId]: [{who, avatar, color, time, text}] }
  const [extras,  setExtras]  = React.useState({});
  const [closed,  setClosed]  = React.useState({});

  const addReply = React.useCallback((topicId, msg) => {
    setExtras(prev => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), msg],
    }));
  }, []);

  const closeTopic = React.useCallback((topicId) => {
    setClosed(prev => ({ ...prev, [topicId]: true }));
  }, []);

  const filtered = React.useMemo(() => {
    let list = FORUM_TOPICS.slice();
    if (cat === 'hot')    list = list.filter(t => t.hot);
    else if (cat === 'closed') list = list.filter(t => !!closed[t.id]);
    else if (cat !== 'all')    list = list.filter(t => t.tag === cat);
    if (query) list = list.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.author.toLowerCase().includes(query.toLowerCase())
    );
    return list;
  }, [cat, query, closed]);

  const active = filtered.find(t => t.id === activeId) || filtered[0] || null;

  return (
    <div className="page active fade-in">
      <div className="forum-wrap">
        <div className="forum-toolbar">
          <div className="forum-cats">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                className={'fcat' + (cat === c.id ? ' active' : '')}
                data-cursor="hover"
                onClick={() => setCat(c.id)}
              >{c.label}</button>
            ))}
          </div>
          <button className="forum-new-btn" data-cursor="hover" onClick={onNewPost}>+ Nova</button>
        </div>

        <div className="forum-split">
          <TopicsPane
            topics={filtered}
            query={query}
            setQuery={setQuery}
            activeId={active ? active.id : null}
            setActiveId={setActiveId}
            extras={extras}
            closed={closed}
          />
          {active
            ? <ThreadPane
                topic={active}
                user={user}
                onSignIn={onSignIn}
                extra={extras[active.id] || []}
                onReply={(msg) => addReply(active.id, msg)}
                isClosed={!!closed[active.id]}
                onClose={() => closeTopic(active.id)}
              />
            : <div className="thread-pane"><div className="thread-empty">Nenhum tópico nessa categoria ainda.</div></div>
          }
        </div>
      </div>
      <Footer />
    </div>
  );
}

function TopicsPane({ topics, query, setQuery, activeId, setActiveId, extras, closed }) {
  return (
    <div className="topics-pane">
      <div className="topics-search">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder="Buscar..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="topics-list">
        {topics.length === 0
          ? <div className="topics-empty">Nada por aqui.</div>
          : topics.map((t) => {
              const topicExtras  = extras[t.id] || [];
              const totalReplies = t.replies + topicExtras.length;
              const allMsgs      = t.messages.concat(topicExtras);
              const lastMsg      = allMsgs[allMsgs.length - 1];
              const preview      = lastMsg ? stripHtml(lastMsg.text) : '';
              const isClosed     = !!closed[t.id];

              return (
                <div
                  key={t.id}
                  className={'topic-item' + (t.id === activeId ? ' active' : '') + (isClosed ? ' closed' : '')}
                  data-cursor="hover"
                  onClick={() => setActiveId(t.id)}
                >
                  <div className="topic-title-row">
                    <span className="topic-title">{t.title}</span>
                    {isClosed && <span className="topic-closed-badge">encerrada</span>}
                  </div>
                  {preview && (
                    <div className="topic-preview">
                      <span className="topic-preview-who">{lastMsg.who}:</span> {preview}
                    </div>
                  )}
                  <div className="topic-meta">{t.author} · {totalReplies} resp. · {t.time}</div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

function ThreadPane({ topic, user, onSignIn, extra, onReply, isClosed, onClose }) {
  const [reply, setReply]     = React.useState('');
  const [confirming, setConf] = React.useState(false);
  const msgsRef               = React.useRef(null);
  const msgs                  = topic.messages.concat(extra);
  const totalReplies          = topic.replies + extra.length;

  // Scroll to bottom when topic changes or new message arrives
  React.useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [topic.id, msgs.length]);

  const send = () => {
    if (!reply.trim() || !user || isClosed) return;
    onReply({ who: user.name, avatar: user.initials, color: user.color, time: 'agora', text: reply });
    setReply('');
  };

  const handleClose = () => {
    if (!confirming) { setConf(true); return; }
    onClose();
    setConf(false);
  };

  return (
    <div className="thread-pane">
      <div className="thread-header">
        <div className="thread-header-top">
          <div className="thread-title">
            {topic.title}
            {isClosed && <span className="thread-closed-badge">encerrada</span>}
          </div>
          {user && !isClosed && (
            <button
              className={'thread-close-btn' + (confirming ? ' confirming' : '')}
              data-cursor="hover"
              onClick={handleClose}
              onBlur={() => setConf(false)}
            >
              {confirming ? 'Confirmar?' : 'Encerrar'}
            </button>
          )}
        </div>
        <div className="thread-sub">
          <span>{topic.tagLabel}</span>
          <span>·</span>
          <span>{topic.author}</span>
          <span>·</span>
          <span>{topic.time}</span>
          <span>·</span>
          <span>{totalReplies} respostas</span>
        </div>
      </div>
      <div className="thread-msgs" ref={msgsRef}>
        {msgs.map((m, i) => (
          <div key={i} className="msg">
            <div className="msg-avatar" style={{ background: m.color }}>{m.avatar}</div>
            <div className="msg-body">
              <div className="msg-head">
                <span className="msg-name">{m.who}</span>
                <span className="msg-time">{m.time}</span>
              </div>
              <div className="msg-text" dangerouslySetInnerHTML={{ __html: m.text }} />
            </div>
          </div>
        ))}
        {isClosed && (
          <div className="thread-closed-notice">Conversa encerrada. Nenhuma nova resposta pode ser adicionada.</div>
        )}
      </div>
      {!isClosed && (
        user ? (
          <div className="thread-reply">
            <input
              type="text"
              placeholder="Escreve uma resposta..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button data-cursor="hover" onClick={send} disabled={!reply.trim()}>Enviar</button>
          </div>
        ) : (
          <div className="thread-login-warn">
            <a data-cursor="hover" onClick={() => onSignIn('login')}>Entra</a> ou <a data-cursor="hover" onClick={() => onSignIn('signup')}>cria uma conta</a> pra responder.
          </div>
        )
      )}
    </div>
  );
}

Object.assign(window, { ForumPage, TopicsPane, ThreadPane, CATEGORIES });
