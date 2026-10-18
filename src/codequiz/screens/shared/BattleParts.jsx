import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleCheck, Hourglass, SmilePlus, X } from 'lucide-react';
import { PVP_EMOJI_FX_DURATION_MS } from '../../app/helpers';
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

export function EmojiBar({ emojis = [], onSend, cooldownActive = false, cooldownPct = 0, cooldownLabel = '', className = '' }) {
  return (
    <div className={cx(styles.emojiBar, className)} role="group" aria-label="Reações">
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

// Mobile: as reações ficam num botão ao lado do "Confirmar"; tocar abre a fileira de emojis.
export function EmojiToggle({ emojis = [], onSend, cooldownActive = false, cooldownPct = 0, cooldownLabel = '' }) {
  const [open, setOpen] = useState(false);
  if (!Array.isArray(emojis) || !emojis.length) return null;
  return (
    <div className={styles.emojiToggleWrap}>
      {open ? (
        <div className={styles.emojiPopover}>
          <EmojiBar
            emojis={emojis}
            onSend={(emoji) => {
              onSend(emoji);
              setOpen(false);
            }}
            cooldownActive={cooldownActive}
            cooldownPct={cooldownPct}
            cooldownLabel={cooldownLabel}
          />
        </div>
      ) : null}
      <button
        type="button"
        className={cx(styles.emojiButton, styles.emojiToggle, open ? styles.emojiToggleOpen : '')}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Fechar reações' : 'Abrir reações'}
      >
        {open ? <X aria-hidden="true" strokeWidth={2.6} /> : <SmilePlus aria-hidden="true" strokeWidth={2.4} />}
        {cooldownActive && !open ? (
          <span className={styles.emojiCooldown} style={{ height: `${cooldownPct}%` }} aria-hidden="true" />
        ) : null}
      </button>
    </div>
  );
}

// Renderizada no body (como o Modal) para ficar por cima do resultado da rodada.
export function EmojiFxLayer({ items = [] }) {
  if (!items.length || typeof document === 'undefined') return null;
  return createPortal(
    <div className={styles.fxLayer} aria-hidden="true">
      {items.map((fx) => (
        <span
          key={fx.id}
          className={cx(styles.fx, fx.label ? styles.fxLabeled : '')}
          style={{
            top: `${Number.isFinite(Number(fx?.topPct)) ? Number(fx.topPct) : 58}%`,
            [String(fx?.side || '') === 'left' ? 'left' : 'right']: `calc(8% + ${Math.max(0, Number(fx?.offsetPx || 0))}px)`,
            animationDuration: `${PVP_EMOJI_FX_DURATION_MS}ms`
          }}
        >
          {fx.emoji}
          {/* Partidas com mais de dois jogadores: mostra quem mandou */}
          {fx.label ? <span className={styles.fxLabel}>{fx.label}</span> : null}
        </span>
      ))}
    </div>,
    document.body
  );
}

export { styles as battleStyles };
