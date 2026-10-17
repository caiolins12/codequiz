import { Brain, Flame, LockKeyhole, RefreshCcw, Swords, Trophy, Zap, Route } from 'lucide-react';
import { cx } from '../ui';
import styles from './LoginScreen.module.css';

const FEATURES = [
  {
    key: 'pve',
    icon: Route,
    color: 'var(--cq-grad-primary)',
    title: 'Trilhas PvE',
    description: 'Programação, assuntos gerais e teologia em trilhas com três níveis.'
  },
  {
    key: 'pvp',
    icon: Swords,
    color: 'var(--cq-grad-pink)',
    title: 'Arena PvP',
    description: 'Duelos 1x1, batalhas em equipe e eliminatórias em tempo real.'
  },
  {
    key: 'rank',
    icon: Trophy,
    color: 'var(--cq-grad-gold)',
    title: 'Ranking e loja',
    description: 'Suba de liga, ganhe moedas e personalize seu perfil.'
  }
];

function HeroArt({ className }) {
  return (
    <div className={cx(styles.art, className)} aria-hidden="true">
      <div className={styles.artCard}>
        <span className={styles.artQuestion} />
        <span className={styles.artQuestionShort} />
        <div className={styles.artAnswers}>
          <span className={cx(styles.artAnswer, styles.artA)} />
          <span className={cx(styles.artAnswer, styles.artB, styles.artCorrect)} />
          <span className={cx(styles.artAnswer, styles.artC)} />
          <span className={cx(styles.artAnswer, styles.artD)} />
        </div>
      </div>
      <span className={cx(styles.artChip, styles.artXp)}><Zap strokeWidth={2.6} /> +30 XP</span>
      <span className={cx(styles.artChip, styles.artStreak)}><Flame strokeWidth={2.6} /> 5 seguidas</span>
      <span className={cx(styles.artChip, styles.artTrophy)}><Trophy strokeWidth={2.6} /> Liga Ouro</span>
    </div>
  );
}

export default function LoginScreen({ vm }) {
  const { googleButtonContainerRef, googleSignInBusy } = vm;

  return (
    <div className={styles.screen}>
      <div className={styles.layout}>
        <section className={styles.hero}>
          <div className={styles.heroTop}>
            <div className={styles.brand}>
              <span className={styles.brandMark} aria-hidden="true"><Brain strokeWidth={2.4} /></span>
              <span className={styles.brandText}>
                <span className={styles.brandName}>Brain Versus Brain</span>
                <span className={styles.brandTag}>BVB Game</span>
              </span>
            </div>
            <HeroArt className={styles.artMobile} />
          </div>
          <h1 className={styles.title}>
            Aprenda jogando,{' '}
            <span className={styles.titleAccent}>suba no ranking.</span>
          </h1>
          <p className={styles.lead}>
            Quizzes por tema, batalhas em tempo real e um passe de evolução cheio de recompensas.
          </p>
          <ul className={styles.features} aria-label="O que você encontra no Brain Versus Brain">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.key} className={styles.feature}>
                  <span className={styles.featureIcon} style={{ background: feature.color }} aria-hidden="true">
                    <Icon strokeWidth={2.5} />
                  </span>
                  <span className={styles.featureTitle}>{feature.title}</span>
                  <span className={styles.featureDesc}>{feature.description}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <div className={styles.side}>
          <HeroArt className={styles.artDesktop} />
        <section className={styles.card} aria-labelledby="login-title">
          <h2 id="login-title" className={styles.cardTitle}>Entre para jogar</h2>
          <p className={styles.cardText}>Use sua conta Google. Seu progresso fica salvo e sincronizado.</p>
          <div
            ref={googleButtonContainerRef}
            className={cx(styles.googleSlot, googleSignInBusy ? styles.googleSlotBusy : '')}
            aria-busy={googleSignInBusy}
          />
          {googleSignInBusy ? (
            <span className={styles.busy} role="status">
              <span className={styles.busySpinner} aria-hidden="true" />
              Conectando com o Google...
            </span>
          ) : null}
          <div className={styles.trust}>
            <span className={styles.trustItem}>
              <LockKeyhole aria-hidden="true" strokeWidth={2.5} />
              Login seguro pelo Google, sem senha no BVB.
            </span>
            <span className={styles.trustItem}>
              <RefreshCcw aria-hidden="true" strokeWidth={2.5} />
              Progresso, moedas e cosméticos sincronizados em qualquer aparelho.
            </span>
          </div>
          <p className={styles.legal}>
            Ao entrar, você concorda com os <a href="/termos">Termos de Uso</a> e a{' '}
            <a href="/privacidade">Política de Privacidade</a>.
          </p>
        </section>
        </div>
      </div>
    </div>
  );
}
