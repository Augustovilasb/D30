/* PalestrasPage.jsx — talks/lectures listing for the community */

const TALKS_UPCOMING = [
  {
    when: 'Quinta · 23 Mai · 20h',
    guest: 'Renata Linhares',
    role: 'Tech Recruiter · Stone',
    title: 'O que recrutador realmente lê num currículo júnior',
    blurb: 'Sem rodeios. O que importa, o que é decoração, e o que faz um perfil ir pro lixo nos 5 primeiros segundos.',
    tag: 'recrutamento',
    rsvp: 142,
  },
  {
    when: 'Quarta · 5 Jun · 21h',
    guest: 'Diego Mariano',
    role: 'Eng. Sênior · Nubank',
    title: 'De CLT comum a dev sênior em 4 anos — sem virar carreirista',
    blurb: 'A transição contada na ordem que aconteceu, com os erros que ele cometeria de novo.',
    tag: 'jornada',
    rsvp: 89,
  },
  {
    when: 'Sábado · 14 Jun · 10h',
    guest: 'Camila Souza',
    role: 'Tech Lead · iFood',
    title: 'Soft skills que ninguém fala (e que decidem promoções)',
    blurb: 'O que separa quem é júnior eternamente de quem chega em sênior. Spoiler: não é código.',
    tag: 'carreira',
    rsvp: 67,
  },
];

const TALKS_PAST = [
  { when: '8 Mai', guest: 'Augusto', title: 'Por que comecei a D30 (e por que você devia começar algo)', duration: '47min' },
  { when: '24 Abr', guest: 'Mariana Yamamoto', title: 'Estudar trabalhando 8h — a rotina que destruiu e a que sobreviveu', duration: '52min' },
  { when: '10 Abr', guest: 'Henrique Paiva', title: 'Quebrei meu portfólio 3 vezes. Esse é o quarto.', duration: '38min' },
  { when: '27 Mar', guest: 'Luísa Velloso', title: 'Como cair na primeira entrevista técnica e voltar pra próxima', duration: '41min' },
];

function PalestrasPage() {
  return (
    <div className="page active fade-in">
      <div className="palestras-wrap">
        <p className="page-label">Palestras</p>
        <h1 className="page-title">Vozes que já passaram<br/>por <span>esse caminho</span>.</h1>
        <p className="palestras-lede">
          Conversa direta com quem tá fazendo, contratando ou trilhou essa transição antes.
          Sem palco, sem fórmula — só dev falando com dev em formação.
        </p>

        <div className="palestras-section">
          <p className="strip-label">Próximas</p>
          <div className="palestras-grid">
            {TALKS_UPCOMING.map((t, i) => <UpcomingTalk key={i} talk={t} featured={i === 0} />)}
          </div>
        </div>

        <div className="palestras-section">
          <p className="strip-label">Já aconteceram</p>
          <div className="palestras-past">
            {TALKS_PAST.map((t, i) => <PastTalk key={i} talk={t} />)}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function UpcomingTalk({ talk, featured }) {
  return (
    <div className={'talk-card' + (featured ? ' is-featured' : '')} data-cursor="hover">
      <div className="talk-when">{talk.when}</div>
      <div className="talk-guest">
        <div className="talk-guest-name">{talk.guest}</div>
        <div className="talk-guest-role">{talk.role}</div>
      </div>
      <h3 className="talk-title">{talk.title}</h3>
      <p className="talk-blurb">{talk.blurb}</p>
      <div className="talk-foot">
        <span className="talk-rsvp">{talk.rsvp} confirmados</span>
        <button className="talk-rsvp-btn" data-cursor="hover">Quero ir →</button>
      </div>
    </div>
  );
}

function PastTalk({ talk }) {
  return (
    <div className="past-talk" data-cursor="hover">
      <div className="past-talk-when">{talk.when}</div>
      <div className="past-talk-body">
        <div className="past-talk-title">{talk.title}</div>
        <div className="past-talk-meta">{talk.guest} · {talk.duration}</div>
      </div>
      <button className="past-talk-replay" data-cursor="hover">▶ Replay</button>
    </div>
  );
}

Object.assign(window, { PalestrasPage, UpcomingTalk, PastTalk, TALKS_UPCOMING, TALKS_PAST });
