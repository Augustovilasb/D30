/* HomePage.jsx — fullpage scroll: hero → about → founder */

const FP_SECTIONS = [
  { id: 'fp-hero',    label: 'Início'         },
  { id: 'fp-story',   label: 'Minha história' },
  { id: 'fp-about',   label: 'Sobre'          },
  { id: 'fp-founder', label: 'Fundador'       },
];

function FpDots() {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let activeIdx = 0;
      FP_SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= mid) activeIdx = i;
      });
      setActive(activeIdx);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fp-dots">
      {FP_SECTIONS.map((s, i) => (
        <button
          key={s.id}
          className={'fp-dot' + (i === active ? ' active' : '')}
          onClick={() => goTo(s.id)}
          title={s.label}
          data-cursor="hover"
        />
      ))}
    </div>
  );
}

function HomePage({ onNavigate, onSignIn }) {
  React.useEffect(() => {
    const check = () => {
      if (window.innerWidth > 768) {
        document.documentElement.classList.add('fp-active');
      } else {
        document.documentElement.classList.remove('fp-active');
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => {
      document.documentElement.classList.remove('fp-active');
      window.removeEventListener('resize', check);
    };
  }, []);

  return (
    <div className="page active fade-in">
      <FpDots />

      {/* ── Seção 1: Hero ── */}
      <section className="fp-section" id="fp-hero">
        <div className="home-hero">
          <div className="hero-inner">
            <p className="hero-eyebrow">Bem-vindo ao Dev aos 30</p>

            <h1 className="hero-manifest-lead">
              Uma comunidade<br/>
              para <em>qualquer</em> pessoa<br/>
              buscando a <em>evolução.</em>
            </h1>

            <div className="hero-sub-row">
              <p className="hero-manifest-sub">
                Ninguém começa bom em algo...<br/>
                E ninguém continua ruim<br/>
                depois de <strong>1000 tentativas.</strong>
              </p>
              <div className="hero-stats">
                <div className="stat"><div className="stat-label">Sua idade não importa</div></div>
                <div className="stat"><div className="stat-label">Não existe pré-requisito</div></div>
                <div className="stat"><div className="stat-label">Sua melhor versão</div></div>
                <div className="stat"><div className="stat-label">Queremos você aqui</div></div>
              </div>
              <div className="hero-actions">
                <button className="btn-primary" data-cursor="hover" onClick={() => onSignIn('signup')}>Quero fazer parte →</button>
                <button className="btn-ghost" data-cursor="hover" onClick={() => document.getElementById('fp-story').scrollIntoView({ behavior: 'smooth' })}>Saber mais</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Seção 2: Minha história ── */}
      <section className="fp-section" id="fp-story">
        <StorySection />
      </section>

      {/* ── Seção 3: Sobre + Features ── */}
      <section className="fp-section" id="fp-about">
        <AboutWithFeatures />
      </section>

      {/* ── Seção 4: Fundador + Footer ── */}
      <section className="fp-section" id="fp-founder">
        <AugustoSection />
        <Footer />
      </section>
    </div>
  );
}

const STORY_BEATS = [
  { id: 'b1', type: 'line',  text: 'Eu já tentei muita coisa.' },
  { id: 'b2', type: 'tags',  items: ['Educação Física', 'Exército', 'Engenharia Civil', 'Produção'] },
  { id: 'b3', type: 'muted', text: 'No fundo, eu sabia que nada disso era pra mim.' },
  { id: 'b4', type: 'big',   text: '4 anos atrás,\ndecidi sair do Brasil.' },
  { id: 'b5', type: 'tags',  items: ['Sem inglês', 'Sem nunca ter saído do país', 'Cozinha', 'Cleaner', 'Segurança'] },
  { id: 'b6', type: 'line',  text: 'Precisei escolher: voltar pro Brasil ou entrar numa faculdade e ficar.' },
  { id: 'b7', type: 'line',  text: 'Entrei em Ciência da Computação. Sem nunca ter aberto um terminal na vida.' },
  { id: 'b8', type: 'quote', text: 'Pela primeira vez na vida,\neu tava feliz estudando.' },
  { id: 'b9', type: 'close', text: 'Criei a D30 pra você não perder tanto tempo quanto eu perdi.\nIsso aqui não é um curso. É uma comunidade de verdade.' },
  { id: 'b10', type: 'next', text: 'O que você vai encontrar aqui' },
];

function StorySection() {
  const [selected, setSelected] = React.useState(0);
  const lockedRef    = React.useRef(false);
  const touchStartRef = React.useRef(null);
  const stageRef     = React.useRef(null);

  const go = React.useCallback((next) => {
    if (lockedRef.current || next < 0 || next >= STORY_BEATS.length) return;
    lockedRef.current = true;
    setSelected(next);
    setTimeout(() => { lockedRef.current = false; }, 600);
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (window.innerWidth <= 768) return;
      if (lockedRef.current) { e.stopPropagation(); e.preventDefault(); return; }
      const down = e.deltaY > 0;
      if (down && selected < STORY_BEATS.length - 1) {
        e.stopPropagation(); e.preventDefault(); go(selected + 1);
      } else if (!down && selected > 0) {
        e.stopPropagation(); e.preventDefault(); go(selected - 1);
      }
    };

    const onTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      if (touchStartRef.current === null || lockedRef.current) return;
      const dy = touchStartRef.current - e.changedTouches[0].clientY;
      touchStartRef.current = null;
      if (Math.abs(dy) < 40) return;
      dy > 0 ? go(selected + 1) : go(selected - 1);
    };

    el.addEventListener('wheel',      onWheel,      { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener('wheel',      onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, [selected, go]);

  const goToAbout = () => {
    const el = document.getElementById('fp-about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={stageRef} className="story-scroll-section">

      {/* Label colada ao stage */}
      <div className="story-header-row">
        <span className="story-scroll-label">minha história</span>
        {selected < STORY_BEATS.length - 1 && (
          <button className="story-skip-btn" onClick={goToAbout} data-cursor="hover">
            pular ↓
          </button>
        )}
      </div>

      <div className="story-scroll-stage">
        {STORY_BEATS.map((beat, i) => (
          <div
            key={beat.id}
            className={'story-beat story-beat--' + beat.type + (i === selected ? ' story-beat--active' : '') + (i < selected ? ' story-beat--past' : '')}
          >
            {beat.type === 'tags'
              ? <div className="story-beat-tags">{beat.items.map((item, j) => <span key={j}>{item}</span>)}</div>
              : beat.type === 'next'
              ? <button className="story-next-btn" onClick={goToAbout} data-cursor="hover">
                  <span>{beat.text}</span>
                  <span className="story-next-arrow">↓</span>
                </button>
              : beat.text.split('\n').map((line, j) => <p key={j}>{line}</p>)
            }
          </div>
        ))}
      </div>

      <div className="story-scroll-track">
        <div className="story-scroll-bar" style={{ width: `${(selected / (STORY_BEATS.length - 1)) * 100}%` }} />
      </div>

      <div className="story-nav-mobile">
        <button onClick={() => go(selected - 1)} disabled={selected === 0}>←</button>
        <span>{selected + 1} / {STORY_BEATS.length}</span>
        <button onClick={() => go(selected + 1)} disabled={selected === STORY_BEATS.length - 1}>→</button>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    num: '01', title: 'Fórum',
    backLabel: 'Por que existe',
    desc: 'A maioria das pessoas estuda sozinha e trava na mesma dúvida por horas e às vezes desiste por isso. O Fórum existe pra acabar com isso. Você posta a dúvida, alguém que já travou no mesmo ponto responde com contexto real. Sem ego, sem julgamento, sem resposta genérica de StackOverflow.',
    topics: [
      'Crie tópicos em categorias: Dúvidas, Dicas, Conquistas, Carreira e Tecnologias',
      'Responda outros membros e vote nas melhores respostas',
      'Compartilhe conquistas pequenas que ninguém de fora entenderia',
      'Discuta oportunidades, trampos e experiências de trabalho',
      'Pesquise dúvidas antigas — alguém provavelmente já perguntou',
    ],
    tagline: 'Essa é a essência da D30.',
  },
  {
    num: '02', title: 'Roadmap',
    backLabel: 'Por que existe',
    desc: 'A maior paralisia de quem começa é não saber o que estudar, em qual ordem, e se está no caminho certo. O Roadmap resolve isso. É uma skill tree interativa que vai dos fundamentos até dev pleno, com o conteúdo certo em cada etapa. Sem você precisar decidir nada.',
    topics: [
      'Visualize as 4 fases: Fundamentos, Dev Júnior, Dev Pleno e Dev Sênior',
      'Clique em qualquer etapa e veja os cursos, exercícios e documentação daquele ponto',
      'Marque etapas como concluídas e acompanhe seu avanço',
      'Desbloqueie trofeus ao completar cada fase',
      'Conteúdo focado em Java, Spring Boot, SQL e o que o mercado realmente contrata',
      'Indicação clara de onde você está e o que vem a seguir',
    ],
    tagline: 'Chega de se perguntar o que estudar amanhã.',
  },
  {
    num: '03', title: 'Talks',
    backLabel: 'Por que existe',
    desc: 'Curso ensina técnica. Talk ensina realidade. Todo mês um convidado diferente: devs que foram contratados sem faculdade, pessoas que trabalham remotamente no exterior, especialistas em carreira e dinheiro. É uma conversa direta, sem roteiro, com quem viveu o que você quer viver.',
    topics: [
      'Assista talks ao vivo com sessão de perguntas abertas ao público',
      'Acesse replays de todas as talks anteriores quando quiser',
      'Sugira palestrantes que você quer ouvir',
      'Confirme presença e receba lembrete antes da talk',
      'Temas reais: transição de carreira, trabalho no exterior, salário, rotina de estudo',
    ],
    tagline: 'Dev falando com dev em formação.',
  },
  {
    num: '04', title: 'Progresso',
    backLabel: 'Por que existe',
    desc: 'A maioria das pessoas acha que estuda mais do que estuda. E quando fica dias sem estudar, nem percebe. O Progresso é um study tracker dentro da plataforma que torna seu ritmo visível. O que se enxerga, se controla.',
    topics: [
      'Inicie uma sessão de estudo com timer e diga o que vai estudar',
      'Ao terminar, registre o que aprendeu e como foi a sessão',
      'Veja seu heatmap de atividade do ano inteiro, igual ao do GitHub',
      'Acompanhe KPIs: total de horas, média por semana, sequência atual',
      'Análises de IA opcionais com sua própria API key da Anthropic',
      'Desbloqueie badges por conquistas e suba no ranking da comunidade',
    ],
    tagline: 'O que se mede, melhora.',
  },
  {
    num: '05', title: 'Livros',
    backLabel: 'Por que existe',
    desc: 'Os melhores livros técnicos custam caro e estão espalhados pela internet. A D30 reuniu centenas de títulos gratuitos num catálogo organizado, mais uma seleção curada com os livros que realmente valem o tempo. Escolhidos por quem já leu e aplicou.',
    topics: [
      'Acesse centenas de livros técnicos gratuitos organizados por categoria',
      '7 categorias: Web, Algoritmos, Banco de Dados, Carreira, Arquitetura e mais',
      'Veja a seleção curada da D30 com os livros mais recomendados',
      'Marque livros como lidos — cada um conta pontos no Ranking',
      'Capas e informações atualizadas automaticamente via Google Books',
    ],
    tagline: 'Conhecimento sem custo.',
  },
  {
    num: '06', title: 'Vagas',
    backLabel: 'Por que existe',
    desc: 'Garimpar vaga é exaustivo. Você passa horas filtrando lixo no LinkedIn e ainda cai em vaga que pede 5 anos de experiência pra estágio. A D30 faz esse filtro por você: vagas nacionais curadas a mão e remotas internacionais do mundo todo, só o que faz sentido pra quem está começando ou em transição.',
    topics: [
      'Navegue entre vagas nacionais curadas e remotas internacionais',
      'Filtre por nível de experiência, faixa salarial e localização',
      'Veja salário em dólar nas vagas internacionais quando disponível',
      'Acesse o link direto para aplicação sem redirecionamentos',
      'Lista atualizada regularmente com vagas que aceitam transição de carreira',
    ],
    tagline: 'A vaga certa. No lugar certo.',
  },
  {
    num: '07', title: 'Ranking',
    backLabel: 'Por que existe',
    desc: 'Estudar sozinho é difícil. Estudar sabendo que outras pessoas estão avançando junto, e que seu esforço é visível, é completamente diferente. O Ranking não é sobre competição: é sobre accountability coletiva. Ver alguém na sua frente motiva mais do que qualquer guru de produtividade.',
    topics: [
      'Veja o top 100 membros mais ativos da comunidade',
      'Seis critérios: horas estudadas, livros lidos, talks assistidas, tópicos no fórum, sessões e cursos completos',
      'Sua posição no ranking sempre visível, independente de estar no top 100',
      'Cada ação dentro da D30 conta: fórum, livros, tracker, roadmap',
      'Sem trapaça: os pontos vêm do uso real da plataforma',
    ],
    tagline: 'Consistência vira resultado.',
  },
];

function FeatureTab({ f, active, onClick }) {
  return (
    <div
      className={'feature-item' + (active ? ' active-tab' : '')}
      data-cursor="hover"
      onClick={onClick}
    >
      <div className="feat-num">{f.num}</div>
      <div className="feat-title">{f.title}</div>
    </div>
  );
}

function FeaturePanel({ card }) {
  return (
    <div className="feature-panel-content">
      <div className="feat-top">
        {card.backLabel && <p className="feat-back-label">{card.backLabel}</p>}
        {card.desc && <p className="feat-desc-body">{card.desc}</p>}
        <ul className="feat-topics">
          {card.topics.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
      {card.tagline && <p className="feat-tagline">{card.tagline}</p>}
    </div>
  );
}

function AboutWithFeatures() {
  const [selected, setSelected] = React.useState(0);
  const stackRef = React.useRef(null);
  const lockedRef = React.useRef(false);
  const touchStartRef = React.useRef(null);

  const go = React.useCallback((next) => {
    if (lockedRef.current || next < 0 || next >= FEATURES.length) return;
    lockedRef.current = true;
    setSelected(next);
    setTimeout(() => { lockedRef.current = false; }, 400);
  }, []);

  React.useEffect(() => {
    const el = stackRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (window.innerWidth <= 768) return;
      if (lockedRef.current) { e.stopPropagation(); e.preventDefault(); return; }
      const down = e.deltaY > 0;
      if (down && selected < FEATURES.length - 1) {
        e.stopPropagation(); e.preventDefault(); go(selected + 1);
      } else if (!down && selected > 0) {
        e.stopPropagation(); e.preventDefault(); go(selected - 1);
      }
    };

    const onTouchStart = (e) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = (e) => {
      if (touchStartRef.current === null || lockedRef.current) return;
      const dx = touchStartRef.current.x - e.changedTouches[0].clientX;
      const dy = touchStartRef.current.y - e.changedTouches[0].clientY;
      touchStartRef.current = null;
      // só responde ao swipe horizontal — deixa scroll vertical livre
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      dx > 0 ? go(selected + 1) : go(selected - 1);
    };

    el.addEventListener('wheel',      onWheel,      { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener('wheel',      onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, [selected, go]);

  return (
    <section className="about-features">
      <p className="folders-heading">O que você vai encontrar aqui</p>
      <div className="folders-layout">
        <div className="folders-nav">
          {FEATURES.map((f, i) => (
            <button
              key={f.num}
              className={'folders-nav-item' + (i === selected ? ' active' : '')}
              onClick={() => go(i)}
              data-cursor="hover"
            >
              <span className="folders-nav-num">{f.num}</span>
              <span className="folders-nav-title">{f.title}</span>
            </button>
          ))}
        </div>
        <div className="folders-stack" ref={stackRef}>
        {FEATURES.map((f, i) => {
          const depth = i - selected;
          let style;
          if (i < selected) {
            // já passou — sai pelo topo
            style = { transform: 'translateY(-112%) rotate(-1deg)', opacity: 0, zIndex: 1 };
          } else if (i === selected) {
            // ativa — frente
            style = { transform: 'translateY(0) scale(1)', opacity: 1, zIndex: FEATURES.length + 1 };
          } else {
            // empilhada atrás — cada uma um pouco mais baixa e menor
            const offset = Math.min(depth * 18, 54);
            const scale  = Math.max(1 - depth * 0.04, 0.88);
            style = { transform: `translateY(${offset}px) scale(${scale})`, opacity: 1, zIndex: FEATURES.length - depth };
          }

          return (
            <div key={f.num} className={'folder-card' + (i === selected ? ' folder-card--active' : '')} style={style} onClick={i > selected ? () => go(i) : undefined}>
              <div className="folder-card-header">
                <span className="folder-card-num">{f.num}</span>
                <span className="folder-card-title">{f.title}</span>
                {i === selected && selected < FEATURES.length - 1 && (
                  <span className="folder-card-hint">deslize →</span>
                )}
              </div>
              {i === selected && (
                <div className="folder-card-body">
                  <FeaturePanel key={selected} card={f} />
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ f }) {
  const [flipped, setFlipped] = React.useState(false);
  return (
    <div className={'feature-item' + (flipped ? ' flipped' : '')} data-cursor="hover" onClick={() => setFlipped(v => !v)}>
      <div className="feature-item-inner">
        <div className="feat-face feat-face--front">
          <div className="feat-num">{f.num}</div>
          <div className="feat-title">{f.title}</div>
          <div className="feat-hint">clique para ver →</div>
        </div>
        <div className="feat-face feat-face--back">
          <div className="feat-num">{f.num}</div>
          <div className="feat-desc">{f.desc}</div>
        </div>
      </div>
    </div>
  );
}

function FeaturesStrip() {
  return (
    <div className="features-strip">
      <p className="strip-label reveal visible">O que você encontra aqui</p>
      <div className="features-grid reveal visible">
        {FEATURES.filter(f => !f.isStory).map((f) => (
          <FeatureCard key={f.num} f={f} />
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return <footer>Feito por <span>@Dev.aos30</span> · D30 é de todo mundo</footer>;
}

Object.assign(window, { HomePage, FeaturesStrip, AboutWithFeatures, Footer });
