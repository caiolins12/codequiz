import { AvatarImage, isImageAvatarValue } from '../app/helpers';

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
    screen,
    setProfileDraft,
    setScreen,
    settingsSections,
    settingsUpdatedAtValue,
    toggleSettingsSection,
    triggerAppBackNavigation,
    updateAudioSetting
  } = vm;

  return (
    <div className={`screen settings-screen ${screen === 'settings' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>{'Configura\u00e7\u00f5es'}</h2>
      </div>
      {!homeAuthUser ? (
        <div className="profile-content">
          <div className="challenge-status">{'Fa\u00e7a login para abrir as configura\u00e7\u00f5es.'}</div>
          <button className="btn btn-primary" onClick={() => setScreen('login')}>Ir para login</button>
        </div>
      ) : (
        <div className="audio-settings">
          <div className="settings-personal-data">
            <div className="settings-section-head">
              <div className="audio-option-header">
                <div className="audio-option-icon" aria-hidden="true">{'\u{1F464}'}</div>
                <div className="audio-option-text">
                  <div className="settings-personal-title">Conta</div>
                  <div className="settings-personal-subtitle">
                    {onboardingRequired
                      ? 'Expanda para confirmar sua conta Google e definir o apelido.'
                      : 'Conta Google conectada e apelido p\u00fablico do perfil.'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="settings-section-toggle"
                aria-expanded={settingsSections.account === true}
                aria-label={settingsSections.account ? 'Recolher se\u00e7\u00e3o Conta' : 'Expandir se\u00e7\u00e3o Conta'}
                onClick={() => toggleSettingsSection('account')}
              >
                <span className={`settings-section-chevron ${settingsSections.account ? 'is-open' : ''}`} aria-hidden="true">{'\u203A'}</span>
              </button>
            </div>
            {settingsSections.account ? (
              <div className="settings-section-content">
                <div className="settings-account-card">
                  <div className="settings-account-avatar" aria-hidden="true">
                    {isImageAvatarValue(googleAccountAvatar) ? (
                      <AvatarImage src={googleAccountAvatar} fallback={<span>{googleAccountInitial}</span>} />
                    ) : (
                      <span>{googleAccountInitial}</span>
                    )}
                  </div>
                  <div className="settings-account-meta">
                    <strong className="settings-account-name">{googleAccountName}</strong>
                    <span className="settings-account-email">
                      {googleAccountEmail || 'E-mail Google indispon\u00edvel.'}
                    </span>
                    <span className="settings-account-status">Conta Google ativa</span>
                  </div>
                </div>
                <div className="settings-account-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={handleSwitchGoogleAccount}
                    disabled={googleSignInBusy}
                  >
                    Trocar conta Google
                  </button>
                  <button className="btn btn-secondary" onClick={openSettingsSignOutConfirm} disabled={googleSignInBusy}>
                    Sair
                  </button>
                </div>
                <div className="settings-personal-form">
                  <label className="settings-input-label" htmlFor="settings-nickname">Apelido</label>
                  <input
                    id="settings-nickname"
                    type="text"
                    className="profile-input settings-input"
                    placeholder="Seu apelido"
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
                  <div className="settings-personal-hint">O nome da conta segue o nome da sua conta Google.</div>
                  <button
                    className="btn btn-primary"
                    disabled={profileSaving || !nicknameCanSave}
                    onClick={saveProfile}
                  >
                    {profileSaving ? 'Salvando...' : (onboardingRequired ? 'Salvar apelido e continuar' : 'Salvar apelido')}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="audio-option">
            <div className="settings-section-head">
              <div className="audio-option-header">
                <div className="audio-option-icon" aria-hidden="true">{'\u{1F3A7}'}</div>
                <div className="audio-option-text">
                  <div className="audio-option-title">{'\u00c1udio'}</div>
                  <div className="audio-option-desc">{'Controle m\u00fasica e efeitos sonoros em uma \u00fanica se\u00e7\u00e3o.'}</div>
                </div>
              </div>
              <button
                type="button"
                className="settings-section-toggle"
                aria-expanded={settingsSections.audio === true}
                aria-label={settingsSections.audio ? 'Recolher se\u00e7\u00e3o \u00c1udio' : 'Expandir se\u00e7\u00e3o \u00c1udio'}
                onClick={() => toggleSettingsSection('audio')}
              >
                <span className={`settings-section-chevron ${settingsSections.audio ? 'is-open' : ''}`} aria-hidden="true">{'\u203A'}</span>
              </button>
            </div>
            {settingsSections.audio ? (
              <div className="settings-section-content">
                <div className="settings-audio-card">
                  <div className="settings-audio-card-head">
                    <div className="settings-audio-card-copy">
                      <div className="settings-audio-card-title">{'M\u00fasica'}</div>
                      <div className="settings-audio-card-desc">Menu com trilha calma e partidas com trilha intensa.</div>
                    </div>
                    <label className="settings-switch" aria-label={'Ativar m\u00fasica'}>
                      <input
                        type="checkbox"
                        checked={audioSettings.musicEnabled}
                        onChange={(event) => updateAudioSetting('musicEnabled', event.target.checked)}
                      />
                      <span className="settings-switch-track">
                        <span className="settings-switch-thumb" />
                      </span>
                    </label>
                  </div>
                  <div className="audio-slider-row">
                    <input
                      className="vol-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={audioSettings.musicVolume}
                      onChange={(event) => updateAudioSetting('musicVolume', Number(event.target.value))}
                    />
                    <span className="vol-label">{Math.round(audioSettings.musicVolume * 100)}%</span>
                  </div>
                </div>

                <div className="settings-audio-card">
                  <div className="settings-audio-card-head">
                    <div className="settings-audio-card-copy">
                      <div className="settings-audio-card-title">Efeitos sonoros</div>
                      <div className="settings-audio-card-desc">{'Som para bot\u00f5es, respostas e a\u00e7\u00f5es do jogo.'}</div>
                    </div>
                    <label className="settings-switch" aria-label="Ativar efeitos sonoros">
                      <input
                        type="checkbox"
                        checked={audioSettings.sfxEnabled}
                        onChange={(event) => updateAudioSetting('sfxEnabled', event.target.checked)}
                      />
                      <span className="settings-switch-track">
                        <span className="settings-switch-thumb" />
                      </span>
                    </label>
                  </div>
                  <div className="audio-slider-row">
                    <input
                      className="vol-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={audioSettings.sfxVolume}
                      onChange={(event) => updateAudioSetting('sfxVolume', Number(event.target.value))}
                    />
                    <span className="vol-label">{Math.round(audioSettings.sfxVolume * 100)}%</span>
                  </div>
                  <button className="btn btn-secondary settings-sfx-test" onClick={() => playSfx('notify')}>
                    Testar som
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="audio-option settings-admin-tools">
            <div className="settings-section-head">
              <div className="audio-option-header">
                <div className="audio-option-icon" aria-hidden="true">{'\u{1F6E0}\uFE0F'}</div>
                <div className="audio-option-text">
                  <div className="audio-option-title">Build e monitoramento</div>
                  <div className="audio-option-desc">{'Informa\u00e7\u00f5es da build atual e acesso administrativo.'}</div>
                </div>
              </div>
              <button
                type="button"
                className="settings-section-toggle"
                aria-expanded={settingsSections.admin === true}
                aria-label={settingsSections.admin ? 'Recolher se\u00e7\u00e3o Build e monitoramento' : 'Expandir se\u00e7\u00e3o Build e monitoramento'}
                onClick={() => toggleSettingsSection('admin')}
              >
                <span className={`settings-section-chevron ${settingsSections.admin ? 'is-open' : ''}`} aria-hidden="true">{'\u203A'}</span>
              </button>
            </div>
            {settingsSections.admin ? (
              <div className="settings-section-content">
                <div className="settings-app-version">
                  <span className="settings-app-version-code">{buildBadgeValue}</span>
                </div>
                <button className="btn btn-secondary settings-admin-btn" onClick={openAdminScreen}>
                  Abrir monitoramento admin
                </button>
              </div>
            ) : null}
          </div>
          <div className="settings-screen-updated-at">{settingsUpdatedAtValue}</div>
        </div>
      )}
    </div>
  );
}
