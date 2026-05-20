/* SettingsPage.jsx — edit profile, social links, API key */

function SettingsPage({ user, onUpdate, onSignOut, onNavigate }) {
  const [form, setForm] = React.useState({
    full_name:    user.name        || '',
    username:     user.username    || '',
    bio:          user.bio         || '',
    profession:   user.profession  || '',
    avatar_url:   user.avatar_url  || '',
    github_url:    user.github_url    || '',
    linkedin_url:  user.linkedin_url  || '',
    instagram_url: user.instagram_url || '',
    twitter_url:   user.twitter_url   || '',
    website_url:   user.website_url   || '',
  });
  const [aiKey,       setAiKey]       = React.useState(() => { try { return localStorage.getItem('d30_ai_key') || ''; } catch { return ''; } });
  const [showKey,     setShowKey]     = React.useState(false);
  const [saving,      setSaving]      = React.useState(false);
  const [saved,       setSaved]       = React.useState(false);
  const [error,       setError]       = React.useState('');

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const save = async () => {
    if (!form.full_name.trim()) { setError('Nome não pode ser vazio.'); return; }
    setSaving(true); setError('');
    try {
      if (window.sb && user.id) {
        const { data: upsertData, error: dbErr } = await window.sb.from('profiles').upsert({
          id:            user.id,
          full_name:     form.full_name.trim(),
          username:      form.username.trim(),
          bio:           form.bio.trim(),
          profession:    form.profession.trim(),
          avatar_url:    form.avatar_url.trim()    || null,
          github_url:    form.github_url.trim()    || null,
          linkedin_url:  form.linkedin_url.trim()  || null,
          instagram_url: form.instagram_url.trim() || null,
          twitter_url:   form.twitter_url.trim()   || null,
          website_url:   form.website_url.trim()   || null,
        }, { onConflict: 'id' }).select();
        console.log('[D30] upsert data:', upsertData, '| error:', dbErr);
        if (dbErr) throw new Error(
          dbErr.code === '23505' ? 'Esse username já está em uso.' : dbErr.message
        );
      }
      try { localStorage.setItem('d30_ai_key', aiKey.trim()); } catch {}
      try {
        localStorage.setItem('d30_profile_v2', JSON.stringify({
          full_name: form.full_name.trim(), username: form.username.trim(),
          bio: form.bio.trim() || null, profession: form.profession.trim() || null,
          avatar_url: form.avatar_url.trim() || null, github_url: form.github_url.trim() || null,
          linkedin_url: form.linkedin_url.trim() || null, instagram_url: form.instagram_url.trim() || null,
          twitter_url: form.twitter_url.trim() || null, website_url: form.website_url.trim() || null,
        }));
      } catch {}
      const initials = form.full_name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase() || user.initials;
      onUpdate({ ...user, name: form.full_name.trim(), username: form.username.trim(), bio: form.bio.trim() || null, profession: form.profession.trim() || null, avatar_url: form.avatar_url.trim() || null, github_url: form.github_url.trim() || null, linkedin_url: form.linkedin_url.trim() || null, instagram_url: form.instagram_url.trim() || null, twitter_url: form.twitter_url.trim() || null, website_url: form.website_url.trim() || null, initials });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  const previewInitials = form.full_name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase() || user.initials;

  return (
    <div className="page active fade-in">
      <div className="settings-wrap">

        <div className="settings-header">
          <button className="settings-back" data-cursor="hover" onClick={() => onNavigate('profile')}>← Perfil</button>
          <h1 className="settings-title">Configurações</h1>
        </div>

        {/* Profile section */}
        <div className="settings-section">
          <p className="settings-section-label">Perfil público</p>

          <div className="settings-avatar-row">
            <div className="settings-avatar-preview">
              {form.avatar_url
                ? <img src={form.avatar_url} alt="Avatar" className="settings-avatar-img" onError={e => { e.target.style.display='none'; }} />
                : <div className="settings-avatar-init" style={{ background: user.color || '#6d5ce6' }}>{previewInitials}</div>
              }
            </div>
            <div className="settings-avatar-input">
              <label className="settings-label" htmlFor="s-avatar">Foto de perfil (URL)</label>
              <input id="s-avatar" name="avatar_url" className="settings-input" type="url" placeholder="https://..." value={form.avatar_url} onChange={e => set('avatar_url', e.target.value)} />
              <p className="settings-hint">Cole o link de uma imagem pública (ex: GitHub avatar)</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label className="settings-label" htmlFor="s-fullname">Nome completo</label>
              <input id="s-fullname" name="full_name" className="settings-input" type="text" placeholder="Seu nome" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="s-username">Username</label>
              <input id="s-username" name="username" className="settings-input" type="text" placeholder="seunome" value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} />
            </div>
            <div className="settings-field settings-field--full">
              <label className="settings-label" htmlFor="s-bio">Bio</label>
              <textarea id="s-bio" name="bio" className="settings-input settings-textarea" placeholder="Fala um pouco sobre você..." value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} />
            </div>
            <div className="settings-field settings-field--full">
              <label className="settings-label" htmlFor="s-profession">Profissão / Stack</label>
              <input id="s-profession" name="profession" className="settings-input" type="text" placeholder="Ex: Dev Full-Stack · Java & React" value={form.profession} onChange={e => set('profession', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="settings-section">
          <p className="settings-section-label">Redes sociais</p>
          <div className="settings-grid">
            <div className="settings-field">
              <label className="settings-label" htmlFor="s-github">GitHub</label>
              <input id="s-github" name="github_url" className="settings-input" type="url" placeholder="https://github.com/..." value={form.github_url} onChange={e => set('github_url', e.target.value)} />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="s-linkedin">LinkedIn</label>
              <input id="s-linkedin" name="linkedin_url" className="settings-input" type="url" placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="s-instagram">Instagram</label>
              <input id="s-instagram" name="instagram_url" className="settings-input" type="url" placeholder="https://instagram.com/..." value={form.instagram_url} onChange={e => set('instagram_url', e.target.value)} />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="s-twitter">Twitter / X</label>
              <input id="s-twitter" name="twitter_url" className="settings-input" type="url" placeholder="https://x.com/..." value={form.twitter_url} onChange={e => set('twitter_url', e.target.value)} />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="s-website">Website / Portfólio</label>
              <input id="s-website" name="website_url" className="settings-input" type="url" placeholder="https://..." value={form.website_url} onChange={e => set('website_url', e.target.value)} />
            </div>
          </div>
        </div>

        {/* API key */}
        <div className="settings-section">
          <p className="settings-section-label">Análise com IA</p>
          <label className="settings-label" htmlFor="s-aikey">API Key da Anthropic</label>
          <p className="settings-hint">Necessária para gerar análises no Tracker. Obtenha em <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">console.anthropic.com</a></p>
          <div className="settings-key-row">
            <input id="s-aikey" name="ai_key" className="settings-input" type={showKey ? 'text' : 'password'} placeholder="sk-ant-..." value={aiKey} onChange={e => setAiKey(e.target.value)} />
            <button className="settings-key-toggle" data-cursor="hover" onClick={() => setShowKey(v => !v)}>{showKey ? 'Ocultar' : 'Ver'}</button>
          </div>
        </div>

        {/* Save */}
        {error && <p className="settings-error">{error}</p>}
        <div className="settings-actions">
          <button className="settings-save-btn" data-cursor="hover" onClick={save} disabled={saving}>
            {saving ? 'Salvando…' : saved ? 'Salvo ✓' : 'Salvar alterações'}
          </button>
        </div>

        {/* Danger zone */}
        <div className="settings-section settings-danger-zone">
          <p className="settings-section-label">Conta</p>
          <p className="settings-hint">Conectado como <strong>{user.email}</strong></p>
          <button className="settings-signout-btn" data-cursor="hover" onClick={onSignOut}>Sair da conta</button>
        </div>

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { SettingsPage });
