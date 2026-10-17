import { ArrowRight, Check } from 'lucide-react';
import { Button, cx } from '../ui';
import styles from './Tour.module.css';

export default function HomeTourOverlay({ vm }) {
  const {
    advanceHomeTour,
    currentHomeTourStep,
    homeTourHighlight,
    homeTourProgressLabel,
    isHomeTourLastStep,
    skipHomeTour
  } = vm;

  // Cartão fica do lado oposto ao destaque para não cobri-lo.
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const highlightCenter = homeTourHighlight ? homeTourHighlight.top + (homeTourHighlight.height / 2) : 0;
  const placeTop = !!homeTourHighlight && highlightCenter > viewportHeight / 2;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="cq-tour-title">
      {homeTourHighlight ? (
        <span
          className={styles.spotlight}
          style={{
            top: `${homeTourHighlight.top}px`,
            left: `${homeTourHighlight.left}px`,
            width: `${homeTourHighlight.width}px`,
            height: `${homeTourHighlight.height}px`
          }}
          aria-hidden="true"
        />
      ) : (
        <span className={styles.dim} aria-hidden="true" />
      )}
      <div className={cx(styles.card, placeTop ? styles.top : styles.bottom)}>
        <div className={styles.head}>
          <span className={styles.kicker}>{currentHomeTourStep.kicker}</span>
          <span className={styles.step}>{homeTourProgressLabel}</span>
        </div>
        <h2 id="cq-tour-title" className={styles.title}>{currentHomeTourStep.title}</h2>
        <p className={styles.text}>{currentHomeTourStep.description}</p>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={skipHomeTour}>Pular tour</Button>
          <Button variant="primary" iconRight={isHomeTourLastStep ? Check : ArrowRight} onClick={advanceHomeTour} autoFocus>
            {isHomeTourLastStep ? 'Concluir' : 'Próximo'}
          </Button>
        </div>
      </div>
    </div>
  );
}
