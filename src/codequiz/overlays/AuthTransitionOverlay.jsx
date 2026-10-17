import { LogIn, LogOut } from 'lucide-react';
import styles from './Overlays.module.css';

export default function AuthTransitionOverlay({ vm }) {
  const { authTransition } = vm;
  const logout = authTransition?.mode === 'logout';
  const Icon = logout ? LogOut : LogIn;

  return (
    <div className={styles.fullscreen} role="status" aria-live="polite">
      <div className={styles.fullscreenCard}>
        <span className={styles.bigIcon} aria-hidden="true"><Icon strokeWidth={2.4} /></span>
        <h2 className={styles.bigTitle}>{authTransition?.title || (logout ? 'Saindo da conta' : 'Preparando sua conta')}</h2>
        <p className={styles.text}>{authTransition?.subtitle || 'Aguarde alguns segundos...'}</p>
        <span className={styles.spinner} aria-hidden="true" />
      </div>
    </div>
  );
}
