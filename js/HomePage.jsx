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
  { id: 'b1', type: 'line',   range: [0.00, 0.15], text: 'Eu já tentei muita coisa.' },
  { id: 'b2', type: 'tags',   range: [0.13, 0.27], items: ['Educação Física', 'Exército', 'Engenharia Civil', 'Produção'] },
  { id: 'b3', type: 'muted',  range: [0.25, 0.39], text: 'No fundo, eu sabia que nada disso era pra mim.' },
  { id: 'b4', type: 'big',    range: [0.37, 0.51], text: '4 anos atrás,\ndecidi sair do Brasil.' },
  { id: 'b5', type: 'tags',   range: [0.49, 0.62], items: ['Sem inglês', 'Sem nunca ter saído do país', 'Cozinha', 'Cleaner', 'Segurança'] },
  { id: 'b6', type: 'line',   range: [0.60, 0.73], text: 'Precisei escolher: voltar pro Brasil ou entrar numa faculdade e ficar.' },
  { id: 'b7', type: 'line',   range: [0.71, 0.82], text: 'Entrei em Ciência da Computação. Sem nunca ter aberto um terminal na vida.' },
  { id: 'b8', type: 'quote',  range: [0.80, 0.93], text: 'Pela primeira vez na vida,\neu tava feliz estudando.' },
  { id: 'b9', type: 'close',  range: [0.91, 1.00], text: 'Criei a D30 pra você não perder tanto tempo quanto eu perdi.\nIsso aqui não é um curso. É uma comunidade de verdade.' },
];

function StorySection() {
  const sectionRef = React.useRef(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const scrolled = window.scrollY - el.offsetTop;
      setProgress(Math.max(0, Math.min(1, scrolled / scrollable)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function beatStyle(range) {
    const [s, e] = range;
    const FI = 0.05, FO = 0.05;
    let opacity = 0, ty = 20;
    if (progress >= s && progress < s + FI) {
      const t = (progress - s) / FI;
      opacity = t; ty = 20 * (1 - t);
    } else if (progress >= s + FI && progress < e - FO) {
      opacity = 1; ty = 0;
    } else if (progress >= e - FO && progress <= e) {
      const t = (progress - (e - FO)) / FO;
      opacity = 1 - t; ty = -10 * t;
    }
    return { opacity, transform: `translateY(${ty}px)` };
  }

  return (
    <div ref={sectionRef} className="story-scroll-section">
      {/* Desktop: scroll-driven */}
      <div className="story-scroll-sticky">
        <p className="story-scroll-label">minha história</p>
        <div className="story-scroll-stage">
          {STORY_BEATS.map(beat => (
            <div key={beat.id} className={`story-beat story-beat--${beat.type}`} style={beatStyle(beat.range)}>
              {beat.type === 'tags'
                ? <div className="story-beat-tags">{beat.items.map((item, i) => <span key={i}>{item}</span>)}</div>
                : beat.text.split('\n').map((line, i) => <p key={i}>{line}</p>)
              }
            </div>
          ))}
        </div>
        <div className="story-scroll-track">
          <div className="story-scroll-bar" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* Mobile: estático */}
      <div className="story-mobile">
        <p className="story-scroll-label">minha história</p>
        <p className="story-beat--line">Eu já tentei muita coisa.</p>
        <div className="story-beat-tags story-beat-tags--mobile">
          {['Educação Física', 'Exército', 'Engenharia Civil', 'Produção'].map((t, i) => <span key={i}>{t}</span>)}
        </div>
        <p className="story-beat--muted">No fundo, eu sabia que nada disso era pra mim.</p>
        <p className="story-beat--big">4 anos atrás, decidi sair do Brasil.</p>
        <div className="story-beat-tags story-beat-tags--mobile">
          {['Sem inglês', 'Sem nunca ter saído do país', 'Cozinha', 'Cleaner', 'Segurança'].map((t, i) => <span key={i}>{t}</span>)}
        </div>
        <p className="story-beat--line">Precisei escolher: voltar pro Brasil ou entrar numa faculdade e ficar.</p>
        <p className="story-beat--line">Entrei em Ciência da Computação. Sem nunca ter aberto um terminal na vida.</p>
        <blockquote className="story-beat--quote">Pela primeira vez na vida,<br/>eu tava feliz estudando.</blockquote>
        <p className="story-beat--close">Criei a D30 pra você não perder tanto tempo quanto eu perdi. Isso aqui não é um curso. É uma comunidade de verdade.</p>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    num: '01', title: 'Fórum ativo',
    backLabel: 'Discussões sobre',
    desc: 'Um fórum de verdade, não um grupo de WhatsApp cheio de figurinha. Um lugar onde você posta uma dúvida e alguém que já passou por aquilo te responde de verdade. Sem ego, sem julgamento.',
    topics: ['Dúvidas técnicas e de carreira', 'Vida de quem está em transição', 'Dicas de estudo e produtividade', 'Trampo: oportunidades e experiências', 'Desabafos e conquistas do dia a dia'],
    tagline: 'Essa é a essência da D30.',
  },
  {
    num: '02', title: 'Palestras',
    backLabel: 'Profissionais & especialistas',
    desc: 'Toda mês um convidado diferente. Não são aqueles papos genéricos de YouTube, são conversas reais com pessoas que chegaram lá e que estão dispostas a contar como foi de verdade.',
    topics: ['Devs que fizeram transição de carreira', 'Pessoas que foram contratadas sem faculdade', 'Especialistas em tecnologia, saúde e dinheiro', 'Vagas internacionais: como é trabalhar fora', 'Sessão de perguntas ao vivo com o público'],
    tagline: 'Vai ser demais.',
  },
  {
    num: '03', title: 'Road Map',
    backLabel: 'Roadmap de estudos',
    desc: 'Sem enrolação: um caminho claro do zero até o primeiro emprego. Com foco em Java no back-end, a linguagem que o mercado ainda contrata muito e que eu uso.',
    topics: ['Fundamentos: lógica, Git, terminal', 'HTML · CSS · JavaScript do zero', 'Java do zero: sintaxe, POO, coleções', 'Spring Boot: REST API, JPA, segurança', 'Banco de dados: SQL, PostgreSQL, MySQL', 'Portfólio e preparação para entrevistas'],
    tagline: 'O SEU caminho.',
  },
  {
    num: '04', title: 'Apoio real',
    backLabel: 'Para quem estuda com a vida cheia',
    desc: 'Tem filho, tem conta pra pagar, tem trabalho de dia. Aqui não tem guru falando que é só acordar às 5h da manhã. Tem gente real que entende o que é estudar com a vida cheia.',
    topics: ['Sem fórmula mágica ou coach motivacional', 'Rotinas reais: 1h por dia já é suficiente', 'Como manter consistência sem se destruir', 'Pessoas que já estavam no seu lugar', 'Erros, travamentos e voltas: normalizados', 'Consistência acima de velocidade'],
    tagline: 'Você não tá sozinho.',
  },
  {
    num: '05', title: 'Sala de estudos',
    backLabel: 'Discord · ao vivo',
    desc: 'Uma sala de voz sempre aberta no Discord. Liga o microfone ou fica só ouvindo, do jeito que funcionar pra você. Melhor do que estudar em silêncio em casa.',
    topics: ['Sala de estudos silenciosa (foco)', 'Canal de tira-dúvidas ao vivo', 'Screen share para revisar código junto', 'Grupos por nível: iniciante, intermediário', 'Pomodoro coletivo nas noites de semana', 'Voz · texto · vídeo: você escolhe'],
    tagline: 'Estuda junto. Avança junto.',
  },
  {
    num: '06', title: 'Vagas filtradas',
    backLabel: 'Vagas no LinkedIn',
    desc: 'Chega de perder horas garimpando vaga ruim. A gente filtra, organiza e posta só o que faz sentido pra quem está começando ou em transição, com detalhes, requisitos e link direto.',
    topics: ['Vagas júnior e estágio em tech', 'Transição de carreira aceita', 'Remoto, híbrido e presencial', 'Requisitos e faixa salarial quando disponível', 'Link direto para aplicação no LinkedIn', 'Atualizado toda semana'],
    tagline: 'A vaga certa. No lugar certo.',
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
