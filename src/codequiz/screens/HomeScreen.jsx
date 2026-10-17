import { AvatarImage, isImageAvatarValue } from '../app/helpers';

export default function HomeScreen({ vm }) {
  const {
    avatarFrameClass,
    avatarFrameStyle,
    displayAvatar,
    heroBackground,
    heroBackgroundMeta,
    heroNickname,
    homeAuthUser,
    homeScreenClassName,
    openPlayerHistoryPanel,
    playerHeroMenuOpen,
    playerHeroMenuRef,
    progress,
    pveCategory,
    pvpCategory,
    safeCoins,
    safeLevel,
    safeXp,
    setScreen,
    showHomeProfileHero,
    togglePlayerHeroMenu,
    xpForNextLevel,
    xpPercent
  } = vm;

  return (
    <div className={homeScreenClassName}>
      {showHomeProfileHero ? (
        <div
          className={[
            'user-profile-hero',
            playerHeroMenuOpen ? 'menu-open' : '',
            heroBackgroundMeta.className
          ].filter(Boolean).join(' ')}
          data-tour-anchor="home-hero"
          data-bg-id={heroBackgroundMeta.id}
          data-bg-rarity={heroBackgroundMeta.rarity}
          style={{ background: heroBackground }}
        >
          <div className="hero-bg-glow" />
          <div className="hero-menu-shell hero-menu-shell-legacy" aria-hidden="true">
            <button
              type="button"
              className={`hero-menu-btn ${playerHeroMenuOpen ? 'active' : ''}`}
              onClick={togglePlayerHeroMenu}
              aria-label="Abrir menu do perfil"
              aria-haspopup="menu"
              aria-expanded={playerHeroMenuOpen}
            >
              <span />
              <span />
              <span />
            </button>
            {playerHeroMenuOpen ? (
              <div className="hero-menu-popover" role="menu" aria-label="Menu do perfil">
                <button type="button" className="hero-menu-item" onClick={openPlayerHistoryPanel}>
                  <span className="hero-menu-item-icon" aria-hidden="true">🕘</span>
                  <span className="hero-menu-item-copy">
                    <span className="hero-menu-item-label">Historico de partidas</span>
                    <span className="hero-menu-item-desc">Acompanhe seus resultados de PVP e PVE.</span>
                  </span>
                </button>
              </div>
            ) : null}
          </div>
          <div className="hero-content">
            <div className="hero-avatar-wrap">
              <span className={`hero-avatar ${avatarFrameClass}`} style={avatarFrameStyle}>
                {isImageAvatarValue(displayAvatar) ? (
                  <AvatarImage className="hero-avatar-image" src={displayAvatar} alt="Avatar do jogador" fallback="🙂" />
                ) : displayAvatar}
              </span>
              <div className="hero-avatar-glow" />
            </div>
            <div className="hero-info">
              <div className="hero-name-row">
                <div className="hero-name">{heroNickname}</div>
                <div className="hero-menu-shell" ref={playerHeroMenuRef}>
                  <button
                    type="button"
                    className={`hero-menu-btn ${playerHeroMenuOpen ? 'active' : ''}`}
                    onClick={togglePlayerHeroMenu}
                    aria-label="Abrir menu do perfil"
                    aria-haspopup="menu"
                    aria-expanded={playerHeroMenuOpen}
                  >
                    <span />
                    <span />
                    <span />
                  </button>
                  {playerHeroMenuOpen ? (
                    <div className="hero-menu-popover" role="menu" aria-label="Menu do perfil">
                      <button type="button" className="hero-menu-item" onClick={openPlayerHistoryPanel}>
                        <span className="hero-menu-item-icon" aria-hidden="true">🕘</span>
                        <span className="hero-menu-item-copy">
                          <span className="hero-menu-item-label">Histórico de partidas</span>
                          <span className="hero-menu-item-desc">Acompanhe seus resultados de PVP e PVE.</span>
                        </span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="hero-badges-line">
                <div className="hero-badges-group">
                  <span className={`tier-badge tier-badge-compact tier-${pveCategory.key}`}>PVE {pveCategory.label}</span>
                  <span className={`tier-badge tier-badge-compact tier-${pvpCategory.key}`}>PVP {pvpCategory.label}</span>
                </div>
                <span className="hero-coins" aria-label={`Moedas ${safeCoins}`}>
                  <span className="hero-coins-icon" aria-hidden="true">🪙</span>
                  <span className="hero-coins-value">{safeCoins}</span>
                </span>
              </div>
              <div className="hero-xp-bar">
                <div className="hero-xp-fill" style={{ width: `${xpPercent}%` }} />
              </div>
              <div className="hero-xp-label">
                <span className="hero-xp-level">Nv. {safeLevel}</span>
                <span className="hero-xp-progress">{safeXp} / {xpForNextLevel} XP</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!showHomeProfileHero ? (
        <>
          <div className="home-header">
            <div className="logo-icon">{'</>'}</div>
            <h1>Code Quiz</h1>
            <p className="subtitle">Next.js + React + Cloudflare Workers</p>
          </div>

          <div className="player-stats-modern">
            <div className="stat-card-modern stat-level">
              <span className="stat-icon stat-icon-float">🏅</span>
              <div className="stat-value">{progress.level}</div>
              <div className="stat-label">Nivel</div>
            </div>
            <div className="stat-card-modern stat-xp">
              <span className="stat-icon stat-icon-float">⭐</span>
              <div className="stat-value">{progress.rankingPoints}</div>
              <div className="stat-label">Pontos PVE</div>
            </div>
            <div className="stat-card-modern stat-streak">
              <span className="stat-icon stat-icon-float">⚔️</span>
              <div className="stat-value">{progress.pvpPoints}</div>
              <div className="stat-label">Pontos PVP</div>
            </div>
          </div>
        </>
      ) : null}

      <div className="home-actions">
        <button
          className="btn btn-primary btn-lg btn-modern home-play-btn"
          data-tour-anchor="home-play"
          onClick={() => setScreen('play-mode')}
        >
          <span className="btn-icon">▶</span>
          <span className="btn-text">Jogar Agora</span>
          <span className="btn-arrow">›</span>
        </button>

        <div className="home-actions-grid" data-tour-anchor="home-tools">
          <button className="btn btn-secondary btn-modern home-tool-btn home-tool-btn-rankings" onClick={() => setScreen('rankings')}>
            <span className="btn-icon">🏆</span>
            <span className="btn-text">Rankings</span>
          </button>
          <button className="btn btn-secondary btn-modern home-tool-btn home-tool-btn-shop" onClick={() => setScreen('shop')}>
            <span className="btn-icon">🛒</span>
            <span className="btn-text">Loja</span>
          </button>
          <button className="btn btn-secondary btn-modern home-tool-btn home-tool-btn-pass" onClick={() => setScreen('achievements')}>
            <span className="btn-icon">🎟️</span>
            <span className="btn-text">Passe de Evolução</span>
          </button>
          <button
            className="btn btn-secondary btn-modern home-tool-btn home-tool-btn-settings"
            onClick={() => setScreen(homeAuthUser ? 'settings' : 'login')}
          >
            <span className="btn-icon">⚙️</span>
            <span className="btn-text">Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
}
