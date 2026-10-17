import { CircleCheck, Hourglass } from 'lucide-react';
import { Avatar, cx } from '../../ui';
import styles from './Battle.module.css';

// Jogador no placar compacto (mobile).
export function ScorePlayer({ player, score, answered = null, me = false, right = false, accent = '' }) {
  if (!player) return null;
  return (
    <div
      className={cx(styles.scorePlayer, right ? styles.scorePlayerRight : '', me ? styles.me : '', player.backgroundMeta?.className)}
      style={{ background: player.background, ...(accent ? { '--score-accent': accent } : {}) }}
      data-bg-id={player.backgroundMeta?.id}
    >
      <span className={styles.scoreShade} aria-hidden="true" />
      <Avatar avatar={player.avatar} frameClass={player.frameClass} frameStyle={player.frameStyle} size="sm" />
      <span className={styles.scoreText}>
        <span className={styles.scoreName}>{player.nickname}{me ? ' (você)' : ''}</span>
        {answered !== null ? (
          <span className={cx(styles.scoreStatus, answered ? styles.scoreStatusDone : '')}>
            {answered ? 'Respondeu' : 'Pensando...'}
          </span>
        ) : null}
      </span>
      <span className={styles.scoreValue} aria-label={`${score} pontos`}>{score}</span>
    </div>
  );
}

// Painel lateral do jogador (desktop).
export function SidePlayer({ player, score, answered = null, me = false, accent = '' }) {
  if (!player) return <aside className={styles.sidePanel} aria-hidden="true" />;
  return (
    <aside
      className={cx(styles.sidePanel, me ? styles.me : '', player.backgroundMeta?.className)}
      style={{ background: player.background, ...(accent ? { '--score-accent': accent } : {}) }}
      data-bg-id={player.backgroundMeta?.id}
      aria-label={`${player.nickname}: ${score} pontos`}
    >
      <span className={styles.scoreShade} aria-hidden="true" />
      <Avatar avatar={player.avatar} frameClass={player.frameClass} frameStyle={player.frameStyle} size="xl" />
      <span className={styles.sideName}>{player.nickname}{me ? ' (você)' : ''}</span>
      <span className={styles.sideScore}>{score}</span>
      {answered !== null ? (
        <span className={cx(styles.scoreStatus, answered ? styles.scoreStatusDone : '')}>
          {answered ? (
            <><CircleCheck size={14} strokeWidth={2.8} aria-hidden="true" /> Respondeu</>
          ) : (
            <><Hourglass size={14} strokeWidth={2.8} aria-hidden="true" /> Pensando...</>
          )}
        </span>
      ) : null}
    </aside>
  );
}

export function EmojiBar({ emojis = [], onSend, cooldownActive = false, cooldownPct = 0, cooldownLabel = '' }) {
  return (
    <div className={styles.emojiBar} role="group" aria-label="Reações">
      {(Array.isArray(emojis) ? emojis : []).map((emoji) => (
        <button
          key={emoji}
          type="button"
          className={styles.emojiButton}
          onClick={() => onSend(emoji)}
          disabled={cooldownActive}
          aria-label={`Enviar emoji ${emoji}`}
        >
          <span aria-hidden="true">{emoji}</span>
          {cooldownActive ? (
            <>
              <span className={styles.emojiCooldown} style={{ height: `${cooldownPct}%` }} aria-hidden="true" />
              <span className={styles.emojiCooldownLabel} aria-hidden="true">{cooldownLabel}</span>
            </>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function EmojiFxLayer({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className={styles.fxLayer} aria-hidden="true">
      {items.map((fx) => (
        <span
          key={fx.id}
          className={styles.fx}
          style={{
            top: `${Number.isFinite(Number(fx?.topPct)) ? Number(fx.topPct) : 58}%`,
            [String(fx?.side || '') === 'left' ? 'left' : 'right']: `calc(8% + ${Math.max(0, Number(fx?.offsetPx || 0))}px)`
          }}
        >
          {fx.emoji}
        </span>
      ))}
    </div>
  );
}

export { styles as battleStyles };
