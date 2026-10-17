export default function RewardParticles({ vm }) {
  const {
    rewardFxParticles
  } = vm;

  return (
    <div className="reward-collect-particles" aria-hidden="true">
      {rewardFxParticles.map((particle) => (
        <span
          key={particle.id}
          className={`reward-fx-particle ${particle.kind}`}
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
