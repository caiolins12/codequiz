import { Badge, cx } from '../../ui';
import styles from './AdminMatchTable.module.css';

// columns: [{ key, label, mobileLabel?, wide?, render(row) }]
export default function AdminMatchTable({ columns, rows, caption = '' }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        {caption ? <caption className="cq-visually-hidden">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  data-label={column.mobileLabel ?? column.label}
                  className={column.wide ? styles.wide : ''}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MatchCell({ title, code, typeLabel }) {
  return (
    <span className={styles.match}>
      <span className={styles.matchTitle}>{title}</span>
      <span className={styles.matchSub}>
        <code className={styles.code}>{code}</code>
        {typeLabel ? <span>· {typeLabel}</span> : null}
      </span>
    </span>
  );
}

export function ScoreCell({ value, sub = '' }) {
  return (
    <span className={styles.score}>
      {value}
      {sub ? <span className={styles.scoreSub}>{sub}</span> : null}
    </span>
  );
}

export function TimeCell({ value }) {
  return <span className={styles.time}>{value}</span>;
}

export function ChipsCell({ chips }) {
  const items = (Array.isArray(chips) ? chips : []).filter(Boolean);
  if (!items.length) return <span className={cx(styles.time)}>—</span>;
  return (
    <span className={styles.chips}>
      {items.map((chip) => <Badge key={chip} tone="neutral" size="sm">{chip}</Badge>)}
    </span>
  );
}
