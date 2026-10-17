import { AvatarImage, isImageAvatarValue } from '../app/helpers';

export default function SignOutConfirmModal({ vm }) {
  const {
    closeSettingsSignOutConfirm,
    confirmSettingsSignOut,
    googleAccountAvatar,
    googleAccountEmail,
    googleAccountInitial,
    googleSignInBusy,
    settingsSignOutAccountLabel
  } = vm;

  return (
    <div
      className="reset-modal settings-signout-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar saída da conta"
      onClick={closeSettingsSignOutConfirm}
    >
      <div className="reset-modal-card settings-signout-card" onClick={(event) => event.stopPropagation()}>
        <div className="settings-signout-glow" aria-hidden="true" />
        <div className="settings-signout-kicker">Conta Google</div>
        <h3>Deseja sair da conta?</h3>
        <p>
          Você vai encerrar a sessão de <strong>{settingsSignOutAccountLabel}</strong> e retornar para a tela de login.
        </p>
        <div className="settings-signout-account">
          <div className="settings-account-avatar" aria-hidden="true">
            {isImageAvatarValue(googleAccountAvatar) ? (
              <AvatarImage src={googleAccountAvatar} fallback={<span>{googleAccountInitial}</span>} />
            ) : (
              <span>{googleAccountInitial}</span>
            )}
          </div>
          <div className="settings-signout-account-copy">
            <strong>{settingsSignOutAccountLabel}</strong>
            <span>{googleAccountEmail || 'E-mail Google indisponivel.'}</span>
          </div>
        </div>
        <div className="settings-signout-actions">
          <button className="btn btn-secondary" onClick={closeSettingsSignOutConfirm} disabled={googleSignInBusy}>
            Cancelar
          </button>
          <button className="btn btn-primary settings-signout-confirm-btn" onClick={confirmSettingsSignOut} disabled={googleSignInBusy}>
            Confirmar saída
          </button>
        </div>
      </div>
    </div>
  );
}
