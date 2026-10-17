import { Radio } from 'lucide-react';
import { DIFFICULTY_LABELS, QUESTIONS_PER_ROUND } from '../lib/constants';
import {
  getAdminBotClassSummary,
  getAdminMatchDurationLabel,
  getAdminMatchRoundsLabel,
  getAdminMatchTypeLabel,
  getAdminQuizCardData,
  toMillis
} from '../app/helpers';
import { Badge, Card, EmptyState, PageHeader, Skeleton } from '../ui';
import AdminMatchTable, { ChipsCell, MatchCell, ScoreCell, TimeCell } from './shared/AdminMatchTable';
import styles from './AdminScreens.module.css';

const STATUS_VIEW = {
  pending_accept: { label: 'Aguardando aceite', tone: 'gold' },
  matched: { label: 'Pareando', tone: 'cyan' },
  starting: { label: 'Iniciando', tone: 'cyan' },
  round_result: { label: 'Resultado da rodada', tone: 'violet' }
};

function formatTime(value) {
  const ms = toMillis(value);
  return ms ? new Date(ms).toLocaleTimeString('pt-BR') : '--:--';
}

function buildLiveRow(row, adminMatchCodeById, nowMs) {
  const isQuiz = row?.is_bot_quiz === true;
  const status = String(row?.status || '').trim().toLowerCase();
  const botClass = getAdminBotClassSummary(row);
  const base = {
    key: `live_${row?.id}`,
    started: formatTime(row?.created_at),
    updated: formatTime(row?.updated_at),
    duration: getAdminMatchDurationLabel(row, nowMs)
  };
  if (isQuiz) {
    const quiz = getAdminQuizCardData(row);
    const batchId = String(row?.bot_quiz_batch_id || row?.id || '').trim();
    return {
      ...base,
      code: `QUIZ-${batchId ? batchId.slice(-6) : 'LIVE'}`,
      title: `Quiz solo · ${String(row?.player1_nickname || 'Bot').trim() || 'Bot'}`,
      typeLabel: 'Quiz solo',
      score: '—',
      scoreSub: `${Math.max(1, Number(quiz?.totalQuestions || QUESTIONS_PER_ROUND))} questões`,
      status: { label: 'Quiz em andamento', tone: 'lime' },
      chips: [quiz?.difficultyLabel || DIFFICULTY_LABELS.easy, quiz?.languageLabel, quiz?.topicLabel, botClass]
    };
  }
  return {
    ...base,
    code: adminMatchCodeById.get(String(row?.id || '')) || String(row?.id || '--'),
    title: `${row?.player1_nickname || 'Jogador 1'} × ${row?.player2_nickname || 'Jogador 2'}`,
    typeLabel: getAdminMatchTypeLabel(row),
    score: `${Math.max(0, Number(row?.player1_score || 0))} × ${Math.max(0, Number(row?.player2_score || 0))}`,
    scoreSub: `Rodada ${getAdminMatchRoundsLabel(row)}`,
    status: STATUS_VIEW[status] || { label: 'Em andamento', tone: 'lime' },
    chips: [botClass]
  };
}

const COLUMNS = [
  { key: 'match', label: 'Partida', mobileLabel: '', wide: true, render: (row) => <MatchCell title={row.title} code={row.code} typeLabel={row.typeLabel} /> },
  { key: 'score', label: 'Placar', render: (row) => <ScoreCell value={row.score} sub={row.scoreSub} /> },
  { key: 'status', label: 'Status', render: (row) => <Badge tone={row.status.tone} size="sm">{row.status.label}</Badge> },
  { key: 'duration', label: 'Duração', render: (row) => <TimeCell value={row.duration} /> },
  { key: 'started', label: 'Início', render: (row) => <TimeCell value={row.started} /> },
  { key: 'updated', label: 'Atualizada', render: (row) => <TimeCell value={row.updated} /> },
  { key: 'details', label: 'Detalhes', wide: true, render: (row) => <ChipsCell chips={row.chips} /> }
];

export default function AdminLiveScreen({ vm }) {
  const {
    adminLiveMatches,
    adminMatchCodeById,
    adminMatchesLoading,
    triggerAppBackNavigation
  } = vm;

  const matches = Array.isArray(adminLiveMatches) ? adminLiveMatches : [];
  const nowMs = Date.now();
  const rows = matches.map((row) => buildLiveRow(row, adminMatchCodeById, nowMs));

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow="Admin"
        title="Partidas ao vivo"
        subtitle={matches.length ? `${matches.length} partida${matches.length === 1 ? '' : 's'} em andamento.` : 'Acompanhe as partidas em tempo real.'}
        onBack={() => triggerAppBackNavigation('button')}
      />

      {adminMatchesLoading && !rows.length ? (
        <Card padding="lg" className={styles.card}>
          <Skeleton height={18} width="40%" />
          <Skeleton height={14} width="70%" />
          <Skeleton height={14} width="55%" />
        </Card>
      ) : rows.length ? (
        <AdminMatchTable columns={COLUMNS} rows={rows} caption="Partidas ao vivo" />
      ) : (
        <Card padding="lg">
          <EmptyState icon={Radio} title="Nenhuma partida ao vivo" text="Assim que uma partida começar ela aparece aqui." />
        </Card>
      )}
    </div>
  );
}
