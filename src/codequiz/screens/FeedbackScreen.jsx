import { useEffect } from 'react';
import { AlarmClock, ArrowRight, CircleCheck, CircleX, Lightbulb } from 'lucide-react';
import { getDidacticExplainText } from '../app/helpers';
import { Button, Card, cx } from '../ui';
import game from './shared/Game.module.css';
import styles from './shared/Outcome.module.css';

export default function FeedbackScreen({ vm }) {
  const { feedbackState, nextQuestion } = vm;

  const isTimeout = !!feedbackState?.isTimeout;
  const isCorrect = !isTimeout && !!feedbackState?.isCorrect;
  const question = feedbackState?.question || null;
  const options = Array.isArray(question?.opts) ? question.opts : [];
  const correctIndex = Number(question?.answer ?? -1);
  const selectedIndex = Number(feedbackState?.selectedIndex ?? -1);
  const correctOption = correctIndex >= 0 && correctIndex < options.length ? options[correctIndex] : '';
  const selectedOption = selectedIndex >= 0 && selectedIndex < options.length ? options[selectedIndex] : '';

  const tone = isTimeout ? styles.timeout : (isCorrect ? styles.good : styles.bad);
  const Icon = isTimeout ? AlarmClock : (isCorrect ? CircleCheck : CircleX);
  const title = isTimeout ? 'Tempo esgotado!' : (isCorrect ? 'Boa resposta!' : 'Resposta incorreta');
  const text = isTimeout
    ? 'O tempo acabou antes da sua resposta.'
    : (isCorrect ? 'Mandou bem, continue assim!' : 'Sem problemas: veja a explicação e siga em frente.');

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Enter' && !event.repeat) {
        event.preventDefault();
        nextQuestion();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nextQuestion]);

  return (
    <div className={game.game}>
      <main className={cx(game.stage, styles.feedbackStage)}>
        <section className={cx(styles.hero, tone)} aria-live="polite">
          <span className={styles.heroIcon} aria-hidden="true"><Icon strokeWidth={2.6} /></span>
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroText}>{text}</p>
        </section>

        {question ? (
          <Card padding="lg" className={styles.answerBlock}>
            <p className={styles.questionText}>{question.q}</p>
            {correctOption ? (
              <div className={cx(styles.answerRow, styles.answerCorrect)}>
                <CircleCheck aria-hidden="true" strokeWidth={2.6} />
                <span><span className={styles.answerLabel}>Resposta correta</span>{correctOption}</span>
              </div>
            ) : null}
            {!isCorrect && selectedOption ? (
              <div className={cx(styles.answerRow, styles.answerWrong)}>
                <CircleX aria-hidden="true" strokeWidth={2.6} />
                <span><span className={styles.answerLabel}>Sua resposta</span>{selectedOption}</span>
              </div>
            ) : null}
          </Card>
        ) : null}

        <Card padding="lg" className={styles.explainCard}>
          <div className={styles.explain}>
            <span className={styles.explainIcon} aria-hidden="true"><Lightbulb strokeWidth={2.4} /></span>
            <p>
              <span className={styles.explainTitle}>Entenda</span>
              {getDidacticExplainText(question)}
            </p>
          </div>
        </Card>
      </main>

      <footer className={game.actions}>
        <Button size="xl" variant={isCorrect ? 'success' : 'primary'} block iconRight={ArrowRight} onClick={() => nextQuestion()}>
          Continuar
        </Button>
      </footer>
    </div>
  );
}
