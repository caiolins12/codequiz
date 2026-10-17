import { getBackgroundVisualMeta } from '../../app/helpers';
import {
  getAvatarFrameClass,
  getAvatarFrameStyle,
  getDisplayAvatar,
  getHeroBackgroundStyle
} from '../../lib/shop';

// Dados visuais de um jogador (membro de sala/partida) a partir dos cosméticos equipados.
export function buildPlayerView(member, buildCosmeticSnapshot, overrides = {}) {
  const safe = member && typeof member === 'object' ? member : {};
  const shop = buildCosmeticSnapshot(safe.equipped_frame, safe.equipped_background, safe.equipped_emoji);
  return {
    userId: String(safe.user_id || '').trim(),
    nickname: String(safe.nickname || 'Jogador'),
    avatar: getDisplayAvatar(safe.avatar || '🙂', shop),
    frameClass: getAvatarFrameClass(shop),
    frameStyle: getAvatarFrameStyle(shop),
    background: getHeroBackgroundStyle(shop),
    backgroundMeta: getBackgroundVisualMeta(shop),
    level: Math.max(1, Number(safe.level || 1)),
    points: Math.max(0, Number(safe.pvp_points || 0)),
    ...overrides
  };
}

// Mesma coisa, mas a partir dos dados já calculados no App (jogador 1/2 do duelo).
export function playerViewFromShop({ nickname, avatar, frameClass, frameStyle, shop, backgroundMeta, level, points }) {
  return {
    nickname: String(nickname || 'Jogador'),
    avatar,
    frameClass,
    frameStyle,
    background: getHeroBackgroundStyle(shop),
    backgroundMeta,
    level: Math.max(1, Number(level || 1)),
    points: Math.max(0, Number(points || 0))
  };
}
