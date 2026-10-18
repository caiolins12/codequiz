import { UserX } from 'lucide-react';
import styles from './Overlays.module.css';

export default function PvpOpponentLeftOverlay() {
  return (
    <div className={styles.fullscreen} role="status" aria-live="polite">
      <div className={styles.fullscreenCard}>
        <span className={styles.bigIcon} aria-hidden="true"><UserX strokeWidth={2.4} /></span>
        <h2 className={styles.bigTitle}>O adversário deixou a partida</h2>
        <p className={styles.text}>Preparando sua compensação...</p>
        <span className={styles.spinner} aria-hidden="true" />
      </div>
    </div>
  );
}
