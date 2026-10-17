import {
  ADMIN_HISTORY_FILTER_OPTIONS,
  getAdminBotClassSummary,
  getAdminMatchDurationLabel,
  getAdminMatchRoundsLabel,
  getAdminQuizCardData,
  toMillis
} from '../app/helpers';

export default function AdminHistoryScreen({ vm }) {
  const {
    adminHistoryDateLabel,
    adminHistoryFilter,
    adminHistoryTodayBaseMatches,
    adminHistoryTodayMatches,
    adminMatchCodeById,
    adminMatchesLoading,
    screen,
    setAdminHistoryFilter,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={`screen ${screen === 'admin-history' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>Historico Do Dia</h2>
      </div>
      <div className="admin-monitor-date-label">Data: {adminHistoryDateLabel}</div>
      <div className="admin-monitor-filters">
        {ADMIN_HISTORY_FILTER_OPTIONS.map((filter) => (
          <button
            key={filter.id}
            className={`admin-monitor-filter-btn ${adminHistoryFilter === filter.id ? 'active' : ''}`}
            onClick={() => setAdminHistoryFilter(filter.id)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="admin-monitor-filter-summary">
        Exibindo {adminHistoryTodayMatches.length} de {adminHistoryTodayBaseMatches.length} registros.
      </div>
      <div className="admin-monitor-list">
        {adminMatchesLoading ? (
          <div className="ranking-loading">Carregando histórico...</div>
        ) : adminHistoryTodayMatches.length ? adminHistoryTodayMatches.map((row) => {
          const isBotQuizHistory = row?.is_bot_quiz === true;
          const winnerId = String(row?.winner_user_id || '').trim();
          const player1Id = String(row?.player1_user_id || '').trim();
          const winnerName = winnerId
            ? (winnerId === player1Id ? (row.player1_nickname || 'Jogador 1') : (row.player2_nickname || 'Jogador 2'))
            : 'Empate';
          const quizBatchId = String(row?.bot_quiz_batch_id || row?.id || '').trim();
          const displayCode = isBotQuizHistory
            ? `QUIZ-${quizBatchId ? quizBatchId.slice(-6) : 'HIST'}`
            : (adminMatchCodeById.get(String(row?.id || '')) || String(row?.id || '--'));
          const botClassSummary = getAdminBotClassSummary(row);
          const startedAtLabel = toMillis(row.created_at)
            ? new Date(toMillis(row.created_at)).toLocaleTimeString('pt-BR')
            : '--:--';
          const endedAtLabel = toMillis(row.ended_at || row.updated_at)
            ? new Date(toMillis(row.ended_at || row.updated_at)).toLocaleTimeString('pt-BR')
            : '--:--';
          const durationLabel = getAdminMatchDurationLabel(row, Date.now());
          if (isBotQuizHistory) {
            const quizData = getAdminQuizCardData(row);
            const quizBotLabel = String(row?.player1_nickname || 'Bot').trim() || 'Bot';
            return (
              <div key={`history_${row.id}`} className="admin-monitor-item admin-monitor-item-quiz">
                <div className="admin-monitor-item-head">
                  <span className="admin-monitor-item-id">{displayCode}</span>
                  <span className="admin-monitor-status status-finished">Quiz finalizado</span>
                </div>
                <div className="admin-monitor-quiz-header">
                  <strong className="admin-monitor-quiz-title">Quiz Solo</strong>
                  <span className="admin-monitor-quiz-bot">{quizBotLabel}</span>
                </div>
                <div className="admin-monitor-quiz-result">
                  <strong className="admin-monitor-quiz-score">
                    {quizData.correctCount}/{quizData.totalQuestions} acertos
                  </strong>
                  <span className="admin-monitor-quiz-accuracy">{quizData.accuracyPct}% precisao</span>
                </div>
                <div className="admin-monitor-quiz-chips">
                  <span className="admin-monitor-quiz-chip">{quizData.difficultyLabel}</span>
                  <span className="admin-monitor-quiz-chip">{quizData.languageLabel}</span>
                  <span className="admin-monitor-quiz-chip">{quizData.topicLabel}</span>
                  {botClassSummary ? <span className="admin-monitor-quiz-chip">{botClassSummary}</span> : null}
                </div>
                <div className="admin-monitor-quiz-meta-grid">
                  <div className="admin-monitor-quiz-meta-item">
                    <span>Inicio</span>
                    <strong>{startedAtLabel}</strong>
                  </div>
                  <div className="admin-monitor-quiz-meta-item">
                    <span>Fim</span>
                    <strong>{endedAtLabel}</strong>
                  </div>
                  <div className="admin-monitor-quiz-meta-item">
                    <span>Duracao</span>
                    <strong>{durationLabel}</strong>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={`history_${row.id}`} className="admin-monitor-item admin-monitor-item-pvp admin-monitor-item-pvp-history">
              <div className="admin-monitor-item-head">
                <span className="admin-monitor-item-id">{displayCode}</span>
                <span className="admin-monitor-status status-finished">
                  Finalizada
                </span>
              </div>
              <div className="admin-monitor-versus">
                <span className="admin-monitor-player-name">{row.player1_nickname || 'Jogador 1'}</span>
                <strong className="admin-monitor-score-pill">{Math.max(0, Number(row.player1_score || 0))} x {Math.max(0, Number(row.player2_score || 0))}</strong>
                <span className="admin-monitor-player-name">{row.player2_nickname || 'Jogador 2'}</span>
              </div>
              <div className="admin-monitor-meta-row">
                <span className="admin-monitor-meta-chip">Vencedor {winnerName}</span>
                <span className="admin-monitor-meta-chip">Inicio {startedAtLabel}</span>
                <span className="admin-monitor-meta-chip">Fim {endedAtLabel}</span>
                <span className="admin-monitor-meta-chip">Rodadas {getAdminMatchRoundsLabel(row)}</span>
                <span className="admin-monitor-meta-chip">Duracao {durationLabel}</span>
                {botClassSummary ? <span className="admin-monitor-meta-chip">{botClassSummary}</span> : null}
              </div>
            </div>
          );
        }) : (
          <div className="ranking-empty">
            {adminHistoryFilter === 'all'
              ? 'Sem partidas finalizadas hoje.'
              : 'Sem partidas para este filtro hoje.'}
          </div>
        )}
      </div>
    </div>
  );
}
