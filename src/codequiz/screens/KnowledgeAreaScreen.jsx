import { KNOWLEDGE_AREAS } from '../app/helpers';
import { PageHeader } from '../ui';
import AreaCard, { getAreaSummary } from './shared/AreaCard';
import styles from './KnowledgeAreaScreen.module.css';

export default function KnowledgeAreaScreen({ vm }) {
  const {
    chooseKnowledgeAreaForPve,
    languageProgress,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow="Treino PvE"
        title="Escolha uma área"
        subtitle="Cada área tem trilhas com níveis iniciante, intermediário e avançado."
        onBack={() => triggerAppBackNavigation('button')}
      />
      <ul className={styles.list}>
        {KNOWLEDGE_AREAS.map((area) => (
          <li key={area.id}>
            <AreaCard
              area={area}
              summary={getAreaSummary(area.id, languageProgress)}
              onSelect={chooseKnowledgeAreaForPve}
              layout="vertical"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
