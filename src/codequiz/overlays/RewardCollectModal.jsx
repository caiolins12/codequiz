import { Gift, Trophy } from 'lucide-react';
import { Button, CoinIcon, Modal, StatTile, XpIcon } from '../ui';
import styles from './Overlays.module.css';

export default function RewardCollectModal({ vm }) {
  const { handleCollectResultRewards, resultState, rewardCollecting } = vm;
  const xp = Math.max(0, Number(resultState?.awardedXp || 0));
  const coins = Math.max(0, Number(resultState?.awardedCoins || 0));
  const points = Math.max(0, Number(resultState?.rankingGain || 0));

  return (
    <Modal
      title="Recompensas da partida"
      subtitle="Colete seus ganhos para ver o resultado completo."
      icon={Gift}
      tone="gold"
      size="sm"
      centered
      footer={(
        <Button
          size="lg"
          variant="warning"
          block
          loading={rewardCollecting}
          onClick={(event) => handleCollectResultRewards(event)}
        >
          Coletar recompensas
        </Button>
      )}
    >
      <div className={styles.rewardGrid}>
        <StatTile icon={XpIcon} label="XP" value={`+${xp}`} tone="blue" />
        <StatTile icon={CoinIcon} label="Moedas" value={`+${coins}`} tone="gold" />
        <StatTile icon={Trophy} label="Ranking" value={`+${points}`} tone="violet" />
      </div>
    </Modal>
  );
}
