import { SHOP_RARITY_LABELS, canPurchaseItem, getAvatarFrameClass, getAvatarFrameStyle, getDisplayAvatar, getHeroBackgroundStyle } from '../lib/shop';
import { getBackgroundVisualMeta } from '../app/helpers';

export default function ShopScreen({ vm }) {
  const {
    activeShopCategoryOpen,
    equippedShopId,
    getShopPreviewState,
    groupedShopItems,
    handleBuyShopItem,
    handleToggleOwnedShopItem,
    openShopItemPreview,
    ownedShopSet,
    profile,
    progress,
    safeShopOwnershipFilter,
    screen,
    setShopOwnershipFilter,
    setShopTab,
    shopData,
    shopTab,
    toggleShopCategory,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={`screen ${screen === 'shop' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>Loja</h2>
        <div className="shop-coins-badge">🪙 {progress.coins}</div>
      </div>
      <div className="shop-tabs">
        <button className={`shop-tab ${shopTab === 'frame' ? 'active' : ''}`} onClick={() => setShopTab('frame')}>
          🖼️ Molduras
        </button>
        <button className={`shop-tab ${shopTab === 'background' ? 'active' : ''}`} onClick={() => setShopTab('background')}>
          🎨 Fundos
        </button>
        <button className={`shop-tab ${shopTab === 'emoji' ? 'active' : ''}`} onClick={() => setShopTab('emoji')}>
          😎 Emojis
        </button>
      </div>
      <div className="shop-ownership-filters" role="group" aria-label="Filtro de itens da loja">
        <button
          type="button"
          className={`shop-ownership-filter-btn ${safeShopOwnershipFilter === 'all' ? 'active' : ''}`}
          onClick={() => setShopOwnershipFilter('all')}
        >
          Todas
        </button>
        <button
          type="button"
          className={`shop-ownership-filter-btn ${safeShopOwnershipFilter === 'owned' ? 'active' : ''}`}
          onClick={() => setShopOwnershipFilter('owned')}
        >
          Adquiridas
        </button>
        <button
          type="button"
          className={`shop-ownership-filter-btn ${safeShopOwnershipFilter === 'unowned' ? 'active' : ''}`}
          onClick={() => setShopOwnershipFilter('unowned')}
        >
          Não adquiridas
        </button>
      </div>
      <div className="shop-grid">
        {groupedShopItems.map((group) => {
          const groupRarity = group.rarity || 'common';
          const groupLabel = SHOP_RARITY_LABELS[groupRarity] || 'Comum';
          const isOpen = Boolean(activeShopCategoryOpen[groupRarity] ?? true);
          const groupItems = Array.isArray(group.items) ? group.items : [];
          return (
            <section key={`${shopTab}_${groupRarity}`} className={`shop-rarity-section rarity-${groupRarity}`}>
              <button
                type="button"
                className={`shop-rarity-toggle rarity-${groupRarity} ${isOpen ? 'open' : ''}`}
                onClick={() => toggleShopCategory(shopTab, groupRarity)}
              >
                <span className="shop-rarity-title">{groupLabel}</span>
                <span className="shop-rarity-count">{groupItems.length}</span>
                <span className={`shop-rarity-arrow ${isOpen ? 'open' : ''}`} aria-hidden="true">▾</span>
              </button>
              {isOpen ? (
                groupItems.length ? (
                  <div className="shop-rarity-grid">
                    {groupItems.map((item) => {
                      const itemRarity = item?.rarity || 'common';
                      const itemRarityLabel = SHOP_RARITY_LABELS[itemRarity] || 'Categoria';
                      const owned = ownedShopSet.has(item.id);
                      const equipped = equippedShopId === item.id;
                      const unlockSource = String(item?.unlockSource || '').trim().toLowerCase();
                      const isPassRewardOnly = unlockSource === 'evolution_pass';
                      const passUnlockLevel = Math.max(0, Number(item?.unlockLevel || 0));
                      const isPassLocked = isPassRewardOnly && !owned;
                      const canBuyCheck = canPurchaseItem(shopData, item.id, progress.coins);
                      const canBuy = canBuyCheck.ok;
                      const previewState = getShopPreviewState(item);
                      const previewAvatar = getDisplayAvatar(profile?.avatar || '🤓', previewState);
                      const previewFrameStyle = getAvatarFrameStyle(previewState);
                      const previewFrameClass = getAvatarFrameClass(previewState);
                      const previewBgStyle = getHeroBackgroundStyle(previewState);
                      const previewBgMeta = getBackgroundVisualMeta(previewState);
                      const itemClasses = [
                        'shop-item',
                        owned ? 'owned' : '',
                        equipped ? 'equipped' : '',
                        isPassLocked ? 'locked-pass' : ''
                      ].filter(Boolean).join(' ');
                      return (
                        <div key={item.id} className={itemClasses} data-rarity={itemRarity}>
                          <button
                            type="button"
                            className="shop-item-preview-btn"
                            onClick={() => openShopItemPreview(item)}
                            aria-label={`Visualizar ${item.name}`}
                          >
                            <div className="shop-item-preview">
                              {item.type === 'frame' ? (
                                <div className="shop-preview-cosmetic shop-preview-frame-wrap" data-rarity={itemRarity}>
                                  <div className={`shop-preview-frame ${previewFrameClass}`} style={previewFrameStyle}>
                                    <span className="shop-preview-avatar-core">{previewAvatar}</span>
                                  </div>
                                </div>
                              ) : null}
                              {item.type === 'background' ? (
                                <div
                                  className={[
                                    'shop-preview-cosmetic',
                                    'shop-preview-bg'
                                  ].filter(Boolean).join(' ')}
                                  data-rarity={itemRarity}
                                  data-bg-id={previewBgMeta.id}
                                >
                                  <div
                                    className={[
                                      'shop-preview-bg-canvas',
                                      previewBgMeta.className
                                    ].filter(Boolean).join(' ')}
                                    style={{ background: previewBgStyle }}
                                  />
                                  <span className="shop-preview-particles" aria-hidden="true" />
                                </div>
                              ) : null}
                              {item.type === 'emoji' ? (
                                <div className="shop-preview-emoji-wrap" data-rarity={itemRarity}>
                                  <div className="shop-preview-emoji">{item.icon || '✨'}</div>
                                </div>
                              ) : null}
                            </div>
                          </button>
                          <div className="shop-item-name">{item.name}</div>
                          <span className={`shop-item-rarity rarity-${itemRarity}`}>{itemRarityLabel}</span>
                          {owned ? (
                            <button
                              className={`shop-btn shop-btn-equip ${equipped ? 'is-equipped' : ''}`}
                              disabled={Boolean(equipped && item.isDefault)}
                              onClick={() => handleToggleOwnedShopItem(item)}
                            >
                              {equipped
                                ? (item.isDefault ? 'Equipado' : 'Desequipar')
                                : 'Equipar'}
                            </button>
                          ) : (
                            <button
                              className={`shop-btn shop-btn-buy ${canBuyCheck.reason === 'pass_reward_only' ? 'pass-only' : ''} ${canBuy ? '' : 'disabled'}`}
                              disabled={!canBuy}
                              onClick={() => handleBuyShopItem(item.id)}
                            >
                              {canBuyCheck.reason === 'pass_reward_only'
                                ? `Passe Nv. ${passUnlockLevel || '?'}`
                                : `🪙 ${item.price}`
                              }
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="shop-rarity-empty">Sem itens nesta categoria.</div>
                )
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
