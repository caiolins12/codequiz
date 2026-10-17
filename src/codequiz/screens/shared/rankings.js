import { getBackgroundVisualMeta } from '../../app/helpers';
import { getCategoryByPoints } from '../../lib/pvp';
import {
  getAvatarFrameClass,
  getAvatarFrameStyle,
  getDisplayAvatar,
  getHeroBackgroundStyle
} from '../../lib/shop';

// Converte uma linha de subscribeGlobalRankings no que as telas exibem.
export function buildRankingRowView(row, index, mode, buildCosmeticSnapshot, selfUserId = '') {
  const safeRow = row && typeof row === 'object' ? row : {};
  const shop = buildCosmeticSnapshot(safeRow.equipped_frame, safeRow.equipped_background, safeRow.equipped_emoji);
  const backgroundMeta = getBackgroundVisualMeta(shop);
  const isPvp = mode === 'pvp';
  const points = isPvp
    ? Math.max(0, Number(safeRow.pvp_points || 0))
    : Math.max(0, Number(safeRow.ranking_points || 0));
  const wins = Math.max(0, Number(safeRow.pvp_wins || 0));
  const battles = Math.max(0, Number(safeRow.pvp_battles || 0));
  const correct = Math.max(0, Number(safeRow.total_correct || 0));
  const level = Math.max(1, Number(safeRow.level || 1));
  return {
    key: `${safeRow.user_id || 'row'}_${index}`,
    userId: String(safeRow.user_id || ''),
    position: index + 1,
    nickname: String(safeRow.nickname || 'Jogador'),
    avatar: getDisplayAvatar(safeRow.avatar || '🤓', shop),
    frameClass: getAvatarFrameClass(shop),
    frameStyle: getAvatarFrameStyle(shop),
    background: getHeroBackgroundStyle(shop),
    backgroundMeta,
    points,
    category: getCategoryByPoints(points),
    isSelf: !!selfUserId && String(safeRow.user_id || '') === String(selfUserId),
    level,
    meta: isPvp
      ? `${wins} vitória${wins === 1 ? '' : 's'} · ${battles} partida${battles === 1 ? '' : 's'}`
      : `${correct} acerto${correct === 1 ? '' : 's'} · Nv. ${level}`
  };
}
