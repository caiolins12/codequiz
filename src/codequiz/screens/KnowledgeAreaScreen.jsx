import { KNOWLEDGE_AREAS } from '../app/helpers';

export default function KnowledgeAreaScreen({ vm }) {
  const {
    chooseKnowledgeAreaForPve,
    handleKnowledgeAreaTouchEnd,
    handleKnowledgeAreaTouchStart,
    kaCarouselIndex,
    playSfx,
    screen,
    setKaCarouselIndex,
    shiftKnowledgeAreaCarousel,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={`screen ${screen === 'knowledge-area' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>Área do Quiz</h2>
      </div>
      <p className="ka-subtitle">Escolha a área de conhecimento</p>
      <div className="ka-carousel-container">
        <button
          className="ka-arrow-btn ka-arrow-left"
          disabled={kaCarouselIndex <= 0}
          onClick={() => shiftKnowledgeAreaCarousel('pve', -1)}
          aria-label="Anterior"
        >
          ◀
        </button>
        <div
          className="ka-carousel-track"
          onTouchStart={(e) => handleKnowledgeAreaTouchStart('pve', e)}
          onTouchEnd={(e) => handleKnowledgeAreaTouchEnd('pve', e)}
        >
          <div
            className="ka-carousel-slider"
            style={{ transform: `translateX(-${kaCarouselIndex * 100}%)` }}
          >
            {KNOWLEDGE_AREAS.map((area) => (
              <div key={area.id} className="ka-card" style={{ '--ka-color': area.color }}>
                <div className="ka-card-icon">{area.icon}</div>
                <div className="ka-card-name">{area.name}</div>
                <div className="ka-card-desc">{area.desc}</div>
                <button
                  className="ka-card-btn"
                  onClick={() => chooseKnowledgeAreaForPve(area.id)}
                >
                  Escolher
                </button>
              </div>
            ))}
          </div>
        </div>
        <button
          className="ka-arrow-btn ka-arrow-right"
          disabled={kaCarouselIndex >= KNOWLEDGE_AREAS.length - 1}
          onClick={() => shiftKnowledgeAreaCarousel('pve', 1)}
          aria-label="Próximo"
        >
          ▶
        </button>
      </div>
      <div className="ka-dots">
        {KNOWLEDGE_AREAS.map((area, idx) => (
          <button
            key={area.id}
            className={`ka-dot ${idx === kaCarouselIndex ? 'active' : ''}`}
            onClick={() => {
              if (idx === kaCarouselIndex) return;
              setKaCarouselIndex(idx);
              playSfx('click');
            }}
            aria-label={area.name}
          />
        ))}
      </div>
    </div>
  );
}
