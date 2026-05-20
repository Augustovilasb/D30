/* AboutPage.jsx — origin story + values + founder.
   Now rendered as inline sections inside HomePage (the About route is gone).
   We export both `AboutSections` (just the content blocks) and `AboutPage`
   (still works as a standalone route for backwards compat). */

const VALUES = [
  { num: '01', title: 'Autenticidade',   desc: 'Conteúdo de quem tá no meio do processo — não de quem já chegou lá e esqueceu como foi. A D30 nasceu de uma rotina real, não de uma fórmula de palco.' },
  { num: '02', title: 'Sem julgamento',  desc: 'Dúvida básica? Sem problema. Aqui todo mundo foi iniciante e ninguém esqueceu como foi. Pergunta livre, julgamento zero.' },
  { num: '03', title: 'Progresso real',  desc: 'Valorizamos consistência, não velocidade. Um dia ruim não define a jornada — define o que você faz no dia seguinte.' },
  { num: '04', title: 'Acesso livre',    desc: 'Gratuito. Sempre. Conhecimento não pode ser barreira pra quem já tem tantas outras na vida.' },
];

function AboutIntro() {
  return (
    <div className="about-hero" id="sobre">
      <p className="page-label">Sobre a D30</p>
      <h1 className="page-title">Não é mais um curso.<br/>É uma <span>comunidade</span>.</h1>
      <p className="about-text">A D30 nasceu de uma rotina real. De alguém que acordou cedo, foi dormir tarde e decidiu que ia mudar de carreira — mesmo com tudo contra.</p>
      <p className="about-text">O nome vem de <strong>Dev aos 30</strong>, mas a comunidade é pra qualquer pessoa em qualquer fase da vida que tomou essa decisão. Porque o que une aqui não é idade — é <strong>propósito</strong>.</p>
      <p className="about-text">Não tem fórmula mágica. Tem consistência, comunidade e coragem de continuar quando fica difícil.</p>
    </div>
  );
}

function AugustoSection() {
  return (
    <div className="founder-section" id="augusto">
      <div className="founder-col founder-col--id">
        <p className="founder-eyebrow">Fundador</p>
        <h2 className="founder-name">Augusto<br/>Vilas Boas.</h2>
        <p className="founder-role">Dev em formação</p>
      </div>
      <div className="founder-col founder-col--btns">
        <SocialLink kind="instagram" label="Instagram" href="https://www.instagram.com/dev.aos30/"          handle="@dev.aos30" />
        <SocialLink kind="linkedin"  label="LinkedIn"  href="https://www.linkedin.com/in/augustovilasboas/" handle="augustovilasboas" />
        <SocialLink kind="github"    label="GitHub"    href="https://github.com/Augustovilasb"              handle="Augustovilasb" />
      </div>
      <div className="founder-col founder-col--bio">
        <p className="founder-bio">
          Documentando a transição de carreira do zero.
          Porque ninguém deveria fazer esse caminho completamente sozinho.
        </p>
      </div>
      <div className="founder-col founder-col--photo">
        <div className="founder-photo">
          <img src="../../images/augusto.png" alt="Augusto" />
        </div>
      </div>
    </div>
  );
}

function AboutSections() {
  return (
    <React.Fragment>
      <AboutIntro />
      <ValuesDice />
      <AugustoSection />
    </React.Fragment>
  );
}

function AboutPage() {
  return (
    <div className="page active fade-in">
      <AboutSections />
      <Footer />
    </div>
  );
}

function ValuesScroll() {
  const sectionRef = React.useRef(null);
  const stickyRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const [focus, setFocus] = React.useState(0);

  React.useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    if (!section || !sticky || !track) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      if (window.innerWidth < 768) {
        track.style.transform = '';
        setFocus(0);
        return;
      }
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - sticky.offsetHeight;
      if (total <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / total));

      const maxTranslate = track.scrollWidth - sticky.offsetWidth;
      if (maxTranslate > 0) {
        track.style.transform = `translateX(${-maxTranslate * progress}px)`;
      }

      // Determine focused card by which is closest to viewport center
      const cards = track.querySelectorAll('.story-card');
      const viewCenter = sticky.offsetWidth / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const center = r.left + r.width / 2;
        const dist = Math.abs(center - viewCenter);
        if (dist < closestDist) { closestDist = dist; closestIdx = i; }
      });
      setFocus(closestIdx);
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section className="story-section" ref={sectionRef}>
      <div className="story-sticky" ref={stickyRef}>
        <div className="story-header">
          <p className="lbl"><span>{String(focus + 1).padStart(2, '0')}</span> / 04 · O que nos move</p>
        </div>
        <div className="story-track" ref={trackRef}>
          {VALUES.map((v, i) => (
            <div key={v.num} className={'story-card' + (i === focus ? ' in-focus' : '')} data-cursor="hover">
              <div className="story-num">{v.num}<span className="total"> / 04</span></div>
              <div>
                <h3 className="story-title">{v.title}</h3>
                <p className="story-desc">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="story-progress">
          {VALUES.map((_, i) => (
            <div key={i} className={'story-dot' + (i === focus ? ' active' : '')}></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProfileCard({ name, handle, bio, image, initials, socials }) {
  return (
    <div className="profile-card" data-cursor="hover">
      <div className="profile-avatar">
        {image ? <img src={image} alt={name} /> : <span>{initials || name[0]}</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div className="profile-name">{name}</div>
        <div className="profile-handle">{handle}</div>
        <div className="profile-bio">{bio}</div>
        {socials && socials.length > 0 && (
          <div className="profile-socials">
            {socials.map((s) => <SocialLink key={s.kind} {...s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function SocialIcon({ kind }) {
  const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'instagram') {
    return (
      <svg {...common}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }
  if (kind === 'linkedin') {
    return (
      <svg {...common}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  if (kind === 'github') {
    return (
      <svg {...common}>
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    );
  }
  return null;
}

function SocialLink({ kind, label, href, handle }) {
  return (
    <a className="social-link" data-cursor="hover" href={href} target="_blank" rel="noopener noreferrer">
      <SocialIcon kind={kind} />
      <span className="social-label">{label}</span>
      <span className="social-handle">{handle}</span>
    </a>
  );
}

Object.assign(window, { AboutPage, AboutSections, AboutIntro, AugustoSection, ValuesScroll, ProfileCard, SocialLink, SocialIcon });