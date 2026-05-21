/* EditProfilePage.jsx — edit profile info and social links */

function EditProfilePage({ user, onUpdate, onNavigate }) {
  const [form, setForm] = React.useState({
    full_name:     user.name           || '',
    username:      user.username       || '',
    bio:           user.bio            || '',
    profession:    user.profession     || '',
    avatar_url:    user.avatar_url     || '',
    github_url:    user.github_url     || '',
    linkedin_url:  user.linkedin_url   || '',
    instagram_url: user.instagram_url  || '',
    twitter_url:   user.twitter_url    || '',
    website_url:   user.website_url    || '',
  });
  const [saving,    setSaving]    = React.useState(false);
  const [saved,     setSaved]     = React.useState(false);
  const [error,     setError]     = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Selecione uma imagem válida.'); return; }
    if (file.size > 3 * 1024 * 1024) { setError('Imagem muito grande. Máximo 3MB.'); return; }
    setUploading(true); setError('');
    try {
      const ext  = file.name.split('.').pop().toLowerCase() || 'jpg';
      const path = `${user.id}.${ext}`;
      const { error: upErr } = await window.sb.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = window.sb.storage.from('avatars').getPublicUrl(path);
      set('avatar_url', publicUrl + '?t=' + Date.now());
    } catch (err) {
      setError('Erro ao enviar foto: ' + (err.message || 'tente novamente.'));
    } finally { setUploading(false); e.target.value = ''; }
  };

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
      try {
        localStorage.setItem('d30_profile_v2', JSON.stringify({
          full_name:     form.full_name.trim(),
          username:      form.username.trim(),
          bio:           form.bio.trim()           || null,
          profession:    form.profession.trim()    || null,
          avatar_url:    form.avatar_url.trim()    || null,
          github_url:    form.github_url.trim()    || null,
          linkedin_url:  form.linkedin_url.trim()  || null,
          instagram_url: form.instagram_url.trim() || null,
          twitter_url:   form.twitter_url.trim()   || null,
          website_url:   form.website_url.trim()   || null,
        }));
      } catch {}
      const initials = form.full_name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase() || user.initials;
      onUpdate({
        ...user,
        name:          form.full_name.trim(),
        username:      form.username.trim(),
        bio:           form.bio.trim()           || null,
        profession:    form.profession.trim()    || null,
        avatar_url:    form.avatar_url.trim()    || null,
        github_url:    form.github_url.trim()    || null,
        linkedin_url:  form.linkedin_url.trim()  || null,
        instagram_url: form.instagram_url.trim() || null,
        twitter_url:   form.twitter_url.trim()   || null,
        website_url:   form.website_url.trim()   || null,
        initials,
      });
      onNavigate('profile');
    } catch (err) {
      setError(err.message || 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  const previewInitials = form.full_name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase() || user.initials;

  return (
    <div className="page active fade-in">
      <div className="settings-wrap">

        <div className="settings-header">
          <button className="settings-back" data-cursor="hover" onClick={() => onNavigate('profile')}>&#8592; Perfil</button>
          <h1 className="settings-title">Editar Perfil</h1>
        </div>

        {/* Foto de perfil */}
        <div className="settings-section">
          <p className="settings-section-label">Foto de perfil</p>
          <div className="settings-avatar-row">
            <div
              className={'settings-avatar-preview settings-avatar-clickable' + (uploading ? ' uploading' : '')}
              onClick={() => !uploading && fileInputRef.current?.click()}
              data-cursor="hover"
            >
              {form.avatar_url
                ? <img src={form.avatar_url} alt="Avatar" className="settings-avatar-img" onError={e => { e.target.style.display = 'none'; }} />
                : <div className="settings-avatar-init" style={{ background: user.color || '#6d5ce6' }}>{previewInitials}</div>
              }
              <span className="settings-avatar-spinner" />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
            <div className="settings-avatar-input">
              <button
                className="settings-avatar-upload-btn"
                data-cursor="hover"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                type="button"
              >
                {uploading ? 'Enviando…' : 'Enviar foto do dispositivo'}
              </button>
              <p className="settings-hint">JPG, PNG ou GIF · Máx 3MB</p>
              <label className="settings-label" htmlFor="ep-avatar" style={{ marginTop: '0.75rem', display: 'block' }}>Ou cole uma URL</label>
              <input id="ep-avatar" name="avatar_url" className="settings-input" type="url" placeholder="https://..." value={form.avatar_url} onChange={e => set('avatar_url', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Sobre você */}
        <div className="settings-section">
          <p className="settings-section-label">Sobre você</p>
          <div className="settings-grid">
            <div className="settings-field">
              <label className="settings-label" htmlFor="ep-fullname">Nome completo</label>
              <input id="ep-fullname" name="full_name" className="settings-input" type="text" placeholder="Seu nome" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="ep-username">Username</label>
              <input id="ep-username" name="username" className="settings-input" type="text" placeholder="seunome" value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
            </div>
            <div className="settings-field settings-field--full">
              <label className="settings-label" htmlFor="ep-bio">Bio</label>
              <textarea id="ep-bio" name="bio" className="settings-input settings-textarea" placeholder="Fala um pouco sobre você..." value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} />
            </div>
            <div className="settings-field settings-field--full">
              <label className="settings-label" htmlFor="ep-profession">Profissão / Stack</label>
              <input id="ep-profession" name="profession" className="settings-input" type="text" placeholder="Ex: Dev Full-Stack · Java & React" value={form.profession} onChange={e => set('profession', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Redes sociais */}
        <div className="settings-section">
          <p className="settings-section-label">Redes sociais</p>
          <div className="settings-grid">
            <div className="settings-field">
              <label className="settings-label" htmlFor="ep-github">GitHub</label>
              <input id="ep-github" name="github_url" className="settings-input" type="url" placeholder="https://github.com/..." value={form.github_url} onChange={e => set('github_url', e.target.value)} />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="ep-linkedin">LinkedIn</label>
              <input id="ep-linkedin" name="linkedin_url" className="settings-input" type="url" placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="ep-instagram">Instagram</label>
              <input id="ep-instagram" name="instagram_url" className="settings-input" type="url" placeholder="https://instagram.com/..." value={form.instagram_url} onChange={e => set('instagram_url', e.target.value)} />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="ep-twitter">Twitter / X</label>
              <input id="ep-twitter" name="twitter_url" className="settings-input" type="url" placeholder="https://x.com/..." value={form.twitter_url} onChange={e => set('twitter_url', e.target.value)} />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="ep-website">Website / Portfólio</label>
              <input id="ep-website" name="website_url" className="settings-input" type="url" placeholder="https://..." value={form.website_url} onChange={e => set('website_url', e.target.value)} />
            </div>
          </div>
        </div>

        {error && <p className="settings-error">{error}</p>}
        <div className="settings-actions">
          <button className="settings-save-btn" data-cursor="hover" onClick={save} disabled={saving}>
            {saving ? 'Salvando…' : saved ? 'Salvo ✓' : 'Salvar alterações'}
          </button>
        </div>

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { EditProfilePage });
