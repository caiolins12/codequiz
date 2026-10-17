import { formatSignedPoints } from '../app/helpers';

export default function PvpCompensationModal({ vm }) {
  const {
    collectPvpCompensation,
    pvpCompensation,
    pvpRewardCollecting
  } = vm;

  return (
    <div className="reset-modal reward-collect-modal" role="dialog" aria-live="polite" aria-label="Compensacao PVP">
      <div className="reset-modal-card reward-collect-card">
        <h3>{pvpCompensation.title || 'Compensação da partida'}</h3>
        <p>{pvpCompensation.subtitle || 'Você recebeu uma compensação.'}</p>
        <div className="reward-collect-list">
          <div className="reward-collect-item">
            <span className="reward-collect-item-label">Pontos PVP</span>
            <span className={`reward-collect-item-value ${Number(pvpCompensation.points || 0) >= 0 ? 'points' : 'points-loss'}`}>
              {formatSignedPoints(pvpCompensation.points || 0)}
            </span>
          </div>
          <div className="reward-collect-item">
            <span className="reward-collect-item-label">XP</span>
            <span className="reward-collect-item-value xp">+{Math.max(0, Number(pvpCompensation.xp || 0))}</span>
          </div>
          <div className="reward-collect-item">
            <span className="reward-collect-item-label">Moedas</span>
            <span className="reward-collect-item-value coins">+{Math.max(0, Number(pvpCompensation.coins || 0))}</span>
          </div>
        </div>
        <button className="reward-collect-btn" disabled={pvpRewardCollecting} onClick={(event) => collectPvpCompensation(event)}>
          {pvpRewardCollecting ? 'Coletando...' : 'Coletar Recompensas'}
        </button>
      </div>
    </div>
  );
}
