export default function PassClaimFx({ vm }) {
  const {
    passClaimFx
  } = vm;

  return (
    <div className="pass-claim-fx" role="status" aria-live="polite" aria-label="Recompensa do passe coletada">
      <div className="pass-claim-fx-card">
        <div className="pass-claim-fx-kicker">Passe de Evolução</div>
        <div className="pass-claim-fx-title">
          <span className="pass-claim-fx-icon" aria-hidden="true">{passClaimFx.icon || '🏆'}</span>
          <span>{passClaimFx.title || 'Recompensa coletada'}</span>
        </div>
        <div className="pass-claim-fx-rewards">
          <span className="pass-claim-fx-chip">+{Math.max(0, Number(passClaimFx.xp || 0))} XP</span>
          <span className="pass-claim-fx-chip">+{Math.max(0, Number(passClaimFx.coins || 0))} moedas</span>
          {(Array.isArray(passClaimFx.cosmetics) ? passClaimFx.cosmetics : []).slice(0, 2).map((name) => (
            <span key={`pass_fx_cosmetic_${name}`} className="pass-claim-fx-chip cosmetic">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
