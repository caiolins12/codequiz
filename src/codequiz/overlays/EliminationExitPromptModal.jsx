export default function EliminationExitPromptModal({ vm }) {
  const {
    exitPvpEliminationWithPlacement,
    keepWatchingPvpElimination,
    pvpEliminationExitPrompt
  } = vm;

  return (
    <div className="reset-modal" onClick={keepWatchingPvpElimination}>
      <div className="reset-modal-card pvp-team-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>Voce foi eliminado</h3>
        <p>{pvpEliminationExitPrompt.nickname || 'Jogador'}, sua colocacao parcial e {pvpEliminationExitPrompt.placementLabel || '4o lugar'}.</p>
        <div className="challenge-status pvp-team-join-confirm">
          Deseja continuar assistindo ou sair agora para receber as recompensas da colocacao?
        </div>
        <div className="match-accept-actions">
          <button className="btn btn-secondary" onClick={keepWatchingPvpElimination}>
            Continuar assistindo
          </button>
          <button className="btn btn-primary" onClick={() => exitPvpEliminationWithPlacement()}>
            Sair e receber
          </button>
        </div>
      </div>
    </div>
  );
}
