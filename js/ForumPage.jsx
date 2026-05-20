/* ForumPage.jsx — topic list + thread split, minimal */

const FORUM_OWNER_EMAIL = 'augustovilasb@hotmail.com';

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

function ForumPage({ user, onSignIn, toast }) {
  const isOwner = user && user.email === FORUM_OWNER_EMAIL;
  const [mobileView, setMobileView] = React.useState('list'); // 'list' | 'thread'
  const isMobile = () => window.innerWidth <= 768;

  const [topics,    setTopics]    = React.useState(FORUM_TOPICS);
  const [cat,       setCat]       = React.useState('all');
  const [query,     setQuery]     = React.useState('');
  const [activeId,  setActiveId]  = React.useState(null);
  const [postModal, setPostModal] = React.useState(false);
  const [extras,    setExtras]    = React.useState({});
  const [closed,    setClosed]    = React.useState({});
  const [likes,     setLikes]     = React.useState({});   // { topicId: count }
  const [likedMe,   setLikedMe]   = React.useState({});   // { topicId: bool }
  const [dislikes,  setDislikes]  = React.useState({});   // { topicId_idx: count }
  const [dislikedMe,setDislikedMe]= React.useState({});   // { topicId_idx: bool }
  const [blocked,   setBlocked]   = React.useState({});   // { username: bool }
  const [msgVotes,  setMsgVotes]  = React.useState({});   // { topicId_key: { up, down } }
  const [msgVotedMe,setMsgVotedMe]= React.useState({});   // { topicId_key: 'up'|'down'|null }

  const addTopic = React.useCallback((topic) => {
    setTopics(prev => [topic, ...prev]);
    setActiveId(topic.id);
  }, []);

  const deleteTopic = React.useCallback((topicId) => {
    setTopics(prev => {
      const next = prev.filter(t => t.id !== topicId);
      if (next.length > 0) setActiveId(next[0].id);
      return next;
    });
  }, []);

  const addReply = React.useCallback((topicId, msg) => {
    setExtras(prev => ({ ...prev, [topicId]: [...(prev[topicId] || []), msg] }));
  }, []);

  const closeTopic = React.useCallback((topicId) => {
    setClosed(prev => ({ ...prev, [topicId]: true }));
  }, []);

  const toggleLike = React.useCallback((topicId, e) => {
    e.stopPropagation();
    setLikedMe(prev => {
      const wasLiked = !!prev[topicId];
      setLikes(lk => ({ ...lk, [topicId]: Math.max(0, (lk[topicId] || 0) + (wasLiked ? -1 : 1)) }));
      return { ...prev, [topicId]: !wasLiked };
    });
  }, []);

  const toggleDislike = React.useCallback((topicId, msgKey) => {
    const key = topicId + '_' + msgKey;
    setDislikedMe(prev => {
      const was = !!prev[key];
      setDislikes(dk => ({ ...dk, [key]: Math.max(0, (dk[key] || 0) + (was ? -1 : 1)) }));
      return { ...prev, [key]: !was };
    });
  }, []);

  const toggleBlock = React.useCallback((username) => {
    setBlocked(prev => ({ ...prev, [username]: !prev[username] }));
  }, []);

  const voteMsgUp = React.useCallback((topicId, msgKey) => {
    const key = topicId + '_' + msgKey;
    setMsgVotedMe(prev => {
      const was = prev[key];
      const next = was === 'up' ? null : 'up';
      setMsgVotes(v => ({
        ...v,
        [key]: {
          up:   (v[key]?.up   || 0) + (was === 'up' ? -1 : 1),
          down: (v[key]?.down || 0) + (was === 'down' ? -1 : 0),
        },
      }));
      return { ...prev, [key]: next };
    });
  }, []);

  const voteMsgDown = React.useCallback((topicId, msgKey) => {
    const key = topicId + '_' + msgKey;
    setMsgVotedMe(prev => {
      const was = prev[key];
      const next = was === 'down' ? null : 'down';
      setMsgVotes(v => ({
        ...v,
        [key]: {
          up:   (v[key]?.up   || 0) + (was === 'up' ? -1 : 0),
          down: (v[key]?.down || 0) + (was === 'down' ? -1 : 1),
        },
      }));
      return { ...prev, [key]: next };
    });
  }, []);

  const filtered = React.useMemo(() => {
    let list = topics.slice();
    if (cat === 'hot')         list = list.filter(t => t.hot || (likes[t.id] || 0) >= 5);
    else if (cat === 'closed') list = list.filter(t => !!closed[t.id]);
    else if (cat !== 'all')    list = list.filter(t => t.tag === cat);
    if (query) list = list.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.author.toLowerCase().includes(query.toLowerCase())
    );
    return list;
  }, [topics, cat, query, closed, likes]);

  const active = filtered.find(t => t.id === activeId) || null;

  const handleSelectTopic = React.useCallback((id) => {
    setActiveId(id);
    if (isMobile()) setMobileView('thread');
  }, []);

  const showList   = !isMobile() || mobileView === 'list';
  const showThread = !isMobile() || mobileView === 'thread';

  return (
    <div className="page active fade-in">
      <div className="forum-wrap">
        <div className="forum-page-header">
          <p className="page-label">Comunidade</p>
          <h1 className="page-title">Fórum</h1>
          <p className="forum-lede">Dúvidas, conquistas, dicas e conversas — tudo num só lugar.</p>
        </div>

        <div className="forum-card">
          <div className="forum-toolbar">
            {mobileView === 'thread' && isMobile() && (
              <button className="forum-back-btn" onClick={() => setMobileView('list')}>← Voltar</button>
            )}
            {showList && (
              <div className="forum-cats">
                {CATEGORIES.map(c => (
                  <button key={c.id} className={'fcat' + (cat === c.id ? ' active' : '')} data-cursor="hover" onClick={() => setCat(c.id)}>{c.label}</button>
                ))}
              </div>
            )}
            <button className="forum-new-btn" data-cursor="hover" onClick={() => setPostModal(true)}>+ Nova</button>
          </div>

          <div className="forum-split">
            {showList && (
              <TopicsPane
                topics={filtered}
                query={query}
                setQuery={setQuery}
                activeId={active ? active.id : null}
                setActiveId={handleSelectTopic}
                extras={extras}
                closed={closed}
                likes={likes}
                likedMe={likedMe}
                onLike={toggleLike}
                dislikes={dislikes}
                dislikedMe={dislikedMe}
                onDislike={(topicId, e) => { e.stopPropagation(); toggleDislike(topicId, 'topic'); }}
              />
            )}
            {showThread && (active
              ? <ThreadPane
                  topic={active}
                  user={user}
                  isOwner={isOwner}
                  onSignIn={onSignIn}
                  extra={extras[active.id] || []}
                  onReply={(msg) => addReply(active.id, msg)}
                  isClosed={!!closed[active.id]}
                  onClose={() => closeTopic(active.id)}
                  onDelete={() => deleteTopic(active.id)}
                  blocked={blocked}
                  onBlock={toggleBlock}
                  msgVotes={msgVotes}
                  msgVotedMe={msgVotedMe}
                  onVoteUp={(key) => voteMsgUp(active.id, key)}
                  onVoteDown={(key) => voteMsgDown(active.id, key)}
                />
              : <div className="thread-pane"><div className="thread-empty">Selecione um tópico ao lado.</div></div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <NewPostModal open={postModal} onClose={() => setPostModal(false)} onAdd={addTopic} user={user} toast={toast || (() => {})} />
    </div>
  );
}

function TopicsPane({ topics, query, setQuery, activeId, setActiveId, extras, closed, likes, likedMe, onLike, dislikes, dislikedMe, onDislike }) {
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
              const likeCount    = (likes[t.id] || 0) + (t.likes || 0);
              const liked        = !!likedMe[t.id];
              const dkKey        = t.id + '_topic';
              const dkCount      = dislikes[dkKey] || 0;
              const didDislike   = !!dislikedMe[dkKey];
              const isHot        = t.hot || likeCount >= 5;

              return (
                <div
                  key={t.id}
                  className={'topic-item' + (t.id === activeId ? ' active' : '') + (isClosed ? ' closed' : '')}
                  data-cursor="hover"
                  onClick={() => setActiveId(t.id)}
                >
                  <div className="topic-title-row">
                    <span className="topic-title">{t.title}</span>
                    {isHot && !isClosed && <span className="topic-hot-badge">🔥</span>}
                    {isClosed && <span className="topic-closed-badge">encerrada</span>}
                  </div>
                  {preview && (
                    <div className="topic-preview">
                      <span className="topic-preview-who">{lastMsg.who}:</span> {preview}
                    </div>
                  )}
                  <div className="topic-meta-row">
                    <span className="topic-meta">{t.author} · {totalReplies} resp. · {t.time}</span>
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

function ThreadPane({ topic, user, isOwner, onSignIn, extra, onReply, isClosed, onClose, onDelete, blocked, onBlock, msgVotes, msgVotedMe, onVoteUp, onVoteDown }) {
  const [reply,      setReply]   = React.useState('');
  const [confirming, setConf]    = React.useState(false);
  const [confirmDel, setConfDel] = React.useState(false);
  const msgsRef                  = React.useRef(null);

  const allMsgs = topic.messages.concat(extra);
  // First message is the original post — stays pinned. Replies sorted by score.
  const firstMsg  = allMsgs[0];
  const replies   = allMsgs.slice(1).map((m, i) => ({ ...m, _origIdx: i + 1 })).sort((a, b) => {
    const scoreA = (msgVotes[topic.id + '_' + a._origIdx]?.up || 0) - (msgVotes[topic.id + '_' + a._origIdx]?.down || 0);
    const scoreB = (msgVotes[topic.id + '_' + b._origIdx]?.up || 0) - (msgVotes[topic.id + '_' + b._origIdx]?.down || 0);
    return scoreB - scoreA;
  });
  const msgs         = firstMsg ? [{ ...firstMsg, _origIdx: 0 }, ...replies] : replies;
  const totalReplies = topic.replies + extra.length;

  React.useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [topic.id, msgs.length]);

  const send = () => {
    if (!reply.trim() || !user || isClosed) return;
    onReply({ who: user.name, avatar: user.initials, color: user.color, time: 'agora', text: reply });
    setReply('');
  };

  const handleClose = () => {
    if (!confirming) { setConf(true); return; }
    onClose(); setConf(false);
  };

  const handleDelete = () => {
    if (!confirmDel) { setConfDel(true); return; }
    onDelete(); setConfDel(false);
  };

  return (
    <div className="thread-pane">
      <div className="thread-header">
        <div className="thread-header-top">
          <div className="thread-title">
            {topic.title}
            {isClosed && <span className="thread-closed-badge">encerrada</span>}
          </div>
          <div className="thread-header-actions">
            {isOwner && !isClosed && (
              <button className={'thread-close-btn' + (confirming ? ' confirming' : '')} data-cursor="hover" onClick={handleClose} onBlur={() => setConf(false)}>
                {confirming ? 'Confirmar?' : 'Encerrar'}
              </button>
            )}
            {(isOwner || (user && user.name === topic.author)) && (
              <button className={'thread-delete-btn' + (confirmDel ? ' confirming' : '')} data-cursor="hover" onClick={handleDelete} onBlur={() => setConfDel(false)}>
                {confirmDel ? 'Confirmar exclusão?' : 'Excluir'}
              </button>
            )}
          </div>
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
        {msgs.map((m, renderIdx) => {
          const msgKey    = m._origIdx;
          const voteKey   = topic.id + '_' + msgKey;
          const isBlocked = !!blocked[m.who];
          const isMine    = user && m.who === user.name;
          const votes     = msgVotes[voteKey] || { up: 0, down: 0 };
          const myVote    = msgVotedMe[voteKey] || null;

          return (
            <div key={voteKey + renderIdx} className={'msg' + (isBlocked ? ' msg--blocked' : '')}>
              <div className="msg-avatar" style={{ background: m.color }}>{m.avatar}</div>
              <div className="msg-body">
                <div className="msg-head">
                  <span className="msg-name">{m.who}</span>
                  <span className="msg-time">{m.time}</span>
                  {isBlocked && <span className="msg-blocked-badge">bloqueado</span>}
                </div>
                {isBlocked
                  ? <div className="msg-blocked-text">Mensagem oculta.</div>
                  : <div className="msg-text" dangerouslySetInnerHTML={{ __html: m.text }} />
                }
                <div className="msg-actions">
                  {!isMine && (
                    <React.Fragment>
                      <button className={'msg-vote-up' + (myVote === 'up' ? ' active' : '')} data-cursor="hover" onClick={() => onVoteUp(msgKey)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={myVote === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/>
                          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        {votes.up > 0 && <span>{votes.up}</span>}
                      </button>
                      <button className={'msg-vote-down' + (myVote === 'down' ? ' active' : '')} data-cursor="hover" onClick={() => onVoteDown(msgKey)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={myVote === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/>
                          <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                        </svg>
                        {votes.down > 0 && <span>{votes.down}</span>}
                      </button>
                    </React.Fragment>
                  )}
                  {isOwner && !isMine && (
                    <button className={'msg-block-btn' + (isBlocked ? ' blocked' : '')} data-cursor="hover" onClick={() => onBlock(m.who)}>
                      {isBlocked ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
