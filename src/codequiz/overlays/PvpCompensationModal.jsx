import { HeartHandshake, Swords } from 'lucide-react';
import { formatSignedPoints } from '../app/helpers';
import { Button, CoinIcon, Modal, StatTile, XpIcon } from '../ui';
import styles from './Overlays.module.css';

export default function PvpCompensationModal({ vm }) {
  const { collectPvpCompensation, pvpCompensation, pvpRewardCollecting } = vm;
  const points = Number(pvpCompensation?.points || 0);

  return (
    <Modal
      title={pvpCompensation?.title || 'Compensação da partida'}
      subtitle={pvpCompensation?.subtitle || 'Você recebeu uma compensação.'}
      icon={HeartHandshake}
      tone="cyan"
      size="sm"
      centered
      footer={(
        <Button size="lg" variant="warning" block loading={pvpRewardCollecting} onClick={(event) => collectPvpCompensation(event)}>
          Coletar recompensas
        </Button>
      )}
    >
      <div className={styles.rewardGrid}>
        <StatTile icon={Swords} label="Pontos PvP" value={formatSignedPoints(points)} tone={points >= 0 ? 'violet' : 'red'} />
        <StatTile icon={XpIcon} label="XP" value={`+${Math.max(0, Number(pvpCompensation?.xp || 0))}`} tone="blue" />
        <StatTile icon={CoinIcon} label="Moedas" value={`+${Math.max(0, Number(pvpCompensation?.coins || 0))}`} tone="gold" />
      </div>
    </Modal>
  );
}
