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
    screen,
    setAdminBotArenaAutomationEnabled,
    setScreen,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={`screen ${screen === 'admin-monitor' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>Monitoramento Admin</h2>
      </div>
      <div className="admin-screen-shell">
        <div className="admin-screen-hero">
          <div className="admin-screen-hero-title">Painel de monitoramento</div>
          <div className="admin-screen-hero-subtitle">Acompanhe partidas em tempo real e histórico diário.</div>
        </div>

        <div className="admin-screen-stats">
          <div className="admin-screen-stat-card">
            <span>Online</span>
            <strong>{arenaMetrics.online}</strong>
          </div>
          <div className="admin-screen-stat-card">
            <span>Fila</span>
            <strong>{arenaMetrics.queue}</strong>
          </div>
          <div className="admin-screen-stat-card">
            <span>Ao vivo</span>
            <strong>{adminLiveMatches.length}</strong>
          </div>
          <div className="admin-screen-stat-card">
            <span>Historico hoje</span>
            <strong>{adminHistoryTodayBaseMatches.length}</strong>
          </div>
        </div>

        <div className="admin-screen-updated-at">
          Atualizado em {adminMatchesUpdatedAtMs ? new Date(adminMatchesUpdatedAtMs).toLocaleTimeString('pt-BR') : '--:--:--'}
        </div>

        <div className="admin-daemon-control">
          <div className="admin-daemon-head">
            <span className={`admin-daemon-dot ${botArenaBattlesEnabled ? 'enabled' : 'disabled'}`} aria-hidden="true" />
            <div className="admin-daemon-copy">
              <strong>{botArenaBattlesEnabled ? 'Automação de bots ativa' : 'Automação de bots desativada'}</strong>
              <span>
                PVP: {botArenaPvpEnabled ? 'ativado' : 'desativado'}
                {' · '}
                Quiz: {botArenaQuizEnabled ? 'ativado' : 'desativado'}
                {' · '}
                Daemon: {botArenaDaemonModeLabel}
                {' · '}
                Atualizado: {botArenaDaemonUpdatedAtLabel}
              </span>
            </div>
          </div>
          <div className="admin-daemon-toggles">
            <div className="admin-daemon-toggle-row">
              <div className="admin-daemon-toggle-copy">
                <strong>Batalhas PVP dos bots</strong>
                <span>{botArenaPvpEnabled ? 'Ativado' : 'Desativado'}</span>
              </div>
              <label className="settings-switch" aria-label="Ativar batalhas PVP dos bots">
                <input
                  type="checkbox"
                  checked={botArenaPvpEnabled}
                  disabled={adminBotDaemonBusy}
                  onChange={(event) => setAdminBotArenaAutomationEnabled('pvp', event.target.checked)}
                />
                <span className="settings-switch-track">
                  <span className="settings-switch-thumb" />
                </span>
              </label>
            </div>

            <div className="admin-daemon-toggle-row">
              <div className="admin-daemon-toggle-copy">
                <strong>Partidas de quiz dos bots</strong>
                <span>{botArenaQuizEnabled ? 'Ativado' : 'Desativado'}</span>
              </div>
              <label className="settings-switch" aria-label="Ativar partidas de quiz dos bots">
                <input
                  type="checkbox"
                  checked={botArenaQuizEnabled}
                  disabled={adminBotDaemonBusy}
                  onChange={(event) => setAdminBotArenaAutomationEnabled('quiz', event.target.checked)}
                />
                <span className="settings-switch-track">
                  <span className="settings-switch-thumb" />
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="admin-screen-actions">
          <button className="btn btn-primary btn-lg" onClick={() => setScreen('admin-live')}>
            Partidas ao vivo
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => setScreen('admin-history')}>
            Historico de partidas do dia
          </button>
          <button className="btn btn-secondary" disabled={adminBusy} onClick={() => refreshAdminMetrics().catch(() => null)}>
            Atualizar painel
          </button>
        </div>
      </div>
    </div>
  );
}
