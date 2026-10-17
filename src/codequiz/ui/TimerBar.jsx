import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import cx from './cx';
import styles from './TimerBar.module.css';

function computeRemaining(startedAtMs, durationMs) {
  const start = Math.max(0, Number(startedAtMs || 0));
  if (!start) return Math.max(0, durationMs);
  return Math.max(0, durationMs - (Date.now() - start));
}

// Exibição pura: segundos restantes + porcentagem da barra.
export function TimerDisplay({ seconds, percent, warnAtSec = 10, dangerAtSec = 5, level = '', className = '' }) {
  const safeSeconds = Math.max(0, Math.ceil(Number(seconds || 0)));
  const safePercent = Math.max(0, Math.min(100, Number(percent || 0)));
  const autoLevel = safeSeconds <= dangerAtSec ? 'danger' : (safeSeconds <= warnAtSec ? 'warning' : '');
  const finalLevel = level || autoLevel;
  return (
    <div className={cx(styles.timer, finalLevel ? styles[finalLevel] : '', className)}>
      <span className={styles.clock} role="timer" aria-label={`${safeSeconds} segundos restantes`}>
        <Timer aria-hidden="true" strokeWidth={2.6} />
        {safeSeconds}s
      </span>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.fill} style={{ width: `${safePercent}%` }} />
      </div>
    </div>
  );
}

// Barra de tempo que se atualiza sozinha (só este componente re-renderiza).
export default function TimerBar({ startedAtMs, durationMs, running = true, warnAtSec = 10, dangerAtSec = 5, className = '' }) {
  const safeDuration = Math.max(1, Number(durationMs || 1));
  const [remainingMs, setRemainingMs] = useState(() => computeRemaining(startedAtMs, safeDuration));

  useEffect(() => {
    setRemainingMs(computeRemaining(startedAtMs, safeDuration));
    if (!running) return undefined;
    const timer = setInterval(() => {
      setRemainingMs(computeRemaining(startedAtMs, safeDuration));
    }, 100);
    return () => clearInterval(timer);
  }, [startedAtMs, safeDuration, running]);

  return (
    <TimerDisplay
      seconds={remainingMs / 1000}
      percent={(remainingMs / safeDuration) * 100}
      warnAtSec={warnAtSec}
      dangerAtSec={dangerAtSec}
      className={className}
    />
  );
}
