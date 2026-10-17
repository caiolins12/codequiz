export default function TeamRoomNoticeModal({ vm }) {
  const {
    closePvpTeamRoomNoticeModal,
    pvpTeamRoomNoticeModal
  } = vm;

  return (
    <div className="reset-modal" onClick={closePvpTeamRoomNoticeModal}>
      <div className="reset-modal-card pvp-team-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>{pvpTeamRoomNoticeModal?.title || 'Aviso da sala'}</h3>
        <p>{pvpTeamRoomNoticeModal?.message || 'Ainda nao e possivel iniciar a sala.'}</p>
        <div className="match-accept-actions">
          <button className="btn btn-primary" onClick={closePvpTeamRoomNoticeModal}>
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
