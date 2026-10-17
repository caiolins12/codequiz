import { Check } from 'lucide-react';
import { cx } from '../../ui';
import styles from './AnswerOptions.module.css';

const TONES = ['violet', 'cyan', 'orange', 'pink'];

// Alternativas A–D. Duas colunas (>= 768px) quando todas as opções são curtas.
export default function AnswerOptions({
  options = [],
  selectedIndex = null,
  onSelect,
  disabled = false,
  keyPrefix = '',
  className = ''
}) {
  const safeOptions = Array.isArray(options) ? options : [];
  const longest = safeOptions.reduce((acc, option) => Math.max(acc, String(option || '').length), 0);
  const twoColumns = safeOptions.length === 4 && longest <= 48;
  return (
    <div
      className={cx(styles.grid, twoColumns ? styles.two : '', className)}
      role="radiogroup"
      aria-label="Alternativas"
    >
      {safeOptions.map((option, index) => {
        const selected = Number(selectedIndex) === index && selectedIndex !== null && selectedIndex !== undefined;
        return (
          <button
            key={`${keyPrefix}_${index}`}
            type="button"
            role="radio"
            aria-checked={selected}
            className={cx(styles.option, styles[TONES[index % TONES.length]], selected ? styles.selected : '')}
            disabled={disabled}
            onClick={() => onSelect(index)}
          >
            <span className={styles.letter} aria-hidden="true">{String.fromCharCode(65 + index)}</span>
            <span className={styles.text}>{option}</span>
            {selected ? (
              <span className={styles.check} aria-hidden="true"><Check strokeWidth={3.2} /></span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
