import { ArrowRight, Check, Swords, Target } from 'lucide-react';
import { PageHeader, cx } from '../ui';
import styles from './PlayModeScreen.module.css';

function ModeCard({ variant, icon: Icon, kicker, title, points, cta, onClick }) {
  return (
    <button type="button" className={cx(styles.mode, styles[variant])} onClick={onClick}>
      <span className={styles.modeHead}>
        <span className={styles.modeIcon} aria-hidden="true"><Icon strokeWidth={2.4} /></span>
        <span>
          <span className={styles.modeKicker}>{kicker}</span>
          <span className={styles.modeTitle}>{title}</span>
        </span>
      </span>
      <ul className={styles.points}>
        {points.map((point) => (
          <li key={point} className={styles.point}>
            <Check aria-hidden="true" strokeWidth={3} />
            {point}
          </li>
        ))}
      </ul>
      <span className={styles.cta}>
        {cta}
        <ArrowRight aria-hidden="true" strokeWidth={2.8} />
      </span>
      <Icon className={styles.decor} aria-hidden="true" strokeWidth={1.4} />
    </button>
  );
}

export default function PlayModeScreen({ vm }) {
  const { startPveFlow, startPvpFlow } = vm;

  return (
    <div className={styles.screen}>
      <PageHeader title="Jogar" subtitle="Treine sozinho nas trilhas ou desafie outros jogadores na arena." />

      <section className={styles.modes} aria-label="Modos de jogo">
        <ModeCard
          variant="pve"
          icon={Target}
          kicker="Modo solo"
          title="Treino PvE"
          points={['Trilhas em 3 áreas de conhecimento', 'Níveis iniciante, intermediário e avançado', 'Ganhe XP, moedas e estrelas']}
          cta="Escolher área"
          onClick={startPveFlow}
        />
        <ModeCard
          variant="pvp"
          icon={Swords}
          kicker="Online"
          title="Arena PvP"
          points={['Duelo 1x1 em tempo real', 'Batalha em equipe e eliminatória', 'Suba de liga e no ranking']}
          cta="Entrar na arena"
          onClick={startPvpFlow}
        />
      </section>
    </div>
  );
}
