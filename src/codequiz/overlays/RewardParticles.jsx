import { cx } from '../ui';
import styles from './Fx.module.css';

export default function RewardParticles({ vm }) {
  const { rewardFxParticles } = vm;

  return (
    <div className={styles.particles} aria-hidden="true">
      {rewardFxParticles.map((particle) => (
        <span
          key={particle.id}
          className={cx(styles.particle, styles[particle.kind] || '')}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            '--dx': `${particle.dx}px`,
            '--dy': `${particle.dy}px`,
            '--drift': `${particle.drift}px`,
            '--delay': `${particle.delay}ms`,
            '--duration': `${particle.duration}ms`,
            '--size': `${particle.size}px`,
            '--rotation': `${particle.rotate}deg`
          }}
        >
          {particle.icon}
        </span>
      ))}
    </div>
  );
}
