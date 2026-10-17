import { History, Swords, Target } from 'lucide-react';
import { Badge, EmptyState, Modal, Tabs, cx } from '../ui';
import styles from './History.module.css';

const CHIP_TONES = {
  rounds: 'neutral',
  win: 'lime',
  loss: 'red',
  area: 'violet',
  xp: 'blue',
  coins: 'gold',
  score: 'violet',
  'difficulty-easy': 'lime',
  'difficulty-medium': 'orange',
  'difficulty-hard': 'pink'
};

function HistoryEntry({ item }) {
  const isPvp = item.type === 'pvp';
  const chips = Array.isArray(item.metaChips) ? item.metaChips : [];
  const winnerSide = item.titleParts?.winnerSide;
  return (
    <li className={styles.entry}>
      <span className={cx(styles.typeIcon, isPvp ? styles.typePvp : '')} aria-label={isPvp ? 'PvP' : 'PvE'}>
        {isPvp ? <Swords strokeWidth={2.4} aria-hidden="true" /> : <Target strokeWidth={2.4} aria-hidden="true" />}
      </span>
      <span className={styles.main}>
        <span className={styles.title}>
          {isPvp ? (
            <>
              <span className={winnerSide === 'player1' ? styles.winner : ''}>{item.titleParts?.player1 || item.title}</span>
              <span className={styles.versus}>×</span>
              <span className={winnerSide === 'player2' ? styles.winner : ''}>{item.titleParts?.player2 || ''}</span>
            </>
          ) : item.title}
        </span>
        <span className={styles.sub}>{item.subtitle ? `${item.subtitle} · ` : ''}{item.timestampLabel}</span>
      </span>
      <span className={styles.score}>
        {isPvp && item.scoreParts ? `${item.scoreParts.player1} × ${item.scoreParts.player2}` : (item.resultLabel || item.scoreLabel)}
        {!isPvp && item.resultLabel ? <Badge tone="neutral" size="sm">{item.scoreLabel}</Badge> : null}
      </span>
      {chips.length ? (
        <span className={styles.chips}>
          {chips.map((chip) => {
            const label = typeof chip === 'string' ? chip : chip?.label;
            const tone = typeof chip === 'string' ? 'neutral' : (CHIP_TONES[chip?.tone] || 'neutral');
            return <Badge key={`${item.id}_${label}`} tone={tone} size="sm">{label}</Badge>;
          })}
        </span>
      ) : null}
    </li>
  );
}

export default function PlayerHistoryModal({ vm }) {
  const {
    closePlayerHistoryPanel,
    playerHistoryCountByType,
    playerHistoryEmptyText,
    playerHistoryError,
    playerHistoryFilter,
    playerHistoryFilterOptions,
    playerHistoryItems,
    playerHistoryLoading,
    setPlayerHistoryFilter
  } = vm;

  const tabs = (Array.isArray(playerHistoryFilterOptions) ? playerHistoryFilterOptions : []).map((filter) => ({
    value: filter.id,
    label: filter.label,
    count: playerHistoryCountByType?.[filter.id] || 0
  }));
  const items = Array.isArray(playerHistoryItems) ? playerHistoryItems : [];

  return (
    <Modal
      title="Histórico de partidas"
      subtitle="Suas partidas PvP e quizzes PvE mais recentes."
      icon={History}
      tone="violet"
      size="lg"
      onClose={closePlayerHistoryPanel}
    >
      <div className={styles.body}>
        <Tabs items={tabs} value={playerHistoryFilter} onChange={setPlayerHistoryFilter} block size="sm" ariaLabel="Filtrar histórico" />
        {playerHistoryError ? <p className={styles.alert} role="alert">{playerHistoryError}</p> : null}
        {playerHistoryLoading ? (
          <span className={styles.syncing} role="status">
            <span className={styles.spinner} aria-hidden="true" />
            Atualizando partidas...
          </span>
        ) : null}
        {items.length ? (
          <ul className={styles.list}>
            {items.map((item) => <HistoryEntry key={item.id} item={item} />)}
          </ul>
        ) : (
          <EmptyState icon={History} title="Nada por aqui ainda" text={playerHistoryLoading ? 'Carregando seu histórico...' : playerHistoryEmptyText} />
        )}
      </div>
    </Modal>
  );
}
