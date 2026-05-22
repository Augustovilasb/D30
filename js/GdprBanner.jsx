/* GdprBanner.jsx — banner de consentimento (LGPD / GDPR ePrivacy) */

function GdprBanner({ onNavigate }) {
  const [visible, setVisible] = React.useState(() => {
    try { return !localStorage.getItem('d30_gdpr_consent'); }
    catch { return false; }
  });

  if (!visible) return null;

  const record = (status) => {
    try {
      localStorage.setItem('d30_gdpr_consent', JSON.stringify({
        status,
        ts:      new Date().toISOString(),
        version: '1.0',
      }));
    } catch {}
    setVisible(false);
  };

  return (
    <div className="gdpr-banner" role="dialog" aria-modal="false" aria-label="Consentimento de privacidade">
      <div className="gdpr-banner-inner">
        <p className="gdpr-banner-text">
          Usamos cookies essenciais para autenticação e armazenamos seus dados de estudo para oferecer a experiência completa da plataforma.{' '}
          <button
            className="gdpr-banner-link"
            data-cursor="hover"
            onClick={() => onNavigate && onNavigate('privacy')}
          >
            Ver Política de Privacidade
          </button>
        </p>
        <div className="gdpr-banner-actions">
          <button
            className="gdpr-btn gdpr-btn--secondary"
            data-cursor="hover"
            onClick={() => record('essential_only')}
          >
            Só essenciais
          </button>
          <button
            className="gdpr-btn gdpr-btn--primary"
            data-cursor="hover"
            onClick={() => record('accepted')}
          >
            Aceitar tudo
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GdprBanner });
