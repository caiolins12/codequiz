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
    <div className="reset-modal admin-auth-modal" onClick={closeAdminAuthModal}>
      <div className="reset-modal-card admin-auth-card" onClick={(event) => event.stopPropagation()}>
        <h3>Acesso administrativo</h3>
        <p>Digite a senha para abrir o monitoramento.</p>
        <input
          type="password"
          className="profile-input settings-input admin-auth-input"
          placeholder="Senha"
          value={adminPassword}
          onChange={(event) => {
            setAdminPassword(event.target.value);
            if (adminAuthError) setAdminAuthError('');
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submitAdminAuth();
          }}
          autoFocus
        />
        {adminAuthError ? <div className="admin-auth-error">{adminAuthError}</div> : null}
        <div className="match-accept-actions">
          <button className="btn btn-primary btn-lg" onClick={submitAdminAuth}>Entrar</button>
          <button className="btn btn-secondary btn-lg" onClick={closeAdminAuthModal}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
