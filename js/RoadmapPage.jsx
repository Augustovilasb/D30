/* RoadmapPage.jsx — personal roadmap with sequential unlock */

const COURSES = [
  {
    id: 'logica',
    phase: 'Fase 01', phaseLabel: 'Base',
    title: 'Lógica de Programação',
    subtitle: 'Virado no Jiraya · DevDojo',
    url: 'https://www.youtube.com/watch?v=ycyL5CqZoUo&list=PL62G310vn6nH-uBTKREcUWDkOi2Q9n4OZ',
    desc: 'Antes de qualquer linguagem, aprenda a pensar como programador. Algoritmos, estruturas de controle e resolução de problemas.',
  },
  {
    id: 'java',
    phase: 'Fase 02', phaseLabel: 'Linguagem',
    title: 'Maratona Java',
    subtitle: 'Virado no Jiraya · DevDojo',
    url: 'https://www.youtube.com/watch?v=F2Y867f1J8U&list=PL62G310vn6nFIsOCC0H-C2infYgwm8SWW',
    desc: 'Java do zero ao avançado. POO, coleções, generics, streams — a linguagem do mercado enterprise.',
  },
  {
    id: 'git',
    phase: 'Fase 03', phaseLabel: 'Ferramentas',
    title: 'Git e Github',
    subtitle: 'Curso Gratuito',
    url: 'https://www.youtube.com/watch?v=2c7yWlpWDJM&list=PLcoYAcR89n-qbO7YAVj5S0alABLis_QVU',
    desc: 'Versionamento de código. Indispensável pra qualquer dev — commits, branches, pull requests.',
  },
  {
    id: 'sql',
    phase: 'Fase 03', phaseLabel: 'Ferramentas',
    title: 'SQL com MySQL',
    subtitle: 'Curso Completo',
    url: 'https://www.youtube.com/watch?v=lHYV_H1526Q&list=PLbIBj8vQhvm2WT-pjGS5x7zUzmh4VgvRk',
    desc: 'Banco de dados relacional. Queries, joins, modelagem — o essencial de qualquer back-end.',
  },
  {
    id: 'api-tests',
    phase: 'Fase 04', phaseLabel: 'Testes',
    title: 'Testes de API Rest',
    subtitle: 'Curso Gratuito · Introdução',
    url: 'https://www.youtube.com/watch?v=VqVQ7vHY32o&list=PLf8x7B3nFTl17WeEVj405tHlstiq1kNBX',
    desc: 'Antes de sair construindo, aprenda a testar. Qualidade de API desde o começo do projeto.',
  },
  {
    id: 'spring1',
    phase: 'Fase 05', phaseLabel: 'Spring Boot',
    title: 'Spring Boot Direto Das Trincheiras',
    subtitle: 'DevDojo',
    url: 'https://www.youtube.com/watch?v=beRdNB8lNUI&list=PL62G310vn6nFTNJ4JbW8BuhAiK16MEc_x',
    desc: 'Introdução prática ao framework mais usado no mercado Java. Sem enrolação.',
  },
  {
    id: 'spring2',
    phase: 'Fase 05', phaseLabel: 'Spring Boot',
    title: 'Spring Boot Essentials 00',
    subtitle: 'DevDojo',
    url: 'https://www.youtube.com/watch?v=R-F-UcDo_5I&list=PL62G310vn6nF3gssjqfCKLpTK2sZJ_a_1',
    desc: 'Fundamentos sólidos: APIs RESTful, JPA, validação e boas práticas de projeto.',
  },
  {
    id: 'spring3',
    phase: 'Fase 05', phaseLabel: 'Spring Boot',
    title: 'Spring Boot Essentials 2',
    subtitle: 'DevDojo',
    url: 'https://www.youtube.com/watch?v=bCzsSXE4Jzg&list=PL62G310vn6nFBIxp6ZwGnm8xMcGE3VA5H',
    desc: 'Continuação — Spring Security, testes de integração, deploy e conceitos avançados.',
  },
  {
    id: 'resteasy',
    phase: 'Fase 05', phaseLabel: 'Spring Boot',
    title: 'REST com RESTEasy',
    subtitle: 'Configuração completa',
    url: 'https://www.youtube.com/watch?v=QxohK_Er0EM&list=PL62G310vn6nEZU20j1J38xEUwuQLuEUFS',
    desc: 'APIs RESTful com JAX-RS. Alternativa ao Spring MVC com foco em performance e padrões.',
  },
  {
    id: 'docker',
    phase: 'Fase 06', phaseLabel: 'DevOps & Cloud',
    title: 'Docker',
    subtitle: 'Curso Completo',
    url: 'https://www.youtube.com/watch?v=OERbOJZwGAU&list=PLViOsriojeLrdw5VByn96gphHFxqH3O_N',
    desc: 'Containerização de aplicações. Essencial pra fazer deploy consistente em qualquer ambiente.',
  },
  {
    id: 'cloud',
    phase: 'Fase 06', phaseLabel: 'DevOps & Cloud',
    title: 'Introdução à Cloud',
    subtitle: 'Conceitos e prática',
    url: 'https://www.youtube.com/watch?v=x4PdyxH7KIw&list=PL62G310vn6nGyKUJVqa_VvATxkm1E-d5k',
    desc: 'Entenda a infraestrutura moderna. Fundamentos de cloud computing e arquitetura distribuída.',
  },
  {
    id: 'aws',
    phase: 'Fase 06', phaseLabel: 'DevOps & Cloud',
    title: 'AWS White Belt',
    subtitle: 'Amazon Web Services',
    url: 'https://www.youtube.com/watch?v=tZWNcpiXvFM&list=PL62G310vn6nHwfC31Q2hqh-3nO-6Rceyd',
    desc: 'A nuvem mais usada no mercado. EC2, S3, RDS, Lambda — os serviços que todo dev precisa conhecer.',
  },
];

const RM_KEY = 'd30_roadmap_v2';

function rmLoad() {
  try { const r = localStorage.getItem(RM_KEY); return r ? new Set(JSON.parse(r)) : new Set(); }
  catch { return new Set(); }
}
function rmSave(set) {
  try { localStorage.setItem(RM_KEY, JSON.stringify([...set])); } catch {}
}

function RoadmapPage() {
  const [done, setDone] = React.useState(() => rmLoad());

  const toggle = React.useCallback((id) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      rmSave(next);
      return next;
    });
  }, []);

  const doneCount = COURSES.filter(c => done.has(c.id)).length;
  const pct = Math.round(doneCount / COURSES.length * 100);

  return (
    <div className="page active fade-in">
      <div className="roadmap-wrap">
        <p className="page-label">Road Map</p>
        <h1 className="page-title">Seu caminho,<br/>passo a passo.</h1>

        <div className="rm2-progress-bar">
          <div className="rm2-progress-fill" style={{ width: pct + '%' }} />
        </div>
        <p className="rm2-progress-label">{doneCount} de {COURSES.length} cursos concluídos · {pct}%</p>

        <div className="rm2-timeline">
          {COURSES.map((course, i) => {
            const isDone    = done.has(course.id);
            const isLocked  = i > 0 && !done.has(COURSES[i - 1].id);
            const isNewPhase = i === 0 || COURSES[i - 1].phase !== course.phase;
            return (
              <React.Fragment key={course.id}>
                {isNewPhase && (
                  <div className="rm2-phase-header">
                    <span className="rm2-phase-num">{course.phase}</span>
                    <span className="rm2-phase-lbl">{course.phaseLabel}</span>
                  </div>
                )}
                <CourseCard
                  course={course}
                  index={i}
                  isDone={isDone}
                  isLocked={isLocked}
                  isLast={i === COURSES.length - 1}
                  onToggle={() => toggle(course.id)}
                />
              </React.Fragment>
            );
          })}

          {doneCount === COURSES.length && (
            <div className="rm2-congrats">
              <div className="rm2-congrats-icon">🎯</div>
              <p>Roadmap concluído. Agora vai atrás da vaga.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function CourseCard({ course, index, isDone, isLocked, isLast, onToggle }) {
  const state = isDone ? 'done' : isLocked ? 'locked' : 'active';
  return (
    <div className="rm2-entry">
      <div className="rm2-stem">
        <div className={'rm2-node ' + state}>
          {isDone
            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : isLocked
            ? <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            : <span>{index + 1}</span>
          }
        </div>
        {!isLast && <div className={'rm2-connector' + (isDone ? ' done' : '')} />}
      </div>

      <div className={'rm2-card ' + state}>
        <div className="rm2-card-top">
          <div className="rm2-card-title">{course.title}</div>
          <div className="rm2-card-sub">{course.subtitle}</div>
        </div>
        {!isLocked
          ? <p className="rm2-card-desc">{course.desc}</p>
          : <p className="rm2-locked-hint">Conclua o curso anterior para desbloquear.</p>
        }
        {!isLocked && (
          <div className="rm2-actions">
            <a
              className="rm2-link-btn"
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
            >
              Assistir ↗
            </a>
            <button
              className={'rm2-check-btn' + (isDone ? ' done' : '')}
              data-cursor="hover"
              onClick={onToggle}
            >
              {isDone ? '✓ Concluído' : 'Marcar como concluído'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { RoadmapPage, COURSES });
