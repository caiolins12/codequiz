import {
  ArrowRight,
  ChevronRight,
  CircleCheck,
  Crosshair,
  Flame,
  Gift,
  History,
  Route,
  Swords,
  Target,
  Ticket,
  Trophy
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Card,
  CoinIcon,
  IconButton,
  ProgressBar,
  StatPill,
  StatTile,
  Tabs,
  TierBadge,
  XpIcon,
  cx
} from '../ui';
import { buildRankingRowView } from './shared/rankings';
import styles from './HomeScreen.module.css';

function PlayCard({ variant, icon: Icon, title, text, cta, onClick, anchor }) {
  return (
    <button
      type="button"
      className={cx(styles.playCard, variant === 'pvp' ? styles.playPvp : styles.playPve)}
      onClick={onClick}
      data-tour-anchor={anchor}
    >
      <span className={styles.playIcon} aria-hidden="true"><Icon strokeWidth={2.4} /></span>
      <span>
        <span className={styles.playTitle}>{title}</span>
        <span className={styles.playText}>{text}</span>
      </span>
      <span className={styles.playGo}>
        {cta}
        <ArrowRight aria-hidden="true" strokeWidth={2.8} />
      </span>
      <Icon className={styles.playDecor} aria-hidden="true" strokeWidth={1.6} />
    </button>
  );
}

const RANKING_TABS = [
  { value: 'pve', label: 'PvE' },
  { value: 'pvp', label: 'PvP' }
];

export default function HomeScreen({ vm }) {
  const {
    authUser,
    avatarFrameClass,
    avatarFrameStyle,
    buildCosmeticSnapshot,
    continueTrack,
    displayAvatar,
    evolutionPass,
    heroBackground,
    heroBackgroundMeta,
    heroNickname,
    openPlayerHistoryPanel,
    openPveTrack,
    progress,
    pveCategory,
    pvpCategory,
    rankingsLoading,
    rankingsMode,
    rankingsRows,
    safeCoins,
    safeLevel,
    safeXp,
    setRankingsMode,
    setScreen,
    startPveFlow,
    startPvpFlow,
    xpForNextLevel,
    xpPercent
  } = vm;

  const totalCorrect = Math.max(0, Number(progress?.totalCorrect || 0));
  const totalAnswered = Math.max(0, Number(progress?.totalAnswered || 0));
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const bestStreak = Math.max(0, Number(progress?.bestStreak || 0));
  const pvpWins = Math.max(0, Number(progress?.pvpWins || 0));
  const pvpBattles = Math.max(0, Number(progress?.pvpBattles || 0));
  const pvpPoints = Math.max(0, Number(progress?.pvpPoints || 0));
  const pvePoints = Math.max(0, Number(progress?.rankingPoints || 0));

  const passStage = evolutionPass?.activeStage || null;
  const passClaimable = Math.max(0, Number(evolutionPass?.claimableCount || 0));
  const passReward = passStage?.reward || {};

  const allRankingViews = (Array.isArray(rankingsRows) ? rankingsRows : [])
    .map((row, index) => buildRankingRowView(row, index, rankingsMode, buildCosmeticSnapshot, authUser?.uid));
  const rankingViews = allRankingViews.slice(0, 5);
  const selfRanking = allRankingViews.find((row) => row.isSelf) || null;

  return (
    <div className={styles.screen}>
      <header className={styles.greeting}>
        <div>
          <h1 className={styles.greetingTitle}>Olá, {heroNickname}!</h1>
          <p className={styles.greetingText}>Pronto para a próxima partida?</p>
        </div>
      </header>

      <div className={styles.grid}>
        <section
          className={cx(styles.hero, heroBackgroundMeta?.className)}
          style={{ background: heroBackground }}
          data-bg-id={heroBackgroundMeta?.id}
          data-bg-rarity={heroBackgroundMeta?.rarity}
          data-tour-anchor="home-hero"
          aria-label="Seu perfil"
        >
          <span className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroTop}>
            <Avatar
              avatar={displayAvatar}
              frameClass={avatarFrameClass}
              frameStyle={avatarFrameStyle}
              size="xl"
              badge={safeLevel}
              alt="Seu avatar"
              className={styles.heroAvatar}
            />
            <div className={styles.heroInfo}>
              <span className={styles.heroEyebrow}>Seu perfil</span>
              <h2 className={styles.heroName}>{heroNickname}</h2>
              <div className={styles.heroBadges}>
                <TierBadge tierKey={pveCategory?.key} label={pveCategory?.label} prefix="PvE" variant="solid" />
                <TierBadge tierKey={pvpCategory?.key} label={pvpCategory?.label} prefix="PvP" variant="solid" />
              </div>
            </div>
            <IconButton
              icon={History}
              label="Histórico de partidas"
              variant="surface"
              className={styles.heroHistory}
              onClick={openPlayerHistoryPanel}
            />
          </div>
          <div className={styles.xpRow}>
            <div className={styles.xpHead}>
              <span className={styles.xpLevel}><XpIcon /> Nível {safeLevel}</span>
              <span className={styles.xpNumbers}>{safeXp} / {xpForNextLevel} XP</span>
            </div>
            <ProgressBar value={xpPercent} tone="blue" size="md" label="Progresso para o próximo nível" />
          </div>
          {/* Mobile: estatísticas em uma linha (moedas já aparecem na barra superior) */}
          <dl className={styles.miniStats}>
            <div><dt>Acertos</dt><dd><CircleCheck aria-hidden="true" strokeWidth={2.6} />{totalCorrect}</dd></div>
            <div><dt>Precisão</dt><dd><Crosshair aria-hidden="true" strokeWidth={2.6} />{accuracy}%</dd></div>
            <div><dt>Sequência</dt><dd><Flame aria-hidden="true" strokeWidth={2.6} />{bestStreak}</dd></div>
            <div><dt>Vitórias</dt><dd><Swords aria-hidden="true" strokeWidth={2.6} />{pvpWins}</dd></div>
          </dl>
          <div className={styles.heroStats}>
            <StatPill icon={CoinIcon} value={safeCoins} label="moedas" ariaLabel={`${safeCoins} moedas`} />
            <StatPill icon={Trophy} value={pvePoints} label="pts PvE" tone="violet" ariaLabel={`${pvePoints} pontos PvE`} />
            <StatPill icon={Swords} value={pvpPoints} label="pts PvP" tone="orange" ariaLabel={`${pvpPoints} pontos PvP`} />
          </div>
        </section>

        <section className={styles.play} aria-label="Jogar">
          <PlayCard
            variant="pve"
            icon={Target}
            title="Treinar"
            text="Quiz solo por trilhas e níveis"
            cta="Jogar"
            onClick={startPveFlow}
            anchor="home-play"
          />
          <PlayCard
            variant="pvp"
            icon={Swords}
            title="Batalhar"
            text="Duelos e equipes em tempo real"
            cta="Entrar"
            onClick={startPvpFlow}
          />
        </section>

        {/* Mobile: atalhos compactos no lugar dos cards de trilha, passe e ranking */}
        <nav className={styles.quick} aria-label="Atalhos">
          {continueTrack ? (
            <button
              type="button"
              className={styles.quickTile}
              style={{ '--quick-color': continueTrack.color }}
              onClick={() => openPveTrack(continueTrack.id)}
            >
              <span className={styles.quickIcon} aria-hidden="true">{continueTrack.icon}</span>
              <span className={styles.quickLabel}>{continueTrack.started ? 'Continuar' : 'Começar'}</span>
              <span className={styles.quickValue}>{continueTrack.name}</span>
              <ProgressBar value={continueTrack.progress} tone="violet" size="sm" label={`Progresso em ${continueTrack.name}`} />
            </button>
          ) : null}
          <button type="button" className={styles.quickTile} style={{ '--quick-color': 'var(--cq-gold)' }} onClick={() => setScreen('achievements')}>
            <span className={styles.quickIcon} aria-hidden="true">{passStage?.icon || <Ticket strokeWidth={2.4} />}</span>
            <span className={styles.quickLabel}>Passe</span>
            <span className={styles.quickValue}>Nível {evolutionPass?.currentLevel || 1}/{evolutionPass?.totalLevels || 1}</span>
            <ProgressBar value={evolutionPass?.currentStageProgressPct || 0} tone="gold" size="sm" label="Progresso da etapa do passe" />
            {passClaimable ? <span className={styles.quickBadge}>{passClaimable}</span> : null}
          </button>
          <button type="button" className={styles.quickTile} style={{ '--quick-color': 'var(--cq-cyan)' }} onClick={() => setScreen('rankings')}>
            <span className={styles.quickIcon} aria-hidden="true"><Trophy strokeWidth={2.4} /></span>
            <span className={styles.quickLabel}>Ranking</span>
            <span className={styles.quickValue}>{selfRanking ? `${selfRanking.position}º lugar` : 'Ver top'}</span>
            <span className={styles.quickHint}>{rankingsMode === 'pvp' ? 'Arena PvP' : 'Treino PvE'}</span>
          </button>
        </nav>

        {continueTrack ? (
          <Card className={cx(styles.infoCard, styles.continueCard)} padding="lg">
            <div className={styles.infoHead}>
              <h3 className={styles.infoTitle}><Route aria-hidden="true" strokeWidth={2.4} /> {continueTrack.started ? 'Continue sua trilha' : 'Comece por aqui'}</h3>
              <Badge tone={continueTrack.progress >= 100 ? 'lime' : 'violet'}>{continueTrack.progress}%</Badge>
            </div>
            <div className={styles.trackRow} style={{ '--track-color': continueTrack.color }}>
              <span className={styles.trackIcon} aria-hidden="true">{continueTrack.icon}</span>
              <span className={styles.trackText}>
                <span className={styles.trackName}>{continueTrack.name}</span>
                <span className={styles.trackDesc}>{continueTrack.desc}</span>
              </span>
            </div>
            <ProgressBar value={continueTrack.progress} tone="violet" size="sm" label={`Progresso em ${continueTrack.name}`} />
            <button type="button" className={styles.linkButton} onClick={() => openPveTrack(continueTrack.id)}>
              {continueTrack.started ? 'Continuar' : 'Começar trilha'} <ChevronRight aria-hidden="true" strokeWidth={2.8} />
            </button>
          </Card>
        ) : null}

        <Card className={cx(styles.infoCard, styles.passCard)} padding="lg">
          <div className={styles.infoHead}>
            <h3 className={styles.infoTitle}><Ticket aria-hidden="true" strokeWidth={2.4} /> Passe de Evolução</h3>
            <Badge tone="gold">Nível {evolutionPass?.currentLevel || 1}/{evolutionPass?.totalLevels || 1}</Badge>
          </div>
          {passStage ? (
            <div className={styles.passStage}>
              <span className={styles.passIcon} aria-hidden="true">{passStage.icon || '🏆'}</span>
              <span className={styles.trackText}>
                <span className={styles.trackName}>{passStage.name}</span>
                <span className={styles.trackDesc}>{passStage.desc}</span>
              </span>
            </div>
          ) : null}
          <div className={styles.progressLine}>
            <span className={styles.progressLabel}>
              <span>Etapa atual</span>
              <span>{Math.round(evolutionPass?.currentStageProgressPct || 0)}%</span>
            </span>
            <ProgressBar value={evolutionPass?.currentStageProgressPct || 0} tone="gold" size="sm" label="Progresso da etapa do passe" />
          </div>
          <div className={styles.rewardRow}>
            {passClaimable ? (
              <Badge tone="lime" icon={Gift}>{passClaimable} para coletar</Badge>
            ) : null}
            {passReward?.xp ? <Badge tone="blue">+{passReward.xp} XP</Badge> : null}
            {passReward?.coins ? <Badge tone="gold">+{passReward.coins} moedas</Badge> : null}
          </div>
          <button type="button" className={styles.linkButton} onClick={() => setScreen('achievements')}>
            {passClaimable ? 'Coletar recompensas' : 'Ver passe'} <ChevronRight aria-hidden="true" strokeWidth={2.8} />
          </button>
        </Card>

        <Card className={cx(styles.infoCard, styles.rankCard)} padding="lg">
          <div className={styles.infoHead}>
            <h3 className={styles.infoTitle}><Trophy aria-hidden="true" strokeWidth={2.4} /> Top jogadores</h3>
            <Tabs items={RANKING_TABS} value={rankingsMode} onChange={setRankingsMode} size="sm" ariaLabel="Modo do ranking" />
          </div>
          {rankingsLoading && !rankingViews.length ? (
            <p className={styles.trackDesc}>Carregando ranking...</p>
          ) : (
            <ol className={styles.rankList}>
              {rankingViews.map((row) => (
                <li key={row.key} className={cx(styles.rankItem, row.isSelf ? styles.rankSelf : '')}>
                  <span className={cx(styles.rankPos, styles[`rankPos${row.position}`] || '')}>{row.position}</span>
                  <Avatar avatar={row.avatar} frameClass={row.frameClass} frameStyle={row.frameStyle} size="xs" />
                  <span className={styles.rankName}>{row.nickname}{row.isSelf ? ' (você)' : ''}</span>
                  <span className={styles.rankPoints}>{row.points}</span>
                </li>
              ))}
            </ol>
          )}
          <button type="button" className={styles.linkButton} onClick={() => setScreen('rankings')}>
            Ver ranking completo <ChevronRight aria-hidden="true" strokeWidth={2.8} />
          </button>
        </Card>

        <section className={styles.stats} aria-label="Suas estatísticas">
          <StatTile icon={CircleCheck} label="Acertos" value={totalCorrect} tone="lime" />
          <StatTile icon={Crosshair} label="Precisão" value={`${accuracy}%`} tone="cyan" />
          <StatTile icon={Flame} label="Melhor sequência" value={bestStreak} tone="orange" />
          <StatTile icon={Swords} label="Vitórias PvP" value={`${pvpWins}/${pvpBattles}`} tone="pink" />
        </section>
      </div>
    </div>
  );
}
