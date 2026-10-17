import { formatSignedPoints } from '../app/helpers';

export default function PvpResultScreen({ vm }) {
  const {
    collectPvpResultRewards,
    pvpFinalScoreParts,
    pvpHideDefaultResultPanel,
    pvpMatch,
    pvpResult,
    pvpResultReward,
    pvpRewardCollecting,
    screen
  } = vm;

  return (
    <div className={`screen ${screen === 'pvp-result' ? 'active' : ''}`}>
      <div className="result-content">
        {!pvpHideDefaultResultPanel ? (
          <div className={`pvp-result-panel pvp-result-panel-dynamic outcome-${pvpResult === 'win' ? 'win' : pvpResult === 'draw' ? 'draw' : 'lose'}`}>
            <div className="result-emoji pvp-result-seq result-seq-1">{pvpResult === 'win' ? '🏆' : pvpResult === 'draw' ? '🤝' : '😵'}</div>
            <div className="result-title pvp-result-seq result-seq-2">
              {pvpResult === 'win' ? 'Vitoria!' : pvpResult === 'draw' ? 'Empate!' : 'Derrota'}
            </div>
            <div className="pvp-result-scoreline pvp-result-seq result-seq-3">
              <span className={`player-history-versus-name ${pvpFinalScoreParts.winnerSide === 'player1' ? 'is-winner' : 'is-loser'}`}>
                {pvpMatch?.player1_nickname || 'Jogador 1'}
              </span>
              <div className="player-history-score type-pvp pvp-result-score pvp-result-inline-score">
                <span className={`player-history-score-value ${pvpFinalScoreParts.winnerSide === 'player1' ? 'is-winner' : 'is-loser'}`}>
                  {pvpFinalScoreParts.player1}
                </span>
                <span className="player-history-score-divider">x</span>
                <span className={`player-history-score-value ${pvpFinalScoreParts.winnerSide === 'player2' ? 'is-winner' : 'is-loser'}`}>
                  {pvpFinalScoreParts.player2}
                </span>
              </div>
              <span className={`player-history-versus-name ${pvpFinalScoreParts.winnerSide === 'player2' ? 'is-winner' : 'is-loser'}`}>
                {pvpMatch?.player2_nickname || 'Jogador 2'}
              </span>
            </div>
            {pvpResultReward ? (
              <>
                <div className="reward-collect-list pvp-result-reward-list pvp-result-seq result-seq-4">
                  <div className="reward-collect-item">
                    <span className="reward-collect-item-label">Pontos PVP</span>
                    <span className={`reward-collect-item-value ${Number(pvpResultReward.points || 0) >= 0 ? 'points' : 'points-loss'}`}>
                      {formatSignedPoints(pvpResultReward.points || 0)}
                    </span>
                  </div>
                  <div className="reward-collect-item">
                    <span className="reward-collect-item-label">XP</span>
                    <span className="reward-collect-item-value xp">+{Math.max(0, Number(pvpResultReward.xp || 0))}</span>
                  </div>
                  <div className="reward-collect-item">
                    <span className="reward-collect-item-label">Moedas</span>
                    <span className="reward-collect-item-value coins">+{Math.max(0, Number(pvpResultReward.coins || 0))}</span>
                  </div>
                </div>
                <button
                  className="reward-collect-btn pvp-result-reward-btn pvp-result-seq result-seq-5"
                  disabled={pvpRewardCollecting}
                  onClick={(event) => collectPvpResultRewards(event)}
                >
                  {pvpRewardCollecting ? 'Coletando...' : 'Coletar Recompensas'}
                </button>
                <div className="result-subtitle pvp-result-seq result-seq-6 pvp-result-collect-note">
                  O retorno ao inicio sera liberado apos a coleta.
                </div>
              </>
            ) : (
              <div className="result-subtitle pvp-result-seq result-seq-4 pvp-result-collect-note">
                Preparando recompensas...
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
