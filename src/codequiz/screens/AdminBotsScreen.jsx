import { Bot, ChevronRight, History, Swords, Users } from 'lucide-react';
import { getAdminBotRecentMatches } from '../app/helpers';
import {
  getAvatarFrameClass,
  getAvatarFrameStyle,
  getDisplayAvatar,
  getHeroBackgroundStyle,
  normalizeShopData
} from '../lib/shop';
import { Avatar, Badge, Card, CoinIcon, EmptyState, PageHeader, Skeleton, StatTile, Tabs, TierBadge } from '../ui';
import styles from './AdminBotsScreen.module.css';

const SORT_TABS = [
  { value: 'pvp', label: 'Pontos PvP' },
  { value: 'level', label: 'Nível' },
  { value: 'battles', label: 'Partidas' },
  { value: 'status', label: 'Status' },
  { value: 'name', label: 'Nome' }
];

const RESULT_VIEW = {
  win: { label: 'Vitória', tone: 'lime' },
  loss: { label: 'Derrota', tone: 'red' },
  draw: { label: 'Empate', tone: 'gold' },
  quiz: { label: 'Quiz', tone: 'cyan' }
};

function getBotVisual(bot) {
  const shop = normalizeShopData({
    owned: ['frame_default', 'bg_default', 'emoji_profile', bot.frameId, bot.backgroundId, bot.emojiId],
    equipped: { frame: bot.frameId, background: bot.backgroundId, emoji: bot.emojiId }
  });
  return {
    avatar: getDisplayAvatar(bot.avatar, shop),
    frameClass: getAvatarFrameClass(shop),
    frameStyle: getAvatarFrameStyle(shop),
    heroBackground: getHeroBackgroundStyle(shop)
  };
}

function formatTime(ms) {
  return ms ? new Date(ms).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
}

function formatDateTime(ms) {
  return ms ? new Date(ms).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--';
}

function sortBots(bots, sortKey) {
  const list = [...bots];
  const byName = (a, b) => a.nickname.localeCompare(b.nickname, 'pt-BR', { sensitivity: 'base' });
  if (sortKey === 'name') return list.sort(byName);
  if (sortKey === 'level') return list.sort((a, b) => (b.level - a.level) || (b.totalXp - a.totalXp) || byName(a, b));
  if (sortKey === 'battles') return list.sort((a, b) => (b.battles - a.battles) || (b.wins - a.wins) || byName(a, b));
  if (sortKey === 'status') {
    const busyRank = (bot) => (bot.status.key === 'free' ? 1 : 0);
    return list.sort((a, b) => (busyRank(a) - busyRank(b)) || byName(a, b));
  }
  return list.sort((a, b) => (b.pvpPoints - a.pvpPoints) || (b.wins - a.wins) || byName(a, b));
}

function BotCard({ bot, onOpen }) {
  const visual = getBotVisual(bot);
  return (
    <button type="button" className={styles.botCard} onClick={() => onOpen(bot.id)}>
      <span className={styles.botHead}>
        <Avatar avatar={visual.avatar} frameClass={visual.frameClass} frameStyle={visual.frameStyle} size="md" badge={bot.level} />
        <span className={styles.botName}>
          <span className={styles.botNick}>{bot.nickname}</span>
          <span className={styles.botBadges}>
            <Badge tone={bot.status.tone} size="sm">{bot.status.label}</Badge>
            <TierBadge tierKey={bot.tier.key} label={bot.tier.label} size="sm" />
          </span>
        </span>
        <ChevronRight className={styles.chevron} aria-hidden="true" strokeWidth={2.6} />
      </span>
      <span className={styles.botStats}>
        <span><strong>{bot.pvpPoints}</strong> pts PvP</span>
        <span><strong>{bot.battles}</strong> partidas</span>
        <span>{bot.wins}V · {bot.losses}D{bot.draws ? ` · ${bot.draws} outros` : ''}</span>
        <span className={styles.coins}><CoinIcon aria-hidden="true" /> {bot.coins}</span>
        {bot.today ? <span>Hoje: {bot.today.pvp} partida{bot.today.pvp === 1 ? '' : 's'}</span> : null}
      </span>
    </button>
  );
}

function Detail({ label, value }) {
  return (
    <div className={styles.detail}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function BotDetail({ bot, botsById, matchRows }) {
  const visual = getBotVisual(bot);
  const rival = bot.status.rivalId ? botsById.get(bot.status.rivalId) : null;
  const recent = getAdminBotRecentMatches(bot.id, matchRows, 10);
  return (
    <div className={styles.detailLayout}>
      <Card padding="lg" className={styles.profileCard}>
        <div className={styles.hero} style={{ background: visual.heroBackground }} aria-hidden="true" />
        <div className={styles.profileHead}>
          <Avatar avatar={visual.avatar} frameClass={visual.frameClass} frameStyle={visual.frameStyle} size="xl" badge={bot.level} />
          <div className={styles.profileText}>
            <span className={styles.profileNick}>{bot.nickname}</span>
            {bot.fullName && bot.fullName !== bot.nickname ? <span className={styles.profileFull}>{bot.fullName}</span> : null}
            <code className={styles.profileId}>{bot.id}</code>
          </div>
        </div>
        <div className={styles.profileBadges}>
          <Badge tone={bot.status.tone}>{bot.status.label}{rival ? ` · contra ${rival.nickname}` : ''}</Badge>
          <TierBadge tierKey={bot.tier.key} label={bot.tier.label} />
          <Badge tone="neutral">Classe {bot.strengthLabel}</Badge>
          <Badge tone="neutral">{bot.personalityLabel}</Badge>
        </div>
        <dl className={styles.details}>
          <Detail label="Fila de partidas" value={bot.queuePosition ? `${bot.queuePosition}º da fila` : '--'} />
          <Detail
            label="Hoje"
            value={bot.today ? `${bot.today.pvp} partida${bot.today.pvp === 1 ? '' : 's'} · ${bot.today.quiz} quiz${bot.today.quiz === 1 ? '' : 'zes'}` : '--'}
          />
          <Detail label="Última atualização" value={formatDateTime(bot.updatedAtMs)} />
          <Detail label="Criado em" value={formatDateTime(bot.createdAtMs)} />
        </dl>
      </Card>

      <div className={styles.detailColumn}>
        <Card padding="lg" className={styles.section}>
          <h2 className={styles.sectionTitle}><Swords aria-hidden="true" strokeWidth={2.4} /> PvP</h2>
          <dl className={styles.statGrid}>
            <Detail label="Pontos" value={bot.pvpPoints} />
            <Detail label="Partidas" value={bot.battles} />
            <Detail label="Vitórias" value={bot.wins} />
            <Detail label="Empates e colocações" value={bot.draws} />
            <Detail label="Derrotas" value={bot.losses} />
            <Detail label="Aproveitamento" value={`${bot.winRatePct}%`} />
          </dl>
        </Card>

        <Card padding="lg" className={styles.section}>
          <h2 className={styles.sectionTitle}><Bot aria-hidden="true" strokeWidth={2.4} /> Conta</h2>
          <dl className={styles.statGrid}>
            <Detail label="Nível" value={bot.level} />
            <Detail label="XP total" value={bot.totalXp} />
            <Detail label="Moedas" value={bot.coins} />
            <Detail label="Passe" value={bot.passLevel ? `Nível ${bot.passLevel}` : '--'} />
            <Detail label="Pontos de quiz" value={bot.rankingPoints} />
            <Detail label="Quizzes" value={bot.quizzesCompleted} />
            <Detail label="Precisão" value={bot.totalAnswered ? `${bot.accuracyPct}% (${bot.totalCorrect}/${bot.totalAnswered})` : '--'} />
            <Detail label="Melhor sequência" value={bot.bestStreak} />
          </dl>
        </Card>

        <Card padding="lg" className={styles.section}>
          <h2 className={styles.sectionTitle}>Visual</h2>
          <dl className={styles.statGrid}>
            <Detail label="Moldura" value={bot.frameLabel} />
            <Detail label="Fundo" value={bot.backgroundLabel} />
            <Detail label="Emoji" value={bot.emojiLabel} />
            <Detail label="Itens na coleção" value={bot.ownedCount} />
          </dl>
        </Card>

        <Card padding="lg" className={styles.section}>
          <h2 className={styles.sectionTitle}>Partidas de hoje</h2>
          {recent.length ? (
            <ul className={styles.matches}>
              {recent.map((match) => {
                const view = RESULT_VIEW[match.result] || RESULT_VIEW.draw;
                return (
                  <li key={match.id} className={styles.match}>
                    <Badge tone={view.tone} size="sm">{view.label}</Badge>
                    <span className={styles.matchText}>
                      <span className={styles.matchTitle}>{match.title}</span>
                      <span className={styles.matchSub}>{match.typeLabel} · {formatTime(match.endedMs)}</span>
                    </span>
                    <span className={styles.matchScore}>{match.score}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.muted}>Nenhuma partida encerrada hoje.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function AdminBotsScreen({ vm }) {
  const {
    adminBotMatchRows,
    adminBotSort,
    adminBotViews,
    adminBotsLoading,
    adminBotsUpdatedAtMs,
    adminSelectedBotId,
    setAdminBotSort,
    setAdminSelectedBotId,
    triggerAppBackNavigation
  } = vm;

  const bots = Array.isArray(adminBotViews) ? adminBotViews : [];
  const botsById = new Map(bots.map((bot) => [bot.id, bot]));
  const selected = adminSelectedBotId ? botsById.get(adminSelectedBotId) : null;
  const busyCount = bots.filter((bot) => bot.status.key !== 'free').length;
  const matchRows = Array.isArray(adminBotMatchRows) ? adminBotMatchRows : [];

  if (selected) {
    return (
      <div className={styles.screen}>
        <PageHeader
          eyebrow="Admin · Bots"
          title={selected.nickname}
          subtitle={`${selected.status.label} · ${selected.tier.label} · Nível ${selected.level}`}
          onBack={() => triggerAppBackNavigation('button')}
        />
        <BotDetail bot={selected} botsById={botsById} matchRows={matchRows} />
      </div>
    );
  }

  const sorted = sortBots(bots, adminBotSort);
  // matchRows = partidas encerradas hoje (histórico do dia); aqui só as que têm bot.
  const todayMatches = matchRows.filter((row) => (
    row?.is_bot_quiz === true
    || botsById.has(String(row?.player1_user_id || ''))
    || botsById.has(String(row?.player2_user_id || ''))
    || (Array.isArray(row?.group_members) && row.group_members.some((member) => member.is_bot))
  )).length;
  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow="Admin"
        title="Bots"
        subtitle="Status, pontos e conta de cada bot, atualizados em tempo real."
        onBack={() => triggerAppBackNavigation('button')}
      />

      <div className={styles.stats}>
        <StatTile icon={Bot} label="Bots" value={bots.length} tone="violet" />
        <StatTile icon={Swords} label="Em partida" value={busyCount} tone="gold" />
        <StatTile icon={Users} label="Livres" value={Math.max(0, bots.length - busyCount)} tone="lime" />
        <StatTile icon={History} label="Partidas hoje" value={todayMatches} tone="cyan" />
      </div>
      <p className={styles.updated}>
        Atualizado às {adminBotsUpdatedAtMs ? new Date(adminBotsUpdatedAtMs).toLocaleTimeString('pt-BR') : '--:--:--'}
      </p>

      <div className={styles.toolbar}>
        <Tabs items={SORT_TABS} value={adminBotSort} onChange={setAdminBotSort} size="sm" ariaLabel="Ordenar bots" />
      </div>

      {adminBotsLoading && !bots.length ? (
        <div className={styles.grid}>
          {[0, 1, 2].map((key) => (
            <Card key={key} padding="lg" className={styles.skeletonCard}>
              <Skeleton height={18} width="50%" />
              <Skeleton height={14} width="80%" />
            </Card>
          ))}
        </div>
      ) : sorted.length ? (
        <div className={styles.grid}>
          {sorted.map((bot) => <BotCard key={bot.id} bot={bot} onOpen={setAdminSelectedBotId} />)}
        </div>
      ) : (
        <Card padding="lg">
          <EmptyState icon={Bot} title="Nenhum bot encontrado" text="Os bots aparecem aqui assim que o banco responder." />
        </Card>
      )}
    </div>
  );
}
