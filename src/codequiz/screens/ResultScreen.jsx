import { getDisplayAvatar } from '../lib/shop';
import { getDidacticExplainText } from '../app/helpers';

export default function ResultScreen({ vm }) {
  const {
    buildCosmeticSnapshot,
    progress,
    quizRankingLoading,
    quizRankingRows,
    resetQuizFlow,
    resultState,
    screen,
    selectedLanguageMeta,
    selectedTopicMeta,
    setScreen,
    xpForNextLevel,
    xpPercent
  } = vm;

  return (
    <div className={`screen ${screen === 'result' ? 'active' : ''}`}>
      <div className="result-content pve-result-content">
        <div className="result-emoji">
          {(resultState?.scorePct || 0) >= 80 ? '🏆' : (resultState?.scorePct || 0) >= 50 ? '👏' : '📚'}
        </div>
        <div className="result-title">Resultado do Quiz</div>
        <div className="result-subtitle">
          {(selectedLanguageMeta?.name || resultState?.language || '')} · {(selectedTopicMeta?.name || resultState?.topic || '')}
        </div>
        <div className="result-stats">
          <div className="result-stat">
            <div className="result-stat-value">{resultState?.correctCount || 0}/{resultState?.totalQuestions || 0}</div>
            <div className="result-stat-label">Acertos</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-value">{resultState?.scorePct || 0}%</div>
            <div className="result-stat-label">Precisao</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-value">+{resultState?.awardedXp || 0}</div>
            <div className="result-stat-label">XP</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-value">+{resultState?.awardedCoins || 0}</div>
            <div className="result-stat-label">Moedas</div>
          </div>
        </div>
        <div className="result-xp-bar">
          <div className="result-xp-fill" style={{ width: `${xpPercent}%` }} />
        </div>
        <div className="result-level-info">
          Nivel {progress.level} · {progress.xp}/{xpForNextLevel} XP
        </div>

        {resultState?.unlockedAchievements?.length ? (
          <div className="result-leaderboard">
            <div className="result-leaderboard-title">Etapas do passe prontas para coleta</div>
            <div className="result-leaderboard-list">
              {resultState.unlockedAchievements.map((achievement) => (
                <div key={achievement.id} className="result-leaderboard-item">
                  <span className="result-leaderboard-pos">{achievement.icon}</span>
                  <span>
                    {achievement.name}
                    {' '}
                    (+{Math.max(0, Number(achievement?.rewardXp || 0))} XP · +{Math.max(0, Number(achievement?.rewardCoins || 0))} moedas)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {resultState?.questionReview?.length ? (
          <div className="result-leaderboard">
            <div className="result-leaderboard-title">Revisao didatica da rodada</div>
            <div className="pve-result-review-list">
              {resultState.questionReview.map((row, index) => {
                const correctIndex = Number(row?.correctIndex ?? -1);
                const selectedIndex = Number(row?.selectedIndex ?? -1);
                const options = Array.isArray(row?.opts) ? row.opts : [];
                const correctOption = (
                  correctIndex >= 0
                  && correctIndex < options.length
                ) ? options[correctIndex] : '--';
                const selectedOption = (
                  selectedIndex >= 0
                  && selectedIndex < options.length
                ) ? options[selectedIndex] : '';
                const statusIcon = row?.isCorrect
                  ? '✅'
                  : (row?.isTimeout ? '⏰' : (row?.wasAnswered === false ? '📘' : '❌'));
                const statusLabel = row?.isCorrect
                  ? 'Acertou'
                  : (row?.isTimeout ? 'Tempo esgotado' : (row?.wasAnswered === false ? 'Não respondida' : 'Errou'));

                return (
                  <div key={`pve_review_${index}`} className="pve-result-review-item">
                    <div className="pve-result-review-head">
                      <span className="result-leaderboard-pos">{statusIcon}</span>
                      <span className="pve-result-review-question">
                        {Math.max(1, Number(row?.index || (index + 1)))}. {row?.q || 'Pergunta sem texto'}
                      </span>
                    </div>
                    <div className="pve-result-review-meta">
                      <span>{statusLabel}</span>
                      <span>Correta: {correctOption}</span>
                      {selectedOption ? (
                        <span>Sua resposta: {selectedOption}</span>
                      ) : null}
                    </div>
                    <div className="feedback-explain pve-result-review-explain">
                      {getDidacticExplainText(row)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="result-leaderboard">
          <div className="result-leaderboard-title">Ranking deste quiz</div>
          {quizRankingLoading ? (
            <div className="ranking-loading">Carregando ranking...</div>
          ) : quizRankingRows.length ? (
            <div className="result-leaderboard-list">
              {quizRankingRows.slice(0, 5).map((row, index) => {
                const rowShop = buildCosmeticSnapshot(
                  row.equipped_frame,
                  row.equipped_background,
                  row.equipped_emoji
                );
                const rowAvatar = getDisplayAvatar(row.avatar || '🤓', rowShop);
                return (
                  <div key={`${row.user_id}_${index}`} className="result-leaderboard-item">
                    <span className="result-leaderboard-pos">#{index + 1}</span>
                    <span>{rowAvatar} {row.nickname || 'Jogador'}</span>
                    <span style={{ marginLeft: 'auto' }}>{row.correct_count}/{row.total_questions}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ranking-empty">Sem dados ainda para este quiz.</div>
          )}
        </div>

        <button className="btn btn-primary result-action-btn result-action-btn-primary" onClick={() => setScreen('difficulty')}>
          Novo desafio
        </button>
        <button
          className="btn btn-secondary result-action-btn result-action-btn-secondary"
          onClick={() => {
            resetQuizFlow();
            setScreen('home');
          }}
        >
          Voltar ao inicio
        </button>
      </div>
    </div>
  );
}
