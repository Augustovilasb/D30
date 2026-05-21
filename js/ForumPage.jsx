/* ForumPage.jsx — topics list + thread, data from Supabase via DB */

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
  return (html || '').replace(/<[^>]+>/g, '');
}

function ForumPage({ user, onSignIn, toast }) {
  const isAdmin  = !!user?.is_admin;
  const t        = toast || (() => {});
  const isMobile = () => window.innerWidth <= 768;

  /* ── state ─────────────────────────────────────────────────── */
  const [topics,       setTopics]       = React.useState([]);
  const [loadingTopics,setLoadingTopics]= React.useState(true);
  const [topicMsgs,    setTopicMsgs]    = React.useState({}); // { topicId: Message[] }
  const [loadingMsgs,  setLoadingMsgs]  = React.useState(false);
  const [voteCounts,   setVoteCounts]   = React.useState({}); // { msgId: {up,down} }
  const [myVotes,      setMyVotes]      = React.useState({}); // { msgId: 'up'|'down' }

  const [cat,       setCat]       = React.useState('all');
  const [query,     setQuery]     = React.useState('');
  const [activeId,  setActiveId]  = React.useState(null);
  const [postModal, setPostModal] = React.useState(false);
  const [blocked,   setBlocked]   = React.useState({});
  const [mobileView,setMobileView]= React.useState('list');

  /* ── load topics ────────────────────────────────────────────── */
  React.useEffect(() => {
    let cancelled = false;
    DB.forum.getTopics()
      .then(data => {
        if (cancelled) return;
        setTopics(data);
        const deepLink = window.__forumOpenTopic;
        if (deepLink && data.find(t => t.id === deepLink)) {
          window.__forumOpenTopic = null;
          setActiveId(deepLink);
        } else if (data.length) {
          setActiveId(data[0].id);
        }
      })
      .catch(() => t('error', 'Erro ao carregar o fórum.'))
      .finally(() => { if (!cancelled) setLoadingTopics(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── load messages when topic selected ─────────────────────── */
  React.useEffect(() => {
    if (!activeId) return;
    if (topicMsgs[activeId] !== undefined) return; // cached

    let cancelled = false;
    setLoadingMsgs(true);

    DB.forum.getMessages(activeId)
      .then(async msgs => {
        if (cancelled) return;
        setTopicMsgs(prev => ({ ...prev, [activeId]: msgs }));

        const ids = msgs.map(m => m.id);
        if (!ids.length) return;

        const [counts, myV] = await Promise.all([
          DB.forum.getVoteCounts(ids),
          user ? DB.forum.getMyVotes(user.id) : Promise.resolve({}),
        ]);
        if (cancelled) return;
        setVoteCounts(prev => ({ ...prev, ...counts }));
        setMyVotes(prev => ({ ...prev, ...myV }));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingMsgs(false); });

    return () => { cancelled = true; };
  }, [activeId]);

  /* ── actions ────────────────────────────────────────────────── */
  const addTopic = React.useCallback(async ({ title, tag, firstMessage }) => {
    if (!user) return;
    try {
      const topic = await DB.forum.createTopic({ title, tag, userId: user.id, authorName: user.name });
      const msg   = await DB.forum.createMessage({ topicId: topic.id, text: firstMessage, userId: user.id, authorName: user.name });
      setTopics(prev => [topic, ...prev]);
      setTopicMsgs(prev => ({ ...prev, [topic.id]: [msg] }));
      setActiveId(topic.id);
      if (isMobile()) setMobileView('thread');
      t('success', 'Publicado!');
    } catch (e) {
      t('error', 'Erro ao publicar. Tente novamente.');
    }
  }, [user]);

  const addReply = React.useCallback(async (topicId, text) => {
    if (!user || !text.trim()) return;
    try {
      const msg = await DB.forum.createMessage({ topicId, text, userId: user.id, authorName: user.name });
      setTopicMsgs(prev => ({ ...prev, [topicId]: [...(prev[topicId] || []), msg] }));
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, reply_count: (t.reply_count || 0) + 1 } : t));
    } catch {
      t('error', 'Erro ao enviar resposta.');
    }
  }, [user]);

  const closeTopic = React.useCallback(async (topicId) => {
    try {
      await DB.forum.closeTopic(topicId);
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, closed: true } : t));
    } catch { t('error', 'Erro ao encerrar tópico.'); }
  }, []);

  const deleteTopic = React.useCallback(async (topicId) => {
    try {
      await DB.forum.deleteTopic(topicId);
      setTopics(prev => {
        const next = prev.filter(tt => tt.id !== topicId);
        setActiveId(next.length ? next[0].id : null);
        return next;
      });
    } catch { t('error', 'Erro ao excluir tópico.'); }
  }, []);

  const voteMsg = React.useCallback(async (msgId, voteType) => {
    if (!user) { onSignIn('login'); return; }
    try {
      const result = await DB.forum.vote({ userId: user.id, messageId: msgId, voteType });

      setMyVotes(prev => {
        const was = prev[msgId];
        const next = { ...prev, [msgId]: result };

        setVoteCounts(vc => {
          const c = { ...(vc[msgId] || { up: 0, down: 0 }) };
          if (was === 'up')    c.up   = Math.max(0, c.up - 1);
          if (was === 'down')  c.down = Math.max(0, c.down - 1);
          if (result === 'up')   c.up++;
          if (result === 'down') c.down++;
          return { ...vc, [msgId]: c };
        });

        return next;
      });
    } catch {}
  }, [user]);

  const toggleBlock = React.useCallback((name) => {
    setBlocked(prev => ({ ...prev, [name]: !prev[name] }));
  }, []);

  /* ── filter ─────────────────────────────────────────────────── */
  const filtered = React.useMemo(() => {
    let list = topics.slice();
    if (cat === 'hot')         list = list.filter(t => t.hot);
    else if (cat === 'closed') list = list.filter(t => t.closed);
    else if (cat !== 'all')    list = list.filter(t => t.tag === cat);
    if (query) list = list.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.author_name.toLowerCase().includes(query.toLowerCase())
    );
    return list;
  }, [topics, cat, query]);

  const active    = filtered.find(t => t.id === activeId) || null;
  const showList  = !isMobile() || mobileView === 'list';
  const showThread= !isMobile() || mobileView === 'thread';

  const handleSelectTopic = React.useCallback((id) => {
    setActiveId(id);
    if (isMobile()) setMobileView('thread');
  }, []);

  if (loadingTopics) {
    return (
      <div className="page active fade-in">
        <div className="forum-wrap">
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Carregando fórum…</div>
        </div>
      </div>
    );
  }

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
                topicMsgs={topicMsgs}
              />
            )}
            {showThread && (active
              ? <ThreadPane
                  topic={active}
                  user={user}
                  isAdmin={isAdmin}
                  onSignIn={onSignIn}
                  msgs={topicMsgs[active.id] || []}
                  loadingMsgs={loadingMsgs && !topicMsgs[active.id]}
                  onReply={(text) => addReply(active.id, text)}
                  onClose={() => closeTopic(active.id)}
                  onDelete={() => deleteTopic(active.id)}
                  blocked={blocked}
                  onBlock={toggleBlock}
                  voteCounts={voteCounts}
                  myVotes={myVotes}
                  onVote={voteMsg}
                />
              : <div className="thread-pane"><div className="thread-empty">Selecione um tópico ao lado.</div></div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <NewPostModal open={postModal} onClose={() => setPostModal(false)} onAdd={addTopic} user={user} toast={t} />
    </div>
  );
}

function TopicsPane({ topics, query, setQuery, activeId, setActiveId, topicMsgs }) {
  return (
    <div className="topics-pane">
      <div className="topics-search">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder="Buscar..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="topics-list">
        {topics.length === 0
          ? <div className="topics-empty">Nada por aqui.</div>
          : topics.map(t => {
              const msgs      = topicMsgs[t.id];
              const lastMsg   = msgs ? msgs[msgs.length - 1] : null;
              const preview   = lastMsg ? stripHtml(lastMsg.text) : '';
              const previewWho= lastMsg ? lastMsg.author_name : '';
              const isHot     = t.hot;
              const isClosed  = t.closed;

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
                      <span className="topic-preview-who">{previewWho}:</span> {preview}
                    </div>
                  )}
                  <div className="topic-meta-row">
                    <span className="topic-meta">{t.author_name} · {t.reply_count || 0} resp. · {t.time}</span>
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

function ThreadPane({ topic, user, isAdmin, onSignIn, msgs, loadingMsgs, onReply, onClose, onDelete, blocked, onBlock, voteCounts, myVotes, onVote }) {
  const [reply,      setReply]   = React.useState('');
  const [confirming, setConf]    = React.useState(false);
  const [confirmDel, setConfDel] = React.useState(false);
  const msgsRef                  = React.useRef(null);
  const isClosed                 = topic.closed;

  const canDelete = isAdmin || (user && msgs[0]?.author_id === user.id);

  const firstMsg  = msgs[0] || null;
  const replies   = msgs.slice(1).slice().sort((a, b) => {
    const sa = (voteCounts[a.id]?.up || 0) - (voteCounts[a.id]?.down || 0);
    const sb = (voteCounts[b.id]?.up || 0) - (voteCounts[b.id]?.down || 0);
    return sb - sa;
  });
  const sortedMsgs = firstMsg ? [firstMsg, ...replies] : replies;

  React.useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [topic.id, msgs.length]);

  const send = () => {
    if (!reply.trim() || !user || isClosed) return;
    onReply(reply.trim());
    setReply('');
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
            {isAdmin && !isClosed && (
              <button className={'thread-close-btn' + (confirming ? ' confirming' : '')} data-cursor="hover"
                onClick={() => { if (!confirming) { setConf(true); return; } onClose(); setConf(false); }}
                onBlur={() => setConf(false)}>
                {confirming ? 'Confirmar?' : 'Encerrar'}
              </button>
            )}
            {canDelete && (
              <button className={'thread-delete-btn' + (confirmDel ? ' confirming' : '')} data-cursor="hover"
                onClick={() => { if (!confirmDel) { setConfDel(true); return; } onDelete(); setConfDel(false); }}
                onBlur={() => setConfDel(false)}>
                {confirmDel ? 'Confirmar exclusão?' : 'Excluir'}
              </button>
            )}
          </div>
        </div>
        <div className="thread-sub">
          <span>{topic.tagLabel}</span>
          <span>·</span>
          <span>{topic.author_name}</span>
          <span>·</span>
          <span>{topic.time}</span>
          <span>·</span>
          <span>{topic.reply_count || msgs.length} respostas</span>
        </div>
      </div>

      <div className="thread-msgs" ref={msgsRef}>
        {loadingMsgs && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Carregando…</div>
        )}
        {sortedMsgs.map((m) => {
          const isBlocked = !!blocked[m.author_name];
          const isMine    = user && m.author_id === user.id;
          const votes     = voteCounts[m.id] || { up: 0, down: 0 };
          const myVote    = myVotes[m.id] || null;

          return (
            <div key={m.id} className={'msg' + (isBlocked ? ' msg--blocked' : '')}>
              <div className="msg-avatar" style={{ background: m.color }}>{m.avatar}</div>
              <div className="msg-body">
                <div className="msg-head">
                  <span className="msg-name">{m.author_name}</span>
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
                      <button className={'msg-vote-up' + (myVote === 'up' ? ' active' : '')} data-cursor="hover" onClick={() => onVote(m.id, 'up')}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={myVote === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/>
                          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        {votes.up > 0 && <span>{votes.up}</span>}
                      </button>
                      <button className={'msg-vote-down' + (myVote === 'down' ? ' active' : '')} data-cursor="hover" onClick={() => onVote(m.id, 'down')}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={myVote === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/>
                          <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                        </svg>
                        {votes.down > 0 && <span>{votes.down}</span>}
                      </button>
                    </React.Fragment>
                  )}
                  {isAdmin && !isMine && (
                    <button className={'msg-block-btn' + (isBlocked ? ' blocked' : '')} data-cursor="hover" onClick={() => onBlock(m.author_name)}>
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
