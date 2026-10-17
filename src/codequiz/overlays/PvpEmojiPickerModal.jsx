import { Smile, X } from 'lucide-react';
import { normalizeEmojiDraftSlots } from '../app/helpers';
import { Button, Modal, cx } from '../ui';
import styles from './EmojiPicker.module.css';

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

  const slots = normalizeEmojiDraftSlots(pvpEmojiDraft);
  const options = Array.isArray(activePvpEmojiOptions) ? activePvpEmojiOptions : [];

  return (
    <Modal
      title="Emojis da partida"
      subtitle="Escolha 6 emojis para reagir durante as batalhas."
      icon={Smile}
      tone="pink"
      size="md"
      onClose={closePvpEmojiPicker}
      footer={(
        <>
          <Button variant="secondary" onClick={closePvpEmojiPicker}>Cancelar</Button>
          <Button variant="primary" onClick={savePvpEmojiDraft}>Salvar</Button>
        </>
      )}
    >
      <div className={styles.body}>
        {pvpEmojiDraftWarning ? <p className={styles.warning} role="alert">{pvpEmojiDraftWarning}</p> : null}

        <span className={styles.sectionTitle}>Selecionados</span>
        <div className={styles.slots}>
          {Array.from({ length: 6 }).map((_, index) => {
            const selected = slots[index] || '';
            const active = index === pvpEmojiSlotFocus;
            return (
              <div key={`emoji_slot_${index}`} className={styles.slot}>
                <button
                  type="button"
                  className={cx(styles.slotButton, active ? styles.slotActive : '')}
                  onClick={() => selectPvpEmojiSlot(index)}
                  aria-pressed={active}
                  aria-label={selected ? `Espaço ${index + 1}: ${selected}` : `Espaço ${index + 1}: vazio`}
                >
                  <span className={styles.slotIndex} aria-hidden="true">{index + 1}</span>
                  <span aria-hidden="true">{selected || '+'}</span>
                </button>
                {selected ? (
                  <button
                    type="button"
                    className={styles.slotRemove}
                    onClick={() => removePvpEmojiAt(index)}
                    aria-label={`Remover ${selected} do espaço ${index + 1}`}
                  >
                    <X strokeWidth={3} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        <span className={styles.sectionTitle}>Galeria</span>
        <div className={styles.gallery}>
          {options.map((emoji, index) => {
            const active = slots.includes(emoji);
            return (
              <button
                type="button"
                key={`emoji_pick_${emoji}_${index}`}
                className={cx(styles.option, active ? styles.optionActive : '')}
                onClick={() => togglePvpEmojiDraft(emoji)}
                aria-pressed={active}
                aria-label={emoji}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
