import { PageHeader } from '../ui';
import DifficultyOptions from './shared/DifficultyOptions';
import styles from './shared/PveLists.module.css';

export default function DifficultyScreen({ vm }) {
  const {
    beginPveRound,
    selectedLanguageMeta,
    selectedTopicDifficultyProgress,
    selectedTopicMeta,
    selectedTopicQuestionCountByDifficulty,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow={selectedLanguageMeta?.name || 'Treino PvE'}
        title={selectedTopicMeta ? `${selectedTopicMeta.emoji} ${selectedTopicMeta.name}` : 'Dificuldade'}
        subtitle="Escolha a dificuldade. Quanto mais difícil, maiores as recompensas."
        onBack={() => triggerAppBackNavigation('button')}
      />
      <DifficultyOptions
        layout="columns"
        counts={selectedTopicQuestionCountByDifficulty}
        progress={selectedTopicDifficultyProgress}
        onPick={beginPveRound}
      />
    </div>
  );
}
