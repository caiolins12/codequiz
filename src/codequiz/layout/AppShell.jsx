import { useEffect, useState } from 'react';
import { History, Music, Music2, Settings, SkipForward, VolumeX } from 'lucide-react';
import { Avatar, CoinIcon, IconButton, ProgressBar, StatPill, TierBadge, Toast, cx } from '../ui';
import { NAV_TABS } from './nav';
import styles from './AppShell.module.css';

function Brand({ onClick }) {
  return (
    <button type="button" className={styles.brand} onClick={onClick} aria-label="CodeQuiz — início">
      <span className={styles.brandMark} aria-hidden="true">{'</>'}</span>
      <span className={styles.brandText}>
        <span className={styles.brandName}>CodeQuiz</span>
        <span className={styles.brandTag}>Aprenda jogando</span>
      </span>
    </button>
  );
}

function MusicControl({ music, compact = false }) {
  if (!music) return null;
  const enabled = music.enabled === true;
  if (compact) {
    return (
      <IconButton
        icon={enabled ? Music2 : VolumeX}
        label={enabled ? 'Desligar música' : 'Ligar música'}
        variant="surface"
        size="md"
        onClick={() => music.onToggle(!enabled)}
      />
    );
  }
  return (
    <div className={styles.music}>
      <span className={cx(styles.musicIcon, enabled ? styles.musicIconPlaying : '')} aria-hidden="true">
        {enabled ? <Music strokeWidth={2.5} /> : <VolumeX strokeWidth={2.5} />}
      </span>
      <span className={styles.musicText}>
        <span className={styles.musicLabel}>{music.mode === 'battle' ? 'Trilha da partida' : 'Trilha do menu'}</span>
        <span className={styles.musicTrack}>{enabled ? (music.trackName || 'Sem trilha') : 'Música desligada'}</span>
      </span>
      {enabled ? (
        <IconButton icon={SkipForward} label="Próxima trilha" size="sm" onClick={music.onSkip} />
      ) : null}
      <IconButton
        icon={enabled ? VolumeX : Music2}
        label={enabled ? 'Desligar música' : 'Ligar música'}
        size="sm"
        onClick={() => music.onToggle(!enabled)}
      />
    </div>
  );
}

function ProfileMenu({ placement, onClose, onOpenHistory, onOpenSettings }) {
  return (
    <>
      <div className={styles.menuLayer} onClick={onClose} aria-hidden="true" />
      <div
        className={cx(styles.menu, placement === 'sidebar' ? styles.menuSidebar : styles.menuTopBar)}
        role="menu"
        aria-label="Menu do perfil"
      >
        <button
          type="button"
          role="menuitem"
          className={styles.menuItem}
          onClick={() => {
            onClose();
            onOpenHistory();
          }}
        >
          <History aria-hidden="true" strokeWidth={2.4} />
          Histórico de partidas
        </button>
        <button
          type="button"
          role="menuitem"
          className={styles.menuItem}
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
        >
          <Settings aria-hidden="true" strokeWidth={2.4} />
          Configurações
        </button>
      </div>
    </>
  );
}

function Sidebar({ activeTab, onNavigate, profile, music, onOpenMenu }) {
  return (
    <aside className={styles.sidebar} aria-label="Navegação principal">
      <Brand onClick={() => onNavigate('home')} />
      <nav data-tour-anchor="app-nav">
        <ul className={styles.navList}>
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <li key={tab.key}>
                <button
                  type="button"
                  className={cx(styles.navItem, active ? styles.navItemActive : '')}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onNavigate(tab.key)}
                >
                  <span className={styles.navIcon} aria-hidden="true"><Icon strokeWidth={2.4} /></span>
                  {tab.label}
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className={cx(styles.navItem, activeTab === 'settings' ? styles.navItemActive : '')}
              aria-current={activeTab === 'settings' ? 'page' : undefined}
              onClick={() => onNavigate('settings')}
            >
              <span className={styles.navIcon} aria-hidden="true"><Settings strokeWidth={2.4} /></span>
              Configurações
            </button>
          </li>
        </ul>
      </nav>
      <div className={styles.sidebarSpacer} />
      {profile ? (
        <div className={styles.profileCard}>
          <button type="button" className={styles.profileTop} onClick={onOpenMenu} aria-haspopup="menu" aria-label="Abrir menu do perfil">
            <Avatar
              avatar={profile.avatar}
              frameClass={profile.frameClass}
              frameStyle={profile.frameStyle}
              size="md"
              badge={profile.level}
              alt=""
            />
            <span className={styles.profileText}>
              <span className={styles.profileName}>{profile.nickname}</span>
              <span className={styles.profileMeta}>Nível {profile.level}</span>
            </span>
          </button>
          <div className={styles.profileXp}>
            <div className={styles.profileXpLabel}>
              <span>XP</span>
              <span>{profile.xp} / {profile.xpNext}</span>
            </div>
            <ProgressBar value={profile.xpPercent} tone="blue" size="sm" label="Progresso de XP" />
          </div>
          <div className={styles.profileRow}>
            <StatPill icon={CoinIcon} value={profile.coins} size="sm" ariaLabel={`${profile.coins} moedas`} />
            <TierBadge tierKey={profile.pvpTier?.key} label={profile.pvpTier?.label} prefix="PvP" size="sm" />
          </div>
        </div>
      ) : null}
      <MusicControl music={music} />
    </aside>
  );
}

function MobileTopBar({ profile, music, onOpenMenu }) {
  if (!profile) return null;
  return (
    <header className={styles.topBar}>
      <button type="button" className={styles.topProfile} onClick={onOpenMenu} aria-haspopup="menu" aria-label="Abrir menu do perfil">
        <Avatar
          avatar={profile.avatar}
          frameClass={profile.frameClass}
          frameStyle={profile.frameStyle}
          size="sm"
          alt=""
        />
        <span className={styles.topProfileText}>
          <span className={styles.topName}>{profile.nickname}</span>
          <span className={styles.topLevel}>
            Nv. {profile.level}
            <ProgressBar value={profile.xpPercent} tone="blue" size="xs" className={styles.topLevelBar} label="Progresso de XP" />
          </span>
        </span>
      </button>
      <div className={styles.topActions}>
        <StatPill icon={CoinIcon} value={profile.coins} size="sm" ariaLabel={`${profile.coins} moedas`} />
        <MusicControl music={music} compact />
      </div>
    </header>
  );
}

function BottomTabBar({ activeTab, onNavigate }) {
  return (
    <nav className={styles.tabBar} aria-label="Navegação principal" data-tour-anchor="app-nav">
      {NAV_TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            className={cx(styles.tab, active ? styles.tabActive : '')}
            aria-current={active ? 'page' : undefined}
            onClick={() => onNavigate(tab.key)}
          >
            <span className={styles.tabIcon} aria-hidden="true"><Icon strokeWidth={2.4} /></span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function SplashScreen({ message = 'Inicializando sua sessão...' }) {
  return (
    <div className={styles.splash} role="status" aria-live="polite">
      <div className={styles.splashCard}>
        <span className={styles.splashMark} aria-hidden="true">{'</>'}</span>
        <h1 className={styles.splashTitle}>CodeQuiz</h1>
        <p className={styles.splashText}>{message}</p>
        <div className={styles.splashBar} aria-hidden="true">
          <div className={styles.splashBarFill} />
        </div>
      </div>
    </div>
  );
}

// mode: 'tabs' (com navegação) | 'focus' (tela cheia, sem menus)
export default function AppShell({
  mode = 'tabs',
  activeTab = null,
  showTopBar = true,
  onNavigate,
  onOpenHistory,
  profile = null,
  music = null,
  toast = '',
  className = '',
  children
}) {
  const [menuPlacement, setMenuPlacement] = useState('');
  const tabsMode = mode === 'tabs';
  const closeMenu = () => setMenuPlacement('');

  // Publica o modo no <html> para overlays fora do shell (ex.: banners acima da barra de abas).
  useEffect(() => {
    document.documentElement.dataset.shellMode = mode;
  }, [mode]);

  // Fecha o menu do perfil ao trocar de aba ou de modo (ex.: entrar numa partida).
  useEffect(() => {
    setMenuPlacement('');
  }, [activeTab, mode]);

  return (
    <div className={cx(styles.shell, className)} data-shell-mode={mode}>
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.grid} />
      </div>
      <div className={cx(styles.frame, tabsMode ? styles.tabsFrame : '')}>
        {tabsMode ? (
          <Sidebar
            activeTab={activeTab}
            onNavigate={onNavigate}
            profile={profile}
            music={music}
            onOpenMenu={() => setMenuPlacement('sidebar')}
          />
        ) : null}
        <div className={styles.main}>
          {tabsMode && showTopBar ? (
            <MobileTopBar profile={profile} music={music} onOpenMenu={() => setMenuPlacement('topbar')} />
          ) : null}
          <main className={tabsMode ? styles.content : styles.focusContent} id="cq-main">
            {children}
          </main>
        </div>
      </div>
      {tabsMode ? <BottomTabBar activeTab={activeTab} onNavigate={onNavigate} /> : null}
      {menuPlacement ? (
        <ProfileMenu
          placement={menuPlacement}
          onClose={closeMenu}
          onOpenHistory={onOpenHistory}
          onOpenSettings={() => onNavigate('settings')}
        />
      ) : null}
      <Toast message={toast} />
    </div>
  );
}
