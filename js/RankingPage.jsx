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

function pl(n, singular, plural) { return n + ' ' + (n === 1 ? singular : plural); }

const RANK_TABS = [
  { key: 'hours',   col: 'total_hours',        label: 'Horas',    fmt: r => (r.total_hours    || 0).toFixed(1) + 'h'                              },
  { key: 'books',   col: 'total_livros_lidos',  label: 'Livros',   fmt: r => pl(r.total_livros_lidos || 0, 'livro',  'livros')                     },
  { key: 'talks',   col: 'total_talks',         label: 'Talks',    fmt: r => pl(r.total_talks         || 0, 'talk',   'talks')                      },
  { key: 'forum',   col: 'total_forum_topics',  label: 'Fórum',    fmt: r => pl(r.total_forum_topics  || 0, 'tópico', 'tópicos')                   },
  { key: 'sessions',col: 'total_sessions',      label: 'Sessões',  fmt: r => pl(r.total_sessions      || 0, 'sessão', 'sessões')                   },
  { key: 'courses', col: 'total_courses_done',  label: 'Cursos',   fmt: r => pl(r.total_courses_done  || 0, 'curso',  'cursos')                    },
];

function RankingPage({ user }) {
  const [tab,     setTab]     = React.useState('hours');
  const [rows,    setRows]    = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [myRank,  setMyRank]  = React.useState(null);

  const currentTab = RANK_TABS.find(t => t.key === tab) || RANK_TABS[0];

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const col = currentTab.col;
      const { data, error } = await window.sb
        .from('profiles')
        .select('id, full_name, username, avatar_url, total_hours, total_sessions, total_livros_lidos, total_talks, total_forum_topics, total_courses_done, is_founding_member')
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

  function displayVal(row) { return currentTab.fmt(row); }

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
          {RANK_TABS.map(t => (
            <button key={t.key} className={'ranking-tab' + (tab === t.key ? ' active' : '')} data-cursor="hover" onClick={() => setTab(t.key)}>{t.label}</button>
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
                    {tab !== 'hours'    && (row.total_hours    || 0) > 0 && <span>{(row.total_hours).toFixed(0)}h</span>}
                    {tab !== 'sessions' && (row.total_sessions || 0) > 0 && <span>{row.total_sessions} sessões</span>}
                    {tab !== 'talks'    && (row.total_talks    || 0) > 0 && <span>{row.total_talks} talks</span>}
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
