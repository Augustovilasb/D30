/* Modals.jsx — Login / Signup / NewPost + toast stack */

function Modal({ open, onClose, label, title, subtitle, children }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={'modal-backdrop' + (open ? ' open' : '')} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" data-cursor="hover" onClick={onClose}>×</button>
        {label && <p className="modal-label">{label}</p>}
        {title && <h2 className="modal-title">{title}</h2>}
        {subtitle && <p className="modal-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div className={'field' + (error ? ' error' : '')}>
      <label>{label}</label>
      {children}
      <div className="field-error">{error || ''}</div>
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}

function LoginModal({ open, onClose, onSignIn, onSwitch, toast }) {
  const [email,    setEmail]    = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors,   setErrors]   = React.useState({});
  const [loading,  setLoading]  = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!email.includes('@')) next.email = 'Email inválido.';
    if (password.length < 6)  next.password = 'Senha curta demais.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const data    = await window.Auth.signIn({ email, password });
      const profile = await window.Auth.getProfile(data.user.id).catch(() => null);
      const name    = profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0];
      const initials = name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase();
      onSignIn({
        id: data.user.id, email: data.user.email, name, initials,
        username: profile?.username || '', color: '#6d5ce6',
        avatar_url: profile?.avatar_url || null, bio: profile?.bio || null,
        profession: profile?.profession || null,
        github_url: profile?.github_url || null, linkedin_url: profile?.linkedin_url || null,
        twitter_url: profile?.twitter_url || null, website_url: profile?.website_url || null,
      });
      toast('success', 'Bem-vindo de volta!');
      onClose();
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid')) setErrors({ password: 'Email ou senha incorretos.' });
      else if (msg.includes('confirmed'))        setErrors({ email: 'Confirme seu email antes de entrar.' });
      else                                       setErrors({ password: 'Erro ao entrar. Tente novamente.' });
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} label="Entrar" title="Bem-vindo de volta." subtitle="Entra com seu email e senha pra continuar de onde parou.">
      <form onSubmit={submit} noValidate>
        <Field label="Email" error={errors.email}>
          <input type="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha" error={errors.password}>
          <input type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <div className="form-actions">
          <button type="submit" className="btn-primary" data-cursor="hover" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
        <p className="form-switch">Não tem conta? <a data-cursor="hover" onClick={() => onSwitch('signup')}>Criar conta grátis</a></p>
      </form>
    </Modal>
  );
}

function SignupModal({ open, onClose, onSignIn, onSwitch, toast }) {
  const [name,     setName]     = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email,    setEmail]    = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm,  setConfirm]  = React.useState('');
  const [errors,   setErrors]   = React.useState({});
  const [loading,  setLoading]  = React.useState(false);

  const strength = password.length >= 10 ? 3 : password.length >= 6 ? 2 : password.length > 0 ? 1 : 0;
  const strengthLabels = ['', 'Senha fraca.', 'Senha média.', 'Senha forte.'];

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!name.trim()) next.name = 'Manda seu nome aí.';
    if (!username.trim() || !/^[a-z0-9_]{3,20}$/.test(username)) next.username = 'Só letras minúsculas, números e _ (3–20 chars).';
    if (!email.includes('@')) next.email = 'Email inválido.';
    if (password.length < 6) next.password = 'Mínimo 6 caracteres.';
    if (password !== confirm) next.confirm = 'As senhas não batem.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const data = await window.Auth.signUp({ email, password, fullName: name.trim(), username: username.trim() });
      if (data.user && !data.user.identities?.length === 0) {
        const initials = name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase();
        onSignIn({ id: data.user.id, email: data.user.email, name: name.trim(), username: username.trim(), initials, color: '#6d5ce6', avatar_url: null, bio: null, profession: null, github_url: null, linkedin_url: null, twitter_url: null, website_url: null });
        toast('success', 'Conta criada! Bem-vindo à D30.');
      } else {
        toast('info', 'Conta criada! Confirme seu email para ativar.');
      }
      onClose();
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('already been registered')) setErrors({ email: 'Este email já está cadastrado.' });
      else if (msg.includes('username'))  setErrors({ username: 'Este username já está em uso.' });
      else                                setErrors({ password: 'Erro ao criar conta. Tente novamente.' });
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} label="Criar conta" title="Queremos você na comunidade.">
      <form onSubmit={submit} noValidate>
        <Field label="Nome" error={errors.name}>
          <input type="text" placeholder="Como te chamam?" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Username" error={errors.username} hint="Só letras minúsculas, números e underscore.">
          <input type="text" placeholder="seunome123" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha" error={errors.password}>
          <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="pw-strength">
            {[1,2,3].map(n => <div key={n} className={'pw-bar' + (strength >= n ? ' active-' + strength : '')}></div>)}
          </div>
          <div className="pw-hint">{strengthLabels[strength] || 'Força da senha aparece aqui'}</div>
        </Field>
        <Field label="Confirmar senha" error={errors.confirm}>
          <input type="password" placeholder="Repita a senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <div className="form-actions">
          <button type="submit" className="btn-primary" data-cursor="hover" disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>
        </div>
        <p className="form-switch">Já tem conta? <a data-cursor="hover" onClick={() => onSwitch('login')}>Entrar</a></p>
      </form>
    </Modal>
  );
}

function NewPostModal({ open, onClose, toast, onAdd, user }) {
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState('duvida');
  const [content, setContent] = React.useState('');
  const [errors, setErrors] = React.useState({});

  const CAT_LABELS = { duvida: 'Dúvidas & Estudo', recurso: 'Dicas', conquista: 'Conquistas', tech: 'Tecnologias', carreira: 'Carreira' };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!title.trim()) next.title = 'Dá um título pro tópico.';
    if (!content.trim() || content.length < 20) next.content = 'Conta um pouco mais — pelo menos 20 caracteres.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      if (onAdd) onAdd({ title: title.trim(), tag: category, firstMessage: content.trim() });
      setTitle(''); setContent(''); setCategory('duvida'); setErrors({});
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} label="Fórum" title="Novo tópico" subtitle="Pergunta, conquista, dica — tudo serve.">
      <form onSubmit={submit} noValidate>
        <Field label="Título" error={errors.title}>
          <input type="text" placeholder="Resuma em uma frase" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Categoria">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="duvida">Dúvidas & Estudo</option>
            <option value="recurso">Dicas</option>
            <option value="conquista">Conquistas</option>
            <option value="tech">Tecnologias</option>
            <option value="carreira">Carreira</option>
          </select>
        </Field>
        <Field label="Conteúdo" error={errors.content}>
          <textarea placeholder="Conta mais detalhes, contexto, o que você já tentou..." value={content} onChange={(e) => setContent(e.target.value)}></textarea>
        </Field>
        <div className="form-actions">
          <button type="submit" className="btn-primary" data-cursor="hover">Publicar</button>
        </div>
      </form>
    </Modal>
  );
}

const DT_WEEKDAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const DT_MONTHS     = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];

function DtDropdown({ id, label, value, display, open, onToggle, onClose, children }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  return (
    <div className="dtdrop" ref={ref}>
      <button type="button" className={'dtdrop-btn' + (open ? ' open' : '')} onClick={onToggle} data-cursor="hover">
        <span className="dtdrop-val">{display}</span>
        <svg className="dtdrop-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <div className="dtdrop-panel">{children}</div>}
    </div>
  );
}

function DateTimePicker({ onChange }) {
  const now = new Date();
  const [wd,    setWd]    = React.useState(now.getDay());
  const [day,   setDay]   = React.useState(now.getDate());
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [hour,  setHour]  = React.useState(19);
  const [open,  setOpen]  = React.useState(null); // 'wd'|'day'|'month'|'hour'|null

  const toggle = (id) => setOpen(v => v === id ? null : id);
  const close  = ()   => setOpen(null);

  const selectDay = (d) => {
    const max = DAYS_IN_MONTH[month - 1];
    setDay(Math.min(d, max));
    close();
  };
  const selectMonth = (m) => {
    setMonth(m);
    setDay(d => Math.min(d, DAYS_IN_MONTH[m - 1]));
    close();
  };

  React.useEffect(() => {
    onChange(`${DT_WEEKDAYS[wd]} · ${day} ${DT_MONTHS[month-1]} · ${String(hour).padStart(2,'0')}h`);
  }, [wd, day, month, hour]);

  const days   = Array.from({ length: DAYS_IN_MONTH[month - 1] }, (_, i) => i + 1);
  const hours  = Array.from({ length: 16 }, (_, i) => i + 7); // 07h–22h

  return (
    <div className="dtpick">
      <DtDropdown id="wd" label="Dia da semana" display={DT_WEEKDAYS[wd]} open={open === 'wd'} onToggle={() => toggle('wd')} onClose={close}>
        <div className="dtdrop-grid dtdrop-grid--7">
          {DT_WEEKDAYS.map((d, i) => (
            <button key={i} type="button" className={'dtdrop-opt' + (wd === i ? ' active' : '')} onClick={() => { setWd(i); close(); }} data-cursor="hover">{d}</button>
          ))}
        </div>
      </DtDropdown>

      <DtDropdown id="day" label="Dia do mês" display={String(day).padStart(2,'0')} open={open === 'day'} onToggle={() => toggle('day')} onClose={close}>
        <div className="dtdrop-grid dtdrop-grid--7">
          {days.map(d => (
            <button key={d} type="button" className={'dtdrop-opt' + (day === d ? ' active' : '')} onClick={() => selectDay(d)} data-cursor="hover">{String(d).padStart(2,'0')}</button>
          ))}
        </div>
      </DtDropdown>

      <DtDropdown id="month" label="Mês" display={DT_MONTHS[month-1]} open={open === 'month'} onToggle={() => toggle('month')} onClose={close}>
        <div className="dtdrop-grid dtdrop-grid--3">
          {DT_MONTHS.map((m, i) => (
            <button key={i} type="button" className={'dtdrop-opt' + (month === i + 1 ? ' active' : '')} onClick={() => selectMonth(i + 1)} data-cursor="hover">{m}</button>
          ))}
        </div>
      </DtDropdown>

      <DtDropdown id="hour" label="Horário" display={String(hour).padStart(2,'0') + 'h'} open={open === 'hour'} onToggle={() => toggle('hour')} onClose={close}>
        <div className="dtdrop-grid dtdrop-grid--4">
          {hours.map(h => (
            <button key={h} type="button" className={'dtdrop-opt' + (hour === h ? ' active' : '')} onClick={() => { setHour(h); close(); }} data-cursor="hover">{String(h).padStart(2,'0')}h</button>
          ))}
        </div>
      </DtDropdown>
    </div>
  );
}

function NewTalkModal({ open, onClose, onAdd, toast }) {
  const [when,    setWhen]    = React.useState('');
  const [guest,   setGuest]   = React.useState('');
  const [role,    setRole]    = React.useState('');
  const [title,   setTitle]   = React.useState('');
  const [blurb,   setBlurb]   = React.useState('');
  const [errors,  setErrors]  = React.useState({});

  const reset = () => { setGuest(''); setRole(''); setTitle(''); setBlurb(''); setErrors({}); };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!when.trim())  next.when  = 'Selecione a data e horário.';
    if (!guest.trim()) next.guest = 'Nome do palestrante obrigatório.';
    if (!title.trim()) next.title = 'Título obrigatório.';
    if (!blurb.trim()) next.blurb = 'Descrição obrigatória.';
    setErrors(next);
    if (Object.keys(next).length) return;

    onAdd({
      when: when.trim(),
      guest: guest.trim(),
      role: role.trim(),
      title: title.trim(),
      blurb: blurb.trim(),
      tag: 'geral',
      rsvp: 0,
      attendees: [],
    });
    toast('success', 'Palestra anunciada!');
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Nova palestra">
      <form onSubmit={submit} noValidate>
        <div className={'field' + (errors.when ? ' error' : '')}>
          <label>Data e horário</label>
          <DateTimePicker onChange={setWhen} />
          <div className="field-error">{errors.when || ''}</div>
        </div>
        <Field label="Nome do palestrante" error={errors.guest}>
          <input type="text" placeholder="Nome completo" value={guest} onChange={(e) => setGuest(e.target.value)} />
        </Field>
        <Field label="Cargo e empresa" error={errors.role}>
          <input type="text" placeholder="Ex: Dev Sênior · Nubank" value={role} onChange={(e) => setRole(e.target.value)} />
        </Field>
        <Field label="Título da palestra" error={errors.title}>
          <input type="text" placeholder="Uma frase que resume o tema" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Descrição curta" error={errors.blurb}>
          <textarea placeholder="O que as pessoas vão aprender ou ouvir..." value={blurb} onChange={(e) => setBlurb(e.target.value)} style={{ minHeight: 72 }} />
        </Field>
        <div className="form-actions">
          <button type="submit" className="btn-primary" data-cursor="hover">Anunciar palestra</button>
        </div>
      </form>
    </Modal>
  );
}

function SuggestSpeakerModal({ open, onClose, onSubmit, toast }) {
  const [name,   setName]   = React.useState('');
  const [why,    setWhy]    = React.useState('');
  const [errors, setErrors] = React.useState({});

  const reset = () => { setName(''); setWhy(''); setErrors({}); };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!name.trim()) next.name = 'Coloca o nome do palestrante.';
    if (!why.trim() || why.length < 10) next.why = 'Conta um pouco mais — pelo menos 10 caracteres.';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ name: name.trim(), why: why.trim() });
    toast('success', 'Indicação enviada! A gente vai analisar.');
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} label="Palestras" title="Indicar palestrante" subtitle="Quem você gostaria de ver palestrando aqui? A gente analisa e tenta trazer.">
      <form onSubmit={submit} noValidate>
        <Field label="Nome do palestrante" error={errors.name}>
          <input type="text" placeholder="Nome completo ou @ das redes sociais" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Por que essa pessoa?" error={errors.why}>
          <textarea placeholder="O que ela tem a ensinar pra nossa comunidade?" value={why} onChange={(e) => setWhy(e.target.value)} style={{ minHeight: 80 }} />
        </Field>
        <div className="form-actions">
          <button type="submit" className="btn-primary" data-cursor="hover">Enviar indicação</button>
        </div>
      </form>
    </Modal>
  );
}

function ToastStack({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={'toast show ' + t.kind}>
          <span className="toast-dot"></span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = React.useState([]);
  const push = React.useCallback((kind, msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((arr) => [...arr, { id, kind, msg }]);
    setTimeout(() => setToasts((arr) => arr.filter(t => t.id !== id)), 3500);
  }, []);
  return [toasts, push];
}

function DiscordOnboardingModal({ open, user, onClose }) {
  const [clicked,  setClicked]  = React.useState(false);
  const [checked,  setChecked]  = React.useState(false);
  const [saving,   setSaving]   = React.useState(false);

  if (!open) return null;

  const confirm = async () => {
    if (!checked || saving) return;
    setSaving(true);
    try { await window.sb.from('profiles').update({ discord_onboarded: true }).eq('id', user.id); } catch {}
    try { localStorage.setItem('d30_discord_done', '1'); } catch {}
    setSaving(false);
    onClose(true);
  };

  return (
    <div className="discord-modal-overlay">
      <div className="discord-modal" onClick={e => e.stopPropagation()}>
        <div className="discord-modal-top">
          <svg className="discord-modal-logo" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
          <div>
            <p className="discord-modal-eyebrow">Próximo passo</p>
            <h2 className="discord-modal-title">Parabéns por fazer<br/>parte da comunidade.</h2>
          </div>
        </div>

        <p className="discord-modal-body">
          Agora entra no nosso Discord — é onde a troca acontece ao vivo:
          salas de estudo, dúvidas em tempo real e as palestras. Seja bem-vindo.
        </p>

        <a className="discord-join-btn" href="https://discord.gg/eUFsMDuUm" target="_blank" rel="noopener noreferrer" data-cursor="hover" onClick={() => setClicked(true)}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
          {clicked ? 'Discord aberto ✓' : 'Entrar no Discord'}
        </a>

        <label className={'discord-check-label' + (!clicked ? ' discord-check-label--disabled' : '')} data-cursor={clicked ? 'hover' : undefined}>
          <input type="checkbox" checked={checked} disabled={!clicked} onChange={e => setChecked(e.target.checked)} />
          <span className="discord-check-box">{checked && '✓'}</span>
          {clicked ? 'Já entrei no Discord' : 'Clique no botão acima primeiro'}
        </label>

        <button className={'discord-confirm-btn' + (checked ? ' active' : '')} disabled={!checked || saving} data-cursor={checked ? 'hover' : undefined} onClick={confirm}>
          {saving ? 'Salvando…' : 'Confirmar →'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Modal, Field, LoginModal, SignupModal, NewPostModal, NewTalkModal, SuggestSpeakerModal, DiscordOnboardingModal, ToastStack, useToasts });
