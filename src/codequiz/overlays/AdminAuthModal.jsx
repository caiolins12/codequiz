import { ShieldCheck } from 'lucide-react';
import { Button, Modal, TextField } from '../ui';

export default function AdminAuthModal({ vm }) {
  const {
    adminAuthError,
    adminPassword,
    closeAdminAuthModal,
    setAdminAuthError,
    setAdminPassword,
    submitAdminAuth
  } = vm;

  return (
    <Modal
      title="Acesso administrativo"
      subtitle="Digite a senha para abrir o monitoramento."
      icon={ShieldCheck}
      tone="violet"
      size="sm"
      onClose={closeAdminAuthModal}
      footer={(
        <>
          <Button variant="secondary" onClick={closeAdminAuthModal}>Cancelar</Button>
          <Button variant="primary" type="submit" form="cq-admin-auth">Entrar</Button>
        </>
      )}
    >
      <form
        id="cq-admin-auth"
        onSubmit={(event) => {
          event.preventDefault();
          submitAdminAuth();
        }}
      >
        <TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="Senha do admin"
          value={adminPassword}
          status={adminAuthError ? 'error' : ''}
          hint={adminAuthError}
          autoFocus
          onChange={(event) => {
            setAdminPassword(event.target.value);
            if (adminAuthError) setAdminAuthError('');
          }}
        />
      </form>
    </Modal>
  );
}
