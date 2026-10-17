import { Cookie } from 'lucide-react';
import { Button } from '../ui';
import styles from './Overlays.module.css';

export default function CookieConsentBanner({ vm }) {
  const { saveCookieConsent } = vm;

  return (
    <div className={`${styles.banner} ${styles.bannerBottom}`} role="dialog" aria-live="polite" aria-label="Preferências de cookies">
      <span className={styles.bannerIcon} aria-hidden="true"><Cookie strokeWidth={2.4} /></span>
      <span className={styles.bannerText}>
        <span className={styles.bannerTitle}>Uso de cookies</span>
        <span className={styles.bannerDesc}>Usamos cookies para manter sua sessão e melhorar o desempenho do app.</span>
      </span>
      <span className={styles.bannerActions}>
        <Button variant="ghost" size="sm" onClick={() => saveCookieConsent('essential')}>Só essenciais</Button>
        <Button variant="primary" size="sm" onClick={() => saveCookieConsent('accepted')}>Aceitar</Button>
      </span>
    </div>
  );
}
