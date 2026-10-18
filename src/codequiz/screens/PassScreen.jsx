import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Gift,
  Lightbulb,
  ListChecks,
  Lock,
  Route,
  Sparkles,
  Ticket
} from 'lucide-react';
import { SHOP_RARITY_LABELS, getShopItem } from '../lib/shop';
import {
  Badge,
  Button,
  Card,
  CoinIcon,
  EmptyState,
  IconButton,
  PageHeader,
  ProgressBar,
  RarityBadge,
  SectionHeader,
  Tabs,
  XpIcon,
  cx
} from '../ui';
import { SHOP_TYPE_LABELS } from './shared/ShopPreview';
import styles from './PassScreen.module.css';

function clampPct(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
}

// claimed | ready | active | locked | open
function getStageState(stage) {
  if (stage.claimed) return 'claimed';
  if (stage.locked) return 'locked';
  if (stage.completed) return 'ready';
  if (stage.active) return 'active';
  return 'open';
}

const STATE_BADGES = {
  claimed: { label: 'Coletada', tone: 'lime' },
  ready: { label: 'Pronta para coletar', tone: 'gold' },
  active: { label: 'Em progresso', tone: 'violet' },
  open: { label: 'Em progresso', tone: 'violet' },
  locked: { label: 'Bloqueada', tone: 'neutral' }
};

// O passe fica em duas subtelas para caber na tela sem rolagem:
// a trilha (progresso geral + níveis) e as missões do nível em foco.
const VIEW_TABS = [
  { value: 'track', label: 'Trilha', icon: Route },
  { value: 'missions', label: 'Missões', icon: ListChecks }
];

function RouteCard({ path, leading }) {
  const goals = Array.isArray(path.goals) ? path.goals : [];
  const pct = clampPct(path.progressPct);
  return (
    <div className={cx(styles.route, path.complete ? styles.routeDone : '', leading && !path.complete ? styles.routeLeading : '')}>
      <div className={styles.routeHead}>
        <span className={styles.routeIcon} aria-hidden="true">{path.icon}</span>
        <span className={styles.routeTitle}>{path.label}</span>
        <span className={styles.routePct}>
          {path.complete ? <><Check aria-hidden="true" strokeWidth={3} /> Concluída</> : `${pct}%`}
        </span>
      </div>
      <ProgressBar value={pct} tone={path.complete ? 'lime' : 'violet'} size="sm" label={`Progresso: ${path.label}`} className={styles.routeBar} />
      <ul className={styles.goals}>
        {goals.map((goal) => {
          const target = Math.max(1, Number(goal.target || 1));
          const value = Math.min(target, Math.max(0, Math.trunc(Number(goal.value || 0))));
          return (
            <li key={`${path.id}_${goal.metric}_${goal.target}`} className={cx(styles.goal, goal.complete ? styles.goalDone : '')}>
              <span className={styles.goalCheck} aria-hidden="true">{goal.complete ? <Check strokeWidth={3.2} /> : null}</span>
              <span className={styles.goalLabel}>{goal.label}</span>
              <span className={styles.goalValue}>{value}/{target}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ClaimButton({ stage, state, disabled, loading, onClaim, size = 'lg', short = false, className = '' }) {
  let label = 'Complete uma rota';
  if (stage.claimed) label = 'Recompensa coletada';
  else if (stage.locked) label = 'Etapa bloqueada';
  else if (stage.completed) label = short ? 'Coletar' : 'Coletar recompensa';
  return (
    <Button
      size={size}
      block
      className={className}
      variant={state === 'ready' ? 'warning' : 'secondary'}
      icon={stage.claimed ? Check : (state === 'ready' ? Sparkles : (stage.locked ? Lock : Ticket))}
      disabled={disabled}
      loading={loading}
      onClick={onClaim}
    >
      {label}
    </Button>
  );
}

function TrackView({
  activeStage,
  allClaimed,
  claim,
  claimable,
  cosmetics,
  evolutionPass,
  focusEvolutionPassStage,
  focusedId,
  missionPaths,
  onOpenMissions,
  openShopItemPreview,
  recentClaim,
  stage,
  stages,
  state,
  totalLevels
}) {
  const trackRef = useRef(null);
  const centeredOnceRef = useRef(false);
  const badge = STATE_BADGES[state];

  // Mantém o nível em foco visível na trilha (só rolagem horizontal). Ao abrir a subtela,
  // vai direto ao nível; depois, ao trocar de nível, desliza até ele.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !focusedId) return;
    const node = track.querySelector(`[data-stage-id="${focusedId}"]`);
    if (!node) return;
    const left = node.offsetLeft - (track.clientWidth / 2) + (node.offsetWidth / 2);
    track.scrollTo({ left: Math.max(0, left), behavior: centeredOnceRef.current ? 'smooth' : 'auto' });
    centeredOnceRef.current = true;
  }, [focusedId]);

  return (
    <>
      <section className={styles.hero} aria-label="Progresso geral do passe">
        <div className={styles.heroMain}>
          <span className={styles.heroIcon} aria-hidden="true">{allClaimed ? '🏆' : (activeStage?.icon || '🎯')}</span>
          <div className={styles.heroText}>
            <span className={styles.heroEyebrow}>Nível {Math.max(1, Number(evolutionPass?.currentLevel || 1))} de {totalLevels}</span>
            <h2 className={styles.heroTitle}>{allClaimed ? 'Passe concluído!' : (activeStage?.name || 'Passe de Evolução')}</h2>
          </div>
          {claimable > 0 ? (
            <Badge tone="gold" variant="solid" icon={Gift} className={styles.heroBadge}>
              {claimable} para coletar
            </Badge>
          ) : null}
        </div>
        <ProgressBar value={clampPct(evolutionPass?.currentStageProgressPct)} tone="gold" size="lg" label="Progresso da etapa atual" />
        <dl className={styles.heroStats}>
          <div>
            <dt>Etapa atual</dt>
            <dd>{clampPct(evolutionPass?.currentStageProgressPct)}%</dd>
          </div>
          <div>
            <dt>Concluídas</dt>
            <dd>{Math.max(0, Number(evolutionPass?.completedCount || 0))}/{totalLevels}</dd>
          </div>
          <div>
            <dt>Passe total</dt>
            <dd>{clampPct(evolutionPass?.overallProgressPct)}%</dd>
          </div>
        </dl>
      </section>

      <section className={styles.trackSection} aria-label="Níveis do passe">
        <ol className={styles.track} ref={trackRef}>
          {stages.map((item) => {
            const itemState = getStageState(item);
            const focused = item.id === focusedId;
            return (
              <li key={item.id} className={cx(styles.node, styles[`node_${itemState}`])} data-stage-id={item.id}>
                <button
                  type="button"
                  className={cx(styles.nodeButton, focused ? styles.nodeFocused : '')}
                  onClick={() => focusEvolutionPassStage(item.id)}
                  aria-current={focused ? 'step' : undefined}
                  aria-label={`Nível ${item.level}: ${STATE_BADGES[itemState].label}`}
                >
                  <span className={styles.nodeIcon} aria-hidden="true">
                    {itemState === 'claimed' ? <Check strokeWidth={3.2} /> : (itemState === 'locked' ? <Lock strokeWidth={2.6} /> : (itemState === 'ready' ? <Gift strokeWidth={2.6} /> : item.icon))}
                  </span>
                  <span className={styles.nodeLevel}>{item.level}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={cx(styles.preview, styles[`preview_${state}`], recentClaim ? styles.burst : '')} aria-label={`Nível ${stage.level}`}>
        <div className={styles.previewHead}>
          <span className={styles.previewIcon} aria-hidden="true">
            {state === 'locked' ? <Lock strokeWidth={2.6} /> : stage.icon}
          </span>
          <div className={styles.previewTitleWrap}>
            <span className={styles.previewEyebrow}>Nível {stage.level} de {totalLevels}</span>
            <h2 className={styles.previewTitle}>{stage.name}</h2>
          </div>
          <Badge tone={badge.tone} variant={state === 'ready' ? 'solid' : 'soft'} size="sm" className={styles.previewBadge}>{badge.label}</Badge>
        </div>

        <div className={styles.previewBody}>
          {stage.locked ? (
            <p className={styles.previewLocked}>
              <Lock aria-hidden="true" strokeWidth={2.4} />
              Conclua o nível anterior para revelar as missões deste nível.
            </p>
          ) : (
            <ul className={styles.previewRoutes} aria-label="Rotas do nível">
              {missionPaths.map((path) => {
                const pct = clampPct(path.progressPct);
                return (
                  <li key={`${stage.id}_${path.id}`} className={cx(styles.previewRoute, path.complete ? styles.previewRouteDone : '')}>
                    <span className={styles.previewRouteName}>
                      <span aria-hidden="true">{path.icon}</span> {path.label}
                    </span>
                    <ProgressBar value={pct} tone={path.complete ? 'lime' : 'violet'} size="sm" label={`Progresso: ${path.label}`} />
                    <span className={styles.previewRoutePct}>
                      {path.complete ? <Check aria-label="Concluída" strokeWidth={3} /> : `${pct}%`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className={styles.previewSide}>
            <ul className={styles.rewardChips} aria-label="Recompensas do nível">
              <li className={styles.rewardChip}>
                <XpIcon aria-hidden="true" />+{Math.max(0, Number(stage?.reward?.xp || 0))} XP
              </li>
              <li className={styles.rewardChip}>
                <CoinIcon aria-hidden="true" />+{Math.max(0, Number(stage?.reward?.coins || 0))}
              </li>
              {cosmetics.map((item) => (
                <li key={`${stage.id}_${item.id}`} className={styles.rewardChipSlot}>
                  <button
                    type="button"
                    className={cx(styles.rewardChip, styles.rewardChipItem)}
                    style={{ '--rarity-color': `var(--cq-rarity-${item.rarity || 'common'})` }}
                    onClick={() => openShopItemPreview(item)}
                    aria-label={`Ver prévia: ${item.name}`}
                  >
                    <span aria-hidden="true">{item.icon || '🎁'}</span>
                    <span className={styles.rewardChipName}>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className={styles.previewActions}>
              {state === 'ready' || claim.loading ? (
                <ClaimButton stage={stage} state={state} disabled={claim.disabled} loading={claim.loading} onClaim={claim.onClaim} size="md" short />
              ) : null}
              <Button variant={state === 'ready' ? 'secondary' : 'primary'} block icon={ListChecks} onClick={onOpenMissions}>
                {stage.locked ? 'Ver nível' : 'Ver missões'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MissionsView({
  claim,
  cosmetics,
  evolutionPassFocusedStageIndex,
  focusAdjacentEvolutionPassStage,
  missionPaths,
  openShopItemPreview,
  recentClaim,
  stage,
  stages,
  state,
  totalLevels
}) {
  const badge = STATE_BADGES[state];
  return (
    <section className={cx(styles.stage, recentClaim ? styles.burst : '')} aria-label={`Missões do nível ${stage.level}`}>
      <header className={styles.stageHead}>
        <IconButton
          icon={ChevronLeft}
          label="Nível anterior"
          variant="surface"
          onClick={() => focusAdjacentEvolutionPassStage(-1)}
          disabled={evolutionPassFocusedStageIndex <= 0}
        />
        <div className={styles.stageTitleWrap}>
          <span className={styles.stageEyebrow}>Nível {stage.level} de {totalLevels}</span>
          <h2 className={styles.stageTitle}>
            <span aria-hidden="true">{stage.icon}</span> {stage.name}
          </h2>
        </div>
        <IconButton
          icon={ChevronRight}
          label="Próximo nível"
          variant="surface"
          onClick={() => focusAdjacentEvolutionPassStage(1)}
          disabled={evolutionPassFocusedStageIndex >= stages.length - 1}
        />
      </header>

      <div className={styles.stageMeta}>
        <Badge tone={badge.tone} variant={state === 'ready' ? 'solid' : 'soft'}>{badge.label}</Badge>
        <p className={styles.stageDesc}>{stage.locked ? 'Conclua o nível anterior para desbloquear esta etapa.' : stage.desc}</p>
      </div>

      <div className={styles.stageGrid}>
        <div className={styles.routes}>
          {stage.locked ? (
            <div className={styles.locked}>
              <span className={styles.lockedIcon} aria-hidden="true"><Lock strokeWidth={2.4} /></span>
              <span>
                <strong>Missões ocultas</strong>
                <span>Finalize a etapa anterior para revelar as missões desta etapa.</span>
              </span>
            </div>
          ) : (
            <>
              {stage.hint ? (
                <p className={styles.hint}><Lightbulb aria-hidden="true" strokeWidth={2.4} /> <span>{stage.hint}</span></p>
              ) : null}
              <div className={styles.routeList}>
                {missionPaths.map((path) => (
                  <RouteCard key={`${stage.id}_${path.id}`} path={path} leading={stage.leadingPathId === path.id} />
                ))}
              </div>
              <p className={styles.routeNote}>
                {stage.completedPathLabel
                  ? `Etapa concluída pela ${stage.completedPathLabel}.`
                  : 'Complete qualquer uma das rotas para liberar a coleta.'}
              </p>
            </>
          )}
        </div>

        {/* Tablet e desktop: recompensas ao lado das rotas. No celular elas ficam na trilha. */}
        <Card padding="lg" className={styles.rewards}>
          <SectionHeader title="Recompensas" icon={Gift} />
          <ul className={styles.rewardList}>
            <li className={styles.reward}>
              <span className={styles.rewardIcon} aria-hidden="true"><XpIcon /></span>
              <span className={styles.rewardText}>+{Math.max(0, Number(stage?.reward?.xp || 0))} XP</span>
            </li>
            <li className={styles.reward}>
              <span className={styles.rewardIcon} aria-hidden="true"><CoinIcon /></span>
              <span className={styles.rewardText}>+{Math.max(0, Number(stage?.reward?.coins || 0))} moedas</span>
            </li>
            {cosmetics.map((item) => (
              <li key={`${stage.id}_${item.id}`}>
                <button
                  type="button"
                  className={cx(styles.reward, styles.rewardItem)}
                  style={{ '--rarity-color': `var(--cq-rarity-${item.rarity || 'common'})` }}
                  onClick={() => openShopItemPreview(item)}
                  aria-label={`Ver prévia: ${item.name}`}
                >
                  <span className={styles.rewardIcon} aria-hidden="true">{item.icon || '🎁'}</span>
                  <span className={styles.rewardText}>
                    <span className={styles.rewardName}>{item.name}</span>
                    <span className={styles.rewardType}>{SHOP_TYPE_LABELS[item.type] || 'Cosmético'}</span>
                  </span>
                  <RarityBadge rarity={item.rarity} label={SHOP_RARITY_LABELS[item.rarity] || 'Comum'} />
                </button>
              </li>
            ))}
          </ul>
          <ClaimButton stage={stage} state={state} disabled={claim.disabled} loading={claim.loading} onClaim={claim.onClaim} />
        </Card>
      </div>

      {/* Celular: com o nível pronto, a coleta fica no pé das missões */}
      {state === 'ready' || claim.loading ? (
        <ClaimButton
          stage={stage}
          state={state}
          disabled={claim.disabled}
          loading={claim.loading}
          onClaim={claim.onClaim}
          size="md"
          className={styles.missionClaim}
        />
      ) : null}
    </section>
  );
}

export default function PassScreen({ vm }) {
  const {
    evolutionPass,
    evolutionPassFocusedStage,
    evolutionPassFocusedStageIndex,
    evolutionPassStages,
    focusAdjacentEvolutionPassStage,
    focusEvolutionPassStage,
    handleClaimEvolutionPassStage,
    openShopItemPreview,
    passClaimingStageId,
    passRecentClaimStageId
  } = vm;

  const [view, setView] = useState('track');
  const [viewDirection, setViewDirection] = useState('');
  const stages = Array.isArray(evolutionPassStages) ? evolutionPassStages : [];
  const stage = evolutionPassFocusedStage || null;
  const focusedId = String(stage?.id || '');
  const totalLevels = Math.max(1, Number(evolutionPass?.totalLevels || stages.length || 1));
  const activeStage = evolutionPass?.activeStage || null;
  const allClaimed = stages.length > 0 && stages.every((item) => item.claimed);
  const claimable = Math.max(0, Number(evolutionPass?.claimableCount || 0));

  const state = stage ? getStageState(stage) : 'locked';
  const isClaiming = !!stage && passClaimingStageId === stage.id;
  const claim = {
    loading: isClaiming,
    disabled: !stage || stage.claimed || stage.locked || !stage.completed || (Boolean(passClaimingStageId) && !isClaiming),
    onClaim: (event) => {
      if (stage) handleClaimEvolutionPassStage(stage.id, event);
    }
  };
  const cosmetics = (Array.isArray(stage?.reward?.shopItems) ? stage.reward.shopItems : [])
    .map((itemId) => getShopItem(itemId))
    .filter(Boolean);
  const missionPaths = Array.isArray(stage?.missionPaths) ? stage.missionPaths : [];

  function changeView(nextView) {
    if (nextView === view) return;
    setViewDirection(nextView === 'missions' ? 'forward' : 'back');
    setView(nextView);
  }

  const shared = {
    claim,
    cosmetics,
    missionPaths,
    openShopItemPreview,
    recentClaim: !!stage && passRecentClaimStageId === stage.id,
    stage,
    stages,
    state,
    totalLevels
  };

  return (
    <div className={cx(styles.screen, view === 'missions' ? styles.screenMissions : '')}>
      <div className={styles.top}>
        <PageHeader title="Passe de Evolução" subtitle="Cada etapa pode ser concluída pela rota PvE ou pela rota PvP." />
        <Tabs className={styles.viewTabs} block items={VIEW_TABS} value={view} onChange={changeView} ariaLabel="Seções do passe" />
      </div>

      {stage ? (
        <div
          key={view}
          className={cx(styles.view, viewDirection === 'forward' ? styles.viewForward : '', viewDirection === 'back' ? styles.viewBack : '')}
        >
          {view === 'missions' ? (
            <MissionsView
              {...shared}
              evolutionPassFocusedStageIndex={evolutionPassFocusedStageIndex}
              focusAdjacentEvolutionPassStage={focusAdjacentEvolutionPassStage}
            />
          ) : (
            <TrackView
              {...shared}
              activeStage={activeStage}
              allClaimed={allClaimed}
              claimable={claimable}
              evolutionPass={evolutionPass}
              focusEvolutionPassStage={focusEvolutionPassStage}
              focusedId={focusedId}
              onOpenMissions={() => changeView('missions')}
            />
          )}
        </div>
      ) : (
        <Card padding="lg">
          <EmptyState icon={Ticket} title="Nenhuma etapa disponível" text="O passe volta a aparecer aqui assim que houver etapas liberadas." />
        </Card>
      )}
    </div>
  );
}
