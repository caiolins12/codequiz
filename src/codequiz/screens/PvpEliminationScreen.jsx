import { Crown, DoorOpen, Eye, Music2, Skull, Swords, VolumeX } from 'lucide-react';
import { Avatar, Button, IconButton, Modal, TimerDisplay, cx } from '../ui';
import AnswerOptions from './shared/AnswerOptions';
import { LoadingDots, arenaStyles as arena } from './shared/ArenaParts';
import { EmojiBar, EmojiFxLayer, EmojiToggle, ScorePlayer, SidePlayer, TiebreakDifficultyBadge, battleStyles as styles } from './shared/BattleParts';
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
    isSelf: !!entry.isSelf,
    answered: !!entry.answered
  };
}

function ScoreRows({ rows, highlightId = '', eliminatedId = '' }) {
  return (
    <ol className={styles.standings}>
      {rows.map((entry, index) => {
        const id = String(entry?.user_id || '');
        const score = Math.max(0, Number(entry?.score || 0));
        return (
          <li
            key={`row_${id}_${index}`}
            className={cx(
              styles.standingsRow,
              id === highlightId ? styles.standingsSelf : '',
              id === eliminatedId ? styles.standingsOut : ''
            )}
          >
            <span className={styles.standingsPos}>{index + 1}º</span>
            <span className={styles.standingsMain}>
              <span className={styles.standingsName}>{entry?.nickname || 'Jogador'}{id === highlightId ? ' (você)' : ''}</span>
              {id === eliminatedId ? <span className={styles.standingsSub}>Eliminado neste ciclo</span> : null}
            </span>
            <strong className={styles.standingsScore} aria-label={`${score} acerto${score === 1 ? '' : 's'}`}>{score}</strong>
          </li>
        );
      })}
    </ol>
  );
}

export default function PvpEliminationScreen({ vm }) {
  const {
    confirmPvpEliminationAnswer,
    emojis,
    leavePvpEliminationFlow,
    music,
    pickPvpEliminationAnswer,
    pvpEliminationAnswerWindowOpen,
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
    pvpEliminationNextTiebreakDifficultyLabel,
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
    pvpEliminationTiebreakDifficultyLabel,
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
  const locked = pvpEliminationSubmitted
    || !active
    || !pvpEliminationIsActivePairMember
    || pvpEliminationIsSpectator
    || pvpEliminationShowBattleIntro
    || pvpEliminationAnswerWindowOpen === false;
  const selected = Number(pvpEliminationSelectedIndex);
  const hasSelection = Number.isFinite(selected) && selected >= 0 && pvpEliminationSelectedIndex !== null;
  const timerLevel = pvpEliminationTimerClass === 'danger' ? 'danger' : (pvpEliminationTimerClass === 'warning' ? 'warning' : '');
  const countdown = Math.max(0, Number(pvpEliminationCountdownSec || 0));
  const cycleTiebreak = pvpEliminationMatch?.cycle_tiebreak === true
    && !pvpEliminationEliminatedUserId
    && !pvpEliminationWinnerUserId;
  // Durante o duelo todos veem se cada um já respondeu (como no duelo 1x1).
  const showAnswerState = active && !pvpEliminationShowBattleIntro;
  const leftAnswered = showAnswerState && left ? left.answered : null;
  const rightAnswered = showAnswerState && right ? right.answered : null;

  let status = null;
  if (active) {
    if (pvpEliminationShowBattleIntro) status = { icon: Swords, text: 'Preparando o confronto da rodada...' };
    else if (pvpEliminationIsSpectator) status = { icon: Eye, text: 'Você foi eliminado e está assistindo aos confrontos.' };
    else if (!pvpEliminationIsActivePairMember) status = { icon: Eye, text: 'Aguardando o duelo de outros jogadores...' };
  }
  // Reações: quem duela tem o botão ao lado do "Confirmar" (mobile); quem assiste, a fileira toda.
  const emojiProps = emojis?.onSend ? {
    emojis: emojis.list,
    onSend: emojis.onSend,
    cooldownActive: emojis.cooldownActive,
    cooldownPct: emojis.cooldownPct,
    cooldownLabel: emojis.cooldownLabel
  } : null;

  return (
    <div className={styles.battle}>
      <header className={styles.top}>
        <IconButton icon={DoorOpen} label="Sair da partida" variant="surface" onClick={() => leavePvpEliminationFlow()} />
        <div className={styles.round}>
          <Crown size={20} strokeWidth={2.6} aria-hidden="true" />
          <span className={styles.roundText}>
            <span className={styles.roundLabel}>{pvpEliminationRoundLabel}</span>
            <TiebreakDifficultyBadge label={pvpEliminationTiebreakDifficultyLabel} />
          </span>
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
        <ScorePlayer player={left} score={left?.score || 0} me={!!left?.isSelf} answered={leftAnswered} />
        <span className={styles.vs} aria-hidden="true">VS</span>
        <ScorePlayer player={right} score={right?.score || 0} me={!!right?.isSelf} answered={rightAnswered} right />
      </div>

      <TimerDisplay seconds={pvpEliminationBattleRemainingSec} percent={pvpEliminationTimerPct} level={timerLevel} />

      <div className={styles.arena}>
        <SidePlayer player={left} score={left?.score || 0} me={!!left?.isSelf} answered={leftAnswered} />
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
          <footer className={cx(styles.footer, status ? styles.footerIdle : (emojiProps ? styles.footerDuel : ''))}>
            {emojiProps && active && !status ? <EmojiToggle {...emojiProps} /> : null}
            <Button size="xl" variant="success" block disabled={locked || !hasSelection} onClick={confirmPvpEliminationAnswer}>
              Confirmar resposta
            </Button>
            {active && pvpEliminationIsActivePairMember && pvpEliminationWaitingPairAnswer && !pvpEliminationShowBattleIntro ? (
              <span className={styles.waiting} role="status">
                <span className={styles.waitingDot} aria-hidden="true" />
                Resposta enviada. Aguardando o adversário...
              </span>
            ) : null}
            {emojiProps && active ? (
              <EmojiBar {...emojiProps} className={status ? '' : styles.emojiBarWide} />
            ) : null}
          </footer>
        </main>
        <SidePlayer player={right} score={right?.score || 0} me={!!right?.isSelf} answered={rightAnswered} />
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
            {emojiProps ? <EmojiBar {...emojiProps} /> : null}
          </div>
        </Modal>
      ) : null}

      {pvpEliminationBattleStatus === 'elimination_result' ? (
        <Modal title={pvpEliminationEliminationLabel} subtitle={cycleTiebreak ? 'Desempate' : 'Fim do ciclo'} icon={cycleTiebreak ? Swords : Skull} tone={cycleTiebreak ? 'gold' : 'red'} size="sm" centered>
          <div className={styles.roundResult}>
            <ScoreRows rows={Array.isArray(pvpEliminationResultRows) ? pvpEliminationResultRows : []} highlightId={pvpEliminationMyUserId} eliminatedId={pvpEliminationEliminatedUserId} />
            {pvpEliminationWinnerUserId ? (
              <span className={team.spectator}><Crown size={18} strokeWidth={2.6} aria-hidden="true" /> Campeão: {pvpEliminationWinnerMember?.nickname || 'Jogador'}</span>
            ) : null}
            <TiebreakDifficultyBadge label={pvpEliminationNextTiebreakDifficultyLabel} announce />
            <span className={cx(styles.nextIn, pvpEliminationCountdownClass ? styles.nextInUrgent : '')} role="timer">
              {pvpEliminationWinnerUserId ? 'Resultado final em ' : cycleTiebreak ? 'Desempate em ' : 'Novo ciclo em '}{countdown}s
            </span>
            {emojiProps ? <EmojiBar {...emojiProps} /> : null}
          </div>
        </Modal>
      ) : null}

      <EmojiFxLayer items={Array.isArray(emojis?.fx) ? emojis.fx : []} />
    </div>
  );
}
