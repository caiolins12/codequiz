import { Eye, Gift, Skull } from 'lucide-react';
import { Button, Modal } from '../ui';
import styles from './Overlays.module.css';

export default function EliminationExitPromptModal({ vm }) {
  const { exitPvpEliminationWithPlacement, keepWatchingPvpElimination, pvpEliminationExitPrompt } = vm;

  return (
    <Modal
      title="Você foi eliminado"
      subtitle={`Colocação parcial: ${pvpEliminationExitPrompt?.placementLabel || '4º lugar'}`}
      icon={Skull}
      tone="red"
      size="sm"
      centered
      onClose={keepWatchingPvpElimination}
      footer={(
        <>
          <Button variant="secondary" icon={Eye} onClick={keepWatchingPvpElimination}>Assistir</Button>
          <Button variant="warning" icon={Gift} onClick={() => exitPvpEliminationWithPlacement()}>Sair e receber</Button>
        </>
      )}
    >
      <p className={styles.text}>
        {pvpEliminationExitPrompt?.nickname || 'Jogador'}, você pode continuar assistindo aos confrontos
        ou sair agora e receber as recompensas da sua colocação.
      </p>
    </Modal>
  );
}
