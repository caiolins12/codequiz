import { Lock, LockOpen, Plus, Users } from 'lucide-react';
import { AreaPicker, DifficultyPicker } from '../screens/shared/ArenaParts';
import { Button, Modal, Tabs, TextField } from '../ui';
import styles from './Overlays.module.css';

const VISIBILITY_TABS = [
  { value: 'open', label: 'Aberta', icon: LockOpen },
  { value: 'password', label: 'Com senha', icon: Lock }
];

export default function TeamRoomCreateModal({ vm }) {
  const {
    chooseKnowledgeAreaForPvp,
    choosePvpDifficulty,
    closePvpTeamRoomCreate,
    createPvpTeamRoomFromDraft,
    pvpSelectedDifficulty,
    pvpTeamActionBusy,
    pvpTeamDraftAreaMeta,
    pvpTeamRoomDraft,
    pvpTeamRoomDraftError,
    setPvpTeamRoomDraft
  } = vm;

  const visibility = pvpTeamRoomDraft?.visibility === 'password' ? 'password' : 'open';

  return (
    <Modal
      title="Criar sala 2x2"
      subtitle="Monte a sala e chame seu time."
      icon={Users}
      tone="cyan"
      size="md"
      onClose={pvpTeamActionBusy ? null : closePvpTeamRoomCreate}
      footer={(
        <>
          <Button variant="secondary" disabled={pvpTeamActionBusy} onClick={closePvpTeamRoomCreate}>Cancelar</Button>
          <Button variant="primary" icon={Plus} type="submit" form="cq-team-room-create" loading={pvpTeamActionBusy}>Criar sala</Button>
        </>
      )}
    >
      <form
        id="cq-team-room-create"
        className={styles.stack}
        onSubmit={(event) => {
          event.preventDefault();
          if (!pvpTeamActionBusy) createPvpTeamRoomFromDraft();
        }}
      >
        <TextField
          label="Nome da sala"
          placeholder="BR #01"
          maxLength={32}
          showCounter
          value={pvpTeamRoomDraft?.name || ''}
          onChange={(event) => setPvpTeamRoomDraft((prev) => ({ ...prev, name: event.target.value }))}
        />
        <Tabs
          items={VISIBILITY_TABS}
          value={visibility}
          block
          ariaLabel="Visibilidade da sala"
          onChange={(value) => setPvpTeamRoomDraft((prev) => ({ ...prev, visibility: value, password: value === 'open' ? '' : prev.password }))}
        />
        {visibility === 'password' ? (
          <TextField
            label="Senha da sala"
            type="password"
            autoComplete="new-password"
            placeholder="Digite a senha"
            maxLength={24}
            value={pvpTeamRoomDraft?.password || ''}
            onChange={(event) => setPvpTeamRoomDraft((prev) => ({ ...prev, password: event.target.value }))}
          />
        ) : null}
        <DifficultyPicker value={pvpSelectedDifficulty} onChoose={choosePvpDifficulty} disabled={pvpTeamActionBusy} />
        <AreaPicker value={pvpTeamDraftAreaMeta?.id} onChoose={chooseKnowledgeAreaForPvp} disabled={pvpTeamActionBusy} label="Área da sala" />
        {pvpTeamRoomDraftError ? <p className={styles.alert} role="alert">{pvpTeamRoomDraftError}</p> : null}
      </form>
    </Modal>
  );
}
