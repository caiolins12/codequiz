import { getCategoryByPoints } from '../lib/pvp';
import { getAvatarFrameClass, getAvatarFrameStyle, getDisplayAvatar, getHeroBackgroundStyle } from '../lib/shop';
import { getBackgroundVisualMeta } from '../app/helpers';

export default function RankingsScreen({ vm }) {
  const {
    authUser,
    buildCosmeticSnapshot,
    rankingsLoading,
    rankingsMode,
    rankingsRows,
    screen,
    setRankingsMode,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={`screen ${screen === 'rankings' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>Rankings</h2>
      </div>
      <div className="ranking-tabs">
        <button
          className={`ranking-tab ${rankingsMode === 'pve' ? 'active' : ''}`}
          onClick={() => setRankingsMode('pve')}
        >
          PVE
        </button>
        <button
          className={`ranking-tab ${rankingsMode === 'pvp' ? 'active' : ''}`}
          onClick={() => setRankingsMode('pvp')}
        >
          PVP
        </button>
      </div>
      <div className="ranking-content">
        {rankingsLoading ? (
          <div className="ranking-loading">Carregando...</div>
        ) : rankingsRows.length ? (
          <div className="ranking-list">
            {rankingsRows.map((row, index) => {
              const isSelf = String(row.user_id || '') === String(authUser?.uid || '');
              const rowShop = buildCosmeticSnapshot(
                row.equipped_frame,
                row.equipped_background,
                row.equipped_emoji
              );
              const rowAvatar = getDisplayAvatar(row.avatar || '🤓', rowShop);
              const rowFrameStyle = getAvatarFrameStyle(rowShop);
              const rowFrameClass = getAvatarFrameClass(rowShop);
              const rowBackgroundMeta = getBackgroundVisualMeta(rowShop);
              const itemClasses = [
                'ranking-item',
                isSelf ? 'ranking-self' : '',
                index === 0 ? 'ranking-top1' : '',
                index === 1 ? 'ranking-top2' : '',
                index === 2 ? 'ranking-top3' : '',
                rowBackgroundMeta.className
              ].filter(Boolean).join(' ');
              const points = rankingsMode === 'pvp'
                ? Math.max(0, Number(row.pvp_points || 0))
                : Math.max(0, Number(row.ranking_points || 0));
              const category = getCategoryByPoints(points);
              const meta = rankingsMode === 'pvp'
                ? `${Math.max(0, Number(row.pvp_wins || 0))}V · ${Math.max(0, Number(row.pvp_battles || 0))}P`
                : `${Math.max(0, Number(row.total_correct || 0))} corretas · Lv ${Math.max(1, Number(row.level || 1))}`;

              return (
                <div
                  key={`${row.user_id}_${index}`}
                  className={itemClasses}
                  data-bg-id={rowBackgroundMeta.id}
                  data-bg-rarity={rowBackgroundMeta.rarity}
                  style={{ background: getHeroBackgroundStyle(rowShop) }}
                >
                  <span className="rank-pos">#{index + 1}</span>
                  <span className={`rank-avatar ${rowFrameClass}`} style={rowFrameStyle}>{rowAvatar}</span>
                  <div className="rank-info">
                    <div className="rank-name-row">
                      <span className="rank-name">{row.nickname || 'Jogador'}</span>
                      <span className={`tier-badge tier-badge-compact tier-badge-rank tier-${category.key}`}>
                        {rankingsMode === 'pvp' ? 'PVP' : 'PVE'} {category.label}
                      </span>
                    </div>
                    <div className="rank-meta">{meta}</div>
                  </div>
                  <span className="rank-xp">{points} PTS</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ranking-empty">Sem ranking disponível ainda.</div>
        )}
      </div>
    </div>
  );
}
