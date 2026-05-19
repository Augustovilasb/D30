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

function NewPostModal({ open, onClose, toast }) {
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState('duvida');
  const [content, setContent] = React.useState('');
  const [errors, setErrors] = React.useState({});

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!title.trim()) next.title = 'Dá um título pro tópico.';
    if (!content.trim() || content.length < 20) next.content = 'Conta um pouco mais — pelo menos 20 caracteres.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      toast('success', 'Publicado! Em breve outras pessoas vão responder.');
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
            <option value="duvida">Dúvida</option>
            <option value="conquista">Conquista</option>
            <option value="recurso">Recurso</option>
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

Object.assign(window, { Modal, Field, LoginModal, SignupModal, NewPostModal, ToastStack, useToasts });
