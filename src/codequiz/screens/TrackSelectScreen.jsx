import { ChevronRight } from 'lucide-react';
import { KNOWLEDGE_AREAS } from '../app/helpers';
import { TOPICS } from '../data/questions-data';
import { getTopicsByLanguage } from '../lib/quizEngine';
import { Badge, PageHeader, ProgressBar, SectionHeader, cx } from '../ui';
import styles from './shared/PveLists.module.css';

function trackStatus(progress) {
  if (progress >= 100) return { label: 'Concluída', tone: 'lime' };
  if (progress > 0) return { label: 'Em andamento', tone: 'cyan' };
  return { label: 'Nova', tone: 'violet' };
}

export default function TrackSelectScreen({ vm }) {
  const {
    languageProgress,
    languageThemeSections,
    selectedKnowledgeArea,
    selectedLanguage,
    setScreen,
    setSelectedLanguage,
    setSelectedTopic,
    triggerAppBackNavigation
  } = vm;

  const area = KNOWLEDGE_AREAS.find((entry) => entry.id === selectedKnowledgeArea) || null;

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow={area ? `${area.icon} ${area.name}` : 'Treino PvE'}
        title="Escolha uma trilha"
        subtitle="Trilhas organizadas por tema para facilitar sua evolução."
        onBack={() => triggerAppBackNavigation('button')}
      />
      {languageThemeSections.map((section) => (
        <section key={section.id} className={styles.section}>
          <SectionHeader title={section.label} subtitle={section.desc} />
          <ul className={cx(styles.grid, styles.gridWide)}>
            {section.items.map((language) => {
              const progress = Math.round(Number(languageProgress.get(language.id) || 0));
              const status = trackStatus(progress);
              return (
                <li key={language.id}>
                  <button
                    type="button"
                    className={cx(styles.item, selectedLanguage === language.id ? styles.itemActive : '')}
                    style={{ '--item-color': language.color }}
                    onClick={() => {
                      setSelectedLanguage(language.id);
                      const topics = getTopicsByLanguage(TOPICS, language.id);
                      setSelectedTopic(topics[0]?.id || '');
                      setScreen('topic');
                    }}
                  >
                    <span className={styles.itemIcon} aria-hidden="true">{language.icon}</span>
                    <span className={styles.itemBody}>
                      <span className={styles.itemTop}>
                        <span className={styles.itemName}>{language.name}</span>
                      </span>
                      <span className={styles.itemDesc}>{language.desc}</span>
                      <span className={styles.itemProgress}>
                        <Badge tone={status.tone} size="sm">{status.label}</Badge>
                        <ProgressBar value={progress} size="xs" tone="violet" className={styles.itemBar} label={`Progresso em ${language.name}`} />
                        <span>{progress}%</span>
                      </span>
                    </span>
                    <span className={styles.chevron} aria-hidden="true"><ChevronRight strokeWidth={2.6} /></span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
