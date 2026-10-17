export default function PvpOpponentLeftOverlay() {
  return (
    <div className="pvp-result-transition-overlay" role="status" aria-live="polite" aria-label="Transicao de resultado">
      <div className="pvp-result-transition-backdrop" />
      <div className="pvp-result-transition-card">
        <div className="pvp-result-transition-spinner" />
        <div className="pvp-result-transition-title">Oponente saiu da partida</div>
        <div className="pvp-result-transition-subtitle">Preparando sua compensação...</div>
      </div>
    </div>
  );
}
