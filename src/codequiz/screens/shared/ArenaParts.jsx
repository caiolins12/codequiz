import { Check, Clock, Flame, Radar, Sprout, Zap } from 'lucide-react';
import { KNOWLEDGE_AREAS } from '../../app/helpers';
import { DIFFICULTY_LABELS } from '../../lib/constants';
import { Avatar, Badge, Button, cx } from '../../ui';
import styles from './Arena.module.css';

const STATE_BADGES = {
  accepted: { label: 'Aceitou', tone: 'lime' },
  rejected: { label: 'Recusou', tone: 'red' },
  pending: { label: 'Aguardando', tone: 'gold' }
};

// Card de jogador com fundo e moldura da loja.
export function PlayerCard({
  player,
  meta = '',
  tags = null,
  state = '',
  badge = null,
  side = '',
  self = false,
  vertical = false,
  stackOnMobile = false,
  avatarSize = 'md',
  className = ''
}) {
  if (!player) return null;
  const stateBadge = badge || (state ? STATE_BADGES[state] : null);
  return (
    <div
      className={cx(
        styles.player,
        vertical ? styles.playerVertical : '',
        stackOnMobile ? styles.playerStackMobile : '',
        side ? styles[side] : '',
        self ? styles.self : '',
        state ? styles[state] : '',
        player.backgroundMeta?.className,
        className
      )}
      style={{ background: player.background }}
      data-bg-id={player.backgroundMeta?.id}
      data-bg-rarity={player.backgroundMeta?.rarity}
    >
      <span className={styles.playerShade} aria-hidden="true" />
      <Avatar avatar={player.avatar} frameClass={player.frameClass} frameStyle={player.frameStyle} size={avatarSize} />
      <span className={styles.playerText}>
        <span className={styles.playerName}>{player.nickname}{self ? ' (você)' : ''}</span>
        {meta ? <span className={styles.playerMeta}>{meta}</span> : null}
        {tags ? <span className={styles.playerTags}>{tags}</span> : null}
      </span>
      {stateBadge ? (
        <span className={styles.playerState}>
          <Badge tone={stateBadge.tone} variant="solid" size="sm">{stateBadge.label}</Badge>
        </span>
      ) : null}
    </div>
  );
}

const DIFFICULTY_CHIPS = [
  { id: 'easy', icon: Sprout, className: styles.chipEasy },
  { id: 'medium', icon: Flame, className: styles.chipMedium },
  { id: 'hard', icon: Zap, className: styles.chipHard }
];

export function DifficultyPicker({ value, onChoose, disabled = false, label = 'Dificuldade' }) {
  return (
    <div className={styles.pickerGroup}>
      <span className={styles.pickerLabel}>{label}</span>
      <div className={styles.chips} role="radiogroup" aria-label={label}>
        {DIFFICULTY_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const active = value === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={cx(styles.chip, chip.className, active ? styles.chipActive : '')}
              disabled={disabled}
              onClick={() => onChoose(chip.id)}
            >
              <Icon aria-hidden="true" strokeWidth={2.6} />
              {DIFFICULTY_LABELS[chip.id]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AreaPicker({ value, onChoose, disabled = false, label = 'Área de confronto' }) {
  return (
    <div className={styles.pickerGroup}>
      <span className={styles.pickerLabel}>{label}</span>
      <div className={styles.areas} role="radiogroup" aria-label={label}>
        {KNOWLEDGE_AREAS.map((area) => {
          const active = value === area.id;
          return (
            <button
              key={area.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={cx(styles.area, active ? styles.areaActive : '')}
              style={{ '--area-color': area.color }}
              disabled={disabled}
              onClick={() => onChoose(area.id)}
            >
              <span className={styles.areaIcon} aria-hidden="true">{area.icon}</span>
              <span className={styles.areaText}>
                <span className={styles.areaName}>{area.name}</span>
                <span className={styles.areaDesc}>{area.desc}</span>
              </span>
              <span className={styles.radio} aria-hidden="true">{active ? <Check strokeWidth={3.2} /> : null}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Painel de fila: quando `searching`, mostra o radar, o tempo de busca e (em `details`) o que foi escolhido.
export function QueuePanel({
  searching,
  timeLabel = '',
  action,
  title = 'Procurando adversário',
  text = 'Você será avisado quando a partida for encontrada.',
  details = null
}) {
  if (searching) {
    return (
      <div className={styles.queue} role="status" aria-live="polite">
        <div className={styles.radar} aria-hidden="true">
          <span className={styles.radarCore}><Radar strokeWidth={2.4} /></span>
        </div>
        <h3 className={styles.queueTitle}>{title}</h3>
        <span className={styles.queueTime}>{timeLabel}</span>
        <p className={styles.queueText}>{text}</p>
        {details ? <div className={styles.queueDetails}>{details}</div> : null}
        {action ? (
          <Button variant="secondary" block onClick={action.onClick} disabled={action.disabled}>
            {action.label}
          </Button>
        ) : null}
      </div>
    );
  }
  if (!action) return null;
  const leaving = /sair|cancelar/i.test(String(action.label || ''));
  return (
    <Button size="xl" variant={leaving ? 'danger' : 'pink'} block onClick={action.onClick} disabled={action.disabled}>
      {action.label}
    </Button>
  );
}

export function Countdown({ label }) {
  if (!label) return null;
  return (
    <span className={styles.countdown} role="timer">
      <Clock aria-hidden="true" strokeWidth={2.6} />
      {label}
    </span>
  );
}

export function LoadingDots() {
  return (
    <div className={styles.dots} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

export { styles as arenaStyles };
