import { useState } from 'react';
import { BookOpen, ChevronRight, Target } from 'lucide-react';
import { Badge, Modal, PageHeader, ProgressBar, ProgressRing, StatTile, cx } from '../ui';
import DifficultyOptions from './shared/DifficultyOptions';
import styles from './shared/PveLists.module.css';

function topicStatus(pct) {
  if (pct >= 80) return { label: 'Dominado', tone: 'lime' };
  if (pct > 0) return { label: `${pct}%`, tone: 'cyan' };
  return { label: 'Novo', tone: 'violet' };
}

export default function TopicScreen({ vm }) {
  const {
    beginPveRound,
    languageProgress,
    selectedLanguage,
    selectedLanguageMeta,
    selectedTopic,
    selectedTopicDifficultyProgress,
    selectedTopicMeta,
    selectedTopicQuestionCountByDifficulty,
    selectedTopics,
    setSelectedTopic,
    topicProgress,
    topicQuestionCountByDifficulty,
    triggerAppBackNavigation
  } = vm;

  const [pickerOpen, setPickerOpen] = useState(false);
  const trackName = selectedLanguageMeta?.name || 'Tópicos';
  const trackProgress = Math.round(Number(languageProgress.get(selectedLanguage) || 0));
  const masteredCount = selectedTopics.filter((topic) => Number(topicProgress.get(topic.id) || 0) >= 80).length;

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow="Trilha"
        title={trackName}
        subtitle="Escolha um tópico e depois a dificuldade."
        onBack={() => triggerAppBackNavigation('button')}
      />

      <div className={styles.topicsLayout}>
        <aside className={styles.summary} style={{ '--summary-color': selectedLanguageMeta?.color || '#7b5cff' }}>
          <div className={styles.summaryTop}>
            <span className={styles.summaryIcon} aria-hidden="true">{selectedLanguageMeta?.icon || '📘'}</span>
            <div>
              <h2 className={styles.summaryName}>{trackName}</h2>
              <p className={styles.summaryDesc}>{selectedLanguageMeta?.desc || 'Escolha um tópico para começar.'}</p>
            </div>
          </div>
          <div className={styles.summaryStats}>
            <StatTile icon={BookOpen} label="Tópicos" value={selectedTopics.length} tone="violet" />
            <StatTile icon={Target} label="Dominados" value={masteredCount} tone="lime" />
          </div>
          <div className={styles.summaryProgress}>
            <ProgressRing value={trackProgress} size={56} stroke={6} tone="cyan" label="Progresso da trilha">
              <strong className={styles.summaryPct}>{trackProgress}%</strong>
            </ProgressRing>
            <span className={styles.itemDesc}>Progresso médio dos tópicos desta trilha.</span>
          </div>
        </aside>

        <ul className={cx(styles.grid, styles.topicGrid)}>
          {selectedTopics.map((topic) => {
            const pct = Math.round(Number(topicProgress.get(topic.id) || 0));
            const status = topicStatus(pct);
            const perDiff = topicQuestionCountByDifficulty.get(topic.id) || { easy: 0, medium: 0, hard: 0 };
            return (
              <li key={topic.id}>
                <button
                  type="button"
                  className={cx(styles.item, selectedTopic === topic.id ? styles.itemActive : '')}
                  style={{ '--item-color': selectedLanguageMeta?.color || '#7b5cff' }}
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    setPickerOpen(true);
                  }}
                >
                  <span className={styles.itemIcon} aria-hidden="true">{topic.emoji}</span>
                  <span className={styles.itemBody}>
                    <span className={styles.itemTop}>
                      <span className={styles.itemName}>{topic.name}</span>
                      <Badge tone={status.tone} size="sm">{status.label}</Badge>
                    </span>
                    <span className={styles.itemDesc}>{topic.desc}</span>
                    <span className={styles.counts} aria-label="Perguntas por nível">
                      <span className={styles.count}><span className={cx(styles.dot, styles.dotEasy)} />{perDiff.easy || 0}</span>
                      <span className={styles.count}><span className={cx(styles.dot, styles.dotMedium)} />{perDiff.medium || 0}</span>
                      <span className={styles.count}><span className={cx(styles.dot, styles.dotHard)} />{perDiff.hard || 0}</span>
                    </span>
                    <span className={styles.itemProgress}>
                      <ProgressBar value={pct} size="xs" tone="violet" className={styles.itemBar} label={`Progresso em ${topic.name}`} />
                      <span>{pct}%</span>
                    </span>
                  </span>
                  <span className={styles.chevron} aria-hidden="true"><ChevronRight strokeWidth={2.6} /></span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {pickerOpen && selectedTopicMeta ? (
        <Modal
          onClose={() => setPickerOpen(false)}
          title={selectedTopicMeta.name}
          subtitle="Escolha a dificuldade da partida."
          icon={selectedTopicMeta.emoji}
          size="md"
        >
          <DifficultyOptions
            counts={selectedTopicQuestionCountByDifficulty}
            progress={selectedTopicDifficultyProgress}
            onPick={(difficulty) => {
              setPickerOpen(false);
              beginPveRound(difficulty);
            }}
          />
        </Modal>
      ) : null}
    </div>
  );
}
