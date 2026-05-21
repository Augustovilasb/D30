/* RoadmapPage.jsx — skill tree + node detail view */

const COURSES = [
  { id: 'logica',   title: 'Lógica de Programação',              subtitle: 'Virado no Jiraya · DevDojo',  url: 'https://www.youtube.com/watch?v=ycyL5CqZoUo&list=PL62G310vn6nH-uBTKREcUWDkOi2Q9n4OZ' },
  { id: 'java',     title: 'Maratona Java',                      subtitle: 'Virado no Jiraya · DevDojo',  url: 'https://www.youtube.com/watch?v=F2Y867f1J8U&list=PL62G310vn6nFIsOCC0H-C2infYgwm8SWW' },
  { id: 'git',      title: 'Git e Github',                       subtitle: 'Curso Gratuito',              url: 'https://www.youtube.com/watch?v=2c7yWlpWDJM&list=PLcoYAcR89n-qbO7YAVj5S0alABLis_QVU' },
  { id: 'sql',      title: 'SQL com MySQL',                      subtitle: 'Curso Completo',              url: 'https://www.youtube.com/watch?v=lHYV_H1526Q&list=PLbIBj8vQhvm2WT-pjGS5x7zUzmh4VgvRk' },
  { id: 'apitests', title: 'Testes de API Rest',                 subtitle: 'Introdução · Gratuito',       url: 'https://www.youtube.com/watch?v=VqVQ7vHY32o&list=PLf8x7B3nFTl17WeEVj405tHlstiq1kNBX' },
  { id: 'spring1',  title: 'Spring Boot Direto Das Trincheiras', subtitle: 'DevDojo',                     url: 'https://www.youtube.com/watch?v=beRdNB8lNUI&list=PL62G310vn6nFTNJ4JbW8BuhAiK16MEc_x' },
  { id: 'spring2',  title: 'Spring Boot Essentials 00',          subtitle: 'DevDojo',                     url: 'https://www.youtube.com/watch?v=R-F-UcDo_5I&list=PL62G310vn6nF3gssjqfCKLpTK2sZJ_a_1' },
  { id: 'spring3',  title: 'Spring Boot Essentials 2',           subtitle: 'DevDojo',                     url: 'https://www.youtube.com/watch?v=bCzsSXE4Jzg&list=PL62G310vn6nFBIxp6ZwGnm8xMcGE3VA5H' },
  { id: 'resteasy', title: 'REST com RESTEasy',                  subtitle: 'Configuração completa',       url: 'https://www.youtube.com/watch?v=QxohK_Er0EM&list=PL62G310vn6nEZU20j1J38xEUwuQLuEUFS' },
  { id: 'docker',   title: 'Docker',                             subtitle: 'Curso Completo',              url: 'https://www.youtube.com/watch?v=OERbOJZwGAU&list=PLViOsriojeLrdw5VByn96gphHFxqH3O_N' },
  { id: 'cloud',    title: 'Introdução à Cloud',                 subtitle: 'Conceitos e prática',         url: 'https://www.youtube.com/watch?v=x4PdyxH7KIw&list=PL62G310vn6nGyKUJVqa_VvATxkm1E-d5k' },
  { id: 'aws',      title: 'AWS White Belt',                     subtitle: 'Amazon Web Services',         url: 'https://www.youtube.com/watch?v=tZWNcpiXvFM&list=PL62G310vn6nHwfC31Q2hqh-3nO-6Rceyd' },
];

const PHASES = [
  { id: 'p1', num: '01', label: 'Base',           ids: ['logica'] },
  { id: 'p2', num: '02', label: 'Versionamento',  ids: ['git'] },
  { id: 'p3', num: '03', label: 'Linguagem',      ids: ['java'] },
  { id: 'p4', num: '04', label: 'Banco de Dados', ids: ['sql'] },
  { id: 'p5', num: '05', label: 'Testes',         ids: ['apitests'] },
  { id: 'p6', num: '06', label: 'Spring Boot',    ids: ['spring1', 'spring2', 'spring3', 'resteasy'] },
  { id: 'p7', num: '07', label: 'DevOps & Cloud', ids: ['docker', 'cloud', 'aws'] },
];

const COURSE_MAP = Object.fromEntries(COURSES.map(c => [c.id, c]));

const TREE = [
  {
    id: 'fundamentos',
    levelTag: 'NOOB',
    title: 'Fundamentos Essenciais',
    desc: 'Lógica, versionamento, linguagem e banco de dados. A base de tudo.',
    trophy: 'Fundamentado',
    phaseIds: ['p1', 'p2', 'p3', 'p4'],
    games: [
      { id: 'linux',      title: 'Linux Survival',     desc: 'Aprenda comandos Linux',       url: 'https://linuxsurvival.com/linux-tutorial-introduction/' },
      { id: 'cmdchall',   title: 'CMD Challenge',       desc: 'Desafios de linha de comando', url: 'https://cmdchallenge.com/#/last_lines' },
      { id: 'learngit',   title: 'Learn Git Branching', desc: 'Git visual e interativo',      url: 'https://learngitbranching.js.org/' },
      { id: 'sqlbolt',    title: 'SQLBolt',             desc: 'Lições interativas de SQL',    url: 'https://sqlbolt.com/' },
      { id: 'sqlmystery', title: 'SQL Murder Mystery',  desc: 'Resolva um crime com SQL',     url: 'https://mystery.knightlab.com/' },
    ],
    docs: [],
  },
  {
    id: 'junior',
    levelTag: 'DEV JUNIOR',
    title: 'Trilha Dev Junior',
    desc: 'Testes de API, Spring Boot e suas primeiras aplicações reais.',
    trophy: 'Dev Junior',
    phaseIds: ['p5', 'p6'],
    games: [],
    docs: [],
  },
  {
    id: 'pleno',
    levelTag: 'DEV PLENO',
    title: 'Trilha Dev Pleno',
    desc: 'Docker, Cloud e autonomia técnica no dia a dia.',
    trophy: 'Dev Pleno',
    phaseIds: ['p7'],
    games: [],
    docs: [],
  },
  {
    id: 'senior',
    levelTag: 'DEV SENIOR',
    title: 'Trilha Dev Senior',
    desc: 'Arquitetura de sistemas, liderança técnica e visão de produto.',
    trophy: 'Dev Senior',
    phaseIds: [],
    games: [],
    docs: [],
    comingSoon: true,
  },
];

function _nodeAllIds(node) {
  return node.phaseIds.flatMap(pid => (PHASES.find(p => p.id === pid)?.ids || []));
}

function RoadmapPage({ user }) {
  const userId = user?.id || null;

  const [done,         setDone]         = React.useState(() => DB.roadmap._loadLocal());
  const [unlocking,    setUnlocking]    = React.useState(new Set());
  const [selectedNode, setSelectedNode] = React.useState(null);
  const [detailTab,    setDetailTab]    = React.useState('cursos');
  const selectedNodeRef = React.useRef(null);

  React.useEffect(() => { selectedNodeRef.current = selectedNode; }, [selectedNode]);

  // intercept browser back button while inside a node detail
  React.useEffect(() => {
    const onPop = () => {
      if (selectedNodeRef.current) {
        setSelectedNode(null);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  React.useEffect(() => {
    DB.roadmap.getProgress(userId).then(setDone).catch(() => {});
  }, [userId]);

  // handle cross-page highlight navigation
  React.useEffect(() => {
    const courseId = window.__roadmapHighlight;
    if (!courseId) return;
    window.__roadmapHighlight = null;
    const node = TREE.find(n => _nodeAllIds(n).includes(courseId));
    if (node) {
      setSelectedNode(node.id);
      setDetailTab('cursos');
      setTimeout(() => {
        const el = document.querySelector(`[data-highlight-id="${courseId}"]`);
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('highlight-flash'); }
      }, 300);
    }
  }, []);

  const toggle = React.useCallback((id) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        DB.roadmap.markUndone(userId, id);
      } else {
        next.add(id);
        DB.roadmap.markDone(userId, id);
        setUnlocking(u => { const n = new Set(u); n.add(id); return n; });
        setTimeout(() => setUnlocking(u => { const n = new Set(u); n.delete(id); return n; }), 500);
      }
      return next;
    });
  }, [userId]);

  const nodeProgress = (node) => {
    const ids = _nodeAllIds(node);
    if (!ids.length) return { done: 0, total: 0, pct: 0 };
    const d = ids.filter(id => done.has(id)).length;
    return { done: d, total: ids.length, pct: Math.round(d / ids.length * 100) };
  };

  const isNodeUnlocked = (idx) => {
    if (idx === 0) return true;
    return _nodeAllIds(TREE[idx - 1]).every(id => done.has(id));
  };

  if (selectedNode) {
    const node    = TREE.find(n => n.id === selectedNode);
    const nodeIdx = TREE.findIndex(n => n.id === selectedNode);
    return (
      <NodeDetail
        node={node}
        unlocked={isNodeUnlocked(nodeIdx)}
        progress={nodeProgress(node)}
        done={done}
        unlocking={unlocking}
        onToggle={toggle}
        tab={detailTab}
        onTabChange={setDetailTab}
        onBack={() => window.history.back()}
      />
    );
  }

  return (
    <div className="page active fade-in">
      <div className="roadmap-wrap">
        <h1 className="page-title">Sua jornada como <em>desenvolvedor</em>.</h1>
        <p className="rm3-lead">Do zero ao sênior, passo a passo. Clique em uma etapa para ver os conteúdos.</p>

        <div className="rm-tree">
          {TREE.map((node, idx) => {
            const unlocked = isNodeUnlocked(idx);
            const progress = nodeProgress(node);
            const earned   = progress.total > 0 && progress.done === progress.total;
            return (
              <React.Fragment key={node.id}>
                <TreeNode
                  node={node}
                  unlocked={unlocked}
                  progress={progress}
                  earned={earned}
                  onClick={() => { if (!node.comingSoon && isNodeUnlocked(idx)) { setSelectedNode(node.id); setDetailTab('cursos'); window.history.pushState({ page: 'roadmap', rmNode: node.id }, '', '#roadmap'); window.scrollTo({ top: 0, behavior: 'instant' }); } }}
                />
                {idx < TREE.length - 1 && (
                  <div className={'rm-tree-connector' + (unlocked ? ' done' : '')} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function TreeNode({ node, unlocked, progress, earned, onClick }) {
  const cls = 'rm-tree-node'
    + ((!unlocked || node.comingSoon) ? ' locked' : '')
    + (node.comingSoon ? ' coming-soon' : '')
    + (' rm-tree-node--' + node.id);
  return (
    <div className={cls} onClick={onClick} data-cursor={!node.comingSoon && unlocked ? 'hover' : undefined}>
      <div className="rm-tree-node-inner">
        <div className="rm-tree-node-left">
          <span className={'rm-tree-level rm-tree-level--' + node.id}>{node.levelTag}</span>
          <h3 className="rm-tree-title">{node.title}</h3>
          <p className="rm-tree-desc">{node.desc}</p>
          {node.comingSoon && <span className="rm-tree-soon">Em breve</span>}
        </div>
        <div className="rm-tree-node-right">
          <div className={'rm-tree-trophy' + (earned ? ' earned' : '')}>
            <span className="rm-tree-trophy-icon">{earned ? '🏆' : '🔒'}</span>
            <span className="rm-tree-trophy-label">{node.trophy}</span>
          </div>
          {!node.comingSoon && unlocked && progress.total > 0 && (
            <div className="rm-tree-progress">
              <div className="rm-tree-progress-bar">
                <div className="rm-tree-progress-fill" style={{ width: progress.pct + '%' }} />
              </div>
              <span className="rm-tree-progress-pct">{progress.pct}%</span>
            </div>
          )}
          {!node.comingSoon && (
            <span className="rm-tree-cta">{unlocked ? 'Ver trilha →' : 'Bloqueado'}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function NodeDetail({ node, unlocked, progress, done, unlocking, onToggle, tab, onTabChange, onBack }) {
  const phases = node.phaseIds.map(pid => PHASES.find(p => p.id === pid)).filter(Boolean);
  const earned = progress.total > 0 && progress.done === progress.total;

  const TABS = [
    { id: 'cursos', label: 'Cursos',      count: progress.total },
    { id: 'jogos',  label: 'Jogos',       count: node.games.length },
    { id: 'docs',   label: 'Docs',        count: node.docs.length },
  ];

  return (
    <div className="page active fade-in">
      <div className="roadmap-wrap">
        <button className="rm-back-btn" onClick={onBack} data-cursor="hover">← Voltar</button>

        <div className="rm-detail-header">
          <span className={'rm-tree-level rm-tree-level--' + node.id}>{node.levelTag}</span>
          <h1 className="page-title" style={{ marginTop: '0.5rem' }}>{node.title}</h1>
          <p className="rm3-lead">{node.desc}</p>

          {progress.total > 0 && (
            <div className="rm3-overall" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
              <div className="rm3-overall-bar">
                <div className="rm3-overall-fill" style={{ width: progress.pct + '%' }} />
                {progress.pct >= 3 && (
                  <span className="rm3-overall-label" style={{ left: progress.pct + '%' }}>{progress.pct}%</span>
                )}
              </div>
              <div className="rm3-overall-meta">
                <span className="rm3-overall-pct">{progress.pct}% concluído</span>
                <span className="rm3-overall-count">{progress.done}/{progress.total} cursos</span>
              </div>
            </div>
          )}
        </div>

        <div className="rm-detail-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={'rm-detail-tab' + (tab === t.id ? ' active' : '')}
              onClick={() => onTabChange(t.id)}
              data-cursor="hover"
            >
              {t.label}
              {t.count > 0 && <span className="rm-detail-tab-count">{t.count}</span>}
            </button>
          ))}
        </div>

        {tab === 'cursos' && (
          <div className="rm3-stack">
            {phases.length === 0
              ? <p className="rm-empty-state">Cursos em breve.</p>
              : phases.map((phase, i) => {
                  const prevPhaseIds  = i > 0 ? (PHASES.find(p => p.id === node.phaseIds[i - 1])?.ids || []) : [];
                  const phaseUnlocked = unlocked && (i === 0 || prevPhaseIds.every(id => done.has(id)));
                  const doneCount     = phase.ids.filter(id => done.has(id)).length;
                  const phasePct      = Math.round(doneCount / phase.ids.length * 100);
                  return (
                    <PhaseCard
                      key={phase.id}
                      phase={phase}
                      unlocked={phaseUnlocked}
                      allDone={doneCount === phase.ids.length}
                      doneCount={doneCount}
                      phasePct={phasePct}
                      done={done}
                      unlocking={unlocking}
                      onToggle={onToggle}
                    />
                  );
                })
            }
          </div>
        )}

        {tab === 'jogos' && (
          <div className="rm-tab-content">
            {node.games.length === 0
              ? <p className="rm-empty-state">Jogos em breve.</p>
              : (
                <div className="rm3-games-list">
                  {node.games.map(g => (
                    <a key={g.id} href={g.url} target="_blank" rel="noopener noreferrer" className="rm3-game-card" data-cursor="hover">
                      <span className="rm3-game-title">{g.title}</span>
                      <span className="rm3-game-desc">{g.desc}</span>
                      <span className="rm3-game-arrow">↗</span>
                    </a>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {tab === 'docs' && (
          <div className="rm-tab-content">
            {node.docs.length === 0
              ? <p className="rm-empty-state">Documentação em breve.</p>
              : node.docs.map(d => (
                  <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" className="rm-doc-card" data-cursor="hover">
                    <span className="rm-doc-title">{d.title}</span>
                    <span className="rm-doc-desc">{d.desc}</span>
                    <span className="rm-doc-arrow">↗</span>
                  </a>
                ))
            }
          </div>
        )}

        {earned && (
          <div className="rm-trophy-earned">
            <span className="rm-trophy-earned-icon">🏆</span>
            <div>
              <p className="rm-trophy-earned-title">Conquista desbloqueada!</p>
              <p className="rm-trophy-earned-sub">Você é {node.trophy}.</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function PhaseCard({ phase, unlocked, allDone, doneCount, phasePct, done, unlocking, onToggle }) {
  const cls = 'rm3-card' + (!unlocked ? ' locked' : allDone ? ' all-done' : '');
  return (
    <div className="rm3-entry">
      <div className={cls} data-phase={phase.id}>
        <div className="rm3-card-header">
          <span className="rm3-card-num">{phase.num}</span>
          <span className="rm3-card-sep">·</span>
          <span className="rm3-card-label">{phase.label}</span>
          {!unlocked
            ? <svg className="rm3-lock-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            : <span className="rm3-card-count">{doneCount}/{phase.ids.length}</span>
          }
        </div>
        <div className="rm3-card-body">
          {!unlocked ? (
            <>
              <p className="rm3-lock-msg">Conclua a fase anterior para desbloquear.</p>
              <div className="rm3-locked-list">
                {phase.ids.map(id => (
                  <span key={id} className="rm3-locked-item">{COURSE_MAP[id].title}</span>
                ))}
              </div>
            </>
          ) : (
            phase.ids.map((id, idx) => {
              const c              = COURSE_MAP[id];
              const isDone         = done.has(id);
              const isAnim         = unlocking.has(id);
              const isCourseLocked = idx > 0 && !done.has(phase.ids[idx - 1]);
              return (
                <div key={id} data-highlight-id={id} className={'rm3-course' + (isDone ? ' done' : '') + (isCourseLocked ? ' course-locked' : '')}>
                  <div className="rm3-course-info">
                    <span className="rm3-course-title">{c.title}</span>
                    <span className="rm3-course-sub">{c.subtitle}</span>
                    {isCourseLocked && <span className="rm3-course-lock-msg">Conclua o anterior primeiro</span>}
                  </div>
                  <div className="rm3-course-actions">
                    {isCourseLocked ? (
                      <span className="rm3-watch rm3-watch--locked">Assistir ↗</span>
                    ) : (
                      <a className="rm3-watch" href={c.url} target="_blank" rel="noopener noreferrer" data-cursor="hover">
                        Assistir ↗
                      </a>
                    )}
                    <button
                      className={'rm3-check' + (isDone ? ' done' : '') + (isAnim ? ' unlocking' : '')}
                      data-cursor="hover"
                      onClick={() => !isCourseLocked && onToggle(id)}
                      disabled={isCourseLocked}
                    >
                      {isDone ? '✓ Concluído' : 'Marcar concluído'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rm3-ruler" data-phase={phase.id}>
        <span className="rm3-ruler-top">100</span>
        <div className="rm3-ruler-track">
          <div className="rm3-ruler-fill" style={{ height: phasePct + '%' }} />
          {[75, 50, 25].map(n => (
            <div key={n} className="rm3-ruler-tick" style={{ bottom: n + '%' }} />
          ))}
        </div>
        <span className="rm3-ruler-bot">0</span>
      </div>
    </div>
  );
}

Object.assign(window, { RoadmapPage, COURSES, PHASES, TREE });
