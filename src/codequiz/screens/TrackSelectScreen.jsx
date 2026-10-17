import { TOPICS } from '../data/questions-data';
import { getTopicsByLanguage } from '../lib/quizEngine';

export default function TrackSelectScreen({ vm }) {
  const {
    languageProgress,
    languageThemeSections,
    screen,
    selectedLanguage,
    setScreen,
    setSelectedLanguage,
    setSelectedTopic,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={`screen ${screen === 'select' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>Escolha o Tema</h2>
      </div>
      <p className="select-subtitle">Organizado por trilhas para facilitar sua progressão no PVE.</p>
      <div className="lang-grid">
        {languageThemeSections.map((section) => (
          <section key={section.id} className="category-section">
            <div className="category-header">
              <p className="category-label">{section.label}</p>
              <p className="category-desc">{section.desc}</p>
            </div>
            <div className="category-cards">
              {section.items.map((language) => (
                <button
                  key={language.id}
                  className={`lang-card ${selectedLanguage === language.id ? 'active' : ''}`}
                  style={{ '--card-accent': language.color }}
                  onClick={() => {
                    setSelectedLanguage(language.id);
                    const topics = getTopicsByLanguage(TOPICS, language.id);
                    setSelectedTopic(topics[0]?.id || '');
                    setScreen('topic');
                  }}
                >
                  <div className="lang-icon">{language.icon}</div>
                  <div className="lang-info">
                    <div className="lang-name">{language.name}</div>
                    <div className="lang-desc">{language.desc}</div>
                    <div className="lang-meta">
                      <div className="lang-progress">
                        <div
                          className="lang-progress-fill"
                          style={{ width: `${languageProgress.get(language.id) || 0}%` }}
                        />
                      </div>
                      <span className="lang-pct">{languageProgress.get(language.id) || 0}%</span>
                    </div>
                  </div>
                  <span className="lang-arrow">›</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
