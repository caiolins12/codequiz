import { cx } from '../../ui';
import styles from './QuestionCard.module.css';

// Enunciado da pergunta (texto + bloco de código opcional).
export default function QuestionCard({ question, scrollRef = null, hasOverflow = false, className = '' }) {
  const text = String(question?.q || '').trim() || 'Carregando pergunta...';
  const code = String(question?.code || '');
  return (
    <section className={cx(styles.card, className)} aria-label="Pergunta">
      <div ref={scrollRef} className={styles.scroll}>
        <p className={cx(styles.text, text.length > 150 ? styles.long : '')}>{text}</p>
        {code ? (
          <pre className={styles.code}><code>{code}</code></pre>
        ) : null}
      </div>
      {hasOverflow ? <span className={styles.fade} aria-hidden="true" /> : null}
    </section>
  );
}
