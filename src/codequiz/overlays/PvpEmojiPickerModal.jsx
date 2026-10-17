import { normalizeEmojiDraftSlots } from '../app/helpers';

export default function PvpEmojiPickerModal({ vm }) {
  const {
    activePvpEmojiOptions,
    closePvpEmojiPicker,
    pvpEmojiDraft,
    pvpEmojiDraftWarning,
    pvpEmojiSlotFocus,
    removePvpEmojiAt,
    savePvpEmojiDraft,
    selectPvpEmojiSlot,
    togglePvpEmojiDraft
  } = vm;

  return (
    <div className="reset-modal" onClick={closePvpEmojiPicker}>
      <div className="reset-modal-card pvp-emoji-editor-card" onClick={(event) => event.stopPropagation()}>
        <h3>Emojis da Partida</h3>
        <p className="pvp-emoji-editor-hint">Selecione os 6 emojis pelos slots abaixo para salvar.</p>
        {pvpEmojiDraftWarning ? (
          <p className="pvp-emoji-editor-warning">{pvpEmojiDraftWarning}</p>
        ) : null}

        <div className="pvp-emoji-slots-wrap">
          <div className="pvp-emoji-section-title">Selecionados</div>
          <div className="pvp-emoji-slots">
            {Array.from({ length: 6 }).map((_, index) => {
              const selected = normalizeEmojiDraftSlots(pvpEmojiDraft)[index] || '';
              const activeSlot = index === pvpEmojiSlotFocus;
              return (
                <button
                  key={`emoji_slot_${index}`}
                  type="button"
                  className={`pvp-emoji-slot ${activeSlot ? 'active' : ''}`}
                  onClick={() => selectPvpEmojiSlot(index)}
                >
                  <span className="pvp-emoji-slot-index">{index + 1}</span>
                  <span className="pvp-emoji-slot-value">{selected || '+'}</span>
                  {selected ? (
                    <span
                      className="pvp-emoji-slot-remove"
                      onClick={(event) => {
                        event.stopPropagation();
                        removePvpEmojiAt(index);
                      }}
                    >
                      ×
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pvp-emoji-divider" aria-hidden="true" />
        <div className="pvp-emoji-section-title pvp-emoji-section-title-options">Galeria de emojis</div>
        <div className="pvp-emoji-editor-list">
          {activePvpEmojiOptions.map((emoji, index) => {
            const active = normalizeEmojiDraftSlots(pvpEmojiDraft).includes(emoji);
            return (
              <button
                type="button"
                key={`emoji_pick_all_${emoji}_${index}`}
                className={`pvp-emoji-option ${active ? 'active' : ''}`}
                onClick={() => togglePvpEmojiDraft(emoji)}
              >
                {emoji}
              </button>
            );
          })}
        </div>
        <div className="match-accept-actions pvp-emoji-picker-actions">
          <button className="btn btn-primary btn-lg" onClick={savePvpEmojiDraft}>Salvar</button>
          <button className="btn btn-secondary btn-lg" onClick={closePvpEmojiPicker}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
