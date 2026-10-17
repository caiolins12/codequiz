import { Eye } from 'lucide-react';
import { Modal } from '../ui';
import ShopPreview, { ShopItemAction, getShopItemStatus } from '../screens/shared/ShopPreview';

export default function ShopItemPreviewModal({ vm }) {
  const {
    activeShopItemPreview,
    closeShopItemPreview,
    getShopPreviewState,
    handleBuyShopItem,
    handleToggleOwnedShopItem,
    heroNickname,
    ownedShopSet,
    profile,
    progress,
    pveCategory,
    pvpCategory,
    safeLevel,
    setScreen,
    shopData
  } = vm;

  const item = activeShopItemPreview;
  const status = getShopItemStatus(item, {
    shopData,
    coins: Math.max(0, Number(progress?.coins || 0)),
    ownedSet: ownedShopSet
  });

  return (
    <Modal title="Prévia do item" icon={Eye} tone="violet" size="sm" onClose={closeShopItemPreview}>
      <ShopPreview
        item={item}
        previewState={getShopPreviewState(item)}
        profileAvatar={profile?.avatar || '🤓'}
        nickname={heroNickname}
        level={safeLevel}
        pveCategory={pveCategory}
        pvpCategory={pvpCategory}
        status={status}
        action={(
          <ShopItemAction
            item={item}
            status={status}
            size="lg"
            block
            onBuy={handleBuyShopItem}
            onToggle={handleToggleOwnedShopItem}
            onOpenPass={() => {
              closeShopItemPreview();
              setScreen('achievements');
            }}
          />
        )}
      />
    </Modal>
  );
}
