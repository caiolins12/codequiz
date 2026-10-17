import cx from './cx';
import styles from './Button.module.css';

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon = null,
  iconRight: IconRight = null,
  block = false,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        block ? styles.block : '',
        loading ? styles.loading : '',
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {Icon ? <Icon className={styles.icon} aria-hidden="true" strokeWidth={2.4} /> : null}
      {children !== undefined && children !== null && children !== '' ? (
        <span className={styles.label}>{children}</span>
      ) : null}
      {IconRight ? <IconRight className={styles.icon} aria-hidden="true" strokeWidth={2.4} /> : null}
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
    </button>
  );
}
