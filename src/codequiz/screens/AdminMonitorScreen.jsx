import { Bot, ChevronRight, History, Hourglass, Radio, RefreshCw, Wifi } from 'lucide-react';
import { Card, IconButton, PageHeader, SectionHeader, StatTile, Switch, cx } from '../ui';
import styles from './AdminScreens.module.css';

function NavLink({ icon: Icon, title, desc, onClick, live = false }) {
  return (
    <button type="button" className={styles.link} onClick={onClick}>
      <span className={cx(styles.linkIcon, live ? styles.linkLive : '')} aria-hidden="true"><Icon strokeWidth={2.4} /></span>
      <span className={styles.linkText}>
        <span className={styles.linkTitle}>{title}</span>
        <span className={styles.linkDesc}>{desc}</span>
      </span>
      <ChevronRight className={styles.linkChevron} aria-hidden="true" strokeWidth={2.6} />
    </button>
  );
}

export default function AdminMonitorScreen({ vm }) {
  const {
    adminBotDaemonBusy,
    adminBusy,
    adminHistoryTodayBaseMatches,
    adminLiveMatches,
    adminMatchesUpdatedAtMs,
    arenaMetrics,
    botArenaBattlesEnabled,
    botArenaDaemonModeLabel,
    botArenaDaemonUpdatedAtLabel,
    botArenaPvpEnabled,
    botArenaQuizEnabled,
    refreshAdminMetrics,
    setAdminBotArenaAutomationEnabled,
    setScreen,
    triggerAppBackNavigation
  } = vm;

  const liveCount = Array.isArray(adminLiveMatches) ? adminLiveMatches.length : 0;
  const historyCount = Array.isArray(adminHistoryTodayBaseMatches) ? adminHistoryTodayBaseMatches.length : 0;
  const updatedAt = adminMatchesUpdatedAtMs ? new Date(adminMatchesUpdatedAtMs).toLocaleTimeString('pt-BR') : '--:--:--';

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow="Admin"
        title="Monitoramento"
        subtitle="Partidas em tempo real, histórico do dia e automação dos bots."
        onBack={() => triggerAppBackNavigation('button')}
        actions={(
          <IconButton
            icon={RefreshCw}
            label="Atualizar painel"
            variant="surface"
            disabled={adminBusy}
            onClick={() => refreshAdminMetrics().catch(() => null)}
          />
        )}
      />

      <div className={styles.stats}>
        <StatTile icon={Wifi} label="Online" value={Math.max(0, Number(arenaMetrics?.online || 0))} tone="lime" />
        <StatTile icon={Hourglass} label="Na fila" value={Math.max(0, Number(arenaMetrics?.queue || 0))} tone="gold" />
        <StatTile icon={Radio} label="Ao vivo" value={liveCount} tone="red" />
        <StatTile icon={History} label="Hoje" value={historyCount} tone="violet" />
      </div>
      <p className={styles.updated}>Atualizado às {updatedAt}</p>

      <div className={styles.grid}>
        <Card padding="lg" className={styles.card}>
          <SectionHeader title="Automação dos bots" subtitle="Liga e desliga as partidas automáticas." icon={Bot} />
          <div className={styles.daemon}>
            <span className={cx(styles.dot, botArenaBattlesEnabled ? styles.dotOn : '')} aria-hidden="true" />
            <span className={styles.daemonText}>
              <span className={styles.daemonTitle}>{botArenaBattlesEnabled ? 'Automação ativa' : 'Automação desativada'}</span>
              <span className={styles.daemonMeta}>Daemon: {botArenaDaemonModeLabel} · Atualizado: {botArenaDaemonUpdatedAtLabel}</span>
            </span>
          </div>
          <div className={styles.toggles}>
            <div className={styles.toggle}>
              <span className={styles.toggleText}>
                <span className={styles.toggleTitle}>Batalhas PvP dos bots</span>
                <span className={styles.toggleState}>{botArenaPvpEnabled ? 'Ativadas' : 'Desativadas'}</span>
              </span>
              <Switch
                checked={!!botArenaPvpEnabled}
                disabled={adminBotDaemonBusy}
                label="Ativar batalhas PvP dos bots"
                onChange={(value) => setAdminBotArenaAutomationEnabled('pvp', value)}
              />
            </div>
            <div className={styles.toggle}>
              <span className={styles.toggleText}>
                <span className={styles.toggleTitle}>Partidas de quiz dos bots</span>
                <span className={styles.toggleState}>{botArenaQuizEnabled ? 'Ativadas' : 'Desativadas'}</span>
              </span>
              <Switch
                checked={!!botArenaQuizEnabled}
                disabled={adminBotDaemonBusy}
                label="Ativar partidas de quiz dos bots"
                onChange={(value) => setAdminBotArenaAutomationEnabled('quiz', value)}
              />
            </div>
          </div>
        </Card>

        <div className={styles.links}>
          <NavLink
            icon={Radio}
            live
            title="Partidas ao vivo"
            desc={liveCount ? `${liveCount} em andamento agora` : 'Nenhuma partida em andamento'}
            onClick={() => setScreen('admin-live')}
          />
          <NavLink
            icon={History}
            title="Histórico do dia"
            desc={historyCount ? `${historyCount} partida${historyCount === 1 ? '' : 's'} finalizada${historyCount === 1 ? '' : 's'} hoje` : 'Sem partidas finalizadas hoje'}
            onClick={() => setScreen('admin-history')}
          />
        </div>
      </div>
    </div>
  );
}
