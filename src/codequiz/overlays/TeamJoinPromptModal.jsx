export default function TeamJoinPromptModal({ vm }) {
  const {
    closePvpTeamJoinPrompt,
    pvpTeamActionBusy,
    pvpTeamJoinPrompt,
    setPvpTeamJoinPrompt,
    submitPvpTeamJoinPrompt
  } = vm;

  return (
    <div className="reset-modal" onClick={closePvpTeamJoinPrompt}>
      <div className="reset-modal-card pvp-team-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>{pvpTeamJoinPrompt.requiresPassword ? 'Entrar em sala privada' : 'Entrar na sala'}</h3>
        <p>{pvpTeamJoinPrompt.roomName || 'Sala privada'}</p>
        <div className="pvp-team-modal-fields">
          {pvpTeamJoinPrompt.requiresPassword ? (
            <>
              <label className="settings-input-label" htmlFor="pvp-team-join-password">Senha da sala</label>
              <input
                id="pvp-team-join-password"
                type="password"
                className="profile-input settings-input"
                placeholder="Digite a senha"
                maxLength={24}
                value={pvpTeamJoinPrompt.password}
                onChange={(event) => setPvpTeamJoinPrompt((prev) => ({ ...prev, password: event.target.value, error: '' }))}
              />
            </>
          ) : (
            <div className="challenge-status pvp-team-join-confirm">
              Voce entrara na sala e sera colocado automaticamente em um dos times.
            </div>
          )}
          {pvpTeamJoinPrompt.error ? (
            <div className="challenge-status pvp-team-modal-error">{pvpTeamJoinPrompt.error}</div>
          ) : null}
        </div>
        <div className="match-accept-actions">
          <button className="btn btn-secondary" disabled={pvpTeamActionBusy} onClick={closePvpTeamJoinPrompt}>
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={pvpTeamActionBusy} onClick={submitPvpTeamJoinPrompt}>
            {pvpTeamJoinPrompt.requiresPassword ? 'Entrar' : 'Confirmar entrada'}
          </button>
        </div>
      </div>
    </div>
  );
}
