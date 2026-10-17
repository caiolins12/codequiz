import { Flame, Play, Sprout, Zap } from 'lucide-react';
import { DIFFICULTY_LABELS } from '../../lib/constants';
import { Badge, ProgressBar, cx } from '../../ui';
import styles from './DifficultyOptions.module.css';

const OPTIONS = [
  { id: 'easy', icon: Sprout, desc: 'Perguntas introdutórias e fundamentos.', multiplier: 'x1', tone: 'lime' },
  { id: 'medium', icon: Flame, desc: 'Aplicação prática e análise.', multiplier: 'x2', tone: 'orange' },
  { id: 'hard', icon: Zap, desc: 'Cenários avançados e detalhes técnicos.', multiplier: 'x3', tone: 'pink' }
];

// counts: { easy, medium, hard } — perguntas por partida; progress: { easy: { pct } ... }
export default function DifficultyOptions({ counts = {}, progress = {}, onPick, layout = 'list' }) {
  return (
    <ul className={cx(styles.list, layout === 'columns' ? styles.columns : '')}>
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const count = Math.max(0, Number(counts?.[option.id] || 0));
        const best = Math.max(0, Math.min(100, Number(progress?.[option.id]?.pct || 0)));
        return (
          <li key={option.id}>
            <button
              type="button"
              className={cx(styles.option, styles[option.id])}
              onClick={() => onPick(option.id)}
              disabled={!count}
              aria-label={`${DIFFICULTY_LABELS[option.id]}: ${count} perguntas, melhor resultado ${best}%`}
            >
              <span className={styles.icon} aria-hidden="true"><Icon strokeWidth={2.6} /></span>
              <span className={styles.body}>
                <span className={styles.nameRow}>
                  <span className={styles.name}>{DIFFICULTY_LABELS[option.id]}</span>
                  <Badge tone={option.tone} size="sm">{option.multiplier} recompensas</Badge>
                </span>
                <span className={styles.desc}>{count ? option.desc : 'Sem perguntas neste nível.'}</span>
                <span className={styles.meta}>{count} perguntas · melhor resultado {best}%</span>
                <ProgressBar value={best} size="xs" tone={option.tone} className={styles.metaBar} label={`Melhor resultado em ${DIFFICULTY_LABELS[option.id]}`} />
              </span>
              <span className={styles.play} aria-hidden="true"><Play strokeWidth={3} fill="currentColor" /></span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
