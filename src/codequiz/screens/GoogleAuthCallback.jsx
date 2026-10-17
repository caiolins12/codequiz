'use client';

// Destino da janela de login do Google (ver lib/googlePagePopup.js): entrega o
// id_token para a aba do jogo e fecha. Se o navegador nao deixar fechar, mostra
// um aviso com o caminho de volta.
import { useEffect, useState } from 'react';
import { publishGooglePageResult } from '../lib/googlePagePopup';
import styles from './GoogleAuthCallback.module.css';

export default function GoogleAuthCallback() {
  const [status, setStatus] = useState('working');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const idToken = params.get('id_token') || '';
    const error = params.get('error') || '';
    const state = params.get('state') || '';
    // Tira o token da barra de endereco e do historico.
    window.history.replaceState(null, '', window.location.pathname);

    if (!state || (!idToken && !error)) {
      setStatus('empty');
      return undefined;
    }
    publishGooglePageResult({ state, idToken, error });
    window.close();
    const timer = window.setTimeout(() => setStatus(idToken ? 'done' : 'cancelled'), 600);
    return () => window.clearTimeout(timer);
  }, []);

  if (status === 'working') return <div className={styles.page} />;

  const title = status === 'done' ? 'Login concluído' : status === 'cancelled' ? 'Login cancelado' : 'Nada por aqui';
  const text = status === 'done'
    ? 'Pode fechar esta aba e voltar para o jogo.'
    : 'Volte para o jogo e toque em "Continuar com o Google" para entrar.';

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
        <button type="button" className={styles.button} onClick={() => window.location.replace('/')}>
          Voltar ao jogo
        </button>
      </main>
    </div>
  );
}
