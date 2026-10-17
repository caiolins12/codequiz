export default function HeroMenuPopover({ vm }) {
  const {
    openPlayerHistoryPanel,
    playerHeroMenuAnchorRect,
    playerHeroMenuPopoverRef
  } = vm;

  return (
    <div
      ref={playerHeroMenuPopoverRef}
      className="hero-menu-popover hero-menu-popover-floating"
      role="menu"
      aria-label="Menu do perfil"
      style={{
        top: `${Math.max(12, Number(playerHeroMenuAnchorRect.top || 0))}px`,
        right: `${Math.max(12, Number(playerHeroMenuAnchorRect.right || 0))}px`,
        width: `${Math.max(220, Number(playerHeroMenuAnchorRect.width || 280))}px`
      }}
    >
      <button type="button" className="hero-menu-item" onClick={openPlayerHistoryPanel}>
        <span className="hero-menu-item-icon" aria-hidden="true">🕘</span>
        <span className="hero-menu-item-copy">
          <span className="hero-menu-item-label">Histórico de partidas</span>
          <span className="hero-menu-item-desc">Acompanhe seus resultados de PVP e PVE.</span>
        </span>
      </button>
    </div>
  );
}
