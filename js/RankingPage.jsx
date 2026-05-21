/* RankingPage.jsx — community leaderboard */

function CrownIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l4 8 6-10 6 10 4-8-2 14H4z"/>
    </svg>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) return <div className="rank-badge rank-badge--1">1</div>;
  if (rank === 2) return <div className="rank-badge rank-badge--2">2</div>;
  if (rank === 3) return <div className="rank-badge rank-badge--3">3</div>;
  return <span className="rank-num">#{rank}</span>;
}

function RankingPage({ user }) {
  const [tab,     setTab]     = React.useState('hours');
  const [rows,    setRows]    = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [myRank,  setMyRank]  = React.useState(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const col = tab === 'hours' ? 'total_hours' : tab === 'streak' ? 'best_streak' : 'total_sessions';
      const { data, error } = await window.sb
        .from('profiles')
        .select('id, full_name, username, avatar_url, total_hours, current_streak, best_streak, total_sessions, is_founding_member')
        .not(col, 'is', null)
        .gt(col, 0)
        .order(col, { ascending: false })
        .limit(100);
      if (error) console.error('[D30] ranking error:', error);

      const list = data || [];
      setRows(list);
      const idx = list.findIndex(r => r.id === user.id);
      setMyRank(idx >= 0 ? idx + 1 : null);
      setLoading(false);
    }
    load();
  }, [tab]);

  function displayVal(row) {
    if (tab === 'hours')    return ((row.total_hours    || 0).toFixed(1)) + 'h';
    if (tab === 'streak')   return (row.best_streak     || 0) + ' dias';
    return                         (row.total_sessions  || 0) + ' sessões';
  }

  function initials(name) {
    return (name || '?').trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
  }

  return (
    <div className="page active fade-in">
      <div className="ranking-wrap">

        <div className="ranking-header">
          <div>
            <h1 className="ranking-title">Ranking</h1>
            <p className="ranking-sub">Top da comunidade D30</p>
          </div>
          {myRank && (
            <div className="ranking-mypos">
              <span className="ranking-mypos-label">Sua posição</span>
              <span className="ranking-mypos-val">#{myRank}</span>
            </div>
          )}
        </div>

        <div className="ranking-tabs">
          {[['hours','Horas estudadas'],['streak','Maior streak'],['sessions','Sessões']].map(([k,l]) => (
            <button key={k} className={'ranking-tab' + (tab === k ? ' active' : '')} data-cursor="hover" onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div className="ranking-loading">Carregando ranking…</div>
        ) : rows.length === 0 ? (
          <div className="ranking-empty">Nenhum dado ainda. Comece a estudar!</div>
        ) : (
          <div className="ranking-list">
            {rows.map((row, i) => {
              const isMe = row.id === user.id;
              return (
                <div key={row.id} className={'ranking-row' + (isMe ? ' is-me' : '') + (i < 3 ? ' top3' : '')}>
                  <div className="ranking-pos">
                    <RankBadge rank={i + 1} />
                  </div>

                  <div className="ranking-avatar-wrap">
                    {row.avatar_url
                      ? <img src={row.avatar_url} alt={row.full_name} className="ranking-avatar-img" />
                      : <div className="ranking-avatar-init" style={{ background: '#6d5ce6' }}>{initials(row.full_name)}</div>
                    }
                  </div>

                  <div className="ranking-info">
                    <div className="ranking-name">
                      {row.full_name || row.username || 'Anônimo'}
                      {row.is_founding_member && (
                        <span className="ranking-founder-icon" title="Membro Fundador" style={{ color: '#f59e0b' }}>
                          <CrownIcon size={13} />
                        </span>
                      )}
                      {isMe && <span className="ranking-you">você</span>}
                    </div>
                    {row.username && <div className="ranking-username">@{row.username}</div>}
                  </div>

                  <div className="ranking-secondary">
                    {tab !== 'hours'    && row.total_hours    > 0 && <span>{(row.total_hours).toFixed(0)}h</span>}
                    {tab !== 'streak'   && row.best_streak    > 0 && <span>{row.best_streak}d streak</span>}
                    {tab !== 'sessions' && row.total_sessions > 0 && <span>{row.total_sessions} sessões</span>}
                  </div>

                  <div className={'ranking-val' + (i < 3 ? ' top3-val' : '')}>{displayVal(row)}</div>
                </div>
              );
            })}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { RankingPage });
