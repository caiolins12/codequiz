export default function LeagueTransitionOverlay({ vm }) {
  const {
    closeLeagueTransition,
    leagueTransition
  } = vm;

  return (
    <div
      className="league-transition-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Mudança de liga"
      onClick={closeLeagueTransition}
    >
      <div className="league-transition-backdrop" />
      <div className="league-transition-card" onClick={(event) => event.stopPropagation()}>
        <div className="league-transition-glow" aria-hidden="true" />
        <div className="league-transition-kicker">Mudança de liga</div>
        <div className="league-transition-title">{leagueTransition.title || 'Classificação atualizada'}</div>
        <div className="league-transition-subtitle">{leagueTransition.subtitle || 'Seu perfil acabou de mudar de liga.'}</div>
        <div className="league-transition-list">
          {(Array.isArray(leagueTransition.changes) ? leagueTransition.changes : []).map((change) => (
            <div
              key={`league_transition_${change.mode}_${change.from?.key || 'from'}_${change.to?.key || 'to'}`}
              className={`league-transition-row is-${change.direction || 'up'}`}
            >
              <div className="league-transition-mode">{change.modeLabel}</div>
              <div className="league-transition-track">
                <span className={`tier-badge league-transition-badge tier-${change.from?.key || 'bronze'}`}>
                  <span className="tier-emblem" aria-hidden="true">{change.from?.emblem || '🥉'}</span>
                  <span>{change.from?.label || 'Bronze'}</span>
                </span>
                <span className="league-transition-arrow" aria-hidden="true">→</span>
                <span className={`tier-badge league-transition-badge tier-${change.to?.key || 'bronze'}`}>
                  <span className="tier-emblem" aria-hidden="true">{change.to?.emblem || '🥉'}</span>
                  <span>{change.to?.label || 'Bronze'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-primary league-transition-btn" onClick={closeLeagueTransition}>
          Continuar
        </button>
      </div>
    </div>
  );
}
