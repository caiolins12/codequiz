import { DoorOpen, Eye, Music2, Swords, Users, VolumeX } from 'lucide-react';
import { getPvpTeamBattleDisplayLabel } from '../app/helpers';
import { Avatar, Button, IconButton, Modal, TimerDisplay, cx } from '../ui';
import AnswerOptions from './shared/AnswerOptions';
import { EmojiBar, EmojiFxLayer, EmojiToggle, TiebreakDifficultyBadge, battleStyles as styles } from './shared/BattleParts';
import { buildPlayerView } from './shared/players';
import QuestionCard from './shared/QuestionCard';
import team from './shared/TeamBattle.module.css';

function TeamPanel({
  side,
  label,
  members,
  score,
  activeUserId,
  mine,
  buildCosmeticSnapshot,
  memberScores,
  leftMemberIds = [],
  answeredIds = null
}) {
  return (
    <section className={cx(team.team, side === 'blue' ? team.blue : '', side === 'blue' ? team.teamBlue : team.teamRed, mine ? team.mine : '')}>
      {mine ? <span className={team.youTag} aria-hidden="true">Seu time</span> : null}
      <div className={team.teamHead}>
        <span className={team.teamName}>Time {label}{mine ? ' (você)' : ''}</span>
        <span className={team.teamScore}>{score}</span>
      </div>
      <ul className={team.members}>
        {members.map((member) => {
          const player = buildPlayerView(member, buildCosmeticSnapshot);
          const memberScore = Math.max(0, Number(memberScores?.[player.userId] || 0));
          const left = leftMemberIds.includes(player.userId);
          const dueling = activeUserId === player.userId;
          // Durante o confronto, quem duela mostra se já respondeu (todos veem, inclusive quem assiste).
          const answered = dueling && !left && Array.isArray(answeredIds) ? answeredIds.includes(player.userId) : null;
          return (
            <li key={`${side}_${player.userId}`} className={cx(team.member, dueling ? team.memberActive : '')}>
              <Avatar avatar={player.avatar} frameClass={player.frameClass} frameStyle={player.frameStyle} size="xs" />
              <span className={team.memberText}>
                <span className={team.memberName}>{player.nickname}</span>
                <span className={team.memberMeta}>
                  {memberScore} acerto{memberScore === 1 ? '' : 's'}
                  {left ? ' · saiu da partida' : (dueling ? ' · duelando' : '')}
                </span>
                {answered !== null ? (
                  <span className={cx(team.memberStatus, answered ? team.memberStatusDone : '')}>
                    {answered ? 'Respondeu' : 'Pensando...'}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function PvpTeamScreen({ vm }) {
  const {
    buildCosmeticSnapshot,
    confirmPvpTeamAnswer,
    emojis,
    leavePvpTeamFlow,
    music,
    pickPvpTeamAnswer,
    pvpTeamBattleEntry,
    pvpTeamBattleNo,
    pvpTeamBattleRemainingSec,
    pvpTeamBattleStatus,
    pvpTeamBlueFeedback,
    pvpTeamBlueMembers,
    pvpTeamCurrentBattleLabel,
    pvpTeamCurrentPairLabel,
    pvpTeamAnswerWindowOpen,
    pvpTeamAnsweredUserIds,
    pvpTeamIsActivePlayer,
    pvpTeamLeftMemberIds,
    pvpTeamMatch,
    pvpTeamMySide,
    pvpTeamNextTiebreakDifficultyLabel,
    pvpTeamQuestion,
    pvpTeamRedFeedback,
    pvpTeamRedMembers,
    pvpTeamResultEntry,
    pvpTeamResultPair,
    pvpTeamRoundResultCountdownClass,
    pvpTeamRoundResultLabel,
    pvpTeamRoundResultRemainingSec,
    pvpTeamSelectedIndex,
    pvpTeamSubmitted,
    pvpTeamTiebreakDifficultyLabel,
    pvpTeamTimerClass,
    pvpTeamTimerPct
  } = vm;

  const isRoundResult = pvpTeamBattleStatus === 'round_result';
  const locked = pvpTeamSubmitted || isRoundResult || !pvpTeamIsActivePlayer || pvpTeamAnswerWindowOpen === false;
  const leftIds = Array.isArray(pvpTeamLeftMemberIds) ? pvpTeamLeftMemberIds : [];
  const selected = Number(pvpTeamSelectedIndex);
  const hasSelection = Number.isFinite(selected) && selected >= 0 && pvpTeamSelectedIndex !== null;
  const redScore = Math.max(0, Number(pvpTeamMatch?.red_score || 0));
  const blueScore = Math.max(0, Number(pvpTeamMatch?.blue_score || 0));
  const timerLevel = pvpTeamTimerClass === 'danger' ? 'danger' : (pvpTeamTimerClass === 'warning' ? 'warning' : '');
  const answeredIds = pvpTeamBattleStatus === 'active' && Array.isArray(pvpTeamAnsweredUserIds) ? pvpTeamAnsweredUserIds : null;
  const watching = !pvpTeamIsActivePlayer && pvpTeamBattleStatus === 'active';
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
        <IconButton icon={DoorOpen} label="Sair da batalha" variant="surface" onClick={() => leavePvpTeamFlow()} />
        <div className={styles.round}>
          <Users size={20} strokeWidth={2.6} aria-hidden="true" />
          <span className={styles.roundText}>
            <span className={styles.roundLabel}>{pvpTeamCurrentBattleLabel}</span>
            <TiebreakDifficultyBadge label={pvpTeamTiebreakDifficultyLabel} />
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

      <TimerDisplay seconds={pvpTeamBattleRemainingSec} percent={pvpTeamTimerPct} level={timerLevel} />

      <div className={team.layout}>
        <div className={team.teams}>
          <TeamPanel
            side="red"
            label="Vermelho"
            members={pvpTeamRedMembers}
            score={redScore}
            activeUserId={String(pvpTeamBattleEntry?.red_user_id || '').trim()}
            mine={pvpTeamMySide === 'red'}
            buildCosmeticSnapshot={buildCosmeticSnapshot}
            memberScores={pvpTeamMatch?.member_scores}
            leftMemberIds={leftIds}
            answeredIds={answeredIds}
          />
          <TeamPanel
            side="blue"
            label="Azul"
            members={pvpTeamBlueMembers}
            score={blueScore}
            activeUserId={String(pvpTeamBattleEntry?.blue_user_id || '').trim()}
            mine={pvpTeamMySide === 'blue'}
            buildCosmeticSnapshot={buildCosmeticSnapshot}
            memberScores={pvpTeamMatch?.member_scores}
            leftMemberIds={leftIds}
            answeredIds={answeredIds}
          />
        </div>

        <main className={cx(styles.stage, team.stageCol)}>
          <span className={team.duelNow}><Swords strokeWidth={2.6} aria-hidden="true" /> Duelo atual: {pvpTeamCurrentPairLabel}</span>
          <QuestionCard question={pvpTeamQuestion} />
          {!pvpTeamIsActivePlayer && pvpTeamBattleStatus === 'active' ? (
            <span className={team.spectator}><Eye size={18} strokeWidth={2.6} aria-hidden="true" /> Você está assistindo ao duelo da sua dupla.</span>
          ) : null}
          <AnswerOptions
            options={pvpTeamQuestion?.opts || []}
            selectedIndex={hasSelection ? selected : null}
            onSelect={pickPvpTeamAnswer}
            disabled={locked}
            keyPrefix={`team${pvpTeamBattleNo}`}
          />
          <footer className={cx(styles.footer, watching ? styles.footerIdle : (emojiProps ? styles.footerDuel : ''))}>
            {emojiProps && !isRoundResult && !watching ? <EmojiToggle {...emojiProps} /> : null}
            <Button
              size="xl"
              variant="success"
              block
              disabled={locked || !hasSelection}
              onClick={confirmPvpTeamAnswer}
            >
              Confirmar resposta
            </Button>
            {pvpTeamBattleStatus === 'active' && pvpTeamIsActivePlayer && pvpTeamSubmitted ? (
              <span className={styles.waiting} role="status">
                <span className={styles.waitingDot} aria-hidden="true" />
                Resposta enviada. Aguardando o adversário...
              </span>
            ) : null}
            {emojiProps && !isRoundResult ? (
              <EmojiBar {...emojiProps} className={watching ? '' : styles.emojiBarWide} />
            ) : null}
          </footer>
        </main>
      </div>

      {isRoundResult ? (
        <Modal
          title={pvpTeamRoundResultLabel}
          subtitle={getPvpTeamBattleDisplayLabel(pvpTeamResultEntry)}
          icon={Users}
          tone="cyan"
          size="sm"
          centered
        >
          <div className={styles.roundResult}>
            <div className={styles.scoreline}>
              <span className={styles.scorelineItem}>
                <span className={styles.scorelineName}>Time Vermelho</span>
                <span className={styles.scorelineValue}>{redScore}</span>
              </span>
              <span className={styles.scorelineDivider} aria-hidden="true">×</span>
              <span className={styles.scorelineItem}>
                <span className={styles.scorelineName}>Time Azul</span>
                <span className={styles.scorelineValue}>{blueScore}</span>
              </span>
            </div>
            <div className={styles.answerChips}>
              <div className={cx(styles.answerChip, styles[pvpTeamRedFeedback?.cssClass] || '')}>
                <span className={styles.answerChipName}>{pvpTeamResultPair?.red?.nickname || 'Time Vermelho'}</span>
                <span className={styles.answerChipState}>{pvpTeamRedFeedback?.emoji} {pvpTeamRedFeedback?.label}</span>
              </div>
              <div className={cx(styles.answerChip, styles[pvpTeamBlueFeedback?.cssClass] || '')}>
                <span className={styles.answerChipName}>{pvpTeamResultPair?.blue?.nickname || 'Time Azul'}</span>
                <span className={styles.answerChipState}>{pvpTeamBlueFeedback?.emoji} {pvpTeamBlueFeedback?.label}</span>
              </div>
            </div>
            <TiebreakDifficultyBadge label={pvpTeamNextTiebreakDifficultyLabel} announce />
            <span className={cx(styles.nextIn, pvpTeamRoundResultCountdownClass ? styles.nextInUrgent : '')} role="timer">
              Próximo confronto em {pvpTeamRoundResultRemainingSec}s
            </span>
            {emojiProps ? <EmojiBar {...emojiProps} /> : null}
          </div>
        </Modal>
      ) : null}

      <EmojiFxLayer items={Array.isArray(emojis?.fx) ? emojis.fx : []} />
    </div>
  );
}
