import { DIFFICULTY_LABELS } from '../lib/constants';

export default function QuizScreen({ vm }) {
  const {
    confirmQuizAnswer,
    currentQuestion,
    handleAnswer,
    openQuizMenu,
    quizQuestionHasOverflow,
    quizQuestionScrollRef,
    quizState,
    quizTimerClass,
    quizTimerPct,
    screen,
    selectedLanguageMeta,
    selectedTopicMeta
  } = vm;

  return (
    <div className={`screen ${screen === 'quiz' ? 'active' : ''}`}>
      <div className="pve-quiz-shell">
        <div className="pve-quiz-topline">
          <span className="pve-quiz-mode">Modo PVE</span>
          <span className={`pve-quiz-difficulty pve-quiz-difficulty-${quizState?.difficulty || 'easy'}`}>
            {DIFFICULTY_LABELS[quizState?.difficulty] || DIFFICULTY_LABELS.easy}
          </span>
        </div>
        <div className="pve-quiz-meta">
          <span>{selectedLanguageMeta?.name || quizState?.language || 'Linguagem'}</span>
          <span className="pve-quiz-dot">·</span>
          <span>{selectedTopicMeta?.name || quizState?.topic || 'Tema'}</span>
        </div>
      </div>

      <div className="quiz-header">
        <div className="quiz-info pve-quiz-info">
          <div className="quiz-info-main">
            <span>{quizState ? `${quizState.index + 1}/${quizState.questions.length}` : '0/0'}</span>
            <span>{quizState ? `${quizState.score} pts` : '0 pts'}</span>
            <div className="quiz-lives">
              {[0, 1, 2].map((idx) => (
                <span key={idx} className={`heart ${quizState && idx >= quizState.lives ? 'lost' : ''}`}>❤️</span>
              ))}
            </div>
          </div>
          <button className="btn-quiz-menu" onClick={openQuizMenu} aria-label="Abrir menu do quiz">☰</button>
        </div>
        {quizState?.streak ? (
          <div className="quiz-streak">{quizState.streak} em sequencia</div>
        ) : null}
      </div>

      <div className="quiz-timer">
        <div
          className={`timer-bar ${quizTimerClass}`}
          style={{
            width: `${quizTimerPct}%`
          }}
        />
      </div>

      <div className="quiz-body pve-quiz-body">
        <div className="question-card">
          <div
            ref={quizQuestionScrollRef}
            className={`question-scroll-wrap ${quizQuestionHasOverflow ? 'has-overflow' : ''}`}
          >
            <p className="question-text">{currentQuestion?.q || 'Carregando pergunta...'}</p>
            {currentQuestion?.code ? (
              <pre className="question-code">{currentQuestion.code}</pre>
            ) : null}
          </div>
          {quizQuestionHasOverflow ? (
            <span className="question-scroll-indicator" aria-hidden="true" />
          ) : null}
        </div>
        <div className="options-list">
          {(currentQuestion?.opts || []).map((option, index) => (
            <button
              key={`${quizState?.index || 0}_${index}`}
              className={`option-btn ${quizState?.selectedIndex === index ? 'selected' : ''} ${quizState?.answered ? 'disabled' : ''}`}
              disabled={!!quizState?.answered}
              onClick={() => handleAnswer(index)}
            >
              <span className="opt-letter">{String.fromCharCode(65 + index)}</span>
              <span>{option}</span>
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary quiz-confirm-btn"
          disabled={!quizState || quizState.answered || !Number.isFinite(Number(quizState.selectedIndex)) || Number(quizState.selectedIndex) < 0}
          onClick={confirmQuizAnswer}
        >
          Confirmar resposta
        </button>
      </div>
    </div>
  );
}
