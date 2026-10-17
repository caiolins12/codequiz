import { getDidacticExplainText } from '../app/helpers';

export default function FeedbackScreen({ vm }) {
  const {
    feedbackState,
    nextQuestion,
    screen
  } = vm;

  return (
    <div className={`screen ${screen === 'feedback' ? 'active' : ''}`}>
      <div className="feedback-content">
        <div className="feedback-emoji">
          {feedbackState?.isTimeout ? '⏰' : feedbackState?.isCorrect ? '✅' : '❌'}
        </div>
        <div className="feedback-title">
          {feedbackState?.isTimeout ? 'Tempo esgotado!' : feedbackState?.isCorrect ? 'Boa resposta!' : 'Resposta incorreta'}
        </div>
        <div className="feedback-explain">
          {getDidacticExplainText(feedbackState?.question)}
        </div>
        <button className="btn btn-primary" onClick={() => nextQuestion()}>
          Continuar
        </button>
      </div>
    </div>
  );
}
