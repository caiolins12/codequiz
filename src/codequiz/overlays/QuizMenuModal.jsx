export default function QuizMenuModal({ vm }) {
  const {
    closeQuizMenu,
    restartCurrentQuiz,
    returnQuizToHome
  } = vm;

  return (
    <div className="quiz-action-overlay" onClick={closeQuizMenu}>
      <div className="quiz-action-modal" onClick={(event) => event.stopPropagation()}>
        <div className="quiz-action-title">Menu do Quiz</div>
        <div className="quiz-action-subtitle">Escolha a próxima ação para a partida atual.</div>
        <div className="quiz-action-buttons">
          <button className="btn btn-primary" onClick={restartCurrentQuiz}>Reiniciar Quiz</button>
          <button className="btn quiz-action-exit" onClick={returnQuizToHome}>Voltar ao Inicio</button>
          <button className="btn btn-secondary quiz-action-close" onClick={closeQuizMenu}>Continuar Quiz</button>
        </div>
      </div>
    </div>
  );
}
