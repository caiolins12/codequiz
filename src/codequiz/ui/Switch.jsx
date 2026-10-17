import cx from './cx';
import styles from './Switch.module.css';

// Interruptor liga/desliga acessível (checkbox nativo com role="switch").
export default function Switch({ checked = false, onChange, label, disabled = false, className = '' }) {
  return (
    <span className={cx(styles.switch, className)}>
      <input
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </span>
  );
}

// Controle deslizante 0–1 (volume), com o trecho preenchido em destaque.
export function RangeSlider({ value = 0, onChange, label, disabled = false, min = 0, max = 1, step = 0.01, className = '' }) {
  const safe = Math.max(min, Math.min(max, Number(value) || 0));
  const pct = ((safe - min) / (max - min || 1)) * 100;
  return (
    <input
      type="range"
      className={cx(styles.range, className)}
      min={min}
      max={max}
      step={step}
      value={safe}
      disabled={disabled}
      aria-label={label}
      style={{ '--range-pct': `${pct}%` }}
      onChange={(event) => onChange?.(Number(event.target.value))}
    />
  );
}
