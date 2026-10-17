import {
  THEME_INTRO_PVE_DURATION_MS,
  THEME_INTRO_ROULETTE_CHIP_CENTER_OFFSET_PX
} from '../app/helpers';
import { cx } from '../ui';
import styles from './ThemeIntro.module.css';

export default function ThemeIntroOverlay({ vm }) {
  const { themeIntro } = vm;
  const items = Array.isArray(themeIntro?.rouletteItems) ? themeIntro.rouletteItems : [];
  const targetIndex = Math.max(0, Number(themeIntro?.rouletteTargetIndex || 0));
  const locked = themeIntro?.phase === 'locked';

  return (
    <div
      className={cx(styles.overlay, themeIntro?.mode === 'pvp' ? styles.pvp : '')}
      role="status"
      aria-live="polite"
      aria-label={`Tema da rodada: ${themeIntro?.title || 'Tema geral'}`}
      style={{
        '--theme-intro-duration-ms': `${Math.max(280, Number(themeIntro?.durationMs || THEME_INTRO_PVE_DURATION_MS))}ms`,
        '--theme-intro-roll-duration-ms': `${Math.max(120, Number(themeIntro?.rollDurationMs || 900))}ms`,
        '--theme-intro-roulette-start-offset-px': `${Math.max(80, Number(themeIntro?.rouletteStartOffsetPx || 240))}px`
      }}
    >
      <div className={styles.card}>
        <span className={styles.kicker}>{themeIntro?.kicker || 'Tema da rodada'}</span>
        <div className={styles.roulette} aria-hidden="true">
          <div
            className={cx(styles.track, locked ? '' : styles.rolling)}
            style={{ left: `calc(50% - ${Math.max(0, Number(themeIntro?.rouletteRailLeftPx || THEME_INTRO_ROULETTE_CHIP_CENTER_OFFSET_PX))}px)` }}
          >
            {items.map((icon, index) => (
              <span
                key={`theme_intro_icon_${index}_${icon}`}
                className={cx(styles.chip, index === targetIndex && locked ? styles.chipLocked : '')}
              >
                {String(icon || '🎯')}
              </span>
            ))}
          </div>
          <span className={styles.vignette} />
          <span className={styles.marker} />
        </div>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon} aria-hidden="true">{themeIntro?.icon || '🎯'}</span>
          <h2 className={styles.title}>{themeIntro?.title || 'Tema geral'}</h2>
        </div>
        <p className={styles.subtitle}>{themeIntro?.subtitle || 'Preparando perguntas...'}</p>
        <span className={styles.progress} aria-hidden="true"><span className={styles.progressFill} /></span>
      </div>
    </div>
  );
}
