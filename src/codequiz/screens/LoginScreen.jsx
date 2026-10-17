export default function LoginScreen({ vm }) {
  const {
    googleButtonContainerRef,
    googleSignInBusy,
    screen
  } = vm;

  return (
    <div id="screen-login" className={`screen ${screen === 'login' ? 'active' : ''}`}>
      <div className="login-shell">
        <div className="login-bg-orb login-bg-orb-a" aria-hidden="true" />
        <div className="login-bg-orb login-bg-orb-b" aria-hidden="true" />
        <div className="login-bg-grid" aria-hidden="true" />

        <div className="login-card">
          <div className="login-brand-stack">
            <div className="login-logo-wrap">
              <span className="login-logo-symbol">{'</>'}</span>
            </div>
            <h1 className="login-title">Code Quiz</h1>
            <p className="login-subtitle">
              Plataforma de treino com quizzes por tema, ranqueamento em tempo real e arena competitiva.
            </p>
          </div>

          <div className="login-pill-row" aria-hidden="true">
            <span className="login-pill">PVE por temas</span>
            <span className="login-pill">Arena PVP</span>
            <span className="login-pill">Ranking global</span>
          </div>

          <div className="login-auth-panel">
            <div className="login-auth-label">Entrar com Google</div>
            <div
              ref={googleButtonContainerRef}
              className={`login-google-gsi ${googleSignInBusy ? 'is-busy' : ''}`}
              aria-busy={googleSignInBusy}
            />
            <p className="login-auth-note">
              Autenticação segura via Google com sincronização automática de progresso no banco remoto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
