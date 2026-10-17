import { Check, Ticket, Undo2 } from 'lucide-react';
import { getBackgroundVisualMeta } from '../../app/helpers';
import {
  SHOP_RARITY_LABELS,
  canPurchaseItem,
  getAvatarFrameClass,
  getAvatarFrameStyle,
  getDisplayAvatar,
  getHeroBackgroundStyle
} from '../../lib/shop';
import { Avatar, Button, CoinIcon, RarityBadge, TierBadge, cx } from '../../ui';
import styles from './ShopPreview.module.css';

export const SHOP_TYPE_LABELS = { frame: 'Moldura', background: 'Fundo', emoji: 'Emoji' };

// Situação do item para o jogador: possuído, equipado, recompensa do passe ou faltando moedas.
export function getShopItemStatus(item, { shopData, coins, ownedSet }) {
  const owned = ownedSet.has(item.id);
  const equipped = String(shopData?.equipped?.[item.type] || '') === item.id;
  const passOnly = String(item?.unlockSource || '').trim().toLowerCase() === 'evolution_pass';
  const check = owned ? { ok: false, reason: 'already_owned' } : canPurchaseItem(shopData, item.id, coins);
  const price = Math.max(0, Number(item?.price || 0));
  return {
    owned,
    equipped,
    passOnly,
    passLevel: Math.max(0, Number(item?.unlockLevel || 0)),
    canBuy: !!check.ok,
    price,
    missingCoins: check.reason === 'insufficient_coins' ? Math.max(0, price - Math.max(0, Number(coins || 0))) : 0
  };
}

export function getShopStatusText(status) {
  if (status.equipped) return 'Equipado no seu perfil.';
  if (status.owned) return 'Você já tem este item. Equipe quando quiser.';
  if (status.passOnly) return `Recompensa do Passe de Evolução${status.passLevel ? ` (nível ${status.passLevel})` : ''}.`;
  if (status.missingCoins) return `Faltam ${status.missingCoins} moedas para comprar.`;
  return `Custa ${status.price} moedas.`;
}

export function ShopItemAction({ item, status, onBuy, onToggle, onOpenPass, size = 'md', block = false, busy = false }) {
  if (status.owned) {
    if (status.equipped && item.isDefault) {
      return <Button size={size} block={block} variant="ghost" icon={Check} disabled>Equipado</Button>;
    }
    if (status.equipped) {
      return <Button size={size} block={block} variant="secondary" icon={Undo2} disabled={busy} onClick={() => onToggle(item)}>Desequipar</Button>;
    }
    return <Button size={size} block={block} variant="success" icon={Check} disabled={busy} onClick={() => onToggle(item)}>Equipar</Button>;
  }
  if (status.passOnly) {
    return (
      <Button size={size} block={block} variant="secondary" icon={Ticket} onClick={onOpenPass}>
        Passe · Nv. {status.passLevel || '?'}
      </Button>
    );
  }
  return (
    <Button
      size={size}
      block={block}
      variant="warning"
      icon={CoinIcon}
      disabled={!status.canBuy || busy}
      onClick={() => onBuy(item.id)}
      aria-label={`Comprar ${item.name} por ${status.price} moedas`}
    >
      {status.price}
    </Button>
  );
}

// Miniatura do item (usada nos cards da grade).
export function ShopItemThumb({ item, previewState, profileAvatar }) {
  if (item.type === 'background') {
    const meta = getBackgroundVisualMeta(previewState);
    return (
      <span
        className={cx(styles.thumbBg, meta.className)}
        style={{ background: getHeroBackgroundStyle(previewState) }}
        data-bg-id={meta.id}
        data-bg-rarity={meta.rarity}
        aria-hidden="true"
      />
    );
  }
  if (item.type === 'emoji') {
    return <span className={styles.thumbEmoji} aria-hidden="true">{item.icon || '✨'}</span>;
  }
  return (
    <Avatar
      avatar={getDisplayAvatar(profileAvatar || '🤓', previewState)}
      frameClass={getAvatarFrameClass(previewState)}
      frameStyle={getAvatarFrameStyle(previewState)}
      size="lg"
      alt=""
    />
  );
}

// Prévia do perfil com o item aplicado + detalhes e ação.
export default function ShopPreview({
  item,
  previewState,
  profileAvatar,
  nickname,
  level,
  pveCategory,
  pvpCategory,
  status,
  action = null,
  className = ''
}) {
  const bgMeta = getBackgroundVisualMeta(previewState);
  return (
    <div className={cx(styles.preview, className)}>
      <div
        className={cx(styles.profile, bgMeta.className)}
        style={{ background: getHeroBackgroundStyle(previewState) }}
        data-bg-id={bgMeta.id}
        data-bg-rarity={bgMeta.rarity}
      >
        <span className={styles.shade} aria-hidden="true" />
        <Avatar
          avatar={getDisplayAvatar(profileAvatar || '🤓', previewState)}
          frameClass={getAvatarFrameClass(previewState)}
          frameStyle={getAvatarFrameStyle(previewState)}
          size="xl"
          badge={level}
          alt="Prévia do seu avatar"
        />
        <span className={styles.profileName}>{nickname}</span>
        <span className={styles.profileBadges}>
          <TierBadge tierKey={pveCategory?.key} label={pveCategory?.label} prefix="PvE" variant="solid" size="sm" />
          <TierBadge tierKey={pvpCategory?.key} label={pvpCategory?.label} prefix="PvP" variant="solid" size="sm" />
        </span>
      </div>

      {item ? (
        <div className={styles.info}>
          <div className={styles.infoHead}>
            <span className={styles.itemIcon} aria-hidden="true">{item.icon || '✨'}</span>
            <span className={styles.itemText}>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemType}>{SHOP_TYPE_LABELS[item.type] || 'Item'}</span>
            </span>
            <RarityBadge rarity={item.rarity} label={SHOP_RARITY_LABELS[item.rarity] || 'Comum'} />
          </div>
          {status ? <p className={styles.statusText}>{getShopStatusText(status)}</p> : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
