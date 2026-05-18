/* RoadmapPage.jsx — vertical 4-phase timeline */

const ROADMAP = [
  {
    state: 'done',
    label: 'Fase 01 · Fundação',
    title: 'Decidir e começar',
    items: [
      { state: 'done', label: 'Escolher sua primeira linguagem' },
      { state: 'done', label: 'Entender lógica de programação' },
      { state: 'done', label: 'Criar rotina de estudos consistente' },
    ],
  },
  {
    state: 'active',
    label: 'Fase 02 · Construção · você está aqui',
    title: 'Aprender de verdade',
    items: [
      { state: 'active', label: 'Orientação a Objetos na prática', mark: '▶' },
      { state: 'todo',   label: 'Projetos reais no GitHub' },
      { state: 'todo',   label: 'Versionamento com Git' },
      { state: 'todo',   label: 'Primeiros frameworks' },
    ],
  },
  {
    state: 'upcoming',
    label: 'Fase 03 · Mercado',
    title: 'Entrar na área',
    items: [
      { state: 'upcoming', label: 'Montar portfólio que impressiona' },
      { state: 'upcoming', label: 'LinkedIn e presença online' },
      { state: 'upcoming', label: 'Processo seletivo e entrevistas técnicas' },
      { state: 'upcoming', label: 'Primeira oportunidade na área' },
    ],
  },
  {
    state: 'upcoming',
    label: 'Fase 04 · Crescimento',
    title: 'Evoluir como dev',
    items: [
      { state: 'upcoming', label: 'Especialização (back, front, dados...)' },
      { state: 'upcoming', label: 'Soft skills e trabalho em equipe' },
      { state: 'upcoming', label: 'Contribuir com a comunidade D30' },
    ],
  },
];

function RoadmapPage() {
  return (
    <div className="page active fade-in">
      <div className="roadmap-wrap">
        <p className="page-label">Road Map</p>
        <h1 className="page-title">De onde você tá<br/>até onde quer chegar.</h1>
        <p style={{ fontSize: 16, color: 'var(--muted)', marginTop: '1rem', lineHeight: 1.7 }}>
          Um caminho honesto. Não tem receita perfeita — mas tem um norte que funciona pra quem tá na transição real.
        </p>
        <div className="rm-timeline">
          {ROADMAP.map((phase, i) => <Phase key={i} phase={phase} index={i} />)}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Phase({ phase, index }) {
  const dotClass = phase.state === 'done' ? 'done' : phase.state === 'active' ? 'active-dot' : 'upcoming';
  const dotContent = phase.state === 'done' ? '✓' : phase.state === 'active' ? '▶' : String(index + 1);
  const phaseClass = 'rm-phase' + (phase.state === 'done' ? ' done-phase' : phase.state === 'active' ? ' active-phase' : '');
  return (
    <div className={phaseClass}>
      <div className={'rm-dot ' + dotClass}>{dotContent}</div>
      <div className="rm-phase-label">{phase.label}</div>
      <div className="rm-phase-title">{phase.title}</div>
      <div className="rm-items">
        {phase.items.map((it, i) => <RoadmapItem key={i} item={it} />)}
      </div>
    </div>
  );
}

function RoadmapItem({ item }) {
  const cls = item.state === 'done' ? 'done-item' : item.state === 'active' ? 'active-item' : '';
  const mark = item.mark || (item.state === 'done' ? '✓' : '◯');
  const color = item.state === 'upcoming' ? { color: 'var(--muted-2, #555)' } : {};
  return (
    <div className={'rm-item ' + cls} data-cursor="hover">
      <span className="check" style={color}>{mark}</span> {item.label}
    </div>
  );
}

Object.assign(window, { RoadmapPage, ROADMAP });
