import cx from './cx';
import styles from './IconButton.module.css';

export default function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  round = false,
  dot = false,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(styles.iconButton, styles[variant], styles[size], round ? styles.round : '', className)}
      {...rest}
    >
      {Icon ? <Icon className={styles.icon} aria-hidden="true" strokeWidth={2.3} /> : null}
      {dot ? <span className={styles.badge} aria-hidden="true" /> : null}
    </button>
  );
}
