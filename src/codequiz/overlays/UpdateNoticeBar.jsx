export default function UpdateNoticeBar({ vm }) {
  const {
    applyPendingUpdate,
    updateState
  } = vm;

  return (
    <div className={`update-notice-bar ${updateState.applying ? 'is-applying' : ''}`} role="status" aria-live="polite">
      <div className="update-notice-inner">
        <div className="update-notice-main">
          <span className="update-notice-dot" aria-hidden="true" />
          <div className="update-notice-copy">
            <span className="update-notice-title">Nova versão disponível</span>
            <span className="update-notice-text">
              Atualize para aplicar melhorias e correções da versão mais recente.
            </span>
          </div>
        </div>
        <button
          className="update-notice-btn"
          disabled={updateState.applying}
          onClick={applyPendingUpdate}
          title="Existe uma versão nova publicada"
        >
          {updateState.applying ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>
    </div>
  );
}
