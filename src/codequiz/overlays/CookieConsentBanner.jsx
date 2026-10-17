export default function CookieConsentBanner({ vm }) {
  const {
    saveCookieConsent
  } = vm;

  return (
    <div className="cookie-consent-banner" role="dialog" aria-live="polite" aria-label="Preferências de cookies">
      <div className="cookie-consent-card">
        <div className="cookie-consent-copy">
          <div className="cookie-consent-title">Uso de cookies</div>
          <div className="cookie-consent-text">
            Aceite cookies para melhorar dados de sessão, desempenho e experiência geral do app.
          </div>
        </div>
        <div className="cookie-consent-actions">
          <button
            className="cookie-consent-btn cookie-consent-btn-muted"
            onClick={() => saveCookieConsent('essential')}
          >
            Somente essenciais
          </button>
          <button
            className="cookie-consent-btn cookie-consent-btn-primary"
            onClick={() => saveCookieConsent('accepted')}
          >
            Aceitar cookies
          </button>
        </div>
      </div>
    </div>
  );
}
