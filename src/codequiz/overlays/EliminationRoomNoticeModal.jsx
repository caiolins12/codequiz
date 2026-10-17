export default function EliminationRoomNoticeModal({ vm }) {
  const {
    closePvpEliminationRoomNoticeModal,
    pvpEliminationRoomNoticeModal
  } = vm;

  return (
    <div className="reset-modal" onClick={closePvpEliminationRoomNoticeModal}>
      <div className="reset-modal-card pvp-team-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>{pvpEliminationRoomNoticeModal?.title || 'Aviso da sala'}</h3>
        <p>{pvpEliminationRoomNoticeModal?.message || 'Ainda nao e possivel iniciar a sala.'}</p>
        <div className="match-accept-actions">
          <button className="btn btn-primary" onClick={closePvpEliminationRoomNoticeModal}>
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
