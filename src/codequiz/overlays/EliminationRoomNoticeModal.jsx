import { Info } from 'lucide-react';
import { Button, Modal } from '../ui';
import styles from './Overlays.module.css';

export default function EliminationRoomNoticeModal({ vm }) {
  const { closePvpEliminationRoomNoticeModal, pvpEliminationRoomNoticeModal } = vm;

  return (
    <Modal
      title={pvpEliminationRoomNoticeModal?.title || 'Aviso da sala'}
      icon={Info}
      tone="gold"
      size="sm"
      onClose={closePvpEliminationRoomNoticeModal}
      footer={<Button variant="primary" block onClick={closePvpEliminationRoomNoticeModal}>Entendi</Button>}
    >
      <p className={styles.text}>{pvpEliminationRoomNoticeModal?.message || 'Ainda não é possível iniciar a sala.'}</p>
    </Modal>
  );
}
