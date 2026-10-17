export default function HomeTourOverlay({ vm }) {
  const {
    advanceHomeTour,
    currentHomeTourStep,
    homeTourHighlight,
    homeTourProgressLabel,
    isHomeTourLastStep,
    skipHomeTour
  } = vm;

  return (
    <div className="home-tour-overlay" role="dialog" aria-modal="true" aria-label="Tour guiado da tela inicial">
      {homeTourHighlight ? (
        <div
          className="home-tour-highlight"
          style={{
            top: `${homeTourHighlight.top}px`,
            left: `${homeTourHighlight.left}px`,
            width: `${homeTourHighlight.width}px`,
            height: `${homeTourHighlight.height}px`
          }}
        />
      ) : null}
      <div className="home-tour-card">
        <div className="home-tour-card-head">
          <span className="home-tour-kicker">{currentHomeTourStep.kicker}</span>
          <span className="home-tour-progress">{homeTourProgressLabel}</span>
        </div>
        <h3 className="home-tour-title">{currentHomeTourStep.title}</h3>
        <p className="home-tour-description">{currentHomeTourStep.description}</p>
        <div className="home-tour-actions">
          <button className="btn btn-secondary" onClick={skipHomeTour}>Pular tour</button>
          <button className="btn btn-primary" onClick={advanceHomeTour}>
            {isHomeTourLastStep ? 'Concluir' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}
