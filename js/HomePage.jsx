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
    document.documentElement.classList.add('fp-active');
    return () => document.documentElement.classList.remove('fp-active');
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

function AboutWithFeatures() {
  return (
    <section className="about-features">
      <div className="about-features-grid">
        {FEATURES.map((f) => (
          <FeatureCard key={f.num} f={f} />
        ))}
      </div>
      <div className="about-features-text">
        <div className="founder-story-inline">
          <p className="founder-story-label">minha história até aqui</p>
          <div className="founder-story-body">
            <p className="founder-story-p founder-story-p--intro">
              Tentei tudo. Educação Física? Não.<br/>
              Exército? Não. Engenharia?<br/>
              3 anos de eng. Civil, formei em eng. de Produção.<br/>
              <span className="founder-muted">Mas no fundo eu sabia que isso <strong>nunca foi pra mim.</strong></span>
            </p>
            <p className="founder-story-p founder-story-p--decision">
              4 anos atrás decidi parar de me mudar do brasil.
            </p>
            <p className="founder-story-p">
              <span className="founder-tag">Sem inglês.</span>{' '}
              <span className="founder-tag">Sem nunca ter saído do país.</span>{' '}
              <span className="founder-tag">Cleaner.</span>{' '}
              <span className="founder-tag">Warehouse.</span>{' '}
              <span className="founder-tag">Cozinha.</span><br/>
              Aí entrei num curso de Ciência da Computação sem nunca ter visto uma IDE antes...<br/>
              mas durante o curso eu só pensava: por que eu não fiz esse curso antes?
            </p>
            <p className="founder-story-p founder-story-p--em">
              Pela primeira vez na vida,<br/>eu estava feliz estudando algo.
            </p>
            <p className="founder-story-p">
              Mesmo que não encontre um trabalho,<br/>
              mesmo que eu não me torne um dev de verdade,<br/>
              vou continuar estudando. Porque é isso que quero fazer.
            </p>
            <p className="founder-story-p founder-story-p--close">
              E é por isso que criei essa comunidade.<br/>
              <span className="founder-muted">Porque não quero que você passe pelo mesmo.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { num: '01', title: 'Fórum ativo',  desc: 'Tire dúvidas, compartilhe progresso e ajude quem tá atrás de você.' },
  { num: '02', title: 'Palestras',    desc: 'Convidados reais de diferentes áreas — recrutadores, devs, líderes.' },
  { num: '03', title: 'Road Map',     desc: 'Um guia de onde começar e pra onde ir na transição de carreira.' },
  { num: '04', title: 'Apoio real',   desc: 'Uma rede que entende estudar com carga cheia, sem tempo sobrando.' },
];

function FeaturesStrip() {
  return (
    <div className="features-strip">
      <p className="strip-label reveal visible">O que você encontra aqui</p>
      <div className="features-grid reveal visible">
        {FEATURES.map((f) => (
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
