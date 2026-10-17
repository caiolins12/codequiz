import { SHOP_RARITY_LABELS, SHOP_RARITY_ORDER, getShopItem } from '../lib/shop';

export default function PassDetailModal({ vm }) {
  const {
    closeEvolutionPassDetailModal,
    evolutionPassDetailPath,
    evolutionPassDetailStage,
    passDetailModal
  } = vm;

  return (
    <div
      className="reset-modal evo-pass-detail-modal"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label={passDetailModal.mode === 'path' ? 'Detalhes das metas da etapa' : 'Detalhes das recompensas da etapa'}
      onClick={closeEvolutionPassDetailModal}
    >
      <div className="reset-modal-card evo-pass-detail-card" onClick={(event) => event.stopPropagation()}>
        <div className="evo-pass-detail-head">
          <span className="evo-pass-detail-kicker">Nível {evolutionPassDetailStage.level}</span>
          <button
            type="button"
            className="btn evo-pass-detail-close"
            onClick={closeEvolutionPassDetailModal}
            aria-label="Fechar detalhes da etapa"
          >
            x
          </button>
        </div>
        <h3>
          {passDetailModal.mode === 'path'
            ? `${evolutionPassDetailPath?.icon || ''} ${evolutionPassDetailPath?.label || 'Metas da etapa'}`
            : `${evolutionPassDetailStage.icon || ''} Recompensas da etapa`}
        </h3>
        <p>{evolutionPassDetailStage.name}</p>

        {passDetailModal.mode === 'path' && evolutionPassDetailPath ? (
          <>
            <div className="evo-pass-detail-progress">
              <span>{Math.round(Math.max(0, Number(evolutionPassDetailPath.progressPct || 0)))}% concluídos</span>
              <div className="evo-stage-progress">
                <div
                  className="evo-stage-progress-fill"
                  style={{ width: `${Math.max(0, Math.min(100, Number(evolutionPassDetailPath.progressPct || 0)))}%` }}
                />
              </div>
            </div>
            <div className="evo-pass-detail-list">
              {(Array.isArray(evolutionPassDetailPath.goals) ? evolutionPassDetailPath.goals : []).map((goal) => (
                <div
                  key={`${evolutionPassDetailStage.id}_${evolutionPassDetailPath.id}_${goal.metric}_${goal.target}`}
                  className={`evo-stage-goal ${goal.complete ? 'done' : ''}`}
                >
                  <span className="evo-stage-goal-label">{goal.label}</span>
                  <span className="evo-stage-goal-value">
                    {Math.min(goal.target, Math.max(0, Math.trunc(Number(goal.value || 0))))}/{goal.target}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="evo-pass-detail-list rewards">
            <div className="evo-stage-reward evo-stage-reward-stat">
              <span className="evo-stage-reward-icon" aria-hidden="true">⭐</span>
              <span className="evo-stage-reward-text">+{Math.max(0, Number(evolutionPassDetailStage?.reward?.xp || 0))} XP</span>
            </div>
            <div className="evo-stage-reward evo-stage-reward-stat">
              <span className="evo-stage-reward-icon" aria-hidden="true">🪙</span>
              <span className="evo-stage-reward-text">+{Math.max(0, Number(evolutionPassDetailStage?.reward?.coins || 0))} moedas</span>
            </div>
            {(Array.isArray(evolutionPassDetailStage?.reward?.shopItems) ? evolutionPassDetailStage.reward.shopItems : []).map((itemId) => {
              const rewardItem = getShopItem(itemId);
              if (!rewardItem) return null;
              const rewardType = String(rewardItem?.type || '').trim().toLowerCase();
              const rewardRarityRaw = String(rewardItem?.rarity || '').trim().toLowerCase();
              const rewardRarity = SHOP_RARITY_ORDER.includes(rewardRarityRaw)
                ? rewardRarityRaw
                : 'common';
              const rewardRarityLabel = SHOP_RARITY_LABELS[rewardRarity] || 'Recompensa';
              const rewardCompactLabel = rewardType === 'frame'
                ? 'Moldura'
                : (rewardType === 'background' ? 'Fundo' : (rewardType === 'emoji' ? 'Emoji' : 'Recompensa'));
              return (
                <div
                  key={`${evolutionPassDetailStage.id}_${itemId}`}
                  className={`evo-stage-reward evo-stage-reward-cosmetic rarity-${rewardRarity}`}
                >
                  <span className="evo-stage-reward-icon" aria-hidden="true">{rewardItem.icon || '🎁'}</span>
                  <span className="evo-stage-reward-content">
                    <span className="evo-stage-reward-title">{rewardCompactLabel}</span>
                    <span className="evo-stage-reward-meta">{`${rewardItem.name} · ${rewardRarityLabel}`}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <button type="button" className="btn btn-primary evo-pass-detail-action" onClick={closeEvolutionPassDetailModal}>
          Fechar
        </button>
      </div>
    </div>
  );
}
