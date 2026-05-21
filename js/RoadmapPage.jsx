/* RoadmapPage.jsx — colored phase cards, vertical stack, side ruler */

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
function RoadmapPage({ user }) {
  const userId = user?.id || null;

  const [done,      setDone]      = React.useState(() => DB.roadmap._loadLocal());
  const [unlocking, setUnlocking] = React.useState(new Set());
  const [loaded,    setLoaded]    = React.useState(false);

  // Merge localStorage + Supabase on mount
  React.useEffect(() => {
    DB.roadmap.getProgress(userId).then(progress => {
      setDone(progress);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [userId]);

  React.useEffect(() => {
    const id = window.__roadmapHighlight;
    if (!id) return;
    window.__roadmapHighlight = null;
    setTimeout(() => {
      const el = document.querySelector(`[data-highlight-id="${id}"]`);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('highlight-flash'); }
    }, 200);
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

  const totalDone = COURSES.filter(c => done.has(c.id)).length;
  const pct = Math.round(totalDone / COURSES.length * 100);

  return (
    <div className="page active fade-in">
      <div className="roadmap-wrap">
        <h1 className="page-title">Roadmap iniciante para <em>Dev Junior</em>.</h1>
        <p className="rm3-lead">Tudo que você precisa para iniciar sua carreira em programação.</p>
        <p className="rm3-lead rm3-lead--sub">Esse é exatamente o roadmap que estou fazendo.</p>

        <div className="rm3-overall">
          <div className="rm3-overall-bar">
            <div className="rm3-overall-fill" style={{ width: pct + '%' }} />
            {pct >= 3 && (
              <span className="rm3-overall-label" style={{ left: pct + '%' }}>{pct}%</span>
            )}
          </div>
          <div className="rm3-overall-meta">
            <span className="rm3-overall-pct">{pct}% concluído</span>
            <span className="rm3-overall-count">{totalDone}/{COURSES.length} cursos</span>
          </div>
        </div>

        <div className="rm3-stack">
          {PHASES.map((phase, i) => {
            const unlocked  = i === 0 || PHASES[i - 1].ids.every(id => done.has(id));
            const doneCount = phase.ids.filter(id => done.has(id)).length;
            const phasePct  = Math.round(doneCount / phase.ids.length * 100);
            const allDone   = doneCount === phase.ids.length;
            return (
              <PhaseCard
                key={phase.id}
                phase={phase}
                unlocked={unlocked}
                allDone={allDone}
                doneCount={doneCount}
                phasePct={phasePct}
                done={done}
                unlocking={unlocking}
                onToggle={toggle}
              />
            );
          })}
        </div>

        {totalDone === COURSES.length && (
          <p className="rm3-congrats">Roadmap concluído. Agora vai atrás da vaga.</p>
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

      {/* Side ruler */}
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

Object.assign(window, { RoadmapPage, COURSES, PHASES });
