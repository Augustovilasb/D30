/* HomePage.jsx — hero + features strip */

function HomePage({ onNavigate, onSignIn }) {
  return (
    <div className="page active fade-in">
      <div className="home-hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>

        <div className="hero-row">
          <div className="hero-manifest">
            <p className="hero-manifest-lead">
              Uma <span className="hl">comunidade</span><br/>
              pra quem está em<br/>
              <span className="hl">transição</span> pra dev.
            </p>
            <p className="hero-manifest-sub">
              <span className="mt">Sem atalhos.</span><br/>
              <span className="mt">Sem promessas vazias.</span><br/>
              Só <span className="hl">pessoas reais</span> na luta.
            </p>
          </div>

          {/* The dice — front face shows the D30 wordmark; mouse over to reveal values. */}
          <Dice />
        </div>

        <div className="hero-actions">
          <button className="btn-primary" data-cursor="hover" onClick={() => onSignIn('signup')}>Quero fazer parte →</button>
          <button className="btn-ghost" data-cursor="hover" onClick={() => {
            const el = document.getElementById('sobre');
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
          }}>Saber mais</button>
        </div>
        <div className="hero-stats">
          <div className="stat"><div className="stat-num">∞</div><div className="stat-label">Idades bem-vindas</div></div>
          <div className="stat"><div className="stat-num">0</div><div className="stat-label">Pré-requisitos</div></div>
        </div>
      </div>

      {/* About copy on the right, 2×2 features grid on the left. */}
      <AboutWithFeatures />
      <AugustoSection />
      <Footer />
    </div>
  );
}

function AboutWithFeatures() {
  return (
    <section className="about-features">
      <div className="about-features-grid">
        {FEATURES.map((f) => (
          <div key={f.num} className="feature-item" data-cursor="hover">
            <div className="feat-num">{f.num}</div>
            <div className="feat-title">{f.title}</div>
            <div className="feat-desc">{f.desc}</div>
          </div>
        ))}
      </div>
      <div className="about-features-text">
        <AboutIntro />
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
          <div key={f.num} className="feature-item" data-cursor="hover">
            <div className="feat-num">{f.num}</div>
            <div className="feat-title">{f.title}</div>
            <div className="feat-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return <footer>Feito por <span>@Dev.aos30</span> · D30 é de todo mundo</footer>;
}

Object.assign(window, { HomePage, FeaturesStrip, AboutWithFeatures, Footer });
