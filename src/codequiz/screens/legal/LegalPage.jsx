// Layout das páginas públicas de Política de Privacidade e Termos de Uso.
import styles from './LegalPage.module.css';

export const LEGAL_LAST_UPDATED = '17 de outubro de 2026';
export const LEGAL_CONTACT_EMAIL = 'caiolins12@gmail.com';

export default function LegalPage({ title, intro, children }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="Brain Versus Brain — início">
          <span className={styles.brandMark} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 18V5" />
              <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
              <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
              <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
              <path d="M18 18a4 4 0 0 0 2-7.464" />
              <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" />
              <path d="M6 18a4 4 0 0 1-2-7.464" />
              <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
            </svg>
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Brain Versus Brain</span>
            <span className={styles.brandTag}>BVB Game</span>
          </span>
        </a>
        <nav className={styles.nav} aria-label="Documentos">
          <a href="/privacidade">Privacidade</a>
          <a href="/termos">Termos de uso</a>
          <a href="/">Jogar</a>
        </nav>
      </header>

      <main className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.updated}>Última atualização: {LEGAL_LAST_UPDATED}</p>
        {intro ? <p className={styles.intro}>{intro}</p> : null}
        <div className={styles.content}>{children}</div>
      </main>

      <footer className={styles.footer}>
        <span>Brain Versus Brain (BVB Game)</span>
        <span>Dúvidas: <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a></span>
      </footer>
    </div>
  );
}
