import { getHeroBackgroundStyle } from '../lib/shop';

export default function PvpDuelScreen({ vm }) {
  const {
    confirmPvpAnswer,
    leavePvpFlow,
    pickPvpAnswer,
    pvpBattleEmojis,
    pvpEmojiCooldownActive,
    pvpEmojiCooldownFillPct,
    pvpEmojiCooldownLabel,
    pvpEmojiFx,
    pvpIsRoundResult,
    pvpMatch,
    pvpPlayer1Avatar,
    pvpPlayer1BackgroundMeta,
    pvpPlayer1FrameClass,
    pvpPlayer1FrameStyle,
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
    pvpRoundPhaseClass,
    pvpRoundPhaseLabel,
    pvpRoundPlayer1Feedback,
    pvpRoundPlayer2Feedback,
    pvpRoundResultCountdownClass,
    pvpRoundResultKicker,
    pvpRoundResultLabel,
    pvpRoundResultPhaseClass,
    pvpRoundResultRemainingSec,
    pvpState,
    pvpTimerClass,
    pvpTimerPct,
    pvpTimerVisualClass,
    pvpTotalRounds,
    pvpWaitingOpponent,
    screen,
    sendPvpEmoji
  } = vm;

  return (
    <div className={`screen screen-pvp ${screen === 'pvp' ? 'active' : ''}`}>
      <div className="quiz-header pvp-header">
        <div className="quiz-info">
          <button className="btn pvp-exit-btn" onClick={() => leavePvpFlow()}>Sair da Partida</button>
        </div>
      </div>
      <div className={`quiz-timer pvp-quiz-timer ${pvpTimerVisualClass}`}>
        <div className={`timer-bar ${pvpTimerClass}`} style={{ width: `${pvpTimerPct}%` }} />
      </div>
      <div className={`pvp-round-indicator ${pvpRoundPhaseClass} ${pvpTimerVisualClass}`}>
        <span className="pvp-round-main">Rodada {pvpRoundNo}/{pvpTotalRounds}</span>
        {pvpRoundPhaseLabel ? (
          <span className="pvp-round-phase">{pvpRoundPhaseLabel}</span>
        ) : null}
      </div>
      <div className="pvp-score-cards">
        <div
          className={[
            'pvp-score-card',
            'pvp-score-card-left',
            pvpPlayer1BackgroundMeta.className
          ].filter(Boolean).join(' ')}
          data-bg-id={pvpPlayer1BackgroundMeta.id}
          data-bg-rarity={pvpPlayer1BackgroundMeta.rarity}
          style={{ background: getHeroBackgroundStyle(pvpPlayer1Shop) }}
        >
          <div className="pvp-player-identity">
            <span className={`pvp-player-avatar ${pvpPlayer1FrameClass}`} style={pvpPlayer1FrameStyle}>{pvpPlayer1Avatar}</span>
            <span className="pvp-player-name">{pvpMatch?.player1_nickname || 'Jogador 1'}</span>
          </div>
          <strong>{Math.max(0, Number(pvpMatch?.player1_score || 0))}</strong>
        </div>
        <div
          className={[
            'pvp-score-card',
            'pvp-score-card-right',
            pvpPlayer2BackgroundMeta.className
          ].filter(Boolean).join(' ')}
          data-bg-id={pvpPlayer2BackgroundMeta.id}
          data-bg-rarity={pvpPlayer2BackgroundMeta.rarity}
          style={{ background: getHeroBackgroundStyle(pvpPlayer2Shop) }}
        >
          <div className="pvp-player-identity">
            <span className={`pvp-player-avatar ${pvpPlayer2FrameClass}`} style={pvpPlayer2FrameStyle}>{pvpPlayer2Avatar}</span>
            <span className="pvp-player-name">{pvpMatch?.player2_nickname || 'Jogador 2'}</span>
          </div>
          <strong>{Math.max(0, Number(pvpMatch?.player2_score || 0))}</strong>
        </div>
      </div>
      <div className="quiz-body pvp-quiz-body">
        <div className="question-card pvp-question-card">
          <div
            ref={pvpQuestionScrollRef}
            className={`question-scroll-wrap ${pvpQuestionHasOverflow ? 'has-overflow' : ''}`}
          >
            <p className="question-text">{pvpQuestion?.q || 'Aguardando pergunta...'}</p>
            {pvpQuestion?.code ? <pre className="question-code">{pvpQuestion.code}</pre> : null}
          </div>
          {pvpQuestionHasOverflow ? (
            <span className="question-scroll-indicator" aria-hidden="true" />
          ) : null}
        </div>
        <div className="options-list">
          {(pvpQuestion?.opts || []).map((option, index) => (
            <button
              key={`pvp_opt_${pvpRoundNo}_${index}`}
              className={`option-btn ${pvpState.selectedIndex === index ? 'selected' : ''} ${pvpState.submitted ? 'disabled' : ''}`}
              disabled={pvpState.submitted || pvpIsRoundResult}
              onClick={() => pickPvpAnswer(index)}
            >
              <span className="opt-letter">{String.fromCharCode(65 + index)}</span>
              <span>{option}</span>
            </button>
          ))}
        </div>
        <div className="pvp-answer-footer">
          <button
            className="btn btn-primary quiz-confirm-btn pvp-confirm-answer-btn"
            disabled={pvpState.submitted || pvpIsRoundResult || !Number.isFinite(Number(pvpState.selectedIndex)) || Number(pvpState.selectedIndex) < 0}
            onClick={confirmPvpAnswer}
          >
            Confirmar resposta
          </button>
          {pvpWaitingOpponent ? (
            <div className="challenge-status pvp-waiting-status">
              Aguardando oponente responder...
            </div>
          ) : null}
          {!pvpIsRoundResult ? (
            <div className="pvp-round-emoji-actions">
              {pvpBattleEmojis.map((emoji) => (
                <button
                  key={emoji}
                  className={`pvp-emoji-btn ${pvpEmojiCooldownActive ? 'is-cooldown' : ''}`}
                  onClick={() => sendPvpEmoji(emoji)}
                  disabled={pvpEmojiCooldownActive}
                  aria-label={`Enviar emoji ${emoji}`}
                >
                  <span className="pvp-emoji-glyph" aria-hidden="true">{emoji}</span>
                  {pvpEmojiCooldownActive ? (
                    <>
                      <span
                        className="pvp-emoji-cooldown-fill"
                        style={{ height: `${pvpEmojiCooldownFillPct}%` }}
                        aria-hidden="true"
                      />
                      <span className="pvp-emoji-cooldown-label" aria-hidden="true">{pvpEmojiCooldownLabel}</span>
                    </>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {pvpEmojiFx.length ? (
        <div className="pvp-emoji-overlay" aria-hidden="true">
          {pvpEmojiFx.map((fx) => (
            <span
              key={fx.id}
              className={`pvp-emoji-fx ${fx.side}`}
              style={{
                top: `${Number.isFinite(Number(fx?.topPct)) ? Number(fx.topPct) : 58}%`,
                [String(fx?.side || '') === 'left' ? 'left' : 'right']: `calc(8% + ${Math.max(0, Number(fx?.offsetPx || 0))}px)`
              }}
            >
              {fx.emoji}
            </span>
          ))}
        </div>
      ) : null}
      {pvpIsRoundResult ? (
        <div className="pvp-wait-modal">
          <div className="pvp-wait-backdrop" />
          <div className={`reset-modal-card pvp-round-card ${pvpRoundResultPhaseClass}`}>
            <div className="pvp-round-kicker">{pvpRoundResultKicker}</div>
            <div className="pvp-round-title">{pvpRoundResultLabel}</div>
            <div className="pvp-round-scoreline">
              <div className="pvp-round-score-item">
                <span>{pvpMatch?.player1_nickname || 'Jogador 1'}</span>
                <strong>{Math.max(0, Number(pvpMatch?.player1_score || 0))}</strong>
              </div>
              <div className="pvp-round-score-divider">×</div>
              <div className="pvp-round-score-item">
                <span>{pvpMatch?.player2_nickname || 'Jogador 2'}</span>
                <strong>{Math.max(0, Number(pvpMatch?.player2_score || 0))}</strong>
              </div>
            </div>
            <div className="pvp-round-answer-feedback">
              <div className={`pvp-round-answer-chip ${pvpRoundPlayer1Feedback.cssClass}`}>
                <span className="pvp-round-answer-name">{pvpMatch?.player1_nickname || 'Jogador 1'}</span>
                <span className="pvp-round-answer-state">{pvpRoundPlayer1Feedback.emoji} {pvpRoundPlayer1Feedback.label}</span>
              </div>
              <div className={`pvp-round-answer-chip ${pvpRoundPlayer2Feedback.cssClass}`}>
                <span className="pvp-round-answer-name">{pvpMatch?.player2_nickname || 'Jogador 2'}</span>
                <span className="pvp-round-answer-state">{pvpRoundPlayer2Feedback.emoji} {pvpRoundPlayer2Feedback.label}</span>
              </div>
            </div>
            <div className={`pvp-round-countdown ${pvpRoundResultCountdownClass}`}>Proxima pergunta em {pvpRoundResultRemainingSec}s</div>
            <div className="pvp-round-emoji-actions pvp-round-emoji-actions-modal">
              {pvpBattleEmojis.map((emoji) => (
                <button
                  key={`modal_${emoji}`}
                  className={`pvp-emoji-btn ${pvpEmojiCooldownActive ? 'is-cooldown' : ''}`}
                  onClick={() => sendPvpEmoji(emoji)}
                  disabled={pvpEmojiCooldownActive}
                  aria-label={`Enviar emoji ${emoji}`}
                >
                  <span className="pvp-emoji-glyph" aria-hidden="true">{emoji}</span>
                  {pvpEmojiCooldownActive ? (
                    <>
                      <span
                        className="pvp-emoji-cooldown-fill"
                        style={{ height: `${pvpEmojiCooldownFillPct}%` }}
                        aria-hidden="true"
                      />
                      <span className="pvp-emoji-cooldown-label" aria-hidden="true">{pvpEmojiCooldownLabel}</span>
                    </>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
