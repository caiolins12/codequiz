import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '../ui';
import styles from './Overlays.module.css';

export default function UpdateNoticeBar({ vm }) {
  const { applyPendingUpdate, updateState } = vm;

  return (
    <div className={`${styles.banner} ${styles.bannerTop}`} role="status" aria-live="polite">
      <span className={`${styles.bannerIcon} ${styles.bannerIconInfo}`} aria-hidden="true"><Sparkles strokeWidth={2.4} /></span>
      <span className={styles.bannerText}>
        <span className={styles.bannerTitle}>Nova versão disponível</span>
        <span className={styles.bannerDesc}>Atualize para receber as melhorias e correções mais recentes.</span>
      </span>
      <span className={styles.bannerActions}>
        <Button variant="cyan" size="sm" icon={RefreshCw} loading={updateState?.applying} onClick={applyPendingUpdate}>
          Atualizar
        </Button>
      </span>
    </div>
  );
}
