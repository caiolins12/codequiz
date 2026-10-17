import cx from './cx';
import styles from './Tabs.module.css';

// Controle segmentado. items: [{ value, label, icon?, count? }]
export default function Tabs({
  items = [],
  value,
  onChange,
  size = 'md',
  block = false,
  ariaLabel = '',
  className = ''
}) {
  return (
    <div
      className={cx(styles.tabs, block ? styles.block : '', size === 'sm' ? styles.sm : '', className)}
      role="tablist"
      aria-label={ariaLabel || undefined}
    >
      {items.map((item) => {
        const active = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cx(styles.tab, active ? styles.active : '')}
            onClick={() => {
              if (!active && typeof onChange === 'function') onChange(item.value);
            }}
          >
            {Icon ? <Icon className={styles.icon} aria-hidden="true" strokeWidth={2.4} /> : null}
            <span>{item.label}</span>
            {item.count !== undefined && item.count !== null ? <span className={styles.count}>{item.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
