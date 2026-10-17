export default function GoogleAuthModal({ vm }) {
  const {
    closeGoogleAuthModal,
    googleAuthModalPrimaryLabel,
    googleAuthModalSubtitle,
    googleAuthModalTitle,
    googleSignInBusy,
    handleSignIn
  } = vm;

  return (
    <div className="reset-modal google-auth-modal" role="dialog" aria-modal="true" aria-label={googleAuthModalTitle} onClick={closeGoogleAuthModal}>
      <div className="reset-modal-card google-auth-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="google-auth-modal-glow" aria-hidden="true" />
        <div className="google-auth-modal-brand">
          <span className="google-mark google-auth-modal-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path fill="#EA4335" d="M12.24 10.285v3.84h5.445c-.24 1.285-.975 2.375-2.055 3.105l3.33 2.58c1.935-1.785 3.06-4.41 3.06-7.53 0-.735-.066-1.44-.19-2.115z" />
              <path fill="#34A853" d="M12 22c2.7 0 4.965-.894 6.62-2.42l-3.33-2.58c-.924.62-2.106.99-3.29.99-2.53 0-4.674-1.71-5.44-4.01l-3.44 2.65C4.76 19.87 8.13 22 12 22z" />
              <path fill="#4A90E2" d="M6.56 13.98c-.19-.57-.3-1.18-.3-1.8s.11-1.23.3-1.8l-3.44-2.65A10 10 0 0 0 2 12.18c0 1.62.39 3.15 1.12 4.45z" />
              <path fill="#FBBC05" d="M12 6.37c1.47 0 2.79.51 3.82 1.51l2.87-2.87C16.96 3.37 14.7 2.37 12 2.37c-3.87 0-7.24 2.13-8.88 5.26l3.44 2.65c.77-2.3 2.91-4.01 5.44-4.01z" />
            </svg>
          </span>
          <div className="google-auth-modal-kicker">Janela segura do Google</div>
        </div>
        <h3 className="google-auth-modal-title">{googleAuthModalTitle}</h3>
        <p className="google-auth-modal-subtitle">{googleAuthModalSubtitle}</p>
        <div className="google-auth-modal-points" aria-hidden="true">
          <div className="google-auth-modal-point">O app permanece na mesma tela</div>
          <div className="google-auth-modal-point">Seu progresso continua protegido</div>
          <div className="google-auth-modal-point">Escolha a conta em uma janela segura</div>
        </div>
        <div className="google-auth-modal-actions">
          <button className="btn btn-secondary" onClick={closeGoogleAuthModal} disabled={googleSignInBusy}>
            Cancelar
          </button>
          <button className="btn btn-google btn-lg login-google-btn google-auth-modal-btn" onClick={handleSignIn} disabled={googleSignInBusy}>
            <span className="google-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path fill="#EA4335" d="M12.24 10.285v3.84h5.445c-.24 1.285-.975 2.375-2.055 3.105l3.33 2.58c1.935-1.785 3.06-4.41 3.06-7.53 0-.735-.066-1.44-.19-2.115z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.965-.894 6.62-2.42l-3.33-2.58c-.924.62-2.106.99-3.29.99-2.53 0-4.674-1.71-5.44-4.01l-3.44 2.65C4.76 19.87 8.13 22 12 22z" />
                <path fill="#4A90E2" d="M6.56 13.98c-.19-.57-.3-1.18-.3-1.8s.11-1.23.3-1.8l-3.44-2.65A10 10 0 0 0 2 12.18c0 1.62.39 3.15 1.12 4.45z" />
                <path fill="#FBBC05" d="M12 6.37c1.47 0 2.79.51 3.82 1.51l2.87-2.87C16.96 3.37 14.7 2.37 12 2.37c-3.87 0-7.24 2.13-8.88 5.26l3.44 2.65c.77-2.3 2.91-4.01 5.44-4.01z" />
              </svg>
            </span>
            <span>{googleAuthModalPrimaryLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
