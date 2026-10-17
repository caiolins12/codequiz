import cx from './cx';
import styles from './Badge.module.css';

export default function Badge({
  tone = 'violet',
  variant = 'soft',
  size = 'md',
  upper = false,
  icon: Icon = null,
  className = '',
  children,
  ...rest
}) {
  return (
    <span
      className={cx(
        styles.badge,
        styles[tone] || '',
        variant === 'solid' ? styles.solid : '',
        size !== 'md' ? styles[size] : '',
        upper ? styles.upper : '',
        className
      )}
      {...rest}
    >
      {Icon ? <Icon className={styles.icon} aria-hidden="true" strokeWidth={2.6} /> : null}
      {children}
    </span>
  );
}

// Liga (bronze..diamante) — `tierKey` vem de getCategoryByPoints().key
export function TierBadge({ tierKey = 'bronze', label, prefix = '', ...rest }) {
  const tone = `tier-${String(tierKey || 'bronze').toLowerCase()}`;
  return (
    <Badge tone={tone} {...rest}>
      {prefix ? `${prefix} ` : ''}
      {label}
    </Badge>
  );
}

export function RarityBadge({ rarity = 'common', label, ...rest }) {
  const tone = `rarity-${String(rarity || 'common').toLowerCase()}`;
  return (
    <Badge tone={tone} upper size="sm" {...rest}>
      {label}
    </Badge>
  );
}
