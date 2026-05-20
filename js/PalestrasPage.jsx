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
    attendees: [
      { initials: 'MR', color: '#6366f1' },
      { initials: 'LS', color: '#f59e0b' },
      { initials: 'TG', color: '#10b981' },
      { initials: 'AC', color: '#ef4444' },
      { initials: 'PB', color: '#8b5cf6' },
    ],
  },
  {
    when: 'Quarta · 5 Jun · 21h',
    guest: 'Diego Mariano',
    role: 'Eng. Sênior · Nubank',
    title: 'De CLT comum a dev sênior em 4 anos — sem virar carreirista',
    blurb: 'A transição contada na ordem que aconteceu, com os erros que ele cometeria de novo.',
    tag: 'jornada',
    rsvp: 89,
    attendees: [
      { initials: 'JF', color: '#0ea5e9' },
      { initials: 'KO', color: '#f97316' },
      { initials: 'BN', color: '#14b8a6' },
      { initials: 'RA', color: '#a855f7' },
    ],
  },
  {
    when: 'Sábado · 14 Jun · 10h',
    guest: 'Camila Souza',
    role: 'Tech Lead · iFood',
    title: 'Soft skills que ninguém fala (e que decidem promoções)',
    blurb: 'O que separa quem é júnior eternamente de quem chega em sênior. Spoiler: não é código.',
    tag: 'carreira',
    rsvp: 67,
    attendees: [
      { initials: 'VT', color: '#ec4899' },
      { initials: 'DM', color: '#22c55e' },
      { initials: 'CP', color: '#f59e0b' },
    ],
  },
];

const TALKS_PAST = [
  { when: '8 Mai', guest: 'Augusto', title: 'Por que comecei a D30 (e por que você devia começar algo)', duration: '47min' },
  { when: '24 Abr', guest: 'Mariana Yamamoto', title: 'Estudar trabalhando 8h — a rotina que destruiu e a que sobreviveu', duration: '52min' },
  { when: '10 Abr', guest: 'Henrique Paiva', title: 'Quebrei meu portfólio 3 vezes. Esse é o quarto.', duration: '38min' },
  { when: '27 Mar', guest: 'Luísa Velloso', title: 'Como cair na primeira entrevista técnica e voltar pra próxima', duration: '41min' },
];

const OWNER_EMAIL   = 'augustovilasb@hotmail.com';
const INDIC_KEY     = 'd30_indicacoes';

function loadIndicacoes() {
  try { return JSON.parse(localStorage.getItem(INDIC_KEY) || '[]'); } catch { return []; }
}
function saveIndicacoes(list) {
  try { localStorage.setItem(INDIC_KEY, JSON.stringify(list)); } catch {}
}

function PalestrasPage({ toast, user, onIndicCountChange }) {
  const [upcoming,   setUpcoming]   = React.useState(TALKS_UPCOMING);
  const [anunciar,   setAnunciar]   = React.useState(false);
  const [sugerindo,  setSugerindo]  = React.useState(false);
  const [indicacoes, setIndicacoes] = React.useState(() => loadIndicacoes());
  const [showIndic,  setShowIndic]  = React.useState(true);
  const isOwner = user && user.email === OWNER_EMAIL;

  const updateIndicacoes = (next) => {
    saveIndicacoes(next);
    setIndicacoes(next);
    if (onIndicCountChange) onIndicCountChange(next.length);
  };

  const addTalk = React.useCallback((talk) => {
    setUpcoming(prev => [talk, ...prev]);
  }, []);

  const addIndicacao = React.useCallback((data) => {
    const next = [...loadIndicacoes(), { ...data, id: Math.random().toString(36).slice(2), by: user.name }];
    updateIndicacoes(next);
  }, [user]);

  const aceitarIndicacao = (ind) => {
    updateIndicacoes(indicacoes.filter(i => i.id !== ind.id));
    setAnunciar(true);
  };

  const rejeitarIndicacao = (id) => {
    updateIndicacoes(indicacoes.filter(i => i.id !== id));
  };

  const t = toast || (() => {});

  return (
    <div className="page active fade-in">
      <div className="palestras-wrap">
        <div className="palestras-header">
          <p className="page-label">Palestras</p>
          <h1 className="page-title">Vozes que já passaram<br/>por <span>esse caminho</span>.</h1>
          <p className="palestras-lede">
            Conversa direta com quem tá fazendo, contratando ou trilhou essa transição antes.
            Sem palco, sem fórmula — só dev falando com dev em formação.
          </p>
        </div>

        {isOwner && indicacoes.length > 0 && (
          <div className="indicacoes-wrap">
            <button className="indicacoes-toggle" data-cursor="hover" onClick={() => setShowIndic(v => !v)}>
              <span>Indicações pendentes</span>
              <span className="indicacoes-badge">{indicacoes.length}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: showIndic ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showIndic && (
              <div className="indicacoes-list">
                {indicacoes.map(ind => (
                  <div key={ind.id} className="indicacao-item">
                    <div className="indicacao-body">
                      <span className="indicacao-name">{ind.name}</span>
                      <span className="indicacao-why">{ind.why}</span>
                      <span className="indicacao-by">sugerido por {ind.by}</span>
                    </div>
                    <div className="indicacao-actions">
                      <button className="indicacao-btn indicacao-btn--accept" data-cursor="hover" onClick={() => aceitarIndicacao(ind)}>Aceitar</button>
                      <button className="indicacao-btn indicacao-btn--reject" data-cursor="hover" onClick={() => rejeitarIndicacao(ind.id)}>Rejeitar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="palestras-actions-bar">
          {isOwner && (
            <button className="btn-anunciar" data-cursor="hover" onClick={() => setAnunciar(true)}>
              + Anunciar palestra
            </button>
          )}
          {!isOwner && (
            <button className="btn-indicar" data-cursor="hover" onClick={() => setSugerindo(true)}>
              Indicar palestrante
            </button>
          )}
        </div>

        <div className="palestras-section">
          <p className="strip-label">Próximas</p>
          <div className="palestras-grid">
            {upcoming.map((t, i) => <UpcomingTalk key={i} talk={t} />)}
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

      {isOwner && (
        <NewTalkModal open={anunciar} onClose={() => setAnunciar(false)} onAdd={addTalk} toast={t} />
      )}
      {!isOwner && (
        <SuggestSpeakerModal open={sugerindo} onClose={() => setSugerindo(false)} onSubmit={addIndicacao} toast={t} />
      )}
    </div>
  );
}

function AvatarStack({ attendees, total }) {
  const visible = attendees.slice(0, 5);
  const extra = total - visible.length;
  return (
    <div className="avatar-stack">
      {visible.map((a, i) => (
        <div
          key={i}
          className="avatar-stack-item"
          style={{ background: a.color, zIndex: visible.length - i }}
          title={a.initials}
        >
          {a.initials}
        </div>
      ))}
      {extra > 0 && (
        <div className="avatar-stack-item avatar-stack-extra">+{extra}</div>
      )}
    </div>
  );
}

function UpcomingTalk({ talk }) {
  return (
    <div className="talk-card" data-cursor="hover">
      <div className="talk-when">{talk.when}</div>
      <div className="talk-guest">
        <div className="talk-guest-name">{talk.guest}</div>
        <div className="talk-guest-role">{talk.role}</div>
      </div>
      <h3 className="talk-title">{talk.title}</h3>
      <p className="talk-blurb">{talk.blurb}</p>
      <div className="talk-foot">
        <div className="talk-foot-left">
          <AvatarStack attendees={talk.attendees} total={talk.rsvp} />
          <span className="talk-rsvp">{talk.rsvp} confirmados</span>
        </div>
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
