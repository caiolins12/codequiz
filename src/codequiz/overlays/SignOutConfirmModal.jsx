import { LogOut } from 'lucide-react';
import { AvatarImage, isImageAvatarValue } from '../app/helpers';
import { Button, Modal } from '../ui';
import styles from './Overlays.module.css';

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
    <Modal
      title="Sair da conta?"
      subtitle="Você volta para a tela de login."
      icon={LogOut}
      tone="red"
      size="sm"
      onClose={googleSignInBusy ? null : closeSettingsSignOutConfirm}
      footer={(
        <>
          <Button variant="secondary" onClick={closeSettingsSignOutConfirm} disabled={googleSignInBusy}>Cancelar</Button>
          <Button variant="danger" icon={LogOut} onClick={confirmSettingsSignOut} loading={googleSignInBusy}>Sair</Button>
        </>
      )}
    >
      <div className={styles.stack}>
        <div className={styles.account}>
          <span className={styles.accountAvatar} aria-hidden="true">
            {isImageAvatarValue(googleAccountAvatar) ? (
              <AvatarImage src={googleAccountAvatar} fallback={<span>{googleAccountInitial}</span>} />
            ) : (
              <span>{googleAccountInitial}</span>
            )}
          </span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>{settingsSignOutAccountLabel}</span>
            <span className={styles.rowSub}>{googleAccountEmail || 'E-mail Google indisponível'}</span>
          </span>
        </div>
        <p className={styles.text}>Seu progresso fica salvo na nuvem. É só entrar de novo com a mesma conta Google.</p>
      </div>
    </Modal>
  );
}
