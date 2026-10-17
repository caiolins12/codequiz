import { useEffect } from 'react';
import { DoorOpen, Music2, Swords, VolumeX } from 'lucide-react';
import { Badge, Button, IconButton, Modal, TimerDisplay, cx } from '../ui';
import AnswerOptions from './shared/AnswerOptions';
import { EmojiBar, EmojiFxLayer, ScorePlayer, SidePlayer, battleStyles as styles } from './shared/BattleParts';
import { playerViewFromShop } from './shared/players';
import QuestionCard from './shared/QuestionCard';

export default function PvpDuelScreen({ vm }) {
  const {
    authUser,
    confirmPvpAnswer,
    leavePvpFlow,
    music,
    pickPvpAnswer,
    pvpBattleEmojis,
    pvpEmojiCooldownActive,
    pvpEmojiCooldownFillPct,
    pvpEmojiCooldownLabel,
    pvpEmojiFx,
    pvpHasPlayer1Answer,
    pvpHasPlayer2Answer,
    pvpIsRoundResult,
    pvpMatch,
    pvpPlayer1Avatar,
    pvpPlayer1BackgroundMeta,
    pvpPlayer1FrameClass,
    pvpPlayer1FrameStyle,
    pvpPlayer1Id,
    pvpPlayer1Shop,
    pvpPlayer2Avatar,
    pvpPlayer2BackgroundMeta,
    pvpPlayer2FrameClass,
    pvpPlayer2FrameStyle,
    pvpPlayer2Shop,
    pvpQuestion,
    pvpQuestionHasOverflow,
    pvpQuestionScrollRef,
    pvpRoundNo,
    pvpRoundPhaseLabel,
    pvpRoundPlayer1Feedback,
    pvpRoundPlayer2Feedback,
    pvpRoundRemainingSec,
    pvpRoundResultCountdownClass,
    pvpRoundResultKicker,
    pvpRoundResultLabel,
    pvpRoundResultRemainingSec,
    pvpState,
    pvpTimerClass,
    pvpTimerPct,
    pvpTotalRounds,
    pvpWaitingOpponent,
    sendPvpEmoji
  } = vm;

  const selfId = String(authUser?.uid || '');
  const meIsPlayer1 = !!selfId && selfId === String(pvpPlayer1Id || '');
  const player1 = playerViewFromShop({
    nickname: pvpMatch?.player1_nickname || 'Jogador 1',
    avatar: pvpPlayer1Avatar,
    frameClass: pvpPlayer1FrameClass,
    frameStyle: pvpPlayer1FrameStyle,
    shop: pvpPlayer1Shop,
    backgroundMeta: pvpPlayer1BackgroundMeta
  });
  const player2 = playerViewFromShop({
    nickname: pvpMatch?.player2_nickname || 'Jogador 2',
    avatar: pvpPlayer2Avatar,
    frameClass: pvpPlayer2FrameClass,
    frameStyle: pvpPlayer2FrameStyle,
    shop: pvpPlayer2Shop,
    backgroundMeta: pvpPlayer2BackgroundMeta
  });
  const score1 = Math.max(0, Number(pvpMatch?.player1_score || 0));
  const score2 = Math.max(0, Number(pvpMatch?.player2_score || 0));
  const selected = Number(pvpState.selectedIndex);
  const hasSelection = Number.isFinite(selected) && selected >= 0 && pvpState.selectedIndex !== null;
  const locked = !!pvpState.submitted || pvpIsRoundResult;
  const canConfirm = !locked && hasSelection;
  const optionCount = pvpQuestion?.opts?.length || 0;
  const answeredStatus = pvpIsRoundResult ? null : true;

  useEffect(() => {
    const handleKey = (event) => {
      if (locked || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const key = String(event.key || '').toLowerCase();
      const numeric = Number(key);
      let pick = -1;
      if (Number.isInteger(numeric) && numeric >= 1 && numeric <= optionCount) pick = numeric - 1;
      else if (key.length === 1 && key >= 'a' && key <= 'd') pick = key.charCodeAt(0) - 97;
      if (pick >= 0 && pick < optionCount) {
        event.preventDefault();
        pickPvpAnswer(pick);
      } else if (key === 'enter' && canConfirm) {
        event.preventDefault();
        confirmPvpAnswer();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [canConfirm, confirmPvpAnswer, locked, optionCount, pickPvpAnswer]);

  const timerLevel = pvpTimerClass === 'danger' ? 'danger' : (pvpTimerClass === 'warning' ? 'warning' : '');

  return (
    <div className={styles.battle}>
      <header className={styles.top}>
        <IconButton icon={DoorOpen} label="Sair da partida" variant="surface" onClick={() => leavePvpFlow()} />
        <div className={styles.round}>
          <Swords size={20} strokeWidth={2.6} aria-hidden="true" />
          <span className={styles.roundLabel}>Rodada {pvpRoundNo}/{pvpTotalRounds}</span>
          {pvpRoundPhaseLabel ? <Badge tone="gold" size="sm">{pvpRoundPhaseLabel}</Badge> : null}
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
        <ScorePlayer player={player1} score={score1} me={meIsPlayer1} answered={answeredStatus && pvpHasPlayer1Answer} />
        <span className={styles.vs} aria-hidden="true">VS</span>
        <ScorePlayer player={player2} score={score2} me={!meIsPlayer1 && !!selfId} answered={answeredStatus && pvpHasPlayer2Answer} right />
      </div>

      <TimerDisplay seconds={pvpRoundRemainingSec} percent={pvpTimerPct} level={timerLevel} />

      <div className={styles.arena}>
        <SidePlayer player={player1} score={score1} me={meIsPlayer1} answered={answeredStatus && pvpHasPlayer1Answer} />
        <main className={styles.stage}>
          <QuestionCard question={pvpQuestion} scrollRef={pvpQuestionScrollRef} hasOverflow={pvpQuestionHasOverflow} />
          <AnswerOptions
            options={pvpQuestion?.opts || []}
            selectedIndex={hasSelection ? selected : null}
            onSelect={pickPvpAnswer}
            disabled={locked}
            keyPrefix={`pvp${pvpRoundNo}`}
          />
        </main>
        <SidePlayer player={player2} score={score2} me={!meIsPlayer1 && !!selfId} answered={answeredStatus && pvpHasPlayer2Answer} />
      </div>

      <footer className={styles.footer}>
        <Button size="xl" variant="success" block disabled={!canConfirm} onClick={confirmPvpAnswer}>
          Confirmar resposta
        </Button>
        {pvpWaitingOpponent ? (
          <span className={styles.waiting} role="status">
            <span className={styles.waitingDot} aria-hidden="true" />
            Aguardando o oponente responder...
          </span>
        ) : null}
        {!pvpIsRoundResult ? (
          <EmojiBar
            emojis={pvpBattleEmojis}
            onSend={sendPvpEmoji}
            cooldownActive={pvpEmojiCooldownActive}
            cooldownPct={pvpEmojiCooldownFillPct}
            cooldownLabel={pvpEmojiCooldownLabel}
          />
        ) : null}
      </footer>

      <EmojiFxLayer items={pvpEmojiFx} />

      {pvpIsRoundResult ? (
        <Modal title={pvpRoundResultLabel} subtitle={pvpRoundResultKicker} icon={Swords} tone="gold" size="sm" centered>
          <div className={styles.roundResult}>
            <div className={styles.scoreline}>
              <span className={styles.scorelineItem}>
                <span className={styles.scorelineName}>{player1.nickname}</span>
                <span className={styles.scorelineValue}>{score1}</span>
              </span>
              <span className={styles.scorelineDivider} aria-hidden="true">×</span>
              <span className={styles.scorelineItem}>
                <span className={styles.scorelineName}>{player2.nickname}</span>
                <span className={styles.scorelineValue}>{score2}</span>
              </span>
            </div>
            <div className={styles.answerChips}>
              <div className={cx(styles.answerChip, styles[pvpRoundPlayer1Feedback?.cssClass] || '')}>
                <span className={styles.answerChipName}>{player1.nickname}</span>
                <span className={styles.answerChipState}>{pvpRoundPlayer1Feedback?.emoji} {pvpRoundPlayer1Feedback?.label}</span>
              </div>
              <div className={cx(styles.answerChip, styles[pvpRoundPlayer2Feedback?.cssClass] || '')}>
                <span className={styles.answerChipName}>{player2.nickname}</span>
                <span className={styles.answerChipState}>{pvpRoundPlayer2Feedback?.emoji} {pvpRoundPlayer2Feedback?.label}</span>
              </div>
            </div>
            <span className={cx(styles.nextIn, pvpRoundResultCountdownClass ? styles.nextInUrgent : '')} role="timer">
              Próxima pergunta em {pvpRoundResultRemainingSec}s
            </span>
            <EmojiBar
              emojis={pvpBattleEmojis}
              onSend={sendPvpEmoji}
              cooldownActive={pvpEmojiCooldownActive}
              cooldownPct={pvpEmojiCooldownFillPct}
              cooldownLabel={pvpEmojiCooldownLabel}
            />
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
