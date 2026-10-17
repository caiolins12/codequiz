import { Badge } from '../ui';
import styles from './Fx.module.css';

export default function PassClaimFx({ vm }) {
  const { passClaimFx } = vm;
  const cosmetics = (Array.isArray(passClaimFx?.cosmetics) ? passClaimFx.cosmetics : []).slice(0, 2);

  return (
    <div className={styles.claim} role="status" aria-live="polite">
      <span className={styles.claimKicker}>Passe de Evolução</span>
      <span className={styles.claimTitle}>
        <span className={styles.claimIcon} aria-hidden="true">{passClaimFx?.icon || '🏆'}</span>
        {passClaimFx?.title || 'Recompensa coletada'}
      </span>
      <span className={styles.claimChips}>
        <Badge tone="blue" variant="solid" size="sm">+{Math.max(0, Number(passClaimFx?.xp || 0))} XP</Badge>
        <Badge tone="gold" variant="solid" size="sm">+{Math.max(0, Number(passClaimFx?.coins || 0))} moedas</Badge>
        {cosmetics.map((name) => <Badge key={`pass_fx_${name}`} tone="pink" variant="solid" size="sm">{name}</Badge>)}
      </span>
    </div>
  );
}
