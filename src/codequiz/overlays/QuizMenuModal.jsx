import { DoorOpen, Pause, Play, RotateCcw } from 'lucide-react';
import { Button, Modal } from '../ui';
import styles from './Overlays.module.css';

export default function QuizMenuModal({ vm }) {
  const { closeQuizMenu, restartCurrentQuiz, returnQuizToHome } = vm;

  return (
    <Modal
      onClose={closeQuizMenu}
      title="Menu do quiz"
      subtitle="Atenção: o tempo da pergunta continua correndo."
      icon={Pause}
      size="sm"
    >
      <div className={styles.stack}>
        <Button size="lg" variant="success" icon={Play} block onClick={closeQuizMenu}>
          Continuar partida
        </Button>
        <Button size="lg" variant="secondary" icon={RotateCcw} block onClick={restartCurrentQuiz}>
          Reiniciar quiz
        </Button>
        <Button size="lg" variant="ghost" icon={DoorOpen} block onClick={returnQuizToHome}>
          Sair para o início
        </Button>
      </div>
    </Modal>
  );
}
