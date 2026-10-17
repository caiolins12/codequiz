import { LogOut, PartyPopper, RefreshCw, Rocket } from 'lucide-react';
import { AvatarImage, isImageAvatarValue } from '../app/helpers';
import { Badge, Button, TextField } from '../ui';
import styles from './NicknameSetupScreen.module.css';

const HINT_STATUS = {
  error: 'error',
  success: 'success',
  checking: 'checking'
};

export default function NicknameSetupScreen({ vm }) {
  const {
    googleAccountAvatar,
    googleAccountEmail,
    googleAccountInitial,
    googleAccountName,
    googleSignInBusy,
    handleSignOut,
    handleSwitchGoogleAccount,
    homeAuthUser,
    nicknameCanSave,
    nicknameHintClass,
    nicknameHintText,
    profileDraft,
    profileSaving,
    saveProfile,
    setProfileDraft,
    setScreen
  } = vm;

  if (!homeAuthUser) {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <div className={styles.empty}>
            <h1 className={styles.title}>Faça login primeiro</h1>
            <p className={styles.subtitle}>Entre com sua conta Google para criar seu apelido.</p>
            <Button size="lg" onClick={() => setScreen('login')}>Ir para o login</Button>
          </div>
        </div>
      </div>
    );
  }

  const nickname = String(profileDraft?.nickname || '');
  const previewName = nickname.trim() || 'Seu apelido';

  return (
    <div className={styles.screen}>
      <form
        className={styles.card}
        onSubmit={(event) => {
          event.preventDefault();
          if (!profileSaving && nicknameCanSave) saveProfile();
        }}
      >
        <div className={styles.head}>
          <span className={styles.welcomeIcon} aria-hidden="true">
            <PartyPopper strokeWidth={2.4} />
          </span>
          <Badge tone="gold" upper>Boas-vindas ao Brain Versus Brain</Badge>
          <h1 className={styles.title}>Escolha seu apelido</h1>
          <p className={styles.subtitle}>
            É assim que os outros jogadores vão te ver no ranking, nas partidas e nas recompensas.
          </p>
        </div>

        <div className={styles.account}>
          <span className={styles.accountAvatar} aria-hidden="true">
            {isImageAvatarValue(googleAccountAvatar) ? (
              <AvatarImage src={googleAccountAvatar} fallback={<span>{googleAccountInitial}</span>} />
            ) : (
              <span>{googleAccountInitial}</span>
            )}
          </span>
          <span className={styles.accountText}>
            <span className={styles.accountName}>{googleAccountName}</span>
            <span className={styles.accountEmail}>{googleAccountEmail || 'E-mail Google indisponível'}</span>
          </span>
        </div>

        <TextField
          label="Apelido"
          placeholder="Ex.: dev_ninja"
          maxLength={12}
          showCounter
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="nickname"
          spellCheck={false}
          autoFocus
          value={nickname}
          status={HINT_STATUS[nicknameHintClass] || ''}
          hint={nicknameHintText}
          onChange={(event) => setProfileDraft((prev) => ({ ...prev, nickname: event.target.value }))}
        />

        <div className={styles.preview} aria-label="Prévia do seu perfil">
          <span className={styles.previewMain}>
            <span className={styles.previewLabel}>Assim você aparece</span>
            <span className={styles.previewName}>{previewName}</span>
          </span>
          <span className={styles.previewChips}>
            <Badge tone="tier-bronze" variant="solid" size="sm">Bronze</Badge>
            <Badge tone="blue" variant="solid" size="sm">Nv. 1</Badge>
          </span>
        </div>

        <Button
          type="submit"
          size="xl"
          variant="success"
          icon={Rocket}
          block
          loading={profileSaving}
          disabled={!nicknameCanSave}
        >
          Começar a jogar
        </Button>

        <div className={styles.secondary}>
          <Button variant="ghost" size="sm" block icon={RefreshCw} onClick={handleSwitchGoogleAccount} disabled={googleSignInBusy}>
            Trocar conta
          </Button>
          <Button variant="ghost" size="sm" block icon={LogOut} onClick={handleSignOut}>
            Sair
          </Button>
        </div>
      </form>
    </div>
  );
}
