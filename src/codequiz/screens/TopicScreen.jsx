export default function TopicScreen({ vm }) {
  const {
    languageProgress,
    screen,
    selectedLanguage,
    selectedLanguageMeta,
    selectedTopic,
    selectedTopics,
    setScreen,
    setSelectedTopic,
    topicProgress,
    topicQuestionCountByDifficulty,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={`screen ${screen === 'topic' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>{selectedLanguageMeta?.name || 'Tópicos'}</h2>
      </div>
      <div className="topic-header-card">
        <div className="topic-header-kicker">Trilhas do tema</div>
        <div className="topic-header-title">{selectedLanguageMeta?.name || 'Tópicos'}</div>
        <div className="topic-header-desc">
          {selectedLanguageMeta?.desc || 'Escolha um topico para iniciar o quiz.'}
        </div>
        <div className="topic-header-meta">
          <span>{selectedTopics.length} topicos</span>
          <span>{languageProgress.get(selectedLanguage) || 0}% de progresso total</span>
        </div>
      </div>
      <div className="topic-list">
        {selectedTopics.map((topic) => {
          const pct = topicProgress.get(topic.id) || 0;
          const badgeClass = pct >= 80 ? 'completed' : pct > 0 ? 'started' : 'new';
          const badgeLabel = pct >= 80 ? 'Dominado' : pct > 0 ? `${pct}%` : 'Novo';
          const perDiff = topicQuestionCountByDifficulty.get(topic.id) || { easy: 0, medium: 0, hard: 0 };
          const totalQuestions = Math.max(0, Number(perDiff.easy || 0), Number(perDiff.medium || 0), Number(perDiff.hard || 0));
          const topicCountLabel = totalQuestions > 0
            ? `Inic./Inter./Avan.: ${perDiff.easy}/${perDiff.medium}/${perDiff.hard}`
            : 'Sem perguntas';
          return (
            <button
              key={topic.id}
              className={`topic-card ${selectedTopic === topic.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedTopic(topic.id);
                setScreen('difficulty');
              }}
            >
              <span className="topic-emoji">{topic.emoji}</span>
              <div className="topic-info">
                <div className="topic-name-row">
                  <div className="topic-name">{topic.name}</div>
                  <div className="topic-count">{topicCountLabel}</div>
                </div>
                <div className="topic-desc">{topic.desc}</div>
                <div className="topic-progress-row">
                  <div className="topic-progress-bar">
                    <div className="topic-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="topic-progress-pct">{pct}%</span>
                </div>
              </div>
              <span className={`topic-badge ${badgeClass}`}>{badgeLabel}</span>
              <span className="topic-arrow">›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
