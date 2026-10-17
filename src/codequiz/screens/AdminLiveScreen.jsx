import { DIFFICULTY_LABELS, QUESTIONS_PER_ROUND } from '../lib/constants';
import {
  getAdminBotClassSummary,
  getAdminMatchDurationLabel,
  getAdminMatchRoundsLabel,
  getAdminMatchTypeLabel,
  getAdminQuizCardData,
  toMillis
} from '../app/helpers';

export default function AdminLiveScreen({ vm }) {
  const {
    adminLiveMatches,
    adminMatchCodeById,
    adminMatchesLoading,
    screen,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={`screen ${screen === 'admin-live' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>Partidas Ao Vivo</h2>
      </div>
      <div className="admin-monitor-list">
        {adminMatchesLoading ? (
          <div className="ranking-loading">Carregando partidas...</div>
        ) : adminLiveMatches.length ? adminLiveMatches.map((row) => {
          const isBotQuizLive = row?.is_bot_quiz === true;
          const status = String(row?.status || '').trim().toLowerCase();
          const statusLabel = isBotQuizLive
            ? 'Quiz em andamento'
            : status === 'pending_accept'
              ? 'Aguardando aceite'
              : status === 'matched'
                ? 'Pareando'
                : status === 'starting'
                  ? 'Inicializando'
                  : status === 'round_result'
                    ? 'Resultado da rodada'
                    : 'Em andamento';
          const quizBatchId = String(row?.bot_quiz_batch_id || row?.id || '').trim();
          const displayCode = isBotQuizLive
            ? `QUIZ-${quizBatchId ? quizBatchId.slice(-6) : 'LIVE'}`
            : (adminMatchCodeById.get(String(row?.id || '')) || String(row?.id || '--'));
          const quizData = isBotQuizLive ? getAdminQuizCardData(row) : null;
          const quizBotLabel = String(row?.player1_nickname || 'Bot').trim() || 'Bot';
          const botClassSummary = getAdminBotClassSummary(row);
          const startedAtLabel = toMillis(row.created_at)
            ? new Date(toMillis(row.created_at)).toLocaleTimeString('pt-BR')
            : '--:--';
          const updatedAtLabel = toMillis(row.updated_at)
            ? new Date(toMillis(row.updated_at)).toLocaleTimeString('pt-BR')
            : '--:--';
          const durationLabel = getAdminMatchDurationLabel(row, Date.now());
          const matchTypeLabel = getAdminMatchTypeLabel(row);
          if (isBotQuizLive) {
            return (
              <div key={`live_${row.id}`} className="admin-monitor-item admin-monitor-item-quiz">
                <div className="admin-monitor-item-head">
                  <span className="admin-monitor-item-id">{displayCode}</span>
                  <span className={`admin-monitor-status status-${status}`}>{statusLabel}</span>
                </div>
                <div className="admin-monitor-quiz-header">
                  <strong className="admin-monitor-quiz-title">Quiz Solo</strong>
                  <span className="admin-monitor-quiz-bot">{quizBotLabel}</span>
                </div>
                <div className="admin-monitor-quiz-chips">
                  <span className="admin-monitor-quiz-chip">{quizData?.difficultyLabel || DIFFICULTY_LABELS.easy}</span>
                  <span className="admin-monitor-quiz-chip">{quizData?.languageLabel || '--'}</span>
                  <span className="admin-monitor-quiz-chip">{quizData?.topicLabel || '--'}</span>
                  <span className="admin-monitor-quiz-chip">{Math.max(1, Number(quizData?.totalQuestions || QUESTIONS_PER_ROUND))} questões</span>
                  {botClassSummary ? <span className="admin-monitor-quiz-chip">{botClassSummary}</span> : null}
                </div>
                <div className="admin-monitor-quiz-meta-grid">
                  <div className="admin-monitor-quiz-meta-item">
                    <span>Iniciada</span>
                    <strong>{startedAtLabel}</strong>
                  </div>
                  <div className="admin-monitor-quiz-meta-item">
                    <span>Atualizada</span>
                    <strong>{updatedAtLabel}</strong>
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
            <div key={`live_${row.id}`} className="admin-monitor-item admin-monitor-item-pvp admin-monitor-item-pvp-live">
              <div className="admin-monitor-item-head">
                <span className="admin-monitor-item-id">{displayCode}</span>
                <span className={`admin-monitor-status status-${status}`}>{statusLabel}</span>
              </div>
              <div className="admin-monitor-versus">
                <span className="admin-monitor-player-name">{row.player1_nickname || 'Jogador 1'}</span>
                <strong className="admin-monitor-score-pill">{Math.max(0, Number(row.player1_score || 0))} x {Math.max(0, Number(row.player2_score || 0))}</strong>
                <span className="admin-monitor-player-name">{row.player2_nickname || 'Jogador 2'}</span>
              </div>
              <div className="admin-monitor-meta-row">
                <span className="admin-monitor-meta-chip">Iniciada {startedAtLabel}</span>
                <span className="admin-monitor-meta-chip">Atualizada {updatedAtLabel}</span>
                <span className="admin-monitor-meta-chip">Rodadas {getAdminMatchRoundsLabel(row)}</span>
                <span className="admin-monitor-meta-chip">Duracao {durationLabel}</span>
                <span className="admin-monitor-meta-chip">Tipo {matchTypeLabel}</span>
                {botClassSummary ? <span className="admin-monitor-meta-chip">{botClassSummary}</span> : null}
              </div>
            </div>
          );
        }) : (
          <div className="ranking-empty">Nenhuma partida em tempo real no momento.</div>
        )}
      </div>
    </div>
  );
}
