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
  const [remember, setRemember] = React.useState(false);
  const [errors,   setErrors]   = React.useState({});

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!email.includes('@')) next.email = 'Email inválido.';
    if (password.length < 6) next.password = 'Senha curta demais.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      onSignIn({
        name: email.split('@')[0] || 'voce',
        email,
        initials: (email[0] || 'V').toUpperCase(),
        color: '#6d5ce6',
      });
      toast('success', 'Bem-vindo de volta!');
      onClose();
    }
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
        <label className="form-remember" data-cursor="hover">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Lembrar de mim</span>
        </label>
        <div className="form-actions">
          <button type="submit" className="btn-primary" data-cursor="hover">Entrar</button>
        </div>
        <p className="form-switch">Não tem conta? <a data-cursor="hover" onClick={() => onSwitch('signup')}>Criar conta grátis</a></p>
      </form>
    </Modal>
  );
}

function SignupModal({ open, onClose, onSignIn, onSwitch, toast }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [errors, setErrors] = React.useState({});

  const strength = password.length >= 10 ? 3 : password.length >= 6 ? 2 : password.length > 0 ? 1 : 0;
  const strengthLabels = ['', 'Senha fraca.', 'Senha média.', 'Senha forte.'];

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!name.trim()) next.name = 'Manda seu nome aí.';
    if (!email.includes('@')) next.email = 'Email inválido.';
    if (password.length < 6) next.password = 'Mínimo 6 caracteres.';
    if (password !== confirm) next.confirm = 'As senhas não batem.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      const initials = name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase();
      onSignIn({ name: name.trim(), email, initials, color: '#6d5ce6' });
      toast('success', 'Conta criada! Bem-vindo à D30.');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} label="Criar conta" title="Queremos você na comunidade.">
      <form onSubmit={submit} noValidate>
        <Field label="Nome" error={errors.name}>
          <input type="text" placeholder="Como te chamam?" value={name} onChange={(e) => setName(e.target.value)} />
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
          <button type="submit" className="btn-primary" data-cursor="hover">Criar conta</button>
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
      const newTopic = {
        id: 't_' + Math.random().toString(36).slice(2),
        title: title.trim(),
        author: user ? user.name : 'Anônimo',
        avatar: user ? user.initials : '?',
        color: user ? (user.color || '#6d5ce6') : '#999',
        time: 'agora',
        tag: category,
        tagLabel: CAT_LABELS[category] || category,
        hot: false,
        replies: 0,
        messages: [{
          who: user ? user.name : 'Anônimo',
          avatar: user ? user.initials : '?',
          color: user ? (user.color || '#6d5ce6') : '#999',
          time: 'agora',
          text: content.trim(),
        }],
      };
      if (onAdd) onAdd(newTopic);
      toast('success', 'Publicado!');
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

Object.assign(window, { Modal, Field, LoginModal, SignupModal, NewPostModal, NewTalkModal, SuggestSpeakerModal, ToastStack, useToasts });
