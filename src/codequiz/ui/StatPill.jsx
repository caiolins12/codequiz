import cx from './cx';
import styles from './StatPill.module.css';

// Pílula com ícone + valor (moedas, XP, sequência...). `ariaLabel` descreve o valor.
export default function StatPill({
  icon: Icon,
  value,
  label = '',
  tone = 'gold',
  size = 'md',
  ariaLabel,
  className = '',
  ...rest
}) {
  return (
    <span
      className={cx(styles.pill, styles[tone] || '', size !== 'md' ? styles[size] : '', className)}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      {...rest}
    >
      {Icon ? <Icon className={styles.icon} aria-hidden="true" strokeWidth={2.5} /> : null}
      <span>{value}</span>
      {label ? <span className={styles.label}>{label}</span> : null}
    </span>
  );
}
