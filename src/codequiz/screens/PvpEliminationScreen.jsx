export default function PvpEliminationScreen({ vm }) {
  const {
    confirmPvpEliminationAnswer,
    leavePvpEliminationFlow,
    pickPvpEliminationAnswer,
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
    pvpEliminationTimerVisualClass,
    pvpEliminationWaitingPairAnswer,
    pvpEliminationWinnerMember,
    pvpEliminationWinnerUserId,
    screen
  } = vm;

  return (
    <div className={`screen screen-pvp screen-pvp-elimination ${screen === 'pvp-elimination' ? 'active' : ''}`}>
      <div className="quiz-header pvp-header">
        <div className="quiz-info">
          <button className="btn pvp-exit-btn" onClick={() => leavePvpEliminationFlow()}>Sair da Partida</button>
        </div>
      </div>
      <div className={`quiz-timer pvp-quiz-timer ${pvpEliminationTimerVisualClass}`}>
        <div className={`timer-bar ${pvpEliminationTimerClass}`} style={{ width: `${pvpEliminationTimerPct}%` }} />
      </div>
      <div className={`pvp-round-indicator ${pvpEliminationTimerVisualClass}`}>
        <span className="pvp-round-main">{pvpEliminationRoundLabel}</span>
        <span className="pvp-round-phase">
          {pvpEliminationPairUser1Label} x {pvpEliminationPairUser2Label}
        </span>
      </div>
      <div className="pvp-elimination-scoreboard-grid">
        {pvpEliminationLivePairRows.map((entry) => (
          <div
            key={`elimination_live_pair_${entry.user_id}`}
            className={[
              'pvp-elimination-live-card',
              'is-duel',
              entry.isSelf ? 'is-self' : '',
              entry.bgClassName
            ].filter(Boolean).join(' ')}
            data-bg-id={entry.bgId}
            data-bg-rarity={entry.bgRarity}
            style={{ background: entry.bgStyle }}
          >
            <span className={`pvp-player-avatar pvp-elimination-live-avatar ${entry.frameClass}`} style={entry.frameStyle}>{entry.avatar}</span>
            <div className="pvp-elimination-live-copy">
              <strong>{entry.nickname}</strong>
              <span>{entry.score} acerto(s)</span>
            </div>
          </div>
        ))}
      </div>
      <div className="quiz-body pvp-quiz-body">
        <div className="question-card pvp-question-card">
          <div className="question-scroll-wrap">
            <p className="question-text">{pvpEliminationQuestion?.q || 'Aguardando pergunta...'}</p>
            {pvpEliminationQuestion?.code ? <pre className="question-code">{pvpEliminationQuestion.code}</pre> : null}
          </div>
        </div>
        <div className="challenge-status pvp-team-active-duel">
          Em duelo agora: {pvpEliminationPairUser1Label} x {pvpEliminationPairUser2Label}
        </div>
        <div className="options-list">
          {(pvpEliminationQuestion?.opts || []).map((option, index) => (
            <button
              key={`pvp_elimination_opt_${pvpEliminationMatch?.battle_no || 1}_${index}`}
              className={`option-btn ${pvpEliminationSelectedIndex === index ? 'selected' : ''} ${pvpEliminationSubmitted || !pvpEliminationIsActivePairMember ? 'disabled' : ''}`}
              disabled={pvpEliminationSubmitted || pvpEliminationBattleStatus !== 'active' || !pvpEliminationIsActivePairMember || pvpEliminationIsSpectator || pvpEliminationShowBattleIntro}
              onClick={() => pickPvpEliminationAnswer(index)}
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
              pvpEliminationBattleStatus !== 'active'
              || pvpEliminationIsSpectator
              || !pvpEliminationIsActivePairMember
              || pvpEliminationSubmitted
              || pvpEliminationShowBattleIntro
              || !Number.isFinite(Number(pvpEliminationSelectedIndex))
              || Number(pvpEliminationSelectedIndex) < 0
            }
            onClick={confirmPvpEliminationAnswer}
          >
            Confirmar resposta
          </button>
          {pvpEliminationBattleStatus === 'active' ? (
            pvpEliminationShowBattleIntro ? (
              <div className="challenge-status pvp-waiting-status">
                Preparando confronto da rodada...
              </div>
            ) : pvpEliminationIsSpectator ? (
              <div className="challenge-status pvp-waiting-status">
                Voce foi eliminado e esta assistindo aos confrontos.
              </div>
            ) : pvpEliminationIsActivePairMember ? (
              pvpEliminationWaitingPairAnswer ? (
                <div className="challenge-status pvp-waiting-status">
                  Resposta enviada. Aguardando o adversario...
                </div>
              ) : null
            ) : (
              <div className="challenge-status pvp-waiting-status">
                Aguardando o duelo de outros jogadores...
              </div>
            )
          ) : null}
        </div>
      </div>

      {pvpEliminationShowBattleIntro ? (
        <div className="pvp-wait-modal pvp-elimination-intro-modal">
          <div className="pvp-wait-backdrop" />
          <div className="reset-modal-card pvp-round-card phase-elimination pvp-elimination-intro-card">
            <div className="pvp-round-kicker">Proximo confronto</div>
            <div className="pvp-round-title">{pvpEliminationPairUser1Label} x {pvpEliminationPairUser2Label}</div>
            <div className="pvp-elimination-intro-versus">
              <span className={`pvp-player-avatar pvp-elimination-intro-avatar ${pvpEliminationPairUser1FrameClass}`} style={pvpEliminationPairUser1FrameStyle}>{pvpEliminationPairUser1Avatar}</span>
              <span className="pvp-elimination-intro-vs">VS</span>
              <span className={`pvp-player-avatar pvp-elimination-intro-avatar ${pvpEliminationPairUser2FrameClass}`} style={pvpEliminationPairUser2FrameStyle}>{pvpEliminationPairUser2Avatar}</span>
            </div>
            <div className="pvp-elimination-intro-loader" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      ) : null}

      {pvpEliminationBattleStatus === 'round_result' && !pvpEliminationShowBattleIntro ? (
        <div className="pvp-wait-modal">
          <div className="pvp-wait-backdrop" />
          <div className="reset-modal-card pvp-round-card">
            <div className="pvp-round-kicker">{pvpEliminationRoundLabel}</div>
            <div className="pvp-round-title">{pvpEliminationRoundResultLabel}</div>
            <div className="pvp-round-hint">Placar geral da partida</div>
            <div className="pvp-elimination-transition-grid pvp-elimination-round-scoreboard">
              {pvpEliminationMatchScoreRows.map((entry, index) => (
                <div key={`elimination_round_result_${entry.user_id}`} className={`pvp-elimination-transition-row ${String(entry?.user_id || '') === pvpEliminationMyUserId ? 'is-self' : ''}`}>
                  <span>{index + 1}º - {entry?.nickname || 'Jogador'}</span>
                  <strong>{Math.max(0, Number(entry?.score || 0))}</strong>
                </div>
              ))}
            </div>
            <div className={`pvp-round-countdown ${pvpEliminationCountdownClass}`}>
              Proximo duelo em {Math.max(0, pvpEliminationCountdownSec)}s
            </div>
          </div>
        </div>
      ) : null}

      {pvpEliminationBattleStatus === 'elimination_result' ? (
        <div className="pvp-wait-modal">
          <div className="pvp-wait-backdrop" />
          <div className="reset-modal-card pvp-round-card phase-elimination pvp-elimination-round-card">
            <div className="pvp-round-kicker">Fim do ciclo</div>
            <div className="pvp-round-title">{pvpEliminationEliminationLabel}</div>
            <div className="pvp-elimination-transition-grid">
              {pvpEliminationResultRows.map((entry) => (
                <div key={`elimination_transition_${entry.user_id}`} className={`pvp-elimination-transition-row ${String(entry?.user_id || '') === pvpEliminationEliminatedUserId ? 'is-eliminated' : ''}`}>
                  <span>{entry?.nickname || 'Jogador'}</span>
                  <strong>{Math.max(0, Number(entry?.score || 0))}</strong>
                </div>
              ))}
            </div>
            {pvpEliminationWinnerUserId ? (
              <div className="pvp-round-hint">
                Campeao definido: {pvpEliminationWinnerMember?.nickname || 'Jogador'}.
              </div>
            ) : null}
            <div className={`pvp-round-countdown ${pvpEliminationCountdownClass}`}>
              {pvpEliminationWinnerUserId ? 'Resultado final em ' : 'Novo ciclo em '}
              {Math.max(0, pvpEliminationCountdownSec)}s
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
