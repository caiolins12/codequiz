import { Crown, DoorOpen, Eye, Music2, Skull, Swords, VolumeX } from 'lucide-react';
import { Avatar, Button, IconButton, Modal, TimerDisplay, cx } from '../ui';
import AnswerOptions from './shared/AnswerOptions';
import { LoadingDots, arenaStyles as arena } from './shared/ArenaParts';
import { ScorePlayer, SidePlayer, battleStyles as styles } from './shared/BattleParts';
import overlay from '../overlays/Overlays.module.css';
import QuestionCard from './shared/QuestionCard';
import team from './shared/TeamBattle.module.css';

function liveRowToPlayer(entry) {
  if (!entry) return null;
  return {
    userId: String(entry.user_id || ''),
    nickname: String(entry.nickname || 'Jogador'),
    avatar: entry.avatar,
    frameClass: entry.frameClass,
    frameStyle: entry.frameStyle,
    background: entry.bgStyle,
    backgroundMeta: { className: entry.bgClassName, id: entry.bgId, rarity: entry.bgRarity },
    score: Math.max(0, Number(entry.score || 0)),
    isSelf: !!entry.isSelf
  };
}

function ScoreRows({ rows, highlightId = '', eliminatedId = '' }) {
  return (
    <ol className={overlay.list}>
      {rows.map((entry, index) => {
        const id = String(entry?.user_id || '');
        return (
          <li
            key={`row_${id}_${index}`}
            className={cx(overlay.row, id === eliminatedId ? overlay.rowDanger : (id === highlightId ? overlay.rowSelf : ''))}
          >
            <span className={overlay.rowMain}>
              <span className={overlay.rowTitle}>{index + 1}º · {entry?.nickname || 'Jogador'}{id === highlightId ? ' (você)' : ''}</span>
              {id === eliminatedId ? <span className={overlay.rowSub}>Eliminado neste ciclo</span> : null}
            </span>
            <strong>{Math.max(0, Number(entry?.score || 0))}</strong>
          </li>
        );
      })}
    </ol>
  );
}

export default function PvpEliminationScreen({ vm }) {
  const {
    confirmPvpEliminationAnswer,
    leavePvpEliminationFlow,
    music,
    pickPvpEliminationAnswer,
    pvpEliminationBattleRemainingSec,
    pvpEliminationBattleStatus,
    pvpEliminationCountdownClass,
    pvpEliminationCountdownSec,
    pvpEliminationEliminatedUserId,
    pvpEliminationEliminationLabel,
    pvpEliminationIsActivePairMember,
    pvpEliminationIsSpectator,
    pvpEliminationLivePairRows,
    pvpEliminationMatch,
    pvpEliminationMatchScoreRows,
    pvpEliminationMyUserId,
    pvpEliminationPairUser1Avatar,
    pvpEliminationPairUser1FrameClass,
    pvpEliminationPairUser1FrameStyle,
    pvpEliminationPairUser1Label,
    pvpEliminationPairUser2Avatar,
    pvpEliminationPairUser2FrameClass,
    pvpEliminationPairUser2FrameStyle,
    pvpEliminationPairUser2Label,
    pvpEliminationQuestion,
    pvpEliminationResultRows,
    pvpEliminationRoundLabel,
    pvpEliminationRoundResultLabel,
    pvpEliminationSelectedIndex,
    pvpEliminationShowBattleIntro,
    pvpEliminationSubmitted,
    pvpEliminationTimerClass,
    pvpEliminationTimerPct,
    pvpEliminationWaitingPairAnswer,
    pvpEliminationWinnerMember,
    pvpEliminationWinnerUserId
  } = vm;

  const pair = (Array.isArray(pvpEliminationLivePairRows) ? pvpEliminationLivePairRows : []).map(liveRowToPlayer);
  const left = pair[0] || null;
  const right = pair[1] || null;
  const active = pvpEliminationBattleStatus === 'active';
  const locked = pvpEliminationSubmitted || !active || !pvpEliminationIsActivePairMember || pvpEliminationIsSpectator || pvpEliminationShowBattleIntro;
  const selected = Number(pvpEliminationSelectedIndex);
  const hasSelection = Number.isFinite(selected) && selected >= 0 && pvpEliminationSelectedIndex !== null;
  const timerLevel = pvpEliminationTimerClass === 'danger' ? 'danger' : (pvpEliminationTimerClass === 'warning' ? 'warning' : '');
  const countdown = Math.max(0, Number(pvpEliminationCountdownSec || 0));

  let status = null;
  if (active) {
    if (pvpEliminationShowBattleIntro) status = { icon: Swords, text: 'Preparando o confronto da rodada...' };
    else if (pvpEliminationIsSpectator) status = { icon: Eye, text: 'Você foi eliminado e está assistindo aos confrontos.' };
    else if (!pvpEliminationIsActivePairMember) status = { icon: Eye, text: 'Aguardando o duelo de outros jogadores...' };
  }

  return (
    <div className={styles.battle}>
      <header className={styles.top}>
        <IconButton icon={DoorOpen} label="Sair da partida" variant="surface" onClick={() => leavePvpEliminationFlow()} />
        <div className={styles.round}>
          <Crown size={20} strokeWidth={2.6} aria-hidden="true" />
          <span className={styles.roundLabel}>{pvpEliminationRoundLabel}</span>
        </div>
        {music ? (
          <IconButton
            icon={music.enabled ? Music2 : VolumeX}
            label={music.enabled ? 'Desligar música' : 'Ligar música'}
            onClick={() => music.onToggle(!music.enabled)}
          />
        ) : null}
      </header>

      <div className={styles.scoreboard}>
        <ScorePlayer player={left} score={left?.score || 0} me={!!left?.isSelf} />
        <span className={styles.vs} aria-hidden="true">VS</span>
        <ScorePlayer player={right} score={right?.score || 0} me={!!right?.isSelf} right />
      </div>

      <TimerDisplay seconds={pvpEliminationBattleRemainingSec} percent={pvpEliminationTimerPct} level={timerLevel} />

      <div className={styles.arena}>
        <SidePlayer player={left} score={left?.score || 0} me={!!left?.isSelf} />
        <main className={styles.stage}>
          <span className={team.duelNow}>
            <Swords strokeWidth={2.6} aria-hidden="true" />
            Em duelo agora: {pvpEliminationPairUser1Label} × {pvpEliminationPairUser2Label}
          </span>
          <QuestionCard question={pvpEliminationQuestion} />
          {status ? (
            <span className={team.spectator}>
              <status.icon size={18} strokeWidth={2.6} aria-hidden="true" /> {status.text}
            </span>
          ) : null}
          <AnswerOptions
            options={pvpEliminationQuestion?.opts || []}
            selectedIndex={hasSelection ? selected : null}
            onSelect={pickPvpEliminationAnswer}
            disabled={locked}
            keyPrefix={`elim${pvpEliminationMatch?.battle_no || 1}`}
          />
          <footer className={styles.footer}>
            <Button size="xl" variant="success" block disabled={locked || !hasSelection} onClick={confirmPvpEliminationAnswer}>
              Confirmar resposta
            </Button>
            {active && pvpEliminationIsActivePairMember && pvpEliminationWaitingPairAnswer && !pvpEliminationShowBattleIntro ? (
              <span className={styles.waiting} role="status">
                <span className={styles.waitingDot} aria-hidden="true" />
                Resposta enviada. Aguardando o adversário...
              </span>
            ) : null}
          </footer>
        </main>
        <SidePlayer player={right} score={right?.score || 0} me={!!right?.isSelf} />
      </div>

      {pvpEliminationShowBattleIntro ? (
        <Modal title={`${pvpEliminationPairUser1Label} × ${pvpEliminationPairUser2Label}`} subtitle="Próximo confronto" icon={Swords} tone="orange" size="sm" centered>
          <div className={styles.roundResult}>
            <div className={arena.versus}>
              <span className={overlay.centerItem}>
                <Avatar avatar={pvpEliminationPairUser1Avatar} frameClass={pvpEliminationPairUser1FrameClass} frameStyle={pvpEliminationPairUser1FrameStyle} size="lg" />
              </span>
              <span className={arena.vs}>VS</span>
              <span className={overlay.centerItem}>
                <Avatar avatar={pvpEliminationPairUser2Avatar} frameClass={pvpEliminationPairUser2FrameClass} frameStyle={pvpEliminationPairUser2FrameStyle} size="lg" />
              </span>
            </div>
            <LoadingDots />
          </div>
        </Modal>
      ) : null}

      {pvpEliminationBattleStatus === 'round_result' && !pvpEliminationShowBattleIntro ? (
        <Modal title={pvpEliminationRoundResultLabel} subtitle={`${pvpEliminationRoundLabel} · placar geral`} icon={Crown} tone="gold" size="sm" centered>
          <div className={styles.roundResult}>
            <ScoreRows rows={Array.isArray(pvpEliminationMatchScoreRows) ? pvpEliminationMatchScoreRows : []} highlightId={pvpEliminationMyUserId} />
            <span className={cx(styles.nextIn, pvpEliminationCountdownClass ? styles.nextInUrgent : '')} role="timer">
              Próximo duelo em {countdown}s
            </span>
          </div>
        </Modal>
      ) : null}

      {pvpEliminationBattleStatus === 'elimination_result' ? (
        <Modal title={pvpEliminationEliminationLabel} subtitle="Fim do ciclo" icon={Skull} tone="red" size="sm" centered>
          <div className={styles.roundResult}>
            <ScoreRows rows={Array.isArray(pvpEliminationResultRows) ? pvpEliminationResultRows : []} highlightId={pvpEliminationMyUserId} eliminatedId={pvpEliminationEliminatedUserId} />
            {pvpEliminationWinnerUserId ? (
              <span className={team.spectator}><Crown size={18} strokeWidth={2.6} aria-hidden="true" /> Campeão: {pvpEliminationWinnerMember?.nickname || 'Jogador'}</span>
            ) : null}
            <span className={cx(styles.nextIn, pvpEliminationCountdownClass ? styles.nextInUrgent : '')} role="timer">
              {pvpEliminationWinnerUserId ? 'Resultado final em ' : 'Novo ciclo em '}{countdown}s
            </span>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
