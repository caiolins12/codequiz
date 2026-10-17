import { History } from 'lucide-react';
import {
  ADMIN_HISTORY_FILTER_OPTIONS,
  getAdminBotClassSummary,
  getAdminMatchDurationLabel,
  getAdminMatchRoundsLabel,
  getAdminMatchTypeLabel,
  getAdminQuizCardData,
  toMillis
} from '../app/helpers';
import { Card, EmptyState, PageHeader, Skeleton, Tabs } from '../ui';
import AdminMatchTable, { ChipsCell, MatchCell, ScoreCell, TimeCell } from './shared/AdminMatchTable';
import styles from './AdminScreens.module.css';

const FILTER_TABS = ADMIN_HISTORY_FILTER_OPTIONS.map((filter) => ({ value: filter.id, label: filter.label }));

function formatTime(value) {
  const ms = toMillis(value);
  return ms ? new Date(ms).toLocaleTimeString('pt-BR') : '--:--';
}

function buildHistoryRow(row, adminMatchCodeById, nowMs) {
  const isQuiz = row?.is_bot_quiz === true;
  const botClass = getAdminBotClassSummary(row);
  const base = {
    key: `history_${row?.id}`,
    started: formatTime(row?.created_at),
    ended: formatTime(row?.ended_at || row?.updated_at),
    duration: getAdminMatchDurationLabel(row, nowMs)
  };
  if (isQuiz) {
    const quiz = getAdminQuizCardData(row);
    const batchId = String(row?.bot_quiz_batch_id || row?.id || '').trim();
    return {
      ...base,
      code: `QUIZ-${batchId ? batchId.slice(-6) : 'HIST'}`,
      title: `Quiz solo · ${String(row?.player1_nickname || 'Bot').trim() || 'Bot'}`,
      typeLabel: 'Quiz solo',
      result: `${quiz.correctCount}/${quiz.totalQuestions}`,
      resultSub: `${quiz.accuracyPct}% de precisão`,
      chips: [quiz.difficultyLabel, quiz.languageLabel, quiz.topicLabel, botClass]
    };
  }
  const winnerId = String(row?.winner_user_id || '').trim();
  const player1Id = String(row?.player1_user_id || '').trim();
  const winnerName = winnerId
    ? (winnerId === player1Id ? (row?.player1_nickname || 'Jogador 1') : (row?.player2_nickname || 'Jogador 2'))
    : '';
  return {
    ...base,
    code: adminMatchCodeById.get(String(row?.id || '')) || String(row?.id || '--'),
    title: `${row?.player1_nickname || 'Jogador 1'} × ${row?.player2_nickname || 'Jogador 2'}`,
    typeLabel: getAdminMatchTypeLabel(row),
    result: `${Math.max(0, Number(row?.player1_score || 0))} × ${Math.max(0, Number(row?.player2_score || 0))}`,
    resultSub: winnerName ? `Vitória: ${winnerName}` : 'Empate',
    chips: [`Rodadas ${getAdminMatchRoundsLabel(row)}`, botClass]
  };
}

const COLUMNS = [
  { key: 'match', label: 'Partida', mobileLabel: '', wide: true, render: (row) => <MatchCell title={row.title} code={row.code} typeLabel={row.typeLabel} /> },
  { key: 'result', label: 'Resultado', render: (row) => <ScoreCell value={row.result} sub={row.resultSub} /> },
  { key: 'duration', label: 'Duração', render: (row) => <TimeCell value={row.duration} /> },
  { key: 'started', label: 'Início', render: (row) => <TimeCell value={row.started} /> },
  { key: 'ended', label: 'Fim', render: (row) => <TimeCell value={row.ended} /> },
  { key: 'details', label: 'Detalhes', wide: true, render: (row) => <ChipsCell chips={row.chips} /> }
];

export default function AdminHistoryScreen({ vm }) {
  const {
    adminHistoryDateLabel,
    adminHistoryFilter,
    adminHistoryTodayBaseMatches,
    adminHistoryTodayMatches,
    adminMatchCodeById,
    adminMatchesLoading,
    setAdminHistoryFilter,
    triggerAppBackNavigation
  } = vm;

  const matches = Array.isArray(adminHistoryTodayMatches) ? adminHistoryTodayMatches : [];
  const total = Array.isArray(adminHistoryTodayBaseMatches) ? adminHistoryTodayBaseMatches.length : 0;
  const nowMs = Date.now();
  const rows = matches.map((row) => buildHistoryRow(row, adminMatchCodeById, nowMs));

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow="Admin"
        title="Histórico do dia"
        subtitle={adminHistoryDateLabel ? `Partidas finalizadas em ${adminHistoryDateLabel}.` : 'Partidas finalizadas hoje.'}
        onBack={() => triggerAppBackNavigation('button')}
      />

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Tabs items={FILTER_TABS} value={adminHistoryFilter} onChange={setAdminHistoryFilter} size="sm" ariaLabel="Filtrar histórico" />
        </div>
        <span className={styles.summary}>Exibindo {matches.length} de {total} registros</span>
      </div>

      {adminMatchesLoading && !rows.length ? (
        <Card padding="lg" className={styles.card}>
          <Skeleton height={18} width="40%" />
          <Skeleton height={14} width="70%" />
          <Skeleton height={14} width="55%" />
        </Card>
      ) : rows.length ? (
        <AdminMatchTable columns={COLUMNS} rows={rows} caption="Histórico de partidas do dia" />
      ) : (
        <Card padding="lg">
          <EmptyState
            icon={History}
            title={adminHistoryFilter === 'all' ? 'Sem partidas finalizadas hoje' : 'Nada para este filtro'}
            text={adminHistoryFilter === 'all' ? 'As partidas aparecem aqui assim que terminam.' : 'Troque o filtro para ver outras partidas do dia.'}
          />
        </Card>
      )}
    </div>
  );
}
