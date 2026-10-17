import {
  THEME_INTRO_PVE_DURATION_MS,
  THEME_INTRO_ROULETTE_CHIP_CENTER_OFFSET_PX
} from '../app/helpers';

export default function ThemeIntroOverlay({ vm }) {
  const {
    themeIntro
  } = vm;

  return (
    <div
      className={`theme-intro-overlay mode-${themeIntro.mode}`}
      role="status"
      aria-live="polite"
      aria-label="Tema da rodada"
      style={{
        '--theme-intro-duration-ms': `${Math.max(280, Number(themeIntro.durationMs || THEME_INTRO_PVE_DURATION_MS))}ms`,
        '--theme-intro-roll-duration-ms': `${Math.max(120, Number(themeIntro.rollDurationMs || 900))}ms`,
        '--theme-intro-roulette-start-offset-px': `${Math.max(80, Number(themeIntro.rouletteStartOffsetPx || 240))}px`
      }}
    >
      <div className="theme-intro-backdrop" />
      <div className="theme-intro-card">
        <div className="theme-intro-kicker">{themeIntro.kicker || 'Tema da rodada'}</div>
        <div className="theme-intro-roulette" aria-hidden="true">
          <div className="theme-intro-roulette-vignette" />
          <div
            className={`theme-intro-roulette-track phase-${themeIntro.phase || 'rolling'}`}
            style={{
              left: `calc(50% - ${Math.max(0, Number(themeIntro.rouletteRailLeftPx || THEME_INTRO_ROULETTE_CHIP_CENTER_OFFSET_PX))}px)`
            }}
          >
            {(Array.isArray(themeIntro.rouletteItems) ? themeIntro.rouletteItems : []).map((icon, index) => {
              const isTarget = index === Math.max(0, Number(themeIntro.rouletteTargetIndex || 0));
              const isLocked = isTarget && themeIntro.phase === 'locked';
              return (
                <span
                  key={`theme_intro_icon_${index}_${icon}`}
                  className={`theme-intro-roulette-chip${isTarget ? ' is-target' : ''}${isLocked ? ' is-locked' : ''}`}
                >
                  {String(icon || '🎯')}
                </span>
              );
            })}
          </div>
          <div className="theme-intro-roulette-marker" />
        </div>
        <div className="theme-intro-title-row">
          <span className="theme-intro-title-icon" aria-hidden="true">{themeIntro.icon || '🎯'}</span>
          <div className="theme-intro-title">{themeIntro.title || 'Tema geral'}</div>
        </div>
        <div className="theme-intro-subtitle">{themeIntro.subtitle || 'Preparando perguntas...'}</div>
        <div className="theme-intro-progress" aria-hidden="true">
          <span className="theme-intro-progress-fill" />
        </div>
      </div>
    </div>
  );
}
