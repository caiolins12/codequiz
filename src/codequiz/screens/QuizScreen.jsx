import { useEffect } from 'react';
import { Check, Flame, Heart, Menu, Music2, VolumeX } from 'lucide-react';
import { DIFFICULTY_LABELS } from '../lib/constants';
import { Badge, Button, IconButton, StatPill, TimerBar, cx } from '../ui';
import AnswerOptions from './shared/AnswerOptions';
import QuestionCard from './shared/QuestionCard';
import styles from './shared/Game.module.css';

const DIFFICULTY_TONES = { easy: 'lime', medium: 'orange', hard: 'pink' };

function segmentClass(entry, index, currentIndex) {
  if (entry) {
    if (entry.isCorrect) return styles.segCorrect;
    if (entry.isTimeout) return styles.segTimeout;
    return styles.segWrong;
  }
  return index === currentIndex ? styles.segCurrent : '';
}

export default function QuizScreen({ vm }) {
  const {
    confirmQuizAnswer,
    currentQuestion,
    handleAnswer,
    music,
    openQuizMenu,
    quizMenuOpen,
    quizQuestionHasOverflow,
    quizQuestionScrollRef,
    quizQuestionStartMs,
    quizRoundSeconds,
    quizState,
    selectedLanguageMeta,
    selectedTopicMeta
  } = vm;

  const total = quizState?.questions?.length || 0;
  const index = quizState?.index || 0;
  const answered = !!quizState?.answered;
  const selected = Number(quizState?.selectedIndex);
  const hasSelection = Number.isFinite(selected) && selected >= 0 && quizState?.selectedIndex !== null;
  const canConfirm = !!quizState && !answered && hasSelection;
  const lives = Math.max(0, Number(quizState?.lives ?? 3));
  const difficulty = quizState?.difficulty || 'easy';
  const answerLog = Array.isArray(quizState?.answerLog) ? quizState.answerLog : [];
  const optionCount = currentQuestion?.opts?.length || 0;

  // Atalhos: 1–4 / A–D escolhem, Enter confirma.
  useEffect(() => {
    const handleKey = (event) => {
      if (quizMenuOpen || answered || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const tag = String(event.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const key = String(event.key || '').toLowerCase();
      const numeric = Number(key);
      let pick = -1;
      if (Number.isInteger(numeric) && numeric >= 1 && numeric <= optionCount) pick = numeric - 1;
      else if (key.length === 1 && key >= 'a' && key <= 'd') pick = key.charCodeAt(0) - 97;
      if (pick >= 0 && pick < optionCount) {
        event.preventDefault();
        handleAnswer(pick);
        return;
      }
      if (key === 'enter' && canConfirm) {
        event.preventDefault();
        confirmQuizAnswer();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [answered, canConfirm, confirmQuizAnswer, handleAnswer, optionCount, quizMenuOpen]);

  return (
    <div className={styles.game}>
      <header className={styles.top}>
        <IconButton icon={Menu} label="Menu do quiz" variant="surface" onClick={openQuizMenu} />
        <div className={styles.topInfo}>
          <span className={styles.eyebrow}>Treino PvE · {selectedLanguageMeta?.name || quizState?.language || 'Trilha'}</span>
          <span className={styles.topTitle}>{selectedTopicMeta?.emoji ? `${selectedTopicMeta.emoji} ` : ''}{selectedTopicMeta?.name || quizState?.topic || 'Tema'}</span>
        </div>
        <Badge tone={DIFFICULTY_TONES[difficulty] || 'lime'}>{DIFFICULTY_LABELS[difficulty] || DIFFICULTY_LABELS.easy}</Badge>
        {music ? (
          <IconButton
            icon={music.enabled ? Music2 : VolumeX}
            label={music.enabled ? 'Desligar música' : 'Ligar música'}
            onClick={() => music.onToggle(!music.enabled)}
          />
        ) : null}
      </header>

      <div className={styles.statusRow}>
        <span className={styles.counter}>{Math.min(total, index + 1)}/{total || 0}</span>
        <div className={styles.segments} aria-hidden="true">
          {Array.from({ length: total }, (_, idx) => (
            <span key={idx} className={cx(styles.segment, segmentClass(answerLog.find((entry) => Number(entry?.questionIndex) === idx), idx, index))} />
          ))}
        </div>
        <div className={styles.hearts} aria-label={`${lives} vida${lives === 1 ? '' : 's'} restante${lives === 1 ? '' : 's'}`} role="img">
          {[0, 1, 2].map((idx) => (
            <Heart key={idx} className={cx(styles.heart, idx >= lives ? styles.heartLost : '')} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          ))}
        </div>
      </div>

      <div className={styles.timerRow}>
        <TimerBar
          className={styles.timerGrow}
          startedAtMs={quizQuestionStartMs}
          durationMs={Math.max(1, Number(quizRoundSeconds || 0)) * 1000}
          running={!!quizState && !answered}
        />
        <div className={styles.pills}>
          <StatPill icon={Check} value={quizState?.score || 0} label="pts" tone="lime" size="sm" ariaLabel={`${quizState?.score || 0} pontos`} />
          {quizState?.streak >= 2 ? (
            <StatPill icon={Flame} value={`${quizState.streak} seguidas`} tone="orange" size="sm" />
          ) : null}
        </div>
      </div>

      <main className={styles.stage}>
        <QuestionCard question={currentQuestion} scrollRef={quizQuestionScrollRef} hasOverflow={quizQuestionHasOverflow} />
        <AnswerOptions
          options={currentQuestion?.opts || []}
          selectedIndex={hasSelection ? selected : null}
          onSelect={handleAnswer}
          disabled={answered}
          keyPrefix={`q${index}`}
        />
      </main>

      <footer className={styles.actions}>
        <Button size="xl" variant="success" block disabled={!canConfirm} onClick={confirmQuizAnswer}>
          Confirmar resposta
        </Button>
        <span className={styles.hint}>
          Atalhos: <span className={styles.kbd}>1</span>–<span className={styles.kbd}>4</span> escolhem · <span className={styles.kbd}>Enter</span> confirma
        </span>
      </footer>
    </div>
  );
}
