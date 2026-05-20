/* SettingsPage.jsx — account settings: email, password, AI key, privacy, danger zone */

function SettingsPage({ user, onSignOut, onNavigate }) {
  /* Email change */
  const [showEmailForm,  setShowEmailForm]  = React.useState(false);
  const [newEmail,       setNewEmail]       = React.useState('');
  const [emailMsg,       setEmailMsg]       = React.useState('');
  const [emailErr,       setEmailErr]       = React.useState('');
  const [emailSaving,    setEmailSaving]    = React.useState(false);

  /* Password change */
  const [showPwForm,     setShowPwForm]     = React.useState(false);
  const [currentPw,      setCurrentPw]      = React.useState('');
  const [newPw,          setNewPw]          = React.useState('');
  const [confirmPw,      setConfirmPw]      = React.useState('');
  const [pwMsg,          setPwMsg]          = React.useState('');
  const [pwErr,          setPwErr]          = React.useState('');
  const [pwSaving,       setPwSaving]       = React.useState(false);

  /* AI key */
  const [aiKey,          setAiKey]          = React.useState(() => { try { return localStorage.getItem('d30_ai_key') || ''; } catch { return ''; } });
  const [showKey,        setShowKey]        = React.useState(false);
  const [keySaved,       setKeySaved]       = React.useState(false);

  /* Privacy toggles */
  const [profilePublic,  setProfilePublic]  = React.useState(true);
  const [notifications,  setNotifications]  = React.useState(() => { try { return localStorage.getItem('d30_notifications') !== 'false'; } catch { return true; } });
  const [analytics,      setAnalytics]      = React.useState(() => { try { return localStorage.getItem('d30_analytics') !== 'false'; } catch { return true; } });
  const [privacySaving,  setPrivacySaving]  = React.useState(false);
  const [privacySaved,   setPrivacySaved]   = React.useState(false);

  /* Delete account */
  const [showDeleteForm, setShowDeleteForm] = React.useState(false);
  const [deleteInput,    setDeleteInput]    = React.useState('');
  const [deleteMsg,      setDeleteMsg]      = React.useState('');

  /* Load profile_public from Supabase on mount */
  React.useEffect(() => {
    if (!window.sb || !user.id) return;
    window.sb.from('profiles').select('profile_public').eq('id', user.id).single()
      .then(({ data }) => {
        if (data && typeof data.profile_public === 'boolean') {
          setProfilePublic(data.profile_public);
        }
      })
      .catch(() => {});
  }, [user.id]);

  /* Email change */
  const saveEmail = async () => {
    if (!newEmail.trim()) { setEmailErr('Informe o novo email.'); return; }
    setEmailSaving(true); setEmailErr('');
    try {
      const { error } = await window.sb.auth.updateUser({ email: newEmail.trim() });
      if (error) throw new Error(error.message);
      setEmailMsg('Confirme nos dois emails para concluir a alteração.');
      setNewEmail('');
      setShowEmailForm(false);
    } catch (err) {
      setEmailErr(err.message || 'Erro ao atualizar email.');
    } finally { setEmailSaving(false); }
  };

  /* Password change */
  const savePw = async () => {
    if (!newPw) { setPwErr('Informe a nova senha.'); return; }
    if (newPw !== confirmPw) { setPwErr('As senhas não coincidem.'); return; }
    if (newPw.length < 6) { setPwErr('A senha deve ter pelo menos 6 caracteres.'); return; }
    setPwSaving(true); setPwErr('');
    try {
      const { error } = await window.sb.auth.updateUser({ password: newPw });
      if (error) throw new Error(error.message);
      setPwMsg('Senha alterada com sucesso.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setShowPwForm(false);
    } catch (err) {
      setPwErr(err.message || 'Erro ao alterar senha.');
    } finally { setPwSaving(false); }
  };

  /* AI key save */
  const saveKey = () => {
    try { localStorage.setItem('d30_ai_key', aiKey.trim()); } catch {}
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  /* Privacy save */
  const savePrivacy = async () => {
    setPrivacySaving(true);
    try {
      try { localStorage.setItem('d30_notifications', String(notifications)); } catch {}
      try { localStorage.setItem('d30_analytics', String(analytics)); } catch {}
      if (window.sb && user.id) {
        await window.sb.from('profiles').upsert({ id: user.id, profile_public: profilePublic }, { onConflict: 'id' });
      }
      setPrivacySaved(true);
      setTimeout(() => setPrivacySaved(false), 2500);
    } catch {}
    finally { setPrivacySaving(false); }
  };

  /* Delete confirm */
  const confirmDelete = async () => {
    if (deleteInput !== 'EXCLUIR') return;
    try {
      await window.sb.auth.signOut();
    } catch {}
    setDeleteMsg('Solicitação de exclusão registrada. Sua conta será analisada para remoção.');
    onSignOut();
  };

  return (
    <div className="page active fade-in">
      <div className="settings-wrap">

        <div className="settings-header">
          <button className="settings-back" data-cursor="hover" onClick={() => onNavigate('profile')}>&#8592; Perfil</button>
          <h1 className="settings-title">Configurações</h1>
        </div>

        {/* Conta */}
        <div className="settings-section">
          <p className="settings-section-label">Conta</p>
          <label className="settings-label">Email atual</label>
          <p className="settings-hint" style={{ marginBottom: 12 }}>{user.email}</p>

          {!showEmailForm && (
            <button className="settings-key-toggle" data-cursor="hover" onClick={() => { setShowEmailForm(true); setEmailErr(''); setEmailMsg(''); }}>
              Alterar email
            </button>
          )}
          {showEmailForm && (
            <div style={{ marginTop: 10 }}>
              <label className="settings-label" htmlFor="s-new-email">Novo email</label>
              <input id="s-new-email" className="settings-input" type="email" placeholder="novo@email.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ marginBottom: 8 }} />
              {emailErr && <p className="settings-error">{emailErr}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="settings-save-btn" data-cursor="hover" onClick={saveEmail} disabled={emailSaving} style={{ padding: '8px 20px', fontSize: 13 }}>
                  {emailSaving ? 'Salvando…' : 'Confirmar'}
                </button>
                <button className="settings-key-toggle" data-cursor="hover" onClick={() => { setShowEmailForm(false); setEmailErr(''); }}>Cancelar</button>
              </div>
            </div>
          )}
          {emailMsg && <p className="settings-hint" style={{ marginTop: 8, color: 'var(--text)' }}>{emailMsg}</p>}
        </div>

        {/* Segurança */}
        <div className="settings-section">
          <p className="settings-section-label">Segurança</p>

          {!showPwForm && (
            <button className="settings-key-toggle" data-cursor="hover" onClick={() => { setShowPwForm(true); setPwErr(''); setPwMsg(''); }}>
              Alterar senha
            </button>
          )}
          {showPwForm && (
            <div style={{ marginTop: 10 }}>
              <div className="settings-grid">
                <div className="settings-field settings-field--full">
                  <label className="settings-label" htmlFor="s-cur-pw">Senha atual</label>
                  <input id="s-cur-pw" className="settings-input" type="password" placeholder="••••••••" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                  <p className="settings-hint">Apenas para confirmação visual</p>
                </div>
                <div className="settings-field">
                  <label className="settings-label" htmlFor="s-new-pw">Nova senha</label>
                  <input id="s-new-pw" className="settings-input" type="password" placeholder="••••••••" value={newPw} onChange={e => setNewPw(e.target.value)} />
                </div>
                <div className="settings-field">
                  <label className="settings-label" htmlFor="s-confirm-pw">Confirmar nova senha</label>
                  <input id="s-confirm-pw" className="settings-input" type="password" placeholder="••••••••" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                </div>
              </div>
              {pwErr && <p className="settings-error">{pwErr}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="settings-save-btn" data-cursor="hover" onClick={savePw} disabled={pwSaving} style={{ padding: '8px 20px', fontSize: 13 }}>
                  {pwSaving ? 'Salvando…' : 'Alterar senha'}
                </button>
                <button className="settings-key-toggle" data-cursor="hover" onClick={() => { setShowPwForm(false); setPwErr(''); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }}>Cancelar</button>
              </div>
            </div>
          )}
          {pwMsg && <p className="settings-hint" style={{ marginTop: 8, color: 'var(--text)' }}>{pwMsg}</p>}
        </div>

        {/* Análise com IA */}
        <div className="settings-section">
          <p className="settings-section-label">Análise com IA</p>
          <label className="settings-label" htmlFor="s-aikey">API Key da Anthropic</label>
          <p className="settings-hint">Necessária para gerar análises no Tracker. Obtenha em <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">console.anthropic.com</a></p>
          <div className="settings-key-row">
            <input id="s-aikey" name="ai_key" className="settings-input" type={showKey ? 'text' : 'password'} placeholder="sk-ant-..." value={aiKey} onChange={e => setAiKey(e.target.value)} />
            <button className="settings-key-toggle" data-cursor="hover" onClick={() => setShowKey(v => !v)}>{showKey ? 'Ocultar' : 'Ver'}</button>
          </div>
          <div className="settings-actions" style={{ paddingTop: 10 }}>
            <button className="settings-save-btn" data-cursor="hover" onClick={saveKey}>
              {keySaved ? 'Salvo ✓' : 'Salvar chave'}
            </button>
          </div>
        </div>

        {/* Privacidade */}
        <div className="settings-section">
          <p className="settings-section-label">Privacidade</p>

          <div className="settings-toggle-row">
            <div>
              <label className="settings-label" style={{ marginBottom: 0 }}>Perfil público</label>
              <p>Permite encontrar seu perfil via /perfil/:username</p>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" checked={profilePublic} onChange={e => setProfilePublic(e.target.checked)} />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>

          <div className="settings-toggle-row">
            <div>
              <label className="settings-label" style={{ marginBottom: 0 }}>Receber notificações por email</label>
              <p>Novidades e atualizações da comunidade</p>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>

          <div className="settings-toggle-row">
            <div>
              <label className="settings-label" style={{ marginBottom: 0 }}>Permitir análise de uso anônima</label>
              <p>Ajuda a melhorar a plataforma sem identificar você</p>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>

          <div className="settings-actions" style={{ paddingTop: 10 }}>
            <button className="settings-save-btn" data-cursor="hover" onClick={savePrivacy} disabled={privacySaving}>
              {privacySaving ? 'Salvando…' : privacySaved ? 'Salvo ✓' : 'Salvar preferências'}
            </button>
          </div>
        </div>

        {/* Zona de perigo */}
        <div className="settings-section settings-danger-zone">
          <p className="settings-section-label">Zona de perigo</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="settings-signout-btn" data-cursor="hover" onClick={onSignOut}>Sair da conta</button>

            {!showDeleteForm && (
              <button
                data-cursor="hover"
                onClick={() => { setShowDeleteForm(true); setDeleteInput(''); setDeleteMsg(''); }}
                style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid #ef444433', background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: 'none', transition: 'background .15s', textAlign: 'left' }}
              >
                Excluir conta
              </button>
            )}

            {showDeleteForm && (
              <div style={{ padding: '16px', border: '1px solid #ef444433', borderRadius: 10, background: '#ef44440a' }}>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.6 }}>
                  Esta ação é irreversível. Para confirmar, digite <strong style={{ color: '#ef4444' }}>EXCLUIR</strong> abaixo.
                </p>
                <input
                  className="settings-input"
                  type="text"
                  placeholder="EXCLUIR"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  style={{ marginBottom: 10 }}
                />
                {deleteMsg && <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{deleteMsg}</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    data-cursor="hover"
                    onClick={confirmDelete}
                    disabled={deleteInput !== 'EXCLUIR'}
                    style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: deleteInput !== 'EXCLUIR' ? 'not-allowed' : 'none', opacity: deleteInput !== 'EXCLUIR' ? 0.4 : 1, transition: 'opacity .15s' }}
                  >
                    Confirmar exclusão
                  </button>
                  <button className="settings-key-toggle" data-cursor="hover" onClick={() => { setShowDeleteForm(false); setDeleteInput(''); }}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { SettingsPage });
