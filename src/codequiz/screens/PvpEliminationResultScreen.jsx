import { Crown, Flag, Home, ListOrdered, Medal, Swords } from 'lucide-react';
import { formatSignedPoints } from '../app/helpers';
import { Avatar, Badge, Button, Card, CoinIcon, Confetti, SectionHeader, StatTile, XpIcon, cx } from '../ui';
import { EmojiBar, EmojiFxLayer, battleStyles as battle } from './shared/BattleParts';
import { buildPlayerView } from './shared/players';
import game from './shared/Game.module.css';
import outcome from './shared/Outcome.module.css';

// Só o campeão recebe vitória; a apresentação do vice preserva sua colocação.
const OUTCOMES = {
  win: { title: 'Campeão da eliminatória!', icon: Crown, tone: outcome.great },
  runner_up: { title: 'Vice-campeão!', icon: Medal, tone: outcome.ok },
  loss: { title: 'Eliminatória encerrada', icon: Flag, tone: outcome.low }
};

const PODIUM = [outcome.rankPos1, outcome.rankPos2, outcome.rankPos3];

export default function PvpEliminationResultScreen({ vm }) {
  const {
    buildCosmeticSnapshot,
    collectPvpEliminationResultRewards,
    emojis,
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
    setPvpMode,
    setScreen
  } = vm;

  const placementLabel = pvpEliminationResultReward?.placementLabel || pvpEliminationPlacementLabel;
  const rows = Array.isArray(pvpEliminationResultRows) ? pvpEliminationResultRows : [];
  const placement = Number(pvpEliminationResultReward?.placement
    || rows.find((row) => String(row?.user_id || '') === pvpEliminationMyUserId)?.placement
    || 0);
  const key = pvpEliminationResultKey === 'win' ? 'win' : (placement === 2 ? 'runner_up' : 'loss');
  const view = OUTCOMES[key];
  const Icon = view.icon;
  const points = Number(pvpEliminationResultReward?.points || 0);
  const winnerIsMe = !!pvpEliminationWinnerUserId && pvpEliminationWinnerUserId === pvpEliminationMyUserId;

  const goHome = () => {
    resetPvpEliminationState();
    setPvpMode('');
    setScreen('home');
  };

  return (
    <div className={game.game}>
      {key === 'win' ? <Confetti count={90} seed={13} /> : null}
      <main className={outcome.split}>
        <div className={outcome.splitMain}>
          <section className={cx(outcome.hero, view.tone)}>
            <span className={outcome.heroIcon} aria-hidden="true"><Icon strokeWidth={2.4} /></span>
            <h1 className={outcome.heroTitle}>{view.title}</h1>
            <p className={outcome.heroText}>
              {key === 'win' ? 'Você venceu todos os ciclos da arena.' : `Você terminou em ${placementLabel}.`}
            </p>
            <div className={outcome.heroMeta}>
              <Badge tone={key === 'win' ? 'gold' : 'violet'} icon={Medal}>{placementLabel}</Badge>
              {pvpEliminationWinnerUserId && !winnerIsMe ? (
                <Badge tone="gold" icon={Crown}>Campeão: {pvpEliminationWinnerMember?.nickname || 'Jogador'}</Badge>
              ) : null}
            </div>
            {emojis?.onSend ? (
              <EmojiBar
                emojis={emojis.list}
                onSend={emojis.onSend}
                cooldownActive={emojis.cooldownActive}
                cooldownPct={emojis.cooldownPct}
                cooldownLabel={emojis.cooldownLabel}
                className={battle.emojiBarResult}
              />
            ) : null}
          </section>
        </div>

        <div className={outcome.splitSide}>
          <Card padding="lg" className={outcome.rankCard}>
            <SectionHeader title="Classificação final" icon={ListOrdered} />
            <ol className={outcome.list}>
              {rows.map((entry, index) => {
                const player = buildPlayerView(entry, buildCosmeticSnapshot);
                const isSelf = player.userId === pvpEliminationMyUserId;
                const placement = Math.max(1, Number(entry?.placement || index + 1));
                const score = Math.max(0, Number(entry?.score || 0));
                return (
                  <li key={`elim_result_${player.userId}_${index}`} className={cx(outcome.rankRow, isSelf ? outcome.rankSelf : '')}>
                    <span className={cx(outcome.rankPos, PODIUM[placement - 1] || '')}>{placement}</span>
                    <Avatar avatar={player.avatar} frameClass={player.frameClass} frameStyle={player.frameStyle} size="xs" />
                    <span className={outcome.rankName}>{player.nickname}{isSelf ? ' (você)' : ''}</span>
                    <span className={outcome.rankMeta}>{score} acerto{score === 1 ? '' : 's'}</span>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        <div className={outcome.splitActions}>
          {pvpEliminationResultReward ? (
            <>
              <div className={outcome.rewards}>
                <StatTile icon={Swords} label="Pontos PvP" value={formatSignedPoints(points)} tone={points >= 0 ? 'violet' : 'red'} />
                <StatTile icon={XpIcon} label="XP" value={`+${Math.max(0, Number(pvpEliminationResultReward.xp || 0))}`} tone="blue" />
                <StatTile icon={CoinIcon} label="Moedas" value={`+${Math.max(0, Number(pvpEliminationResultReward.coins || 0))}`} tone="gold" />
              </div>
              <Button size="xl" variant="warning" block loading={pvpEliminationRewardCollecting} onClick={(event) => collectPvpEliminationResultRewards(event)}>
                Coletar recompensas
              </Button>
              <p className={cx(outcome.muted, outcome.centerText)}>Depois da coleta você volta para o início.</p>
            </>
          ) : !pvpEliminationResultProcessed ? (
            <p className={cx(outcome.muted, outcome.centerText)} role="status">Preparando recompensas...</p>
          ) : (
            <Button size="xl" variant="primary" block icon={Home} onClick={goHome}>
              Voltar ao início
            </Button>
          )}
        </div>
      </main>
      <EmojiFxLayer items={Array.isArray(emojis?.fx) ? emojis.fx : []} />
    </div>
  );
}
