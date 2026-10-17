import { useState } from 'react';
import { Check, ChevronDown, Frame, Image as ImageIcon, Lock, PackageOpen, Smile } from 'lucide-react';
import { SHOP_RARITY_LABELS } from '../lib/shop';
import { Card, CoinIcon, EmptyState, PageHeader, RarityBadge, StatPill, Tabs, cx } from '../ui';
import ShopPreview, { ShopItemAction, ShopItemThumb, getShopItemStatus } from './shared/ShopPreview';
import styles from './ShopScreen.module.css';

const TYPE_TABS = [
  { value: 'frame', label: 'Molduras', icon: Frame },
  { value: 'background', label: 'Fundos', icon: ImageIcon },
  { value: 'emoji', label: 'Emojis', icon: Smile }
];

const OWNERSHIP_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'owned', label: 'Adquiridos' },
  { value: 'unowned', label: 'Não adquiridos' }
];

// No desktop largo a prévia fica no painel lateral; abaixo disso abre o sheet.
const SIDE_PREVIEW_QUERY = '(min-width: 1200px)';

function ItemCard({ item, status, selected, previewState, profileAvatar, onSelect, action }) {
  return (
    <li
      className={cx(
        styles.item,
        status.equipped ? styles.itemEquipped : '',
        selected ? styles.itemSelected : ''
      )}
      style={{ '--rarity-color': `var(--cq-rarity-${item.rarity || 'common'})` }}
    >
      <button
        type="button"
        className={cx(styles.thumb, item.type === 'background' ? styles.thumbFill : '')}
        onClick={onSelect}
        aria-label={`Ver prévia de ${item.name}`}
        aria-pressed={selected || undefined}
      >
        <ShopItemThumb item={item} previewState={previewState} profileAvatar={profileAvatar} />
        {status.equipped ? (
          <span className={cx(styles.tag, styles.tagEquipped)}><Check aria-hidden="true" strokeWidth={3} /> Equipado</span>
        ) : status.owned ? (
          <span className={cx(styles.tag, styles.tagOwned)} title="Adquirido"><Check aria-hidden="true" strokeWidth={3} /></span>
        ) : status.passOnly ? (
          <span className={cx(styles.tag, styles.tagLocked)} title="Recompensa do passe"><Lock aria-hidden="true" strokeWidth={2.8} /></span>
        ) : null}
      </button>
      <span className={styles.itemName}>{item.name}</span>
      {action}
    </li>
  );
}

export default function ShopScreen({ vm }) {
  const {
    activeShopCategoryOpen,
    getShopPreviewState,
    groupedShopItems,
    handleBuyShopItem,
    handleToggleOwnedShopItem,
    heroNickname,
    openShopItemPreview,
    ownedShopSet,
    profile,
    progress,
    pveCategory,
    pvpCategory,
    safeLevel,
    safeShopOwnershipFilter,
    setScreen,
    setShopOwnershipFilter,
    setShopTab,
    shopData,
    shopTab,
    toggleShopCategory
  } = vm;

  const [selectedId, setSelectedId] = useState('');
  const coins = Math.max(0, Number(progress?.coins || 0));
  const profileAvatar = profile?.avatar || '🤓';
  const statusContext = { shopData, coins, ownedSet: ownedShopSet };
  const groups = (Array.isArray(groupedShopItems) ? groupedShopItems : []).filter((group) => group.items?.length);
  const visibleItems = groups.flatMap((group) => group.items);
  const equippedId = String(shopData?.equipped?.[shopTab] || '');
  const selectedItem = visibleItems.find((item) => item.id === selectedId)
    || visibleItems.find((item) => item.id === equippedId)
    || visibleItems[0]
    || null;
  const openPass = () => setScreen('achievements');

  const handleSelect = (item) => {
    const sidePreview = typeof window !== 'undefined' && window.matchMedia?.(SIDE_PREVIEW_QUERY).matches;
    if (sidePreview) setSelectedId(item.id);
    else openShopItemPreview(item);
  };

  const renderAction = (item, status, size = 'sm') => (
    <ShopItemAction
      item={item}
      status={status}
      size={size}
      block
      onBuy={handleBuyShopItem}
      onToggle={handleToggleOwnedShopItem}
      onOpenPass={openPass}
    />
  );

  const selectedStatus = selectedItem ? getShopItemStatus(selectedItem, statusContext) : null;

  return (
    <div className={styles.screen}>
      <PageHeader
        title="Loja"
        subtitle="Personalize seu perfil com molduras, fundos e emojis."
        actions={<StatPill className={styles.headerCoins} icon={CoinIcon} value={coins} label="moedas" tone="gold" ariaLabel={`${coins} moedas`} />}
      />

      <div className={styles.toolbar}>
        <Tabs items={TYPE_TABS} value={shopTab} onChange={setShopTab} block ariaLabel="Tipo de item" className={styles.typeTabs} />
        <Tabs
          items={OWNERSHIP_TABS}
          value={safeShopOwnershipFilter}
          onChange={setShopOwnershipFilter}
          size="sm"
          ariaLabel="Filtrar itens"
          className={styles.filterTabs}
        />
      </div>

      <div className={styles.layout}>
        <div className={styles.catalog}>
          {groups.length ? groups.map((group) => {
            const rarity = group.rarity || 'common';
            const isOpen = Boolean(activeShopCategoryOpen?.[rarity] ?? true);
            return (
              <section key={`${shopTab}_${rarity}`} className={styles.group} style={{ '--rarity-color': `var(--cq-rarity-${rarity})` }}>
                <button
                  type="button"
                  className={styles.groupHead}
                  onClick={() => toggleShopCategory(shopTab, rarity)}
                  aria-expanded={isOpen}
                >
                  <RarityBadge rarity={rarity} label={SHOP_RARITY_LABELS[rarity] || 'Comum'} />
                  <span className={styles.groupCount}>{group.items.length} {group.items.length === 1 ? 'item' : 'itens'}</span>
                  <ChevronDown className={cx(styles.groupChevron, isOpen ? styles.groupChevronOpen : '')} aria-hidden="true" strokeWidth={2.6} />
                </button>
                {isOpen ? (
                  <ul className={cx(styles.grid, shopTab === 'emoji' ? styles.gridCompact : '')}>
                    {group.items.map((item) => {
                      const status = getShopItemStatus(item, statusContext);
                      return (
                        <ItemCard
                          key={item.id}
                          item={item}
                          status={status}
                          selected={selectedItem?.id === item.id}
                          previewState={getShopPreviewState(item)}
                          profileAvatar={profileAvatar}
                          onSelect={() => handleSelect(item)}
                          action={renderAction(item, status)}
                        />
                      );
                    })}
                  </ul>
                ) : null}
              </section>
            );
          }) : (
            <Card padding="lg">
              <EmptyState
                icon={PackageOpen}
                title={safeShopOwnershipFilter === 'owned' ? 'Nenhum item adquirido aqui' : 'Nada por aqui'}
                text={safeShopOwnershipFilter === 'owned' ? 'Compre itens com moedas ou desbloqueie no Passe de Evolução.' : 'Você já tem todos os itens desta categoria!'}
              />
            </Card>
          )}
        </div>

        {selectedItem ? (
          <aside className={styles.side} aria-label="Prévia do item">
            <Card padding="lg">
              <ShopPreview
                item={selectedItem}
                previewState={getShopPreviewState(selectedItem)}
                profileAvatar={profileAvatar}
                nickname={heroNickname}
                level={safeLevel}
                pveCategory={pveCategory}
                pvpCategory={pvpCategory}
                status={selectedStatus}
                action={renderAction(selectedItem, selectedStatus, 'lg')}
              />
            </Card>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
