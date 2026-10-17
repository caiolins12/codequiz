import { DIFFICULTY_LABELS } from '../lib/constants';

export default function DifficultyScreen({ vm }) {
  const {
    beginPveRound,
    screen,
    selectedTopicDifficultyProgress,
    selectedTopicQuestionCountByDifficulty,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={`screen ${screen === 'difficulty' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>Dificuldade</h2>
      </div>
      <div className="difficulty-list">
        <button
          className="diff-card diff-easy"
          onClick={() => beginPveRound('easy')}
          disabled={!selectedTopicQuestionCountByDifficulty.easy}
        >
          <span className="diff-emoji">🌱</span>
          <span className="diff-name">{DIFFICULTY_LABELS.easy}</span>
          <span className="diff-desc">Perguntas introdutórias e fundamentos.</span>
          <span className="diff-meta">
            {selectedTopicQuestionCountByDifficulty.easy || 0} perguntas por partida · melhor {selectedTopicDifficultyProgress.easy?.pct || 0}%
          </span>
          <div className="diff-progress">
            <div className="diff-progress-fill" style={{ width: `${selectedTopicDifficultyProgress.easy?.pct || 0}%` }} />
          </div>
          <span className="diff-mult">x1 recompensas</span>
        </button>
        <button
          className="diff-card diff-medium"
          onClick={() => beginPveRound('medium')}
          disabled={!selectedTopicQuestionCountByDifficulty.medium}
        >
          <span className="diff-emoji">🔥</span>
          <span className="diff-name">{DIFFICULTY_LABELS.medium}</span>
          <span className="diff-desc">Aplicação prática e análise intermediária.</span>
          <span className="diff-meta">
            {selectedTopicQuestionCountByDifficulty.medium || 0} perguntas por partida · melhor {selectedTopicDifficultyProgress.medium?.pct || 0}%
          </span>
          <div className="diff-progress">
            <div className="diff-progress-fill" style={{ width: `${selectedTopicDifficultyProgress.medium?.pct || 0}%` }} />
          </div>
          <span className="diff-mult">x2 recompensas</span>
        </button>
        <button
          className="diff-card diff-hard"
          onClick={() => beginPveRound('hard')}
          disabled={!selectedTopicQuestionCountByDifficulty.hard}
        >
          <span className="diff-emoji">⚡</span>
          <span className="diff-name">{DIFFICULTY_LABELS.hard}</span>
          <span className="diff-desc">Cenarios avancados e detalhes tecnicos.</span>
          <span className="diff-meta">
            {selectedTopicQuestionCountByDifficulty.hard || 0} perguntas por partida · melhor {selectedTopicDifficultyProgress.hard?.pct || 0}%
          </span>
          <div className="diff-progress">
            <div className="diff-progress-fill" style={{ width: `${selectedTopicDifficultyProgress.hard?.pct || 0}%` }} />
          </div>
          <span className="diff-mult">x3 recompensas</span>
        </button>
      </div>
    </div>
  );
}
