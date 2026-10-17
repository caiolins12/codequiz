import {
  AlarmClock,
  ArrowRight,
  BookOpenCheck,
  ChevronRight,
  CircleCheck,
  CircleX,
  House,
  Medal,
  Sparkles,
  Star,
  Ticket,
  Trophy
} from 'lucide-react';
import { getDidacticExplainText } from '../app/helpers';
import { DIFFICULTY_LABELS } from '../lib/constants';
import { getAvatarFrameClass, getAvatarFrameStyle, getDisplayAvatar } from '../lib/shop';
import { calculateStars } from '../lib/utils';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CoinIcon,
  Confetti,
  ProgressBar,
  ProgressRing,
  SectionHeader,
  StatTile,
  XpIcon,
  cx
} from '../ui';
import game from './shared/Game.module.css';
import styles from './shared/Outcome.module.css';

const DIFFICULTY_TONES = { easy: 'lime', medium: 'orange', hard: 'pink' };

function reviewStatus(row) {
  if (row?.isCorrect) return { icon: CircleCheck, className: styles.statusOk, label: 'Acertou' };
  if (row?.isTimeout) return { icon: AlarmClock, className: styles.statusTime, label: 'Tempo esgotado' };
  if (row?.wasAnswered === false) return { icon: BookOpenCheck, className: styles.statusTime, label: 'Não respondida' };
  return { icon: CircleX, className: styles.statusBad, label: 'Errou' };
}

export default function ResultScreen({ vm }) {
  const {
    buildCosmeticSnapshot,
    progress,
    quizRankingLoading,
    quizRankingRows,
    resetQuizFlow,
    resultState,
    selectedLanguageMeta,
    selectedTopicMeta,
    setScreen,
    xpForNextLevel,
    xpPercent
  } = vm;

  const correct = Math.max(0, Number(resultState?.correctCount || 0));
  const total = Math.max(0, Number(resultState?.totalQuestions || 0));
  const scorePct = Math.max(0, Math.min(100, Number(resultState?.scorePct || 0)));
  const stars = total ? calculateStars(correct, total) : 0;
  const tier = scorePct >= 90 ? 'great' : (scorePct >= 65 ? 'ok' : 'low');
  const heroTitle = tier === 'great' ? 'Excelente!' : (tier === 'ok' ? 'Muito bem!' : 'Continue praticando');
  const HeroIcon = tier === 'great' ? Trophy : (tier === 'ok' ? Medal : BookOpenCheck);
  const difficulty = resultState?.difficulty || 'easy';
  const review = Array.isArray(resultState?.questionReview) ? resultState.questionReview : [];
  const unlocked = Array.isArray(resultState?.unlockedAchievements) ? resultState.unlockedAchievements : [];
  const ranking = Array.isArray(quizRankingRows) ? quizRankingRows.slice(0, 5) : [];

  return (
    <div className={game.game}>
      {tier !== 'low' && resultState?.rewardsCollected ? <Confetti count={70} seed={correct + total} /> : null}
      <main className={styles.resultLayout}>
        <div className={styles.column}>
          <section className={cx(styles.hero, styles[tier])}>
            <span className={styles.heroIcon} aria-hidden="true"><HeroIcon strokeWidth={2.4} /></span>
            <h1 className={styles.heroTitle}>{heroTitle}</h1>
            <div className={styles.stars} role="img" aria-label={`${stars} de 3 estrelas`}>
              {[0, 1, 2].map((index) => (
                <Star key={index} className={cx(styles.star, index < stars ? styles.starOn : '')} fill="currentColor" strokeWidth={0} aria-hidden="true" />
              ))}
            </div>
            <div className={styles.heroMeta}>
              <Badge tone="violet">{selectedLanguageMeta?.name || resultState?.language || 'Trilha'}</Badge>
              <Badge tone="cyan">{selectedTopicMeta?.name || resultState?.topic || 'Tema'}</Badge>
              <Badge tone={DIFFICULTY_TONES[difficulty] || 'lime'}>{DIFFICULTY_LABELS[difficulty] || DIFFICULTY_LABELS.easy}</Badge>
            </div>
          </section>

          <Card padding="lg">
            <div className={styles.scoreRow}>
              <ProgressRing value={scorePct} size={96} stroke={10} tone={tier === 'low' ? 'violet' : 'lime'} label="Precisão">
                <span className={styles.scoreValue}>
                  <span className={styles.scoreBig}>{scorePct}%</span>
                  <span className={styles.scoreSmall}>precisão</span>
                </span>
              </ProgressRing>
              <span className={styles.scoreValue}>
                <span className={styles.scoreBig}>{correct}/{total}</span>
                <span className={styles.scoreSmall}>acertos</span>
              </span>
            </div>
          </Card>

          <div className={styles.rewards}>
            <StatTile icon={XpIcon} label="XP" value={`+${Math.max(0, Number(resultState?.awardedXp || 0))}`} tone="blue" />
            <StatTile icon={CoinIcon} label="Moedas" value={`+${Math.max(0, Number(resultState?.awardedCoins || 0))}`} tone="gold" />
            <StatTile icon={Trophy} label="Ranking" value={`+${Math.max(0, Number(resultState?.rankingGain || 0))}`} tone="violet" />
          </div>

          {resultState?.leveledUp ? (
            <div className={styles.levelUp} role="status">
              <Sparkles aria-hidden="true" strokeWidth={2.4} />
              Você subiu para o nível {resultState?.newLevel || progress?.level}!
            </div>
          ) : null}

          <Card padding="lg" className={styles.xpLine}>
            <span className={styles.xpLabel}>
              <span>Nível {progress?.level || 1}</span>
              <span>{progress?.xp || 0}/{xpForNextLevel} XP</span>
            </span>
            <ProgressBar value={xpPercent} tone="blue" size="md" label="Progresso de XP" />
          </Card>

          {unlocked.length ? (
            <Card padding="lg">
              <SectionHeader title="Passe de Evolução" subtitle="Etapas prontas para coletar" icon={Ticket} />
              <ul className={styles.list}>
                {unlocked.map((achievement) => (
                  <li key={achievement.id} className={styles.passItem}>
                    <span className={styles.passIcon} aria-hidden="true">{achievement.icon}</span>
                    <span className={styles.passText}>
                      <span>{achievement.name}</span>
                      <span className={styles.passReward}>
                        +{Math.max(0, Number(achievement?.rewardXp || 0))} XP · +{Math.max(0, Number(achievement?.rewardCoins || 0))} moedas
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <Button variant="warning" size="sm" iconRight={ChevronRight} onClick={() => setScreen('achievements')}>
                Coletar no passe
              </Button>
            </Card>
          ) : null}

          <div className={styles.actionsRow}>
            <Button size="lg" variant="success" iconRight={ArrowRight} onClick={() => setScreen('difficulty')}>
              Novo desafio
            </Button>
            <Button
              size="lg"
              variant="secondary"
              icon={House}
              onClick={() => {
                resetQuizFlow();
                setScreen('home');
              }}
            >
              Voltar ao início
            </Button>
          </div>
        </div>

        <div className={styles.column}>
          {review.length ? (
            <Card padding="lg">
              <SectionHeader title="Revisão da rodada" subtitle="Toque numa pergunta para ver a explicação." icon={BookOpenCheck} />
              <ol className={styles.list}>
                {review.map((row, index) => {
                  const status = reviewStatus(row);
                  const StatusIcon = status.icon;
                  const options = Array.isArray(row?.opts) ? row.opts : [];
                  const correctIndex = Number(row?.correctIndex ?? -1);
                  const selectedIndex = Number(row?.selectedIndex ?? -1);
                  const correctOption = correctIndex >= 0 && correctIndex < options.length ? options[correctIndex] : '';
                  const selectedOption = selectedIndex >= 0 && selectedIndex < options.length ? options[selectedIndex] : '';
                  return (
                    <li key={`review_${index}`}>
                      <details className={styles.review}>
                        <summary className={styles.reviewSummary}>
                          <span className={cx(styles.reviewStatus, status.className)} title={status.label}>
                            <StatusIcon aria-hidden="true" strokeWidth={2.6} />
                            <span className="cq-visually-hidden">{status.label}</span>
                          </span>
                          <span className={styles.reviewQuestion}>
                            {Math.max(1, Number(row?.index || index + 1))}. {row?.q || 'Pergunta sem texto'}
                          </span>
                          <ChevronRight className={styles.reviewChevron} aria-hidden="true" strokeWidth={2.6} />
                        </summary>
                        <div className={styles.reviewBody}>
                          <p className={styles.reviewFull}>{row?.q}</p>
                          {correctOption ? (
                            <div className={cx(styles.answerRow, styles.answerCorrect)}>
                              <CircleCheck aria-hidden="true" strokeWidth={2.6} />
                              <span><span className={styles.answerLabel}>Correta</span>{correctOption}</span>
                            </div>
                          ) : null}
                          {!row?.isCorrect && selectedOption ? (
                            <div className={cx(styles.answerRow, styles.answerWrong)}>
                              <CircleX aria-hidden="true" strokeWidth={2.6} />
                              <span><span className={styles.answerLabel}>Sua resposta</span>{selectedOption}</span>
                            </div>
                          ) : null}
                          <p className={styles.reviewExplain}>{getDidacticExplainText(row)}</p>
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ol>
            </Card>
          ) : null}

          <Card padding="lg">
            <SectionHeader title="Ranking deste quiz" icon={Trophy} />
            {quizRankingLoading ? (
              <p className={styles.muted}>Carregando ranking...</p>
            ) : ranking.length ? (
              <ol className={styles.list}>
                {ranking.map((row, index) => {
                  const rowShop = buildCosmeticSnapshot(row.equipped_frame, row.equipped_background, row.equipped_emoji);
                  const rowAvatar = getDisplayAvatar(row.avatar || '🤓', rowShop);
                  return (
                    <li key={`${row.user_id}_${index}`} className={styles.rankRow}>
                      <span className={styles.rankPos}>{index + 1}</span>
                      <Avatar avatar={rowAvatar} frameClass={getAvatarFrameClass(rowShop)} frameStyle={getAvatarFrameStyle(rowShop)} size="xs" />
                      <span className={styles.rankName}>{row.nickname || 'Jogador'}</span>
                      <span className={styles.rankScore}>{row.correct_count}/{row.total_questions}</span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className={styles.muted}>Ainda não há resultados neste quiz.</p>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
