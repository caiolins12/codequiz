import { DIFFICULTY_LABELS } from '../lib/constants';

export default function TeamRoomCreateModal({ vm }) {
  const {
    chooseKnowledgeAreaForPvp,
    choosePvpDifficulty,
    closePvpTeamRoomCreate,
    createPvpTeamRoomFromDraft,
    pvpSelectedDifficulty,
    pvpTeamActionBusy,
    pvpTeamDraftAreaMeta,
    pvpTeamDraftNextAreaMeta,
    pvpTeamDraftPrevAreaMeta,
    pvpTeamRoomDraft,
    pvpTeamRoomDraftError,
    setPvpTeamRoomDraft
  } = vm;

  return (
    <div className="reset-modal" onClick={closePvpTeamRoomCreate}>
      <div className="reset-modal-card pvp-team-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>Criar sala 2x2</h3>
        <div className="pvp-team-modal-fields">
          <label className="settings-input-label" htmlFor="pvp-team-room-name">Nome da sala</label>
          <input
            id="pvp-team-room-name"
            type="text"
            className="profile-input settings-input"
            placeholder="BR #01"
            maxLength={32}
            value={pvpTeamRoomDraft.name}
            onChange={(event) => setPvpTeamRoomDraft((prev) => ({ ...prev, name: event.target.value }))}
          />
          <div className="pvp-team-visibility-row">
            <button
              className={`btn ${pvpTeamRoomDraft.visibility === 'open' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPvpTeamRoomDraft((prev) => ({ ...prev, visibility: 'open', password: '' }))}
            >
              Sala aberta
            </button>
            <button
              className={`btn ${pvpTeamRoomDraft.visibility === 'password' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPvpTeamRoomDraft((prev) => ({ ...prev, visibility: 'password' }))}
            >
              Com senha
            </button>
          </div>
          {pvpTeamRoomDraft.visibility === 'password' ? (
            <>
              <label className="settings-input-label" htmlFor="pvp-team-room-password">Senha</label>
              <input
                id="pvp-team-room-password"
                type="password"
                className="profile-input settings-input"
                placeholder="Digite a senha"
                maxLength={24}
                value={pvpTeamRoomDraft.password}
                onChange={(event) => setPvpTeamRoomDraft((prev) => ({ ...prev, password: event.target.value }))}
              />
            </>
          ) : null}
          <div className="pvp-team-modal-config">
            <div className="pvp-team-modal-config-block">
              <label className="settings-input-label">Dificuldade</label>
              <div className="challenge-diff-list pvp-team-modal-difficulty-list">
                {['easy', 'medium', 'hard'].map((difficulty) => {
                  const isSelected = pvpSelectedDifficulty === difficulty;
                  return (
                    <button
                      key={`team_modal_diff_${difficulty}`}
                      className={`challenge-diff-btn arena-diff-btn arena-diff-btn-${difficulty} ${isSelected ? 'active' : ''}`}
                      disabled={pvpTeamActionBusy}
                      onClick={() => choosePvpDifficulty(difficulty)}
                    >
                      {DIFFICULTY_LABELS[difficulty] || difficulty}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="pvp-team-modal-config-block">
              <label className="settings-input-label">Area da sala</label>
              <div className="pvp-team-area-selector">
                <button
                  className="ka-arrow-btn pvp-team-area-selector-nav"
                  disabled={pvpTeamActionBusy || !pvpTeamDraftPrevAreaMeta}
                  onClick={() => {
                    if (!pvpTeamDraftPrevAreaMeta) return;
                    chooseKnowledgeAreaForPvp(pvpTeamDraftPrevAreaMeta.id);
                  }}
                  aria-label="Area anterior"
                >
                  &lt;
                </button>
                <div
                  className="pvp-team-area-selector-card"
                  style={pvpTeamDraftAreaMeta ? { '--team-area-color': pvpTeamDraftAreaMeta.color } : undefined}
                >
                  {pvpTeamDraftAreaMeta ? (
                    <>
                      <span className="pvp-team-area-selector-kicker">Area selecionada</span>
                      <span className="pvp-team-area-selector-icon">{pvpTeamDraftAreaMeta.icon}</span>
                      <strong className="pvp-team-area-selector-name">{pvpTeamDraftAreaMeta.name}</strong>
                      <span className="pvp-team-area-selector-desc">{pvpTeamDraftAreaMeta.desc}</span>
                    </>
                  ) : (
                    <span className="pvp-team-area-selector-empty">Nenhuma area disponivel</span>
                  )}
                </div>
                <button
                  className="ka-arrow-btn pvp-team-area-selector-nav"
                  disabled={pvpTeamActionBusy || !pvpTeamDraftNextAreaMeta}
                  onClick={() => {
                    if (!pvpTeamDraftNextAreaMeta) return;
                    chooseKnowledgeAreaForPvp(pvpTeamDraftNextAreaMeta.id);
                  }}
                  aria-label="Proxima area"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
          {pvpTeamRoomDraftError ? (
            <div className="challenge-status pvp-team-modal-error">{pvpTeamRoomDraftError}</div>
          ) : null}
        </div>
        <div className="match-accept-actions">
          <button className="btn btn-secondary" disabled={pvpTeamActionBusy} onClick={closePvpTeamRoomCreate}>
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={pvpTeamActionBusy} onClick={() => createPvpTeamRoomFromDraft()}>
            {pvpTeamActionBusy ? 'Criando...' : 'Criar sala'}
          </button>
        </div>
      </div>
    </div>
  );
}
