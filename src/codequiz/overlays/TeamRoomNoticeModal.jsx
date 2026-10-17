import { Info } from 'lucide-react';
import { Button, Modal } from '../ui';
import styles from './Overlays.module.css';

export default function TeamRoomNoticeModal({ vm }) {
  const { closePvpTeamRoomNoticeModal, pvpTeamRoomNoticeModal } = vm;

  return (
    <Modal
      title={pvpTeamRoomNoticeModal?.title || 'Aviso da sala'}
      icon={Info}
      tone="gold"
      size="sm"
      onClose={closePvpTeamRoomNoticeModal}
      footer={<Button variant="primary" block onClick={closePvpTeamRoomNoticeModal}>Entendi</Button>}
    >
      <p className={styles.text}>{pvpTeamRoomNoticeModal?.message || 'Ainda não é possível iniciar a sala.'}</p>
    </Modal>
  );
}
