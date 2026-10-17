import { useId } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import cx from './cx';
import styles from './TextField.module.css';

// status: '' | 'checking' | 'success' | 'error'
export default function TextField({
  label = '',
  hint = '',
  status = '',
  size = 'md',
  maxLength,
  value = '',
  showCounter = false,
  className = '',
  id,
  ...inputProps
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const length = String(value || '').length;
  return (
    <div className={cx(styles.field, status ? styles[status] : '', size === 'sm' ? styles.sm : '', className)}>
      {label ? <label className={styles.label} htmlFor={inputId}>{label}</label> : null}
      <div className={styles.control}>
        <input
          id={inputId}
          className={styles.input}
          maxLength={maxLength}
          value={value}
          aria-invalid={status === 'error' || undefined}
          aria-describedby={hintId}
          {...inputProps}
        />
        <span className={styles.statusIcon} aria-hidden="true">
          {status === 'checking' ? <span className={styles.spinner} /> : null}
          {status === 'success' ? <CircleCheck strokeWidth={2.6} /> : null}
          {status === 'error' ? <CircleAlert strokeWidth={2.6} /> : null}
        </span>
      </div>
      {hint || (showCounter && maxLength) ? (
        <div className={styles.hint} id={hintId} aria-live="polite">
          <span className={styles.hintText}>{hint}</span>
          {showCounter && maxLength ? <span className={styles.counter}>{length}/{maxLength}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
