export default function PlayerHistoryModal({ vm }) {
  const {
    closePlayerHistoryPanel,
    playerHistoryCountByType,
    playerHistoryEmptyText,
    playerHistoryError,
    playerHistoryFilter,
    playerHistoryFilterOptions,
    playerHistoryItems,
    playerHistoryLoading,
    setPlayerHistoryFilter
  } = vm;

  return (
    <div className="reset-modal player-history-modal" onClick={closePlayerHistoryPanel}>
      <div className="reset-modal-card player-history-card" onClick={(event) => event.stopPropagation()}>
        <div className="player-history-head">
          <div>
            <div className="player-history-kicker">Perfil do jogador</div>
            <h3>Historico de partidas</h3>
          </div>
          <button type="button" className="player-history-close" onClick={closePlayerHistoryPanel} aria-label="Fechar historico">
            x
          </button>
        </div>
        <div className="player-history-subtitle">
          Revise suas ultimas partidas de PVP e seus quizzes PVE mais recentes em um unico painel.
        </div>
        <div className="player-history-filters">
          {playerHistoryFilterOptions.map((filter) => (
            <button
              key={`player_history_filter_${filter.id}`}
              type="button"
              className={`player-history-filter-btn ${playerHistoryFilter === filter.id ? 'active' : ''}`}
              onClick={() => setPlayerHistoryFilter(filter.id)}
            >
              {filter.label}
              <span>{playerHistoryCountByType[filter.id] || 0}</span>
            </button>
          ))}
        </div>
        {playerHistoryError ? (
          <div className="player-history-alert">{playerHistoryError}</div>
        ) : null}
        {playerHistoryLoading ? (
          <div className="player-history-syncing">Atualizando partidas PVP...</div>
        ) : null}
        <div className="player-history-list">
          {playerHistoryItems.length ? playerHistoryItems.map((item) => (
            <div
              key={item.id}
              className={`player-history-entry type-${item.type}`}
            >
              {item.type !== 'pvp' ? (
                <div className="player-history-entry-head">
                  <span className={`player-history-type type-${item.type}`}>{item.type === 'pvp' ? 'PVP' : 'PVE'}</span>
                  <span className="player-history-time">{item.timestampLabel}</span>
                </div>
              ) : null}
              <div className={`player-history-title-row type-${item.type}`}>
                {item.type === 'pvp' ? (
                  <>
                    <span className={`player-history-type type-${item.type}`}>PVP</span>
                    <strong className="player-history-versus">
                      <span className={`player-history-versus-name ${item.titleParts?.winnerSide === 'player1' ? 'is-winner' : 'is-loser'}`}>
                        {item.titleParts?.player1 || item.title}
                      </span>
                      <span className="player-history-versus-divider">x</span>
                      <span className={`player-history-versus-name ${item.titleParts?.winnerSide === 'player2' ? 'is-winner' : 'is-loser'}`}>
                        {item.titleParts?.player2 || ''}
                      </span>
                    </strong>
                    <span className="player-history-time">{item.timestampLabel}</span>
                  </>
                ) : (
                  <strong>{item.title}</strong>
                )}
                {item.resultLabel ? (
                  <span className={`player-history-result tone-${item.resultTone || 'default'}`}>{item.resultLabel}</span>
                ) : null}
              </div>
              {item.type !== 'pvp' && item.subtitle ? (
                <div className="player-history-subline">{item.subtitle}</div>
              ) : null}
              <div className={`player-history-score type-${item.type}`}>
                {item.type === 'pvp' && item.scoreParts ? (
                  <>
                    <span className={`player-history-score-value ${item.scoreParts.winnerSide === 'player1' ? 'is-winner' : 'is-loser'}`}>
                      {item.scoreParts.player1}
                    </span>
                    <span className="player-history-score-divider">x</span>
                    <span className={`player-history-score-value ${item.scoreParts.winnerSide === 'player2' ? 'is-winner' : 'is-loser'}`}>
                      {item.scoreParts.player2}
                    </span>
                  </>
                ) : item.scoreLabel}
              </div>
              <div className="player-history-chip-row">
                {(Array.isArray(item.metaChips) ? item.metaChips : []).map((chip) => (
                  <span
                    key={`${item.id}_${typeof chip === 'string' ? chip : chip?.label}`}
                    className={`player-history-chip tone-${typeof chip === 'string' ? 'default' : (chip?.tone || 'default')}`}
                  >
                    {typeof chip === 'string' ? chip : chip?.label}
                  </span>
                ))}
              </div>
            </div>
          )) : (
            <div className="player-history-empty">
              {playerHistoryLoading ? 'Atualizando historico...' : playerHistoryEmptyText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
