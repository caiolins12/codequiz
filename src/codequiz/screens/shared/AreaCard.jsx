import { ChevronRight } from 'lucide-react';
import { LANGUAGE_THEME_GROUPS } from '../../app/helpers';
import { ProgressBar, cx } from '../../ui';
import styles from './AreaCard.module.css';

// Resumo de uma área de conhecimento: nº de trilhas e progresso médio.
export function getAreaSummary(areaId, languageProgress) {
  const ids = new Set(
    LANGUAGE_THEME_GROUPS.filter((group) => group.area === areaId).flatMap((group) => group.languages)
  );
  const values = [...ids].map((id) => Number(languageProgress?.get?.(id) || 0));
  const progress = values.length ? Math.round(values.reduce((acc, value) => acc + value, 0) / values.length) : 0;
  return { tracks: ids.size, progress };
}

export default function AreaCard({ area, summary, onSelect, layout = 'row' }) {
  return (
    <button
      type="button"
      className={cx(styles.card, layout === 'vertical' ? styles.vertical : '')}
      style={{ '--area-color': area.color }}
      onClick={() => onSelect(area.id)}
    >
      <span className={styles.icon} aria-hidden="true">{area.icon}</span>
      <span className={styles.body}>
        <span className={styles.name}>{area.name}</span>
        <span className={styles.desc}>{area.desc}</span>
        <span className={styles.meta}>
          <span>{summary.tracks} trilha{summary.tracks === 1 ? '' : 's'}</span>
          <ProgressBar value={summary.progress} size="xs" tone="cyan" className={styles.metaBar} label={`Progresso em ${area.name}`} />
          <span>{summary.progress}%</span>
        </span>
      </span>
      <span className={styles.arrow} aria-hidden="true"><ChevronRight strokeWidth={2.8} /></span>
    </button>
  );
}
