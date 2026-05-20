/* HomePage.jsx — fullpage scroll: hero → about → founder */

const FP_SECTIONS = [
  { id: 'fp-hero',    label: 'Início'   },
  { id: 'fp-about',  label: 'Sobre'    },
  { id: 'fp-founder',label: 'Fundador' },
];

function FpDots() {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const els = FP_SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = FP_SECTIONS.findIndex(s => s.id === e.target.id);
          if (idx >= 0) setActive(idx);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
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
                <button className="btn-ghost" data-cursor="hover" onClick={() => document.getElementById('fp-about').scrollIntoView({ behavior: 'smooth' })}>Saber mais</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Seção 2: Sobre + Features ── */}
      <section className="fp-section" id="fp-about">
        <AboutWithFeatures />
      </section>

      {/* ── Seção 3: Fundador + Footer ── */}
      <section className="fp-section" id="fp-founder">
        <AugustoSection />
        <Footer />
      </section>
    </div>
  );
}

const FEATURES = [
  { num: '—', title: 'Minha história', isStory: true },
  {
    num: '01', title: 'Fórum ativo',
    backLabel: 'Discussões sobre',
    desc: 'Um fórum de verdade — não um grupo de WhatsApp cheio de figurinha. Um lugar onde você posta uma dúvida e alguém que já passou por aquilo te responde de verdade. Sem ego, sem julgamento.',
    topics: ['Dúvidas técnicas e de carreira', 'Vida de quem está em transição', 'Dicas de estudo e produtividade', 'Trampo: oportunidades e experiências', 'Desabafos e conquistas do dia a dia'],
    tagline: 'Essa é a essência da D30.',
  },
  {
    num: '02', title: 'Palestras',
    backLabel: 'Profissionais & especialistas',
    desc: 'Toda mês um convidado diferente. Não são aqueles papos genéricos de YouTube — são conversas reais com pessoas que chegaram lá e que estão dispostas a contar como foi de verdade.',
    topics: ['Devs que fizeram transição de carreira', 'Pessoas que foram contratadas sem faculdade', 'Especialistas em tecnologia, saúde e dinheiro', 'Vagas internacionais: como é trabalhar fora', 'Sessão de perguntas ao vivo com o público'],
    tagline: 'Vai ser demais.',
  },
  {
    num: '03', title: 'Road Map',
    backLabel: 'Roadmap de estudos',
    desc: 'Sem enrolação: um caminho claro do zero até o primeiro emprego. Com foco em Java no back-end — a linguagem que o mercado ainda contrata muito e que eu uso.',
    topics: ['Fundamentos: lógica, Git, terminal', 'HTML · CSS · JavaScript do zero', 'Java do zero: sintaxe, POO, coleções', 'Spring Boot: REST API, JPA, segurança', 'Banco de dados: SQL, PostgreSQL, MySQL', 'Portfólio e preparação para entrevistas'],
    tagline: 'O SEU caminho.',
  },
  {
    num: '04', title: 'Apoio real',
    backLabel: 'Para quem estuda com a vida cheia',
    desc: 'Tem filho, tem conta pra pagar, tem trabalho de dia. Aqui não tem guru falando que é só acordar às 5h da manhã. Tem gente real que entende o que é estudar com a vida cheia.',
    topics: ['Sem fórmula mágica ou coach motivacional', 'Rotinas reais: 1h por dia já é suficiente', 'Como manter consistência sem se destruir', 'Pessoas que já estavam no seu lugar', 'Erros, travamentos e voltas — normalizados', 'Consistência acima de velocidade'],
    tagline: 'Você não tá sozinho.',
  },
  {
    num: '05', title: 'Sala de estudos',
    backLabel: 'Discord · ao vivo',
    desc: 'Uma sala de voz sempre aberta no Discord. Liga o microfone ou fica só ouvindo — do jeito que funcionar pra você. Melhor do que estudar em silêncio em casa.',
    topics: ['Sala de estudos silenciosa (foco)', 'Canal de tira-dúvidas ao vivo', 'Screen share para revisar código junto', 'Grupos por nível: iniciante, intermediário', 'Pomodoro coletivo nas noites de semana', 'Voz · texto · vídeo — você escolhe'],
    tagline: 'Estuda junto. Avança junto.',
  },
  {
    num: '06', title: 'Vagas filtradas',
    backLabel: 'Vagas no LinkedIn',
    desc: 'Chega de perder horas garimpando vaga ruim. A gente filtra, organiza e posta só o que faz sentido pra quem está começando ou em transição — com detalhes, requisitos e link direto.',
    topics: ['Vagas júnior e estágio em tech', 'Transição de carreira aceita', 'Remoto, híbrido e presencial', 'Requisitos e faixa salarial quando disponível', 'Link direto para aplicação no LinkedIn', 'Atualizado toda semana'],
    tagline: 'A vaga certa. No lugar certo.',
  },
];

function FeatureTab({ f, active, onClick }) {
  return (
    <div
      className={'feature-item' + (active ? ' active-tab' : '') + (f.isStory ? ' feature-item--story' : '')}
      data-cursor="hover"
      onClick={onClick}
    >
      {!f.isStory && <div className="feat-num">{f.num}</div>}
      <div className="feat-title">{f.title}</div>
    </div>
  );
}

function FeaturePanel({ card }) {
  if (card.isStory) {
    return (
      <div className="story-card-inner">
        <div className="story-section-top">
          <p className="story-eyebrow">minha história até aqui</p>
          <p className="story-intro">
            Tentei tudo — Educação Física, Exército, 3 anos de Civil, formei em Produção.
            No fundo eu sabia que <strong>nada disso era pra mim.</strong>
          </p>
        </div>

        <div className="story-section-mid">
          <p className="story-decision">4 anos atrás<br/>decidi sair do Brasil.</p>
          <div className="story-tags">
            <span>Sem inglês</span>
            <span>Sem nunca ter saído do país</span>
            <span>Cleaner</span>
            <span>Warehouse</span>
            <span>Cozinha</span>
          </div>
        </div>

        <blockquote className="story-quote">
          Pela primeira vez na vida,<br/>eu tava feliz estudando.
        </blockquote>

        <p className="story-close">
          É por isso que criei essa comunidade.{' '}
          <span>Pra você não passar pelo mesmo.</span>
        </p>
      </div>
    );
  }
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
  const touchYRef = React.useRef(null);

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
      if (window.innerWidth <= 768) return;
      touchYRef.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      if (window.innerWidth <= 768 || touchYRef.current === null || lockedRef.current) return;
      const dy = touchYRef.current - e.changedTouches[0].clientY;
      touchYRef.current = null;
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

  return (
    <section className="about-features">
      <div className="folders-layout">
        <div className="folders-nav">
          {FEATURES.map((f, i) => (
            <button
              key={f.num}
              className={'folders-nav-item' + (i === selected ? ' active' : '')}
              onClick={() => go(i)}
              data-cursor="hover"
            >
              <span className="folders-nav-num">{f.isStory ? '—' : f.num}</span>
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
                {!f.isStory && <span className="folder-card-num">{f.num}</span>}
                <span className="folder-card-title">{f.title}</span>
                {i === selected && selected < FEATURES.length - 1 && (
                  <span className="folder-card-hint">scroll ↓</span>
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
