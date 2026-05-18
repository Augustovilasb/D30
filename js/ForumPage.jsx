/* ForumPage.jsx — topic list + thread split */

function ForumPage({ user, onSignIn, onNewPost }) {
  const [tab, setTab] = React.useState('hot');
  const [query, setQuery] = React.useState('');
  const [activeId, setActiveId] = React.useState(FORUM_TOPICS[0].id);

  const filtered = React.useMemo(() => {
    let list = FORUM_TOPICS.slice();
    if (tab === 'hot') list.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0));
    if (tab === 'recent') list.sort((a, b) => a.time.length - b.time.length);
    if (tab === 'resolved') list = list.filter(t => t.tag === 'conquista');
    if (query) list = list.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.author.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [tab, query]);

  const active = FORUM_TOPICS.find(t => t.id === activeId);

  return (
    <div className="page active fade-in">
      <div className="forum-wrap">
        <div style={{ marginBottom: '1.5rem' }}>
          <p className="page-label">Fórum</p>
          <h1 className="page-title" style={{ fontSize: 36 }}>A conversa nunca para.</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div className="forum-tabs">
            {[
              { id: 'hot',      label: 'Em alta' },
              { id: 'recent',   label: 'Recentes' },
              { id: 'resolved', label: 'Resolvidas' },
            ].map((t) => (
              <button key={t.id} className={'ftab' + (tab === t.id ? ' active' : '')} data-cursor="hover" onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
          <button className="new-post-btn" data-cursor="hover" onClick={onNewPost}>+ Nova publicação</button>
        </div>

        <div className="forum-split">
          <TopicsPane topics={filtered} query={query} setQuery={setQuery} activeId={activeId} setActiveId={setActiveId} />
          {active ? <ThreadPane topic={active} user={user} onSignIn={onSignIn} /> : <div className="thread-pane"><div className="thread-empty">Nenhum tópico encontrado.</div></div>}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function TopicsPane({ topics, query, setQuery, activeId, setActiveId }) {
  return (
    <div className="topics-pane">
      <div className="topics-search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder="Buscar tópicos..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="topics-list">
        {topics.length === 0 ? <div className="topics-empty">Nada por aqui.</div> :
          topics.map((t) => (
            <div key={t.id} className={'topic-item' + (t.id === activeId ? ' active' : '')} data-cursor="hover" onClick={() => setActiveId(t.id)}>
              <div className="topic-title">{t.title}</div>
              <div className="topic-meta">
                <span className={'post-tag ' + (TAG_CLASSES[t.tag] || 'tag-duvida')}>{t.tagLabel}</span>
                <span className="dot"></span>
                <span>{t.author}</span>
                <span className="dot"></span>
                <span>{t.replies} resp.</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function ThreadPane({ topic, user, onSignIn }) {
  const [reply, setReply] = React.useState('');
  const [extra, setExtra] = React.useState([]);
  const msgs = topic.messages.concat(extra);

  const send = () => {
    if (!reply.trim() || !user) return;
    setExtra([...extra, { who: user.name, avatar: user.initials, color: user.color, time: 'agora', text: reply }]);
    setReply('');
  };

  return (
    <div className="thread-pane">
      <div className="thread-header">
        <div className="thread-title">{topic.title}</div>
        <div className="thread-sub">
          <span className={'post-tag ' + (TAG_CLASSES[topic.tag] || 'tag-duvida')}>{topic.tagLabel}</span>
          <span>{topic.author}</span>
          <span>·</span>
          <span>{topic.time}</span>
          <span>·</span>
          <span>{topic.replies} respostas</span>
        </div>
      </div>
      <div className="thread-msgs">
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
      </div>
      {user ? (
        <div className="thread-reply">
          <input type="text" placeholder="Escreve uma resposta..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
          <button data-cursor="hover" onClick={send} disabled={!reply.trim()}>Responder</button>
        </div>
      ) : (
        <div className="thread-login-warn">
          <a data-cursor="hover" onClick={() => onSignIn('login')}>Entra</a> ou <a data-cursor="hover" onClick={() => onSignIn('signup')}>cria uma conta</a> pra responder.
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ForumPage, TopicsPane, ThreadPane });
