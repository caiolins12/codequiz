import { getShopItem } from '../lib/shop';
import { getEvolutionPassStageStatus } from '../app/helpers';

export default function PassScreen({ vm }) {
  const {
    evolutionPass,
    evolutionPassFocusedStage,
    evolutionPassFocusedStageIndex,
    evolutionPassStages,
    focusAdjacentEvolutionPassStage,
    focusEvolutionPassStage,
    handleClaimEvolutionPassStage,
    openEvolutionPassDetailModal,
    passClaimingStageId,
    passRecentClaimStageId,
    screen,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={`screen screen-achievements ${screen === 'achievements' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>Passe de Evolução</h2>
      </div>
      <div className="evo-pass-shell">
        <div className="evo-pass-hero-card">
          <div className="evo-pass-hero-head">
            <div className="evo-pass-hero-title">Passe de Evolução</div>
            <div className="evo-pass-hero-level">
              Nível {evolutionPass.currentLevel}/{evolutionPass.totalLevels}
            </div>
          </div>
          <div className="evo-pass-hero-subtitle">
            {evolutionPass.activeStage
              ? `${evolutionPass.activeStage.icon} ${evolutionPass.activeStage.name}`
              : 'Passe concluído'}
          </div>
          <div className="evo-pass-bar">
            <div
              className="evo-pass-bar-fill"
              style={{ width: `${Math.max(0, Math.min(100, Number(evolutionPass.currentStageProgressPct || 0)))}%` }}
            />
          </div>
          <div className="evo-pass-hero-meta">
            Progresso da etapa atual: {Math.round(Math.max(0, Number(evolutionPass.currentStageProgressPct || 0)))}%
          </div>
          <div className="evo-pass-hero-note">
            Cada etapa pode ser concluída pela trilha PVE ou pela trilha PVP.
          </div>
          <div className="evo-pass-summary-grid">
            <div className="evo-pass-summary-item">
              <span className="evo-pass-summary-label">Etapas concluídas</span>
              <strong>{evolutionPass.completedCount}/{evolutionPass.totalLevels}</strong>
            </div>
            <div className="evo-pass-summary-item">
              <span className="evo-pass-summary-label">Passe total</span>
              <strong>{Math.round(Math.max(0, Number(evolutionPass.overallProgressPct || 0)))}%</strong>
            </div>
            <div className="evo-pass-summary-item">
              <span className="evo-pass-summary-label">Prontas para coletar</span>
              <strong>{evolutionPass.claimableCount}</strong>
            </div>
          </div>
        </div>

        {evolutionPassFocusedStage ? (() => {
          const stage = evolutionPassFocusedStage;
          const isLockedStage = stage.locked && !stage.claimed;
          const stageStatus = getEvolutionPassStageStatus(stage);
          const isClaiming = passClaimingStageId === stage.id;
          const collectDisabled = (
            stage.claimed
            || isLockedStage
            || !stage.completed
            || (Boolean(passClaimingStageId) && !isClaiming)
          );
          const collectLabel = stage.claimed
            ? 'Recompensa coletada'
            : (isClaiming ? 'Coletando...' : (stage.completed ? 'Coletar recompensa' : 'Complete para coletar'));
          const missionPaths = Array.isArray(stage.missionPaths) ? stage.missionPaths : [];
          const cosmeticRewards = (Array.isArray(stage?.reward?.shopItems) ? stage.reward.shopItems : [])
            .map((itemId) => getShopItem(itemId))
            .filter(Boolean);
          return (
            <div className="evo-pass-stage-frame">
              <div className="evo-pass-stage-nav-card">
                <div className="evo-pass-stage-nav-head">
                  <button
                    type="button"
                    className="btn evo-pass-stage-arrow"
                    onClick={() => focusAdjacentEvolutionPassStage(-1)}
                    disabled={evolutionPassFocusedStageIndex <= 0}
                    aria-label="Etapa anterior"
                  >
                    &lt;
                  </button>
                  <div className="evo-pass-stage-nav-copy">
                    <span className="evo-pass-stage-nav-label">Etapa em foco</span>
                    <strong>Nível {stage.level} de {evolutionPass.totalLevels}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn evo-pass-stage-arrow"
                    onClick={() => focusAdjacentEvolutionPassStage(1)}
                    disabled={evolutionPassFocusedStageIndex >= evolutionPassStages.length - 1}
                    aria-label="Proxima etapa"
                  >
                    &gt;
                  </button>
                </div>
                <div className="evo-pass-stage-dots" role="tablist" aria-label="Selecionar etapa do passe">
                  {evolutionPassStages.map((stageOption) => {
                    const optionId = String(stageOption?.id || '').trim();
                    const optionActive = optionId === String(stage.id || '').trim();
                    const optionStatus = getEvolutionPassStageStatus(stageOption);
                    return (
                      <button
                        key={optionId}
                        type="button"
                        className={[
                          'evo-pass-stage-dot-btn',
                          optionActive ? 'active' : '',
                          stageOption.claimed ? 'claimed' : '',
                          (!stageOption.claimed && stageOption.completed) ? 'ready' : '',
                          (stageOption.locked && !stageOption.claimed) ? 'locked' : ''
                        ].filter(Boolean).join(' ')}
                        onClick={() => focusEvolutionPassStage(optionId)}
                        aria-label={`Nível ${stageOption.level}: ${optionStatus}`}
                        aria-pressed={optionActive}
                      >
                        <span className="evo-pass-stage-dot-icon" aria-hidden="true">{stageOption.icon}</span>
                        <span className="evo-pass-stage-dot-level">{stageOption.level}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className={[
                  'evo-pass-focus-card',
                  stage.claimed ? 'claimed' : '',
                  isLockedStage ? 'locked' : '',
                  passRecentClaimStageId === stage.id ? 'claim-burst' : ''
                ].filter(Boolean).join(' ')}
              >
                <div className="evo-stage-top">
                  <span className="evo-stage-level">Nível {stage.level}</span>
                  <span className="evo-stage-status">{stageStatus}</span>
                </div>

                <div className="evo-pass-focus-head">
                  <div className="evo-stage-title">{stage.icon} {stage.name}</div>
                  <div className="evo-stage-desc">
                    {isLockedStage ? 'Conclua o nivel anterior para desbloquear esta etapa.' : stage.desc}
                  </div>
                  <div className="evo-stage-hint">
                    {isLockedStage ? 'As missões aparecem assim que a etapa for liberada.' : stage.hint}
                  </div>
                </div>

                {!isLockedStage ? (
                  <>
                    <div className="evo-pass-route-grid">
                      {missionPaths.map((path) => {
                        const pathGoals = Array.isArray(path.goals) ? path.goals : [];
                        const completedGoals = pathGoals.filter((goal) => goal.complete).length;
                        return (
                          <div
                            key={`${stage.id}_${path.id}`}
                            className={[
                              'evo-stage-path',
                              'evo-pass-route-card',
                              path.complete ? 'done' : '',
                              stage.leadingPathId === path.id ? 'is-leading' : ''
                            ].filter(Boolean).join(' ')}
                          >
                            <div className="evo-stage-path-head">
                              <span className="evo-stage-path-title">{path.icon} {path.label}</span>
                              <span className="evo-stage-path-status">
                                {path.complete ? 'Concluida' : `${Math.round(Math.max(0, Number(path.progressPct || 0)))}%`}
                              </span>
                            </div>
                            <div className="evo-pass-route-summary">
                              {path.complete
                                ? 'Rota concluída e pronta para liberar a etapa.'
                                : `${completedGoals}/${pathGoals.length} metas concluídas nesta rota.`}
                            </div>
                            <div className="evo-stage-progress">
                              <div
                                className="evo-stage-progress-fill"
                                style={{ width: `${Math.max(0, Math.min(100, Number(path.progressPct || 0)))}%` }}
                              />
                            </div>
                            <button
                              type="button"
                              className="btn evo-pass-inline-btn"
                              onClick={() => openEvolutionPassDetailModal('path', stage.id, path.id)}
                            >
                              Ver metas
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="evo-stage-route-note">
                      {stage.completedPathLabel
                        ? `Etapa concluída pela ${stage.completedPathLabel}.`
                        : 'Complete a trilha PVE ou a trilha PVP para liberar a coleta desta etapa.'}
                    </div>

                    <div className="evo-pass-reward-strip">
                      <span className="evo-stage-reward evo-stage-reward-stat">
                        <span className="evo-stage-reward-icon" aria-hidden="true">⭐</span>
                        <span className="evo-stage-reward-text">+{Math.max(0, Number(stage?.reward?.xp || 0))} XP</span>
                      </span>
                      <span className="evo-stage-reward evo-stage-reward-stat">
                        <span className="evo-stage-reward-icon" aria-hidden="true">🪙</span>
                        <span className="evo-stage-reward-text">+{Math.max(0, Number(stage?.reward?.coins || 0))} moedas</span>
                      </span>
                      {cosmeticRewards.length ? (
                        <span className="evo-pass-reward-summary-pill">
                          <span className="evo-pass-reward-summary-icons" aria-hidden="true">
                            {cosmeticRewards.slice(0, 3).map((item, itemIndex) => (
                              <span key={`${stage.id}_${item?.id || itemIndex}`}>{item?.icon || '🎁'}</span>
                            ))}
                          </span>
                          <span>{cosmeticRewards.length} cosmético{cosmeticRewards.length > 1 ? 's' : ''}</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="evo-pass-focus-actions">
                      <button
                        type="button"
                        className="btn evo-pass-inline-btn"
                        onClick={() => openEvolutionPassDetailModal('rewards', stage.id)}
                      >
                        Ver recompensas
                      </button>
                      <button
                        type="button"
                        className={[
                          'btn',
                          'evo-stage-claim-btn',
                          stage.claimed ? 'claimed' : '',
                          (!stage.claimed && stage.completed) ? 'ready' : '',
                          (!stage.completed && !stage.claimed) ? 'locked' : '',
                          isClaiming ? 'is-claiming' : ''
                        ].filter(Boolean).join(' ')}
                        disabled={collectDisabled}
                        onClick={(event) => handleClaimEvolutionPassStage(stage.id, event)}
                      >
                        {collectLabel}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="evo-pass-focus-locked">
                    <div className="evo-stage-locked-icon">ðŸ”’</div>
                    <div className="evo-pass-focus-locked-copy">
                      <strong>Etapa bloqueada</strong>
                      <span>Finalize a etapa anterior para revelar as missões e recompensas.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })() : (
          <div className="evo-pass-empty-state">
            Nenhuma etapa do passe está disponível no momento.
          </div>
        )}

        <div className="evo-pass-timeline-hint">Deslize a trilha para navegar pelos níveis do passe.</div>
        <div className="evo-pass-timeline-scroll">
          <div className="evo-pass-timeline">
            {evolutionPass.stages.map((stage, index) => {
              const isLockedStage = stage.locked && !stage.claimed;
              const isClaiming = passClaimingStageId === stage.id;
              const collectDisabled = (
                stage.claimed
                || isLockedStage
                || !stage.completed
                || (Boolean(passClaimingStageId) && !isClaiming)
              );
              const collectLabel = stage.claimed
                ? 'Recompensa coletada'
                : (isClaiming ? 'Coletando...' : (stage.completed ? 'Coletar recompensa' : 'Complete para coletar'));
              return (
                <div
                  key={stage.id}
                  className={[
                    'evo-stage-column',
                    stage.claimed ? 'claimed' : '',
                    stage.active ? 'active' : '',
                    stage.locked ? 'locked' : '',
                    passRecentClaimStageId === stage.id ? 'claim-burst' : ''
                  ].filter(Boolean).join(' ')}
                >
                  <div className="evo-stage-track-head">
                    <span className="evo-stage-track-dot" aria-hidden="true">{stage.icon}</span>
                    <span className="evo-stage-track-level">Nível {stage.level}</span>
                    {index < evolutionPass.stages.length - 1 ? (
                      <span
                        className={[
                          'evo-stage-track-link',
                          stage.claimed || stage.completed ? 'filled' : '',
                          stage.active ? 'active' : ''
                        ].filter(Boolean).join(' ')}
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                  <div className="evo-stage-card">
                    <div className="evo-stage-top">
                      <div className="evo-stage-title">{stage.icon} {stage.name}</div>
                      <span className="evo-stage-level">Nível {stage.level}</span>
                    </div>

                    <div className="evo-stage-paths">
                      {!isLockedStage ? (
                        (Array.isArray(stage.missionPaths) ? stage.missionPaths : []).map((path) => {
                          const pathGoals = Array.isArray(path.goals) ? path.goals : [];
                          return (
                            <div
                              key={`${stage.id}_${path.id}`}
                              className={[
                                'evo-stage-path',
                                path.complete ? 'done' : '',
                                stage.leadingPathId === path.id ? 'is-leading' : ''
                              ].filter(Boolean).join(' ')}
                            >
                              <div className="evo-stage-path-head">
                                <span className="evo-stage-path-title">{path.icon} {path.label}</span>
                                <span className="evo-stage-path-status">
                                  {path.complete ? 'Concluída' : `${Math.round(Math.max(0, Number(path.progressPct || 0)))}%`}
                                </span>
                              </div>
                              <div className="evo-stage-goals">
                                {pathGoals.map((goal) => (
                                  <div
                                    key={`${stage.id}_${path.id}_${goal.metric}_${goal.target}`}
                                    className={`evo-stage-goal ${goal.complete ? 'done' : ''}`}
                                  >
                                    <span className="evo-stage-goal-label">{goal.label}</span>
                                    <span className="evo-stage-goal-value">
                                      {Math.min(goal.target, Math.max(0, Math.trunc(Number(goal.value || 0))))}/{goal.target}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="evo-stage-progress">
                                <div
                                  className="evo-stage-progress-fill"
                                  style={{ width: `${Math.max(0, Math.min(100, Number(path.progressPct || 0)))}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="evo-stage-path evo-stage-path-locked">
                          <div className="evo-stage-path-head">
                            <span className="evo-stage-path-title">🔒 Missões ocultas</span>
                            <span className="evo-stage-path-status">Bloqueada</span>
                          </div>
                          <div className="evo-stage-goals">
                            <div className="evo-stage-goal">
                              <span className="evo-stage-goal-label">
                                Conclua o nível anterior para revelar as missões desta etapa.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className={[
                        'btn',
                        'evo-stage-claim-btn',
                        stage.claimed ? 'claimed' : '',
                        (!stage.claimed && stage.completed) ? 'ready' : '',
                        (!stage.completed && !stage.claimed) ? 'locked' : '',
                        isClaiming ? 'is-claiming' : ''
                      ].filter(Boolean).join(' ')}
                      disabled={collectDisabled}
                      onClick={(event) => handleClaimEvolutionPassStage(stage.id, event)}
                    >
                      {collectLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
