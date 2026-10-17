import { Headphones, Info, LogIn, LogOut, Music2, RefreshCw, ShieldCheck, UserRound, Volume2 } from 'lucide-react';
import { AvatarImage, isImageAvatarValue } from '../app/helpers';
import { Badge, Button, Card, EmptyState, PageHeader, RangeSlider, SectionHeader, Switch, TextField } from '../ui';
import styles from './SettingsScreen.module.css';

const HINT_STATUS = {
  error: 'error',
  success: 'success',
  checking: 'checking'
};

function AudioSetting({ icon: Icon, title, desc, enabled, volume, onToggle, onVolume, children }) {
  return (
    <div className={styles.setting}>
      <div className={styles.settingHead}>
        <span className={styles.settingIcon} aria-hidden="true"><Icon strokeWidth={2.4} /></span>
        <span className={styles.settingText}>
          <span className={styles.settingTitle}>{title}</span>
          <span className={styles.settingDesc}>{desc}</span>
        </span>
        <Switch checked={!!enabled} onChange={onToggle} label={`Ativar ${title.toLowerCase()}`} />
      </div>
      <div className={styles.volume}>
        <RangeSlider value={volume} onChange={onVolume} label={`Volume: ${title.toLowerCase()}`} disabled={!enabled} />
        <span className={styles.volumeValue}>{Math.round(Math.max(0, Math.min(1, Number(volume) || 0)) * 100)}%</span>
      </div>
      {children}
    </div>
  );
}

export default function SettingsScreen({ vm }) {
  const {
    audioSettings,
    buildBadgeValue,
    googleAccountAvatar,
    googleAccountEmail,
    googleAccountInitial,
    googleAccountName,
    googleSignInBusy,
    handleSwitchGoogleAccount,
    homeAuthUser,
    nicknameCanSave,
    nicknameHintClass,
    nicknameHintText,
    onboardingRequired,
    openAdminScreen,
    openSettingsSignOutConfirm,
    playSfx,
    profileDraft,
    profileSaving,
    saveProfile,
    setProfileDraft,
    setScreen,
    triggerAppBackNavigation,
    updateAudioSetting
  } = vm;

  const header = (
    <PageHeader
      title="Configurações"
      subtitle="Conta, áudio e informações do aplicativo."
      onBack={() => triggerAppBackNavigation('button')}
    />
  );

  if (!homeAuthUser) {
    return (
      <div className={styles.screen}>
        {header}
        <Card padding="lg">
          <EmptyState
            icon={LogIn}
            title="Entre para continuar"
            text="Faça login com sua conta Google para abrir as configurações."
            action={<Button icon={LogIn} onClick={() => setScreen('login')}>Ir para o login</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      {header}

      <div className={styles.layout}>
        <div className={styles.column}>
          <Card padding="lg" className={styles.card}>
            <SectionHeader title="Conta" subtitle="Conta Google conectada e apelido público." icon={UserRound} />

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
              <Badge tone="lime" size="sm">Google</Badge>
            </div>

            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault();
                if (!profileSaving && nicknameCanSave) saveProfile();
              }}
            >
              <TextField
                label="Apelido"
                placeholder="Seu apelido"
                maxLength={12}
                showCounter
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={profileDraft?.nickname || ''}
                status={HINT_STATUS[nicknameHintClass] || ''}
                hint={nicknameHintText}
                onChange={(event) => setProfileDraft((prev) => ({ ...prev, nickname: event.target.value }))}
              />
              <p className={styles.note}>O nome da conta acompanha o nome da sua conta Google.</p>
              <Button type="submit" variant="primary" block loading={profileSaving} disabled={!nicknameCanSave}>
                {onboardingRequired ? 'Salvar apelido e continuar' : 'Salvar apelido'}
              </Button>
            </form>

            <hr className={styles.divider} />

            <div className={styles.actions}>
              <Button variant="secondary" icon={RefreshCw} onClick={handleSwitchGoogleAccount} disabled={googleSignInBusy}>
                Trocar conta
              </Button>
              <Button variant="danger" icon={LogOut} onClick={openSettingsSignOutConfirm} disabled={googleSignInBusy}>
                Sair
              </Button>
            </div>
          </Card>
        </div>

        <div className={styles.column}>
          <Card padding="lg" className={styles.card}>
            <SectionHeader title="Áudio" subtitle="Música e efeitos sonoros do jogo." icon={Headphones} />
            <AudioSetting
              icon={Music2}
              title="Música"
              desc="Trilha calma nos menus e intensa nas partidas."
              enabled={audioSettings?.musicEnabled}
              volume={audioSettings?.musicVolume}
              onToggle={(value) => updateAudioSetting('musicEnabled', value)}
              onVolume={(value) => updateAudioSetting('musicVolume', value)}
            />
            <AudioSetting
              icon={Volume2}
              title="Efeitos sonoros"
              desc="Sons de botões, respostas e recompensas."
              enabled={audioSettings?.sfxEnabled}
              volume={audioSettings?.sfxVolume}
              onToggle={(value) => updateAudioSetting('sfxEnabled', value)}
              onVolume={(value) => updateAudioSetting('sfxVolume', value)}
            >
              <Button variant="ghost" size="sm" icon={Volume2} onClick={() => playSfx('notify')} disabled={!audioSettings?.sfxEnabled}>
                Testar som
              </Button>
            </AudioSetting>
          </Card>

          <Card padding="lg" className={styles.card}>
            <SectionHeader title="Sobre o app" icon={Info} />
            <p className={styles.version}>
              <span className={styles.versionLabel}>Versão em uso</span>
              <span>{buildBadgeValue}</span>
            </p>
            <Button variant="ghost" icon={ShieldCheck} onClick={openAdminScreen}>
              Monitoramento (admin)
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
