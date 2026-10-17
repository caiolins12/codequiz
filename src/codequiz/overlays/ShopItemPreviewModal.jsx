import { AvatarImage, isImageAvatarValue } from '../app/helpers';

export default function ShopItemPreviewModal({ vm }) {
  const {
    activeShopItemPreview,
    closeShopItemPreview,
    heroNickname,
    pveCategory,
    pvpCategory,
    safeBestStreak,
    safeCoins,
    safeLevel,
    shopModalPreviewAvatar,
    shopModalPreviewBgMeta,
    shopModalPreviewBgStyle,
    shopModalPreviewFrameClass,
    shopModalPreviewFrameStyle
  } = vm;

  return (
    <div className="reset-modal shop-item-preview-modal" onClick={closeShopItemPreview}>
      <div className="reset-modal-card shop-item-preview-card" onClick={(event) => event.stopPropagation()}>
        <h3>Pre-visualizacao</h3>
        <p>{activeShopItemPreview.name}</p>
        <div
          className={[
            'shop-modal-profile',
            shopModalPreviewBgMeta.className
          ].filter(Boolean).join(' ')}
          data-bg-id={shopModalPreviewBgMeta.id}
          data-bg-rarity={shopModalPreviewBgMeta.rarity}
          style={{ background: shopModalPreviewBgStyle }}
        >
          <div className="shop-modal-profile-content">
            <span className={`hero-avatar shop-modal-avatar ${shopModalPreviewFrameClass}`} style={shopModalPreviewFrameStyle}>
              {isImageAvatarValue(shopModalPreviewAvatar) ? (
                <AvatarImage className="hero-avatar-image" src={shopModalPreviewAvatar} alt="Avatar da pre-visualizacao" fallback="🙂" />
              ) : shopModalPreviewAvatar}
            </span>
            <div className="shop-modal-profile-info">
              <div className="shop-modal-profile-name">{heroNickname}</div>
              <div className="shop-modal-profile-meta">Nv. {safeLevel} · 🔥 {safeBestStreak} · 🪙 {safeCoins}</div>
              <div className="shop-modal-profile-badges">
                <span className={`tier-badge tier-badge-compact tier-${pveCategory.key}`}>PVE {pveCategory.label}</span>
                <span className={`tier-badge tier-badge-compact tier-${pvpCategory.key}`}>PVP {pvpCategory.label}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="match-accept-actions">
          <button className="btn btn-secondary btn-lg" onClick={closeShopItemPreview}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
