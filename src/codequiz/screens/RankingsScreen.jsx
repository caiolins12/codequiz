import { Crown, Swords, Target, Trophy } from 'lucide-react';
import { getCategoryByPoints } from '../lib/pvp';
import { Avatar, Card, EmptyState, PageHeader, Skeleton, Tabs, TierBadge, cx } from '../ui';
import { buildRankingRowView } from './shared/rankings';
import styles from './RankingsScreen.module.css';

const MODE_TABS = [
  { value: 'pve', label: 'Treino PvE', icon: Target },
  { value: 'pvp', label: 'Arena PvP', icon: Swords }
];

// Fundo cosmético só para quem equipou um fundo da loja (o padrão usa a superfície do card).
function cosmeticBackground(row) {
  if (!row || !row.backgroundMeta || row.backgroundMeta.id === 'bg_default') return null;
  return {
    className: row.backgroundMeta.className,
    style: { background: row.background },
    'data-bg-id': row.backgroundMeta.id,
    'data-bg-rarity': row.backgroundMeta.rarity
  };
}

function PodiumSpot({ row, place }) {
  const bg = cosmeticBackground(row);
  return (
    <li className={cx(styles.spot, styles[`place${place}`])}>
      {row ? (
        <div
          className={cx(styles.spotCard, row.isSelf ? styles.spotSelf : '', bg?.className)}
          style={bg?.style}
          data-bg-id={bg?.['data-bg-id']}
          data-bg-rarity={bg?.['data-bg-rarity']}
        >
          {bg ? <span className={styles.shade} aria-hidden="true" /> : null}
          {place === 1 ? <Crown className={styles.crown} aria-hidden="true" strokeWidth={2.4} /> : null}
          <Avatar avatar={row.avatar} frameClass={row.frameClass} frameStyle={row.frameStyle} size={place === 1 ? 'lg' : 'md'} />
          <span className={styles.spotName}>{row.nickname}{row.isSelf ? ' (você)' : ''}</span>
          <TierBadge tierKey={row.category.key} label={row.category.label} size="sm" />
          <span className={styles.spotPoints}>{row.points}<small>pts</small></span>
        </div>
      ) : (
        <div className={cx(styles.spotCard, styles.spotEmpty)}>
          <span className={styles.emptyAvatar} aria-hidden="true">?</span>
          <span className={styles.spotName}>Vaga aberta</span>
        </div>
      )}
      <span className={styles.pedestal} aria-label={`${place}º lugar`}>{place}</span>
    </li>
  );
}

function RankRow({ row }) {
  const bg = cosmeticBackground(row);
  return (
    <li
      className={cx(styles.row, row.isSelf ? styles.rowSelf : '', bg?.className)}
      style={bg?.style}
      data-bg-id={bg?.['data-bg-id']}
      data-bg-rarity={bg?.['data-bg-rarity']}
    >
      {bg ? <span className={styles.shade} aria-hidden="true" /> : null}
      <span className={styles.pos}>{row.position}</span>
      <Avatar avatar={row.avatar} frameClass={row.frameClass} frameStyle={row.frameStyle} size="sm" />
      <span className={styles.rowText}>
        <span className={styles.rowName}>{row.nickname}{row.isSelf ? ' (você)' : ''}</span>
        <span className={styles.rowMeta}>{row.meta}</span>
      </span>
      <TierBadge className={styles.rowTier} tierKey={row.category.key} label={row.category.label} size="sm" />
      <span className={styles.rowPoints}>{row.points}<small>pts</small></span>
    </li>
  );
}

function SelfCard({ row, fallback, listFull, className }) {
  const view = row || fallback;
  let position = '—';
  let label = 'Ainda sem posição';
  if (row) {
    position = `${row.position}º`;
    label = 'Sua posição';
  } else if (listFull) {
    position = '50+';
    label = 'Fora do top 50';
  }
  return (
    <div className={cx(styles.selfCard, className)}>
      <span className={styles.selfPos}>{position}</span>
      <Avatar avatar={view.avatar} frameClass={view.frameClass} frameStyle={view.frameStyle} size="sm" />
      <span className={styles.rowText}>
        <span className={styles.selfLabel}>{label}</span>
        <span className={styles.rowName}>{view.nickname}</span>
      </span>
      <span className={styles.rowPoints}>{view.points}<small>pts</small></span>
    </div>
  );
}

function LoadingList() {
  return (
    <ul className={styles.list} aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <li key={index} className={styles.row}>
          <Skeleton width={32} height={32} radius={10} />
          <Skeleton width={40} height={40} radius={999} />
          <span className={styles.rowText}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="35%" height={10} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function RankingsScreen({ vm }) {
  const {
    authUser,
    avatarFrameClass,
    avatarFrameStyle,
    buildCosmeticSnapshot,
    displayAvatar,
    heroNickname,
    progress,
    rankingsLoading,
    rankingsMode,
    rankingsRows,
    setRankingsMode
  } = vm;

  const mode = rankingsMode === 'pvp' ? 'pvp' : 'pve';
  const rows = (Array.isArray(rankingsRows) ? rankingsRows : [])
    .map((row, index) => buildRankingRowView(row, index, mode, buildCosmeticSnapshot, authUser?.uid));
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);
  const selfRow = rows.find((row) => row.isSelf) || null;
  const myPoints = Math.max(0, Number(mode === 'pvp' ? progress?.pvpPoints : progress?.rankingPoints) || 0);
  const selfFallback = {
    nickname: heroNickname || 'Você',
    avatar: displayAvatar,
    frameClass: avatarFrameClass,
    frameStyle: avatarFrameStyle,
    points: myPoints,
    category: getCategoryByPoints(myPoints)
  };
  const loading = rankingsLoading && !rows.length;

  return (
    <div className={styles.screen}>
      <PageHeader
        title="Ranking"
        subtitle={mode === 'pvp' ? 'Pontos de liga conquistados na arena.' : 'Pontos acumulados nos treinos das trilhas.'}
      />

      <Tabs className={styles.modeTabs} block items={MODE_TABS} value={mode} onChange={setRankingsMode} ariaLabel="Modo do ranking" />

      {loading ? (
        <Card padding="lg"><LoadingList /></Card>
      ) : !rows.length ? (
        <Card padding="lg">
          <EmptyState
            icon={Trophy}
            title="Ranking vazio por enquanto"
            text={mode === 'pvp' ? 'Vença partidas na arena para aparecer aqui.' : 'Complete treinos nas trilhas para aparecer aqui.'}
          />
        </Card>
      ) : (
        <div className={styles.layout}>
          <aside className={styles.aside}>
            <ol className={styles.podium} aria-label="Pódio">
              {[1, 2, 3].map((place) => (
                <PodiumSpot key={place} place={place} row={podium[place - 1] || null} />
              ))}
            </ol>
            <SelfCard row={selfRow} fallback={selfFallback} listFull={rows.length >= 50} className={styles.selfAside} />
          </aside>

          <section className={styles.listCol} aria-label="Classificação">
            {rest.length ? (
              <ol className={styles.list} start={4}>
                {rest.map((row) => <RankRow key={row.key} row={row} />)}
              </ol>
            ) : (
              <p className={styles.note}>Só três jogadores no ranking até agora. Que tal entrar nessa lista?</p>
            )}
          </section>

          <SelfCard row={selfRow} fallback={selfFallback} listFull={rows.length >= 50} className={styles.selfBar} />
        </div>
      )}
    </div>
  );
}
