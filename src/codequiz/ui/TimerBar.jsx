import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import cx from './cx';
import styles from './TimerBar.module.css';

function computeRemaining(startedAtMs, durationMs) {
  const start = Math.max(0, Number(startedAtMs || 0));
  if (!start) return Math.max(0, durationMs);
  return Math.max(0, durationMs - (Date.now() - start));
}

// Barra de tempo que se atualiza sozinha (só este componente re-renderiza).
export default function TimerBar({ startedAtMs, durationMs, running = true, warnAtSec = 10, dangerAtSec = 5 }) {
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

  const remainingSec = Math.ceil(remainingMs / 1000);
  const percent = Math.max(0, Math.min(100, (remainingMs / safeDuration) * 100));
  const level = remainingSec <= dangerAtSec ? styles.danger : (remainingSec <= warnAtSec ? styles.warning : '');

  return (
    <div className={cx(styles.timer, level)}>
      <span className={styles.clock} role="timer" aria-label={`${remainingSec} segundos restantes`}>
        <Timer aria-hidden="true" strokeWidth={2.6} />
        {remainingSec}s
      </span>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
