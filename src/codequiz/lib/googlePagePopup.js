// Login do Google em janela propria, com a pagina normal de conta do Google.
// Usado no celular quando o botao oficial abriria o popup do GSI (cartao
// /gsi/select feito para janela de desktop, esticado numa aba inteira).
// A pagina /auth/google recebe o id_token no fragmento da URL e devolve o
// resultado para a aba do jogo por localStorage + BroadcastChannel.

export const GOOGLE_PAGE_CALLBACK_PATH = '/auth/google';

const RESULT_STORAGE_KEY = 'codequiz_google_page_result_v1';
const PENDING_STORAGE_KEY = 'codequiz_google_page_pending_v1';
const CHANNEL_NAME = 'codequiz_google_page_v1';
const MAX_AGE_MS = 10 * 60 * 1000;

function readJson(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function removeKey(storage, key) {
  try {
    storage.removeItem(key);
  } catch {
    // ignore storage failures
  }
}

function isFresh(entry) {
  return Number(entry?.at || 0) > Date.now() - MAX_AGE_MS;
}

// Aba do jogo: guarda o state e o nonce bruto antes de abrir a janela. Fica no
// sessionStorage para sobreviver a um recarregamento da aba enquanto o usuario
// esta na janela do Google.
export function savePendingGooglePage(pending) {
  try {
    window.sessionStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify({ ...pending, at: Date.now() }));
  } catch {
    // ignore storage failures
  }
}

export function readPendingGooglePage() {
  const pending = readJson(window.sessionStorage, PENDING_STORAGE_KEY);
  if (!pending?.state || !isFresh(pending)) return null;
  return pending;
}

export function clearPendingGooglePage() {
  removeKey(window.sessionStorage, PENDING_STORAGE_KEY);
}

// Retira (le e apaga) o resultado da janela, se for do login pendente.
export function takeGooglePageResult(state) {
  const result = readJson(window.localStorage, RESULT_STORAGE_KEY);
  if (!result || result.state !== state) return null;
  removeKey(window.localStorage, RESULT_STORAGE_KEY);
  return isFresh(result) ? result : null;
}

// Pagina /auth/google: entrega o resultado para a aba do jogo.
export function publishGooglePageResult(result) {
  try {
    window.localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify({ ...result, at: Date.now() }));
  } catch {
    // ignore storage failures
  }
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage('result');
    channel.close();
  } catch {
    // BroadcastChannel indisponivel: o evento storage e a volta para a aba avisam
  }
}

// Chama onSignal quando pode haver resultado novo. Alem do BroadcastChannel e do
// evento storage, confere ao voltar para a aba: no celular a aba do jogo fica
// suspensa enquanto a janela do Google esta aberta e pode perder os eventos.
export function subscribeGooglePageResult(onSignal) {
  const handleStorage = (event) => {
    if (event.key === RESULT_STORAGE_KEY && event.newValue) onSignal();
  };
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') onSignal();
  };
  let channel = null;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = () => onSignal();
  } catch {
    channel = null;
  }
  window.addEventListener('storage', handleStorage);
  window.addEventListener('focus', onSignal);
  window.addEventListener('pageshow', onSignal);
  document.addEventListener('visibilitychange', handleVisibility);
  return () => {
    channel?.close();
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('focus', onSignal);
    window.removeEventListener('pageshow', onSignal);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}
