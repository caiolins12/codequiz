import { getAvatarFrameClass, getAvatarFrameStyle, getDisplayAvatar } from '../lib/shop';
import { getPvpTeamBattleDisplayLabel } from '../app/helpers';

export default function PvpTeamScreen({ vm }) {
  const {
    buildCosmeticSnapshot,
    confirmPvpTeamAnswer,
    leavePvpTeamFlow,
    pickPvpTeamAnswer,
    pvpTeamBattleEntry,
    pvpTeamBattleNo,
    pvpTeamBattleStatus,
    pvpTeamBlueFeedback,
    pvpTeamBlueMembers,
    pvpTeamCurrentBattleLabel,
    pvpTeamCurrentPairLabel,
    pvpTeamIsActivePlayer,
    pvpTeamMatch,
    pvpTeamMySide,
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
    pvpTeamTimerClass,
    pvpTeamTimerPct,
    pvpTeamTimerVisualClass,
    screen
  } = vm;

  return (
    <div className={`screen screen-pvp ${screen === 'pvp-team' ? 'active' : ''}`}>
      <div className="quiz-header pvp-header">
        <div className="quiz-info">
          <button className="btn pvp-exit-btn" onClick={() => leavePvpTeamFlow()}>Sair da Batalha</button>
        </div>
      </div>
      <div className={`quiz-timer pvp-quiz-timer ${pvpTeamTimerVisualClass}`}>
        <div className={`timer-bar ${pvpTeamTimerClass}`} style={{ width: `${pvpTeamTimerPct}%` }} />
      </div>
      <div className={`pvp-round-indicator ${pvpTeamTimerVisualClass}`}>
        <span className="pvp-round-main">{pvpTeamCurrentBattleLabel}</span>
        <span className="pvp-round-phase">{pvpTeamCurrentPairLabel}</span>
      </div>
      <div className="pvp-team-scoreboard">
        {[
          {
            side: 'red',
            label: 'Vermelho',
            members: pvpTeamRedMembers,
            score: Math.max(0, Number(pvpTeamMatch?.red_score || 0)),
            activeUserId: String(pvpTeamBattleEntry?.red_user_id || '').trim()
          },
          {
            side: 'blue',
            label: 'Azul',
            members: pvpTeamBlueMembers,
            score: Math.max(0, Number(pvpTeamMatch?.blue_score || 0)),
            activeUserId: String(pvpTeamBattleEntry?.blue_user_id || '').trim()
          }
        ].map((team) => (
          <div key={`battle_team_${team.side}`} className={`pvp-team-score-card ${team.side} ${pvpTeamMySide === team.side ? 'is-mine' : ''}`}>
            <div className="pvp-team-score-card-head">
              <span>Time {team.label}</span>
              <strong>{team.score}</strong>
            </div>
            <div className="pvp-team-score-members">
              {team.members.map((member) => {
                const memberId = String(member?.user_id || '').trim();
                const memberShop = buildCosmeticSnapshot(
                  member?.equipped_frame,
                  member?.equipped_background,
                  member?.equipped_emoji
                );
                const memberAvatar = getDisplayAvatar(member?.avatar || '\uD83D\uDE42', memberShop);
                const memberFrameStyle = getAvatarFrameStyle(memberShop);
                const memberFrameClass = getAvatarFrameClass(memberShop);
                const memberScore = Math.max(0, Number(pvpTeamMatch?.member_scores?.[memberId] || 0));
                return (
                  <div key={`battle_team_member_${team.side}_${memberId}`} className={`pvp-team-score-member ${team.activeUserId === memberId ? 'is-active' : ''}`}>
                    <span className={`pvp-player-avatar pvp-team-score-avatar ${memberFrameClass}`} style={memberFrameStyle}>{memberAvatar}</span>
                    <div className="pvp-team-score-copy">
                      <strong>{member?.nickname || 'Jogador'}</strong>
                      <span>{memberScore} acerto(s)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="quiz-body pvp-quiz-body">
        <div className="question-card pvp-question-card">
          <p className="question-text">{pvpTeamQuestion?.q || 'Aguardando pergunta...'}</p>
          {pvpTeamQuestion?.code ? <pre className="question-code">{pvpTeamQuestion.code}</pre> : null}
        </div>
        <div className="challenge-status pvp-team-active-duel">
          Duelo atual: {pvpTeamCurrentPairLabel}
        </div>
        <div className="options-list">
          {(pvpTeamQuestion?.opts || []).map((option, index) => (
            <button
              key={`pvp_team_opt_${pvpTeamBattleNo}_${index}`}
              className={`option-btn ${pvpTeamSelectedIndex === index ? 'selected' : ''} ${pvpTeamSubmitted || !pvpTeamIsActivePlayer ? 'disabled' : ''}`}
              disabled={pvpTeamSubmitted || pvpTeamBattleStatus === 'round_result' || !pvpTeamIsActivePlayer}
              onClick={() => pickPvpTeamAnswer(index)}
            >
              <span className="opt-letter">{String.fromCharCode(65 + index)}</span>
              <span>{option}</span>
            </button>
          ))}
        </div>
        <div className="pvp-answer-footer">
          <button
            className="btn btn-primary quiz-confirm-btn pvp-confirm-answer-btn"
            disabled={
              !pvpTeamIsActivePlayer
              || pvpTeamSubmitted
              || pvpTeamBattleStatus === 'round_result'
              || !Number.isFinite(Number(pvpTeamSelectedIndex))
              || Number(pvpTeamSelectedIndex) < 0
            }
            onClick={confirmPvpTeamAnswer}
          >
            Confirmar resposta
          </button>
          {pvpTeamBattleStatus === 'active' ? (
            pvpTeamIsActivePlayer ? (
              pvpTeamSubmitted ? (
                <div className="challenge-status pvp-waiting-status">
                  Resposta enviada. Aguardando o adversario...
                </div>
              ) : null
            ) : (
              <div className="challenge-status pvp-waiting-status">
                Aguardando o duelo da sua dupla...
              </div>
            )
          ) : null}
        </div>
      </div>
      {pvpTeamBattleStatus === 'round_result' ? (
        <div className="pvp-wait-modal">
          <div className="pvp-wait-backdrop" />
          <div className="reset-modal-card pvp-round-card">
            <div className="pvp-round-kicker">{getPvpTeamBattleDisplayLabel(pvpTeamResultEntry)}</div>
            <div className="pvp-round-title">{pvpTeamRoundResultLabel}</div>
            <div className="pvp-round-scoreline">
              <div className="pvp-round-score-item">
                <span>Time Vermelho</span>
                <strong>{Math.max(0, Number(pvpTeamMatch?.red_score || 0))}</strong>
              </div>
              <div className="pvp-round-score-divider">x</div>
              <div className="pvp-round-score-item">
                <span>Time Azul</span>
                <strong>{Math.max(0, Number(pvpTeamMatch?.blue_score || 0))}</strong>
              </div>
            </div>
            <div className="pvp-round-answer-feedback">
              <div className={`pvp-round-answer-chip ${pvpTeamRedFeedback.cssClass}`}>
                <span className="pvp-round-answer-name">{pvpTeamResultPair?.red?.nickname || 'Time Vermelho'}</span>
                <span className="pvp-round-answer-state">{pvpTeamRedFeedback.emoji} {pvpTeamRedFeedback.label}</span>
              </div>
              <div className={`pvp-round-answer-chip ${pvpTeamBlueFeedback.cssClass}`}>
                <span className="pvp-round-answer-name">{pvpTeamResultPair?.blue?.nickname || 'Time Azul'}</span>
                <span className="pvp-round-answer-state">{pvpTeamBlueFeedback.emoji} {pvpTeamBlueFeedback.label}</span>
              </div>
            </div>
            <div className={`pvp-round-countdown ${pvpTeamRoundResultCountdownClass}`}>Proximo confronto em {pvpTeamRoundResultRemainingSec}s</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
