/* PalestrasPage.jsx — talks/lectures, data from Supabase via DB */

function PalestrasPage({ toast, user, onIndicCountChange }) {
  const isAdmin = !!user?.is_admin;
  const t       = toast || (() => {});

  const [upcoming,    setUpcoming]    = React.useState([]);
  const [past,        setPast]        = React.useState([]);
  const [loading,     setLoading]     = React.useState(true);
  const [indicacoes,  setIndicacoes]  = React.useState([]);
  const [showIndic,   setShowIndic]   = React.useState(true);
  const [rsvpd,       setRsvpd]       = React.useState({});  // { talkId: bool }
  const [anunciar,    setAnunciar]    = React.useState(false);
  const [sugerindo,   setSugerindo]   = React.useState(false);

  /* ── load on mount ──────────────────────────────────────────── */
  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [up, done] = await Promise.all([
          DB.talks.getUpcoming(),
          DB.talks.getPast(),
        ]);
        if (cancelled) return;
        setUpcoming(up);
        setPast(done);

        if (user) {
          const myRsvps = await DB.talks.getUserRsvps(user.id);
          if (!cancelled) setRsvpd(myRsvps);
        }

        if (isAdmin) {
          const sugs = await DB.talks.getSuggestions();
          if (!cancelled) {
            setIndicacoes(sugs);
            if (onIndicCountChange) onIndicCountChange(sugs.length);
          }
        }
      } catch (e) {
        if (!cancelled) t('error', 'Erro ao carregar palestras.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.id, isAdmin]);

  /* ── highlight from profile ─────────────────────────────────── */
  React.useEffect(() => {
    const id = window.__palestrasHighlight;
    if (!id || loading) return;
    window.__palestrasHighlight = null;
    setTimeout(() => {
      const el = document.querySelector(`[data-highlight-id="${id}"]`);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('highlight-flash'); }
    }, 300);
  }, [loading]);

  /* ── actions ────────────────────────────────────────────────── */
  const handleRsvp = React.useCallback(async (talkId) => {
    if (!user) return;
    const wasRsvpd = !!rsvpd[talkId];
    // optimistic
    setRsvpd(prev => ({ ...prev, [talkId]: !wasRsvpd }));
    setUpcoming(prev => prev.map(tk =>
      tk.id === talkId ? { ...tk, rsvp_count: Math.max(0, (tk.rsvp_count || 0) + (wasRsvpd ? -1 : 1)) } : tk
    ));
    try {
      await DB.talks.toggleRsvp(talkId, user.id);
      t('success', wasRsvpd ? 'Presença cancelada.' : 'Presença confirmada!');
    } catch {
      // rollback
      setRsvpd(prev => ({ ...prev, [talkId]: wasRsvpd }));
      setUpcoming(prev => prev.map(tk =>
        tk.id === talkId ? { ...tk, rsvp_count: Math.max(0, (tk.rsvp_count || 0) + (wasRsvpd ? 1 : -1)) } : tk
      ));
      t('error', 'Erro ao confirmar presença.');
    }
  }, [user, rsvpd]);

  const addTalk = React.useCallback(async (data) => {
    try {
      const talk = await DB.talks.create({
        when_text:  data.when,
        guest_name: data.guest,
        guest_role: data.role,
        title:      data.title,
        blurb:      data.blurb,
        tag:        data.tag || 'geral',
      });
      setUpcoming(prev => [talk, ...prev]);
    } catch {
      t('error', 'Erro ao salvar palestra.');
    }
  }, []);

  const addIndicacao = React.useCallback(async (data) => {
    try {
      await DB.talks.suggestSpeaker({ name: data.name, why: data.why, userId: user.id, suggestedBy: user.name });
    } catch {
      t('error', 'Erro ao enviar indicação.');
    }
  }, [user]);

  const aceitarIndicacao = React.useCallback(async (ind) => {
    try {
      await DB.talks.acceptSuggestion(ind.id);
      const next = indicacoes.filter(i => i.id !== ind.id);
      setIndicacoes(next);
      if (onIndicCountChange) onIndicCountChange(next.length);
      setAnunciar(true);
    } catch {
      t('error', 'Erro ao aceitar indicação.');
    }
  }, [indicacoes]);

  const rejeitarIndicacao = React.useCallback(async (id) => {
    try {
      await DB.talks.rejectSuggestion(id);
      const next = indicacoes.filter(i => i.id !== id);
      setIndicacoes(next);
      if (onIndicCountChange) onIndicCountChange(next.length);
    } catch {
      t('error', 'Erro ao rejeitar indicação.');
    }
  }, [indicacoes]);

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <div className="page active fade-in">
      <div className="palestras-wrap">
        <div className="palestras-header">
          <p className="page-label">Palestras</p>
          <h1 className="page-title">Vozes que já passaram<br/>por <span>esse caminho</span>.</h1>
          <p className="palestras-lede">
            Conversa direta com quem tá fazendo, contratando ou trilhou essa transição antes.
            Sem palco, sem fórmula, só dev falando com dev em formação.
          </p>
        </div>

        {isAdmin && indicacoes.length > 0 && (
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
                      <span className="indicacao-by">sugerido por {ind.suggested_by}</span>
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
          {isAdmin
            ? <button className="btn-anunciar" data-cursor="hover" onClick={() => setAnunciar(true)}>+ Anunciar palestra</button>
            : <button className="btn-indicar"  data-cursor="hover" onClick={() => setSugerindo(true)}>Indicar palestrante</button>
          }
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Carregando palestras…</div>
        ) : (
          <React.Fragment>
            <div className="palestras-section">
              <p className="strip-label">Próximas</p>
              <div className="palestras-grid">
                {upcoming.length === 0
                  ? <p style={{ color: 'var(--muted)' }}>Nenhuma palestra agendada no momento.</p>
                  : upcoming.map(talk => (
                      <UpcomingTalk key={talk.id} talk={talk} rsvpd={!!rsvpd[talk.id]} onRsvp={user ? () => handleRsvp(talk.id) : null} />
                    ))
                }
              </div>
            </div>

            <div className="palestras-section">
              <p className="strip-label">Já aconteceram</p>
              <div className="palestras-past">
                {past.map(talk => <PastTalk key={talk.id} talk={talk} />)}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
      <Footer />

      {isAdmin && (
        <NewTalkModal open={anunciar} onClose={() => setAnunciar(false)} onAdd={addTalk} toast={t} />
      )}
      {!isAdmin && (
        <SuggestSpeakerModal open={sugerindo} onClose={() => setSugerindo(false)} onSubmit={addIndicacao} toast={t} />
      )}
    </div>
  );
}

function UpcomingTalk({ talk, rsvpd, onRsvp }) {
  return (
    <div className="talk-card" data-cursor="hover" data-highlight-id={talk.id}>
      <div className="talk-when">{talk.when_text}</div>
      <div className="talk-guest">
        <div className="talk-guest-name">{talk.guest_name}</div>
        {talk.guest_role && <div className="talk-guest-role">{talk.guest_role}</div>}
      </div>
      <h3 className="talk-title">{talk.title}</h3>
      {talk.blurb && <p className="talk-blurb">{talk.blurb}</p>}
      <div className="talk-foot">
        <div className="talk-foot-left">
          <span className="talk-rsvp">{talk.rsvp_count || 0} confirmados</span>
        </div>
        {onRsvp && (
          <button
            className={'talk-rsvp-btn' + (rsvpd ? ' rsvpd' : '')}
            data-cursor="hover"
            onClick={onRsvp}
          >
            {rsvpd ? '✓ Confirmado' : 'Quero ir →'}
          </button>
        )}
      </div>
    </div>
  );
}

function PastTalk({ talk }) {
  return (
    <div className="past-talk" data-cursor="hover" data-highlight-id={talk.id}>
      <div className="past-talk-when">{talk.when_text}</div>
      <div className="past-talk-body">
        <div className="past-talk-title">{talk.title}</div>
        <div className="past-talk-meta">{talk.guest_name}{talk.duration ? ' · ' + talk.duration : ''}</div>
      </div>
      {talk.video_url
        ? <a className="past-talk-replay" href={talk.video_url} target="_blank" rel="noopener noreferrer" data-cursor="hover">▶ Replay</a>
        : <button className="past-talk-replay" data-cursor="hover" disabled>▶ Replay</button>
      }
    </div>
  );
}

Object.assign(window, { PalestrasPage, UpcomingTalk, PastTalk });
