import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import cx from './cx';
import styles from './Layout.module.css';

export function PageHeader({
  title,
  subtitle = '',
  eyebrow = '',
  onBack = null,
  backLabel = 'Voltar',
  actions = null,
  className = ''
}) {
  return (
    <header className={cx(styles.pageHeader, className)}>
      {typeof onBack === 'function' ? (
        <button type="button" className={styles.backButton} onClick={onBack} aria-label={backLabel} title={backLabel}>
          <ArrowLeft aria-hidden="true" strokeWidth={2.6} />
        </button>
      ) : null}
      <div className={styles.pageHeaderMain}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle ? <p className={styles.pageSubtitle}>{subtitle}</p> : null}
      </div>
      {actions ? <div className={styles.pageActions}>{actions}</div> : null}
    </header>
  );
}

export function SectionHeader({ title, subtitle = '', icon: Icon = null, action = null, className = '' }) {
  return (
    <div className={cx(styles.sectionHeader, className)}>
      <div>
        <h2 className={styles.sectionTitle}>
          {Icon ? <Icon aria-hidden="true" strokeWidth={2.4} /> : null}
          {title}
        </h2>
        {subtitle ? <p className={styles.sectionSubtitle}>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon = null, title, text = '', action = null, className = '' }) {
  return (
    <div className={cx(styles.empty, className)}>
      {Icon ? (
        <span className={styles.emptyIcon} aria-hidden="true">
          <Icon strokeWidth={2.2} />
        </span>
      ) : null}
      <h3 className={styles.emptyTitle}>{title}</h3>
      {text ? <p className={styles.emptyText}>{text}</p> : null}
      {action}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 16, radius, className = '' }) {
  return (
    <span
      className={cx(styles.skeleton, className)}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function StatTile({ icon: Icon = null, label, value, tone = 'violet', className = '' }) {
  return (
    <div className={cx(styles.statTile, styles[`tone-${tone}`] || '', className)}>
      {Icon ? (
        <span className={styles.statIcon} aria-hidden="true">
          <Icon strokeWidth={2.4} />
        </span>
      ) : null}
      <span className={styles.statBody}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </span>
    </div>
  );
}

export function ListRow({
  leading = null,
  title,
  subtitle = '',
  trailing = null,
  onClick = null,
  active = false,
  className = '',
  ...rest
}) {
  const Component = typeof onClick === 'function' ? 'button' : 'div';
  return (
    <Component
      type={Component === 'button' ? 'button' : undefined}
      className={cx(styles.row, active ? styles.rowActive : '', className)}
      onClick={onClick || undefined}
      {...rest}
    >
      {leading ? <span className={styles.rowLeading}>{leading}</span> : null}
      <span className={styles.rowMain}>
        <span className={styles.rowTitle}>{title}</span>
        {subtitle ? <span className={styles.rowSubtitle}>{subtitle}</span> : null}
      </span>
      {trailing ? <span className={styles.rowTrailing}>{trailing}</span> : null}
    </Component>
  );
}

const CONFETTI_COLORS = ['#7b5cff', '#ff4fb4', '#23d2fb', '#3ee07f', '#ffd24a', '#ff8a3d'];

// Chuva de confete decorativa (some sozinha pela animação).
export function Confetti({ count = 60, seed = 0 }) {
  const pieces = useMemo(() => {
    let state = (Number(seed) || 1) * 9301 + 49297;
    const random = () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      left: `${Math.round(random() * 100)}%`,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      delay: `${(random() * 0.6).toFixed(2)}s`,
      duration: `${(2.2 + random() * 1.4).toFixed(2)}s`,
      drift: `${Math.round((random() - 0.5) * 220)}px`,
      rotate: `${Math.round(360 + random() * 540)}deg`,
      round: random() > 0.6
    }));
  }, [count, seed]);
  return (
    <div className={styles.confetti} aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={styles.confettiPiece}
          style={{
            left: piece.left,
            background: piece.color,
            borderRadius: piece.round ? '50%' : undefined,
            animationDelay: piece.delay,
            '--cq-confetti-duration': piece.duration,
            '--cq-confetti-x': piece.drift,
            '--cq-confetti-r': piece.rotate
          }}
        />
      ))}
    </div>
  );
}
