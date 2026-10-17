import { DoorOpen, Lock } from 'lucide-react';
import { Button, Modal, TextField } from '../ui';
import styles from './Overlays.module.css';

export default function TeamJoinPromptModal({ vm }) {
  const {
    closePvpTeamJoinPrompt,
    pvpTeamActionBusy,
    pvpTeamJoinPrompt,
    setPvpTeamJoinPrompt,
    submitPvpTeamJoinPrompt
  } = vm;

  const needsPassword = !!pvpTeamJoinPrompt?.requiresPassword;

  return (
    <Modal
      title={needsPassword ? 'Sala privada' : 'Entrar na sala'}
      subtitle={pvpTeamJoinPrompt?.roomName || 'Sala 2x2'}
      icon={needsPassword ? Lock : DoorOpen}
      tone="cyan"
      size="sm"
      onClose={pvpTeamActionBusy ? null : closePvpTeamJoinPrompt}
      footer={(
        <>
          <Button variant="secondary" disabled={pvpTeamActionBusy} onClick={closePvpTeamJoinPrompt}>Cancelar</Button>
          <Button variant="primary" type="submit" form="cq-team-join" loading={pvpTeamActionBusy}>Entrar</Button>
        </>
      )}
    >
      <form
        id="cq-team-join"
        className={styles.stack}
        onSubmit={(event) => {
          event.preventDefault();
          if (!pvpTeamActionBusy) submitPvpTeamJoinPrompt();
        }}
      >
        {needsPassword ? (
          <TextField
            label="Senha da sala"
            type="password"
            autoComplete="off"
            placeholder="Digite a senha"
            maxLength={24}
            autoFocus
            value={pvpTeamJoinPrompt?.password || ''}
            status={pvpTeamJoinPrompt?.error ? 'error' : ''}
            hint={pvpTeamJoinPrompt?.error || ''}
            onChange={(event) => setPvpTeamJoinPrompt((prev) => ({ ...prev, password: event.target.value, error: '' }))}
          />
        ) : (
          <>
            <p className={styles.text}>Você entra na sala e é colocado automaticamente em um dos times.</p>
            {pvpTeamJoinPrompt?.error ? <p className={styles.alert} role="alert">{pvpTeamJoinPrompt.error}</p> : null}
          </>
        )}
      </form>
    </Modal>
  );
}
