import { getAvatarFrameClass, getAvatarFrameStyle, getDisplayAvatar } from '../lib/shop';
import { formatSignedPoints } from '../app/helpers';

export default function PvpTeamResultScreen({ vm }) {
  const {
    buildCosmeticSnapshot,
    collectPvpTeamResultRewards,
    pvpTeamBlueMembers,
    pvpTeamMatch,
    pvpTeamRedMembers,
    pvpTeamResultKey,
    pvpTeamResultProcessed,
    pvpTeamResultReward,
    pvpTeamRewardCollecting,
    resetPvpTeamState,
    screen,
    setPvpMode,
    setScreen
  } = vm;

  return (
    <div className={`screen ${screen === 'pvp-team-result' ? 'active' : ''}`}>
      <div className="result-content">
        <div className={`pvp-result-panel pvp-result-panel-dynamic outcome-${pvpTeamResultKey === 'win' ? 'win' : pvpTeamResultKey === 'draw' ? 'draw' : 'lose'}`}>
          <div className="result-emoji pvp-result-seq result-seq-1">{pvpTeamResultKey === 'win' ? '\uD83C\uDFC6' : pvpTeamResultKey === 'draw' ? '\uD83E\uDD1D' : '\uD83D\uDE35'}</div>
          <div className="result-title pvp-result-seq result-seq-2">
            {pvpTeamResultKey === 'win' ? 'Vitoria da equipe!' : pvpTeamResultKey === 'draw' ? 'Empate em equipe' : 'Derrota da equipe'}
          </div>
          <div className="pvp-result-scoreline pvp-result-seq result-seq-3">
            <span className={`player-history-versus-name ${String(pvpTeamMatch?.winner_side || '').trim() === 'red' ? 'is-winner' : 'is-loser'}`}>
              Vermelho
            </span>
            <div className="player-history-score type-pvp pvp-result-score pvp-result-inline-score">
              <span className={`player-history-score-value ${String(pvpTeamMatch?.winner_side || '').trim() === 'red' ? 'is-winner' : 'is-loser'}`}>
                {Math.max(0, Number(pvpTeamMatch?.red_score || 0))}
              </span>
              <span className="player-history-score-divider">x</span>
              <span className={`player-history-score-value ${String(pvpTeamMatch?.winner_side || '').trim() === 'blue' ? 'is-winner' : 'is-loser'}`}>
                {Math.max(0, Number(pvpTeamMatch?.blue_score || 0))}
              </span>
            </div>
            <span className={`player-history-versus-name ${String(pvpTeamMatch?.winner_side || '').trim() === 'blue' ? 'is-winner' : 'is-loser'}`}>
              Azul
            </span>
          </div>
          <div className="pvp-team-result-members pvp-result-seq result-seq-4">
            {[
              { side: 'red', label: 'Time Vermelho', members: pvpTeamRedMembers },
              { side: 'blue', label: 'Time Azul', members: pvpTeamBlueMembers }
            ].map((team) => (
              <div key={`team_result_${team.side}`} className={`pvp-team-result-column ${team.side}`}>
                <div className="pvp-team-result-column-title">{team.label}</div>
                <div className="pvp-team-result-member-list">
                  {team.members.map((member) => {
                    const memberId = String(member?.user_id || '').trim();
                    const memberShop = buildCosmeticSnapshot(
                      member?.equipped_frame,
                      member?.equipped_background,
                      member?.equipped_emoji
                    );
                    const memberAvatar = getDisplayAvatar(member?.avatar || '\uD83D\uDE42', memberShop);
                    const memberFrameStyle = getAvatarFrameStyle(memberShop);
                    const memberFrameClass = getAvatarFrameClass(memberShop);
                    return (
                      <div key={`team_result_member_${team.side}_${memberId}`} className="pvp-team-result-member">
                        <span className={`pvp-player-avatar pvp-team-result-avatar ${memberFrameClass}`} style={memberFrameStyle}>{memberAvatar}</span>
                        <div className="pvp-team-result-copy">
                          <strong>{member?.nickname || 'Jogador'}</strong>
                          <span>{Math.max(0, Number(pvpTeamMatch?.member_scores?.[memberId] || 0))} acerto(s)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {pvpTeamResultReward ? (
            <>
              <div className="reward-collect-list pvp-result-reward-list pvp-result-seq result-seq-5">
                <div className="reward-collect-item">
                  <span className="reward-collect-item-label">Pontos PVP</span>
                  <span className={`reward-collect-item-value ${Number(pvpTeamResultReward.points || 0) >= 0 ? 'points' : 'points-loss'}`}>
                    {formatSignedPoints(pvpTeamResultReward.points || 0)}
                  </span>
                </div>
                <div className="reward-collect-item">
                  <span className="reward-collect-item-label">XP</span>
                  <span className="reward-collect-item-value xp">+{Math.max(0, Number(pvpTeamResultReward.xp || 0))}</span>
                </div>
                <div className="reward-collect-item">
                  <span className="reward-collect-item-label">Moedas</span>
                  <span className="reward-collect-item-value coins">+{Math.max(0, Number(pvpTeamResultReward.coins || 0))}</span>
                </div>
              </div>
              <button
                className="reward-collect-btn pvp-result-reward-btn pvp-result-seq result-seq-6"
                disabled={pvpTeamRewardCollecting}
                onClick={(event) => collectPvpTeamResultRewards(event)}
              >
                {pvpTeamRewardCollecting ? 'Coletando...' : 'Coletar Recompensas'}
              </button>
            </>
          ) : !pvpTeamResultProcessed ? (
            <div className="result-subtitle pvp-result-seq result-seq-5 pvp-result-collect-note">
              Preparando recompensas...
            </div>
          ) : (
            <button
              className="reward-collect-btn pvp-result-reward-btn pvp-result-seq result-seq-5"
              onClick={() => {
                resetPvpTeamState();
                setPvpMode('');
                setScreen('home');
              }}
            >
              Voltar ao inicio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
