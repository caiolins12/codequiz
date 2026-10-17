import cx from './cx';
import styles from './Progress.module.css';

const RING_COLORS = {
  violet: '#8f72ff',
  blue: '#4c8dff',
  lime: '#3ee07f',
  gold: '#ffd24a',
  pink: '#ff4fb4',
  cyan: '#23d2fb',
  orange: '#ff8a3d',
  red: '#ff5c6c'
};

function clampPercent(value) {
  const safe = Number(value);
  if (!Number.isFinite(safe)) return 0;
  return Math.max(0, Math.min(100, safe));
}

export function ProgressBar({
  value = 0,
  tone = 'violet',
  size = 'md',
  striped = false,
  label = '',
  className = '',
  ...rest
}) {
  const percent = clampPercent(value);
  return (
    <div
      className={cx(styles.bar, styles[size] || '', styles[tone] || '', striped ? styles.striped : '', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-label={label || undefined}
      {...rest}
    >
      <div className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  );
}

export function ProgressRing({
  value = 0,
  size = 64,
  stroke = 7,
  tone = 'violet',
  label = '',
  className = '',
  children
}) {
  const percent = clampPercent(value);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <div
      className={cx(styles.ring, className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-label={label || undefined}
    >
      <svg className={styles.ringSvg} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className={styles.ringTrack} cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} />
        <circle
          className={styles.ringValue}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={RING_COLORS[tone] || RING_COLORS.violet}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.ringContent}>{children}</div>
    </div>
  );
}
