/* PrivacyPage.jsx — Política de Privacidade + direitos LGPD/GDPR */

function PrivacyPage({ user, onNavigate }) {
  const [exporting,    setExporting]    = React.useState(false);
  const [showDelete,   setShowDelete]   = React.useState(false);
  const [deleteInput,  setDeleteInput]  = React.useState('');
  const [deleting,     setDeleting]     = React.useState(false);
  const [deleteMsg,    setDeleteMsg]    = React.useState('');

  const exportData = async () => {
    if (!user || exporting) return;
    setExporting(true);
    try {
      const data = await window.Auth.exportUserData(user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `d30-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Erro ao exportar. Tente novamente.'); }
    finally { setExporting(false); }
  };

  const confirmDelete = async () => {
    if (deleteInput !== 'EXCLUIR' || !user || deleting) return;
    setDeleting(true);
    setDeleteMsg('Excluindo todos os seus dados…');
    try {
      await window.Auth.deleteAccount(user.id);
      window.location.href = '/';
    } catch (e) {
      setDeleteMsg('Erro: ' + (e.message || 'tente novamente.'));
      setDeleting(false);
    }
  };

  return (
    <div className="page active fade-in">
      <div className="privacy-wrap">

        <div className="settings-header">
          <button className="settings-back" data-cursor="hover" onClick={() => onNavigate('home')}>← Início</button>
          <h1 className="settings-title">Política de Privacidade</h1>
        </div>

        <p className="privacy-updated">Última atualização: maio de 2026 · Versão 1.0</p>

        {/* 1. Quem somos */}
        <section className="privacy-section">
          <h2 className="privacy-h2">1. Controlador dos dados</h2>
          <p>A <strong>D30</strong> é a plataforma de comunidade de desenvolvedores acessível em <em>d30.com.br</em>.
          Para dúvidas sobre privacidade, entre em contato pelo email <strong>privacidade@d30.com.br</strong>.</p>
        </section>

        {/* 2. Dados coletados */}
        <section className="privacy-section">
          <h2 className="privacy-h2">2. Dados que coletamos</h2>
          <table className="privacy-table">
            <thead>
              <tr><th>Dado</th><th>Finalidade</th><th>Base legal</th></tr>
            </thead>
            <tbody>
              <tr><td>Email e senha (hash)</td><td>Autenticação na plataforma</td><td>Contrato (Art. 6(1)(b) GDPR)</td></tr>
              <tr><td>Nome, username, bio, profissão</td><td>Exibição de perfil público</td><td>Consentimento / Contrato</td></tr>
              <tr><td>Foto de perfil</td><td>Personalização visual</td><td>Consentimento</td></tr>
              <tr><td>Sessões de estudo</td><td>Tracker, estatísticas e badges</td><td>Contrato</td></tr>
              <tr><td>Progresso no roadmap</td><td>Acompanhamento de cursos</td><td>Contrato</td></tr>
              <tr><td>Posts e respostas no fórum</td><td>Comunidade pública autenticada</td><td>Contrato / Interesse legítimo</td></tr>
              <tr><td>Presença em palestras (RSVP)</td><td>Controle de participação</td><td>Contrato</td></tr>
              <tr><td>Links sociais (GitHub, LinkedIn…)</td><td>Perfil público opcional</td><td>Consentimento explícito</td></tr>
            </tbody>
          </table>
        </section>

        {/* 3. Armazenamento */}
        <section className="privacy-section">
          <h2 className="privacy-h2">3. Onde os dados são armazenados</h2>
          <p>Os dados são armazenados no <strong>Supabase</strong> (banco PostgreSQL hospedado na AWS us-east-1),
          protegidos com Row Level Security (RLS) — cada usuário acessa apenas seus próprios dados.</p>
          <p>Dados de sessão de estudo são também armazenados localmente no seu navegador (<code>localStorage</code>)
          como cache offline. Esses dados ficam no seu dispositivo e não são transmitidos a terceiros.</p>
        </section>

        {/* 4. Retenção */}
        <section className="privacy-section">
          <h2 className="privacy-h2">4. Por quanto tempo guardamos</h2>
          <p>Seus dados ficam armazenados enquanto sua conta estiver ativa. Ao solicitar a exclusão da conta,
          todos os dados pessoais são removidos permanentemente no prazo imediato. Posts no fórum são
          anonimizados (autor substituído por "[usuário excluído]") para preservar o contexto comunitário.</p>
        </section>

        {/* 5. Compartilhamento */}
        <section className="privacy-section">
          <h2 className="privacy-h2">5. Compartilhamento de dados</h2>
          <p>Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins comerciais.
          Utilizamos apenas os seguintes prestadores de serviço essenciais:</p>
          <ul className="privacy-list">
            <li><strong>Supabase</strong> — banco de dados e autenticação</li>
            <li><strong>Vercel</strong> — hospedagem e CDN</li>
          </ul>
          <p>Dados de fórum marcados como <em>públicos</em> (nome de autor) são visíveis para todos os
          membros autenticados da plataforma.</p>
        </section>

        {/* 6. Cookies */}
        <section className="privacy-section">
          <h2 className="privacy-h2">6. Cookies e armazenamento local</h2>
          <table className="privacy-table">
            <thead>
              <tr><th>Nome</th><th>Tipo</th><th>Finalidade</th></tr>
            </thead>
            <tbody>
              <tr><td><code>sb-*</code> (Supabase)</td><td>Essencial</td><td>Sessão de autenticação</td></tr>
              <tr><td><code>d30_profile_v2</code></td><td>Essencial</td><td>Cache do perfil para carregamento offline</td></tr>
              <tr><td><code>d30_sessions_v1_*</code></td><td>Funcional</td><td>Sessões de estudo locais</td></tr>
              <tr><td><code>d30_roadmap_v3_*</code></td><td>Funcional</td><td>Progresso do roadmap</td></tr>
              <tr><td><code>d30_earned_badges_*</code></td><td>Funcional</td><td>Badges conquistadas</td></tr>
              <tr><td><code>d30_gdpr_consent</code></td><td>Essencial</td><td>Registro do seu consentimento</td></tr>
              <tr><td><code>d30_ai_key_*</code></td><td>Funcional</td><td>Chave de API de IA (salva localmente, nunca enviada)</td></tr>
            </tbody>
          </table>
        </section>

        {/* 7. Seus direitos */}
        <section className="privacy-section">
          <h2 className="privacy-h2">7. Seus direitos (LGPD / GDPR)</h2>
          <ul className="privacy-list">
            <li><strong>Acesso (Art. 15 GDPR / Art. 18 LGPD):</strong> Solicite uma cópia dos seus dados.</li>
            <li><strong>Portabilidade (Art. 20 GDPR / Art. 18 LGPD):</strong> Exporte seus dados em formato JSON.</li>
            <li><strong>Apagamento (Art. 17 GDPR / Art. 18 LGPD):</strong> Exclua sua conta e todos os dados permanentemente.</li>
            <li><strong>Retificação (Art. 16 GDPR):</strong> Corrija seus dados a qualquer momento em Configurações → Editar Perfil.</li>
            <li><strong>Oposição (Art. 21 GDPR):</strong> Desative análises em Configurações → Privacidade.</li>
          </ul>
        </section>

        {/* 8. Segurança */}
        <section className="privacy-section">
          <h2 className="privacy-h2">8. Segurança</h2>
          <ul className="privacy-list">
            <li>Comunicação criptografada via HTTPS/TLS em todas as requisições</li>
            <li>Senhas armazenadas apenas como hash bcrypt via Supabase Auth</li>
            <li>Row Level Security (RLS) no banco — cada usuário acessa só seus dados</li>
            <li>Chave de API de IA armazenada exclusivamente no seu dispositivo (localStorage)</li>
            <li>Headers de segurança HTTP: X-Frame-Options, X-Content-Type-Options, Referrer-Policy</li>
          </ul>
        </section>

        {/* Ações GDPR */}
        {user && (
          <section className="privacy-section privacy-actions-section">
            <h2 className="privacy-h2">Exercer seus direitos</h2>

            <div className="privacy-action-card">
              <div>
                <p className="privacy-action-title">Exportar meus dados</p>
                <p className="privacy-action-desc">Baixa um arquivo JSON com todos os dados que a D30 armazena sobre você. (Art. 20 GDPR)</p>
              </div>
              <button className="settings-save-btn" data-cursor="hover" onClick={exportData} disabled={exporting}>
                {exporting ? 'Exportando…' : '⬇ Exportar'}
              </button>
            </div>

            <div className="privacy-action-card privacy-action-card--danger">
              <div>
                <p className="privacy-action-title">Excluir minha conta</p>
                <p className="privacy-action-desc">Remove permanentemente todos os seus dados pessoais da plataforma. (Art. 17 GDPR)</p>
              </div>
              {!showDelete && (
                <button
                  className="gdpr-delete-btn"
                  data-cursor="hover"
                  onClick={() => setShowDelete(true)}
                >
                  Excluir conta
                </button>
              )}
            </div>

            {showDelete && (
              <div className="privacy-delete-confirm">
                <p>Para confirmar, digite <strong style={{ color: '#ef4444' }}>EXCLUIR</strong> abaixo:</p>
                <input
                  className="settings-input"
                  type="text"
                  placeholder="EXCLUIR"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                />
                {deleteMsg && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{deleteMsg}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    data-cursor="hover"
                    onClick={confirmDelete}
                    disabled={deleteInput !== 'EXCLUIR' || deleting}
                    style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: "'Inter', sans-serif", cursor: 'none', opacity: (deleteInput !== 'EXCLUIR' || deleting) ? 0.35 : 1 }}
                  >
                    {deleting ? 'Excluindo…' : 'Confirmar exclusão permanente'}
                  </button>
                  <button className="settings-key-toggle" data-cursor="hover" onClick={() => { setShowDelete(false); setDeleteInput(''); setDeleteMsg(''); }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="privacy-section">
          <h2 className="privacy-h2">Contato</h2>
          <p>Para qualquer questão relacionada à privacidade dos seus dados: <strong>privacidade@d30.com.br</strong></p>
        </section>

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { PrivacyPage });
