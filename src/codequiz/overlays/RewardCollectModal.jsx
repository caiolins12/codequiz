export default function RewardCollectModal({ vm }) {
  const {
    handleCollectResultRewards,
    resultState,
    rewardCollecting
  } = vm;

  return (
    <div className="reset-modal reward-collect-modal" role="dialog" aria-live="polite" aria-label="Coletar recompensas">
      <div className="reset-modal-card reward-collect-card">
        <div className="reward-collect-shine" aria-hidden="true" />
        <h3>Recompensas da partida</h3>
        <p>Toque em coletar para receber seus ganhos.</p>
        <div className="reward-collect-list">
          <div className="reward-collect-item">
            <span className="reward-collect-item-label">XP</span>
            <span className="reward-collect-item-value xp">+{Math.max(0, Number(resultState.awardedXp || 0))}</span>
          </div>
          <div className="reward-collect-item">
            <span className="reward-collect-item-label">Moedas</span>
            <span className="reward-collect-item-value coins">+{Math.max(0, Number(resultState.awardedCoins || 0))}</span>
          </div>
          <div className="reward-collect-item">
            <span className="reward-collect-item-label">Pontos de ranking</span>
            <span className="reward-collect-item-value points">+{Math.max(0, Number(resultState.rankingGain || 0))}</span>
          </div>
        </div>
        <button className="reward-collect-btn" disabled={rewardCollecting} onClick={(event) => handleCollectResultRewards(event)}>
          {rewardCollecting ? 'Coletando...' : 'Coletar Recompensas'}
        </button>
      </div>
    </div>
  );
}
