import { getAvatarFrameClass, getAvatarFrameStyle, getDisplayAvatar } from '../lib/shop';
import { formatSignedPoints } from '../app/helpers';

export default function PvpEliminationResultScreen({ vm }) {
  const {
    buildCosmeticSnapshot,
    collectPvpEliminationResultRewards,
    pvpEliminationMyUserId,
    pvpEliminationPlacementLabel,
    pvpEliminationResultKey,
    pvpEliminationResultProcessed,
    pvpEliminationResultReward,
    pvpEliminationResultRows,
    pvpEliminationRewardCollecting,
    pvpEliminationWinnerMember,
    pvpEliminationWinnerUserId,
    resetPvpEliminationState,
    screen,
    setPvpMode,
    setScreen
  } = vm;

  return (
    <div className={`screen ${screen === 'pvp-elimination-result' ? 'active' : ''}`}>
      <div className="result-content">
        <div className={`pvp-result-panel pvp-result-panel-dynamic outcome-${pvpEliminationResultKey === 'win' ? 'win' : pvpEliminationResultKey === 'draw' ? 'draw' : 'lose'}`}>
          <div className="result-emoji pvp-result-seq result-seq-1">{pvpEliminationResultKey === 'win' ? '\uD83C\uDFC6' : pvpEliminationResultKey === 'draw' ? '\uD83E\uDD1D' : '\uD83D\uDE35'}</div>
          <div className="result-title pvp-result-seq result-seq-2">
            {pvpEliminationResultKey === 'win' ? 'Campeao da Eliminatoria!' : `Eliminatoria encerrada - ${pvpEliminationPlacementLabel}`}
          </div>
          <div className="result-subtitle pvp-result-seq result-seq-3">
            {pvpEliminationWinnerUserId
              ? `Vencedor: ${pvpEliminationWinnerMember?.nickname || 'Jogador'}`
              : 'Pontuacao final da eliminatoria'}
          </div>
          <div className="pvp-elimination-result-list pvp-result-seq result-seq-4">
            {pvpEliminationResultRows.map((entry) => {
              const memberShop = buildCosmeticSnapshot(
                entry?.equipped_frame,
                entry?.equipped_background,
                entry?.equipped_emoji
              );
              const memberAvatar = getDisplayAvatar(entry?.avatar || '\uD83D\uDE42', memberShop);
              const memberFrameStyle = getAvatarFrameStyle(memberShop);
              const memberFrameClass = getAvatarFrameClass(memberShop);
              const isSelf = String(entry?.user_id || '').trim() === pvpEliminationMyUserId;
              const rowPlacement = Math.max(1, Number(entry?.placement || 0));
              return (
                <div key={`elimination_result_row_${entry.user_id}`} className={`pvp-elimination-result-row ${isSelf ? 'is-self' : ''}`}>
                  <span className="pvp-elimination-result-rank">{rowPlacement}o</span>
                  <span className={`pvp-player-avatar pvp-team-result-avatar ${memberFrameClass}`} style={memberFrameStyle}>{memberAvatar}</span>
                  <div className="pvp-elimination-result-copy">
                    <strong>{entry?.nickname || 'Jogador'}</strong>
                    <span>{Math.max(0, Number(entry?.score || 0))} acerto(s)</span>
                  </div>
                </div>
              );
            })}
          </div>
          {pvpEliminationResultReward ? (
            <>
              <div className="reward-collect-list pvp-result-reward-list pvp-result-seq result-seq-5">
                <div className="reward-collect-item">
                  <span className="reward-collect-item-label">Colocacao</span>
                  <span className="reward-collect-item-value level">{pvpEliminationResultReward.placementLabel || pvpEliminationPlacementLabel}</span>
                </div>
                <div className="reward-collect-item">
                  <span className="reward-collect-item-label">Pontos PVP</span>
                  <span className={`reward-collect-item-value ${Number(pvpEliminationResultReward.points || 0) >= 0 ? 'points' : 'points-loss'}`}>
                    {formatSignedPoints(pvpEliminationResultReward.points || 0)}
                  </span>
                </div>
                <div className="reward-collect-item">
                  <span className="reward-collect-item-label">XP</span>
                  <span className="reward-collect-item-value xp">+{Math.max(0, Number(pvpEliminationResultReward.xp || 0))}</span>
                </div>
                <div className="reward-collect-item">
                  <span className="reward-collect-item-label">Moedas</span>
                  <span className="reward-collect-item-value coins">+{Math.max(0, Number(pvpEliminationResultReward.coins || 0))}</span>
                </div>
              </div>
              <button
                className="reward-collect-btn pvp-result-reward-btn pvp-result-seq result-seq-6"
                disabled={pvpEliminationRewardCollecting}
                onClick={(event) => collectPvpEliminationResultRewards(event)}
              >
                {pvpEliminationRewardCollecting ? 'Coletando...' : 'Coletar Recompensas'}
              </button>
            </>
          ) : !pvpEliminationResultProcessed ? (
            <div className="result-subtitle pvp-result-seq result-seq-5 pvp-result-collect-note">
              Preparando recompensas...
            </div>
          ) : (
            <button
              className="reward-collect-btn pvp-result-reward-btn pvp-result-seq result-seq-5"
              onClick={() => {
                resetPvpEliminationState();
                setPvpMode('');
                setScreen('home');
              }}
            >
              Voltar ao inicio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
