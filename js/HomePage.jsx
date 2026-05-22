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
    backLabel: 'Dúvidas, conquistas e conversas reais',
    desc: 'Um fórum de verdade, não um grupo de WhatsApp. Você posta uma dúvida e alguém que já passou por aquilo responde de verdade. Sem ego, sem julgamento.',
    topics: ['Dúvidas técnicas e de carreira', 'Dicas de estudo e produtividade', 'Vida de quem está em transição', 'Oportunidades e trampos', 'Conquistas do dia a dia'],
    tagline: 'Essa é a essência da D30.',
  },
  {
    num: '02', title: 'Roadmap',
    backLabel: 'Do zero ao sênior, passo a passo',
    desc: 'Uma skill tree interativa com 4 fases de aprendizado. Cada etapa tem cursos em vídeo, exercícios práticos e documentação. Você avança no seu ritmo e acompanha o progresso.',
    topics: ['Fundamentos: lógica, Git, terminal', 'HTML · CSS · JavaScript do zero', 'Java · Spring Boot · APIs REST', 'Banco de dados: SQL e PostgreSQL', 'Portfólio e preparação para entrevistas', 'Trofeus por fase completa'],
    tagline: 'O SEU caminho.',
  },
  {
    num: '03', title: 'Talks',
    backLabel: 'Conversa direta com quem chegou lá',
    desc: 'Todo mês um convidado diferente. Não são papos genéricos de YouTube: são conversas reais com pessoas que fizeram transição, foram contratadas sem faculdade ou trabalham fora.',
    topics: ['Devs que saíram do zero e foram contratados', 'Pessoas que trabalham remotamente no exterior', 'Especialistas em tecnologia, carreira e dinheiro', 'Sessão de perguntas ao vivo com o público', 'Replays disponíveis para membros'],
    tagline: 'Dev falando com dev em formação.',
  },
  {
    num: '04', title: 'Progresso',
    backLabel: 'Study Tracker com timer e análises',
    desc: 'Um tracker de estudos completo dentro da plataforma. Registra suas sessões, gera heatmap de atividade, calcula KPIs e te dá análises semanais e mensais do seu ritmo.',
    topics: ['Timer com formulário pré e pós-sessão', 'Dashboard com horas, sessões e consistência', 'Heatmap de atividade anual', 'Análises com IA: diária, semanal e mensal', 'Badges desbloqueáveis por conquistas', 'Ranking com o resto da comunidade'],
    tagline: 'O que se mede, melhora.',
  },
  {
    num: '05', title: 'Livros',
    backLabel: 'Gratuitos e recomendados pela D30',
    desc: 'Catálogo com centenas de livros técnicos gratuitos organizados por categoria, mais uma seleção curada com os livros que realmente fazem diferença na carreira.',
    topics: ['Livros gratuitos por área de conhecimento', 'Seleção curada: os mais recomendados', 'Capas dinâmicas via Google Books', 'Marque como lido e acumule no ranking', '7 categorias: web, algoritmos, carreira e mais'],
    tagline: 'Conhecimento sem custo.',
  },
  {
    num: '06', title: 'Vagas',
    backLabel: 'Nacionais e internacionais curadas',
    desc: 'Vagas para quem está começando ou em transição — sem enrolação. Nacionais curadas pela D30 e remotas internacionais do mundo todo, com filtros de nível e salário.',
    topics: ['Vagas júnior e estágio em tech', 'Remotas internacionais com salário em dólar', 'Filtro por nível, salário e localização', 'Faixa salarial quando disponível', 'Link direto para aplicação'],
    tagline: 'A vaga certa. No lugar certo.',
  },
  {
    num: '07', title: 'Ranking',
    backLabel: 'Top da comunidade D30',
    desc: 'Um leaderboard com os membros mais ativos da comunidade. Seis critérios diferentes: horas estudadas, livros lidos, talks assistidas, tópicos no fórum, sessões e cursos completos.',
    topics: ['Top 100 membros da comunidade', 'Horas estudadas e sessões registradas', 'Livros lidos e talks assistidas', 'Tópicos criados no fórum', 'Cursos e fases do roadmap completos', 'Sua posição sempre visível'],
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
