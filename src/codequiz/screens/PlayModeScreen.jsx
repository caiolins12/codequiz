export default function PlayModeScreen({ vm }) {
  const {
    resetPvpTeamState,
    screen,
    setPvpMode,
    setScreen,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={`screen ${screen === 'play-mode' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>Escolha o modo</h2>
      </div>
      <div className="challenge-panel play-mode-panel">
        <h3>Selecione seu modo</h3>
        <div className="play-mode-actions">
          <button className="btn btn-primary btn-lg btn-modern play-mode-btn" onClick={() => setScreen('knowledge-area')}>
            <span className="play-mode-icon">🎯</span>
            <span className="play-mode-title">PVE</span>
            <span className="play-mode-subtitle">Quiz Solo</span>
          </button>
          <button
            className="btn btn-secondary btn-lg btn-modern play-mode-btn"
            onClick={() => {
              resetPvpTeamState();
              setPvpMode('');
              setScreen('challenge');
            }}
          >
            <span className="play-mode-icon">⚔️</span>
            <span className="play-mode-title">PVP</span>
            <span className="play-mode-subtitle">Online</span>
          </button>
        </div>
      </div>
    </div>
  );
}
