import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { Button, Modal, TierBadge, cx } from '../ui';
import styles from './Overlays.module.css';

export default function LeagueTransitionOverlay({ vm }) {
  const { closeLeagueTransition, leagueTransition } = vm;
  const changes = Array.isArray(leagueTransition?.changes) ? leagueTransition.changes : [];
  const allDown = changes.length > 0 && changes.every((change) => change.direction === 'down');

  return (
    <Modal
      title={leagueTransition?.title || 'Classificação atualizada'}
      subtitle={leagueTransition?.subtitle || 'Seu perfil mudou de liga.'}
      icon={allDown ? TrendingDown : TrendingUp}
      tone={allDown ? 'red' : 'gold'}
      size="sm"
      centered
      onClose={closeLeagueTransition}
      footer={<Button variant={allDown ? 'primary' : 'warning'} block onClick={closeLeagueTransition}>Continuar</Button>}
    >
      <ul className={styles.list}>
        {changes.map((change) => (
          <li
            key={`league_${change.mode}_${change.from?.key || 'from'}_${change.to?.key || 'to'}`}
            className={cx(styles.row, change.direction === 'down' ? styles.rowDanger : styles.rowSelf)}
          >
            <span className={styles.rowMain}>
              <span className={styles.rowTitle}>{change.modeLabel}</span>
              <span className={styles.rowSub}>{change.direction === 'down' ? 'Caiu de liga' : 'Subiu de liga'}</span>
            </span>
            <TierBadge tierKey={change.from?.key} label={change.from?.label || 'Bronze'} size="sm" />
            <ArrowRight size={16} strokeWidth={2.8} aria-hidden="true" />
            <TierBadge tierKey={change.to?.key} label={change.to?.label || 'Bronze'} variant="solid" size="sm" />
          </li>
        ))}
      </ul>
    </Modal>
  );
}
