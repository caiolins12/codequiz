import { AvatarImage, isImageAvatarValue } from '../app/helpers';

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
    screen,
    setProfileDraft,
    setScreen
  } = vm;

  return (
    <div className={`screen nickname-setup-screen ${screen === 'nickname-setup' ? 'active' : ''}`}>
      {!homeAuthUser ? (
        <div className="profile-content">
          <div className="challenge-status">Faça login para criar seu apelido.</div>
          <button className="btn btn-primary" onClick={() => setScreen('login')}>Ir para login</button>
        </div>
      ) : (
        <div className="nickname-setup-shell">
          <div className="nickname-setup-card">
            <div className="nickname-setup-kicker">Boas-vindas ao Code Quiz</div>
            <h2 className="nickname-setup-title">Escolha seu apelido antes de entrar</h2>
            <p className="nickname-setup-subtitle">
              Esse nome será exibido para outros jogadores em rankings, partidas e recompensas.
            </p>

            <div className="nickname-setup-account">
              <div className="settings-account-avatar" aria-hidden="true">
                {isImageAvatarValue(googleAccountAvatar) ? (
                  <AvatarImage src={googleAccountAvatar} fallback={<span>{googleAccountInitial}</span>} />
                ) : (
                  <span>{googleAccountInitial}</span>
                )}
              </div>
              <div className="settings-account-meta">
                <strong className="settings-account-name">{googleAccountName}</strong>
                <span className="settings-account-email">{googleAccountEmail || 'E-mail Google indisponível.'}</span>
              </div>
            </div>

            <div className="settings-personal-form nickname-setup-form">
              <label className="settings-input-label" htmlFor="nickname-setup-input">Apelido</label>
              <input
                id="nickname-setup-input"
                type="text"
                className="profile-input settings-input"
                placeholder="Digite seu apelido"
                maxLength={12}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={profileDraft.nickname}
                onChange={(event) =>
                  setProfileDraft((prev) => ({ ...prev, nickname: event.target.value }))
                }
              />
              <div className={`settings-personal-hint ${nicknameHintClass}`}>{nicknameHintText}</div>
              <button
                className="btn btn-primary btn-lg nickname-setup-save"
                disabled={profileSaving || !nicknameCanSave}
                onClick={saveProfile}
              >
                {profileSaving ? 'Salvando apelido...' : 'Entrar no app'}
              </button>
            </div>

            <div className="nickname-setup-actions">
              <button
                className="btn btn-secondary"
                onClick={handleSwitchGoogleAccount}
                disabled={googleSignInBusy}
              >
                Trocar conta Google
              </button>
              <button className="btn btn-secondary" onClick={handleSignOut}>
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
