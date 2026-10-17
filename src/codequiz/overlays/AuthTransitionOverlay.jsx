export default function AuthTransitionOverlay({ vm }) {
  const {
    authTransition
  } = vm;

  return (
    <div className="auth-transition-overlay">
      <div className={`auth-transition-card ${authTransition.mode === 'logout' ? 'is-logout' : ''}`}>
        <div className={`auth-transition-spinner ${authTransition.mode === 'logout' ? 'is-logout' : ''}`} />
        {authTransition.mode === 'logout' ? (
          <div className="auth-transition-kicker">Saída confirmada</div>
        ) : null}
        <div className="auth-transition-title">{authTransition.title || 'Preparando sua conta'}</div>
        <div className="auth-transition-subtitle">{authTransition.subtitle || 'Aguarde alguns segundos...'}</div>
      </div>
    </div>
  );
}
