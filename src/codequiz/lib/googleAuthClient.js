import { getSupabase } from './supabaseClient';
import {
  GOOGLE_PAGE_CALLBACK_PATH,
  clearPendingGooglePage,
  readPendingGooglePage,
  savePendingGooglePage,
  subscribeGooglePageResult,
  takeGooglePageResult
} from './googlePagePopup';

const GOOGLE_OAUTH_CLIENT_ID = String(
  process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID
  || '953175707283-btrfi33piiigrc5o1hthhcn9fumtsqm3.apps.googleusercontent.com'
).trim();

const GOOGLE_GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const AUTH_PROVIDER_ID = 'google.com';
const FEDCM_BUTTON_OFF_STORAGE_KEY = 'codequiz_gsi_fedcm_button_off_v1';
// Sem interface de FedCM (webviews, navegador embutido do app Claude) o get()
// e rejeitado em poucos ms; o usuario fechando o seletor leva bem mais que isso.
const FEDCM_NO_UI_REJECT_MS = 1000;
const NATIVE_PROMPT_ERROR_CODES = new Set([
  'auth/native-prompt-not-displayed',
  'auth/native-prompt-skipped',
  'auth/operation-not-supported'
]);

let gsiScriptPromise = null;
let authHydrated = false;
let resolveInitialSession = null;
const initialSessionPromise = new Promise((resolve) => {
  resolveInitialSession = resolve;
});
const authListeners = new Set();

// Estado do Google Identity Services. O nonce (hash no Google, valor bruto no
// Supabase) e trocado a cada credencial usada, por isso o initialize() e
// refeito e os botoes renderizados de novo.
const gsiState = {
  initialized: false,
  rawNonce: '',
  hashedNonce: '',
  preparePromise: null,
  pendingPrompt: null,
  buttons: new Set(),
  fedcmButton: true,
  fedcmWatcherInstalled: false
};

function readFedcmButtonOff() {
  try {
    return window.localStorage.getItem(FEDCM_BUTTON_OFF_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function persistFedcmButtonOff() {
  try {
    window.localStorage.setItem(FEDCM_BUTTON_OFF_STORAGE_KEY, '1');
  } catch {
    // ignore persistence failures
  }
}

// O GSI nao volta para o popup quando o FedCM do botao falha: o clique
// simplesmente nao faz nada. Observa as chamadas FedCM do botao (mode
// "active") e, se forem rejeitadas sem ter mostrado o seletor, passa os
// botoes para o popup classico e avisa a tela para pedir um novo toque.
function installFedcmButtonWatcher() {
  if (gsiState.fedcmWatcherInstalled) return;
  const credentials = window.navigator?.credentials;
  if (typeof credentials?.get !== 'function') return;
  gsiState.fedcmWatcherInstalled = true;
  const originalGet = credentials.get.bind(credentials);
  credentials.get = (options, ...rest) => {
    const request = originalGet(options, ...rest);
    const mode = String(options?.identity?.mode || '');
    if (mode !== 'active' && mode !== 'button') return request;
    const startedAt = Date.now();
    request.catch(() => {
      if (!gsiState.fedcmButton || Date.now() - startedAt > FEDCM_NO_UI_REJECT_MS) return;
      gsiState.fedcmButton = false;
      persistFedcmButtonOff();
      void prepareGsi(true)
        .then(() => {
          gsiState.buttons.forEach((entry) => {
            try {
              entry.onFallback?.();
            } catch {
              // ignore UI callback errors
            }
          });
        })
        .catch(() => null);
    });
    return request;
  };
}

function createAuthError(code, message) {
  const error = new Error(message || 'Google auth failed');
  error.code = String(code || 'auth/internal-error');
  return error;
}

function normalizeSupabaseUser(user = null) {
  const uid = String(user?.id || '').trim();
  if (!uid) return null;
  const meta = user?.user_metadata && typeof user.user_metadata === 'object' ? user.user_metadata : {};
  const displayName = String(meta.full_name || meta.name || '').trim();
  const email = String(user?.email || meta.email || '').trim();
  const photoURL = String(meta.avatar_url || meta.picture || '').trim();
  return {
    uid,
    displayName: displayName || null,
    email: email || null,
    photoURL: photoURL || null,
    providerData: [
      {
        providerId: AUTH_PROVIDER_ID,
        uid,
        displayName: displayName || null,
        email: email || null,
        photoURL: photoURL || null
      }
    ]
  };
}

function emitAuthState(user = null) {
  firebaseAuth.currentUser = user;
  authListeners.forEach((listener) => {
    try {
      listener(firebaseAuth.currentUser);
    } catch {
      // ignore listener errors
    }
  });
}

function hydrateAuthState() {
  if (authHydrated) return;
  authHydrated = true;

  const supabase = getSupabase();
  if (!supabase) {
    resolveInitialSession();
    return;
  }

  supabase.auth.onAuthStateChange((event, session) => {
    const nextUser = normalizeSupabaseUser(session?.user || null);
    if (event === 'INITIAL_SESSION') {
      firebaseAuth.currentUser = nextUser;
      resolveInitialSession();
      return;
    }
    // TOKEN_REFRESHED/USER_UPDATED nao trocam de usuario: o app so precisa
    // ser avisado quando alguem entra ou sai.
    if (String(firebaseAuth.currentUser?.uid || '') === String(nextUser?.uid || '')) return;
    emitAuthState(nextUser);
  });
}

function bytesToBase64Url(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createNoncePair() {
  const rawNonce = bytesToBase64Url(window.crypto.getRandomValues(new Uint8Array(32)));
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawNonce));
  const hashedNonce = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return { rawNonce, hashedNonce };
}

function loadGoogleGsiScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(createAuthError('auth/operation-not-supported', 'Browser environment required'));
  }
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiScriptPromise) return gsiScriptPromise;

  gsiScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_GSI_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(createAuthError('auth/network-request-failed', 'Failed to load Google script')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(createAuthError('auth/network-request-failed', 'Failed to load Google script'));
    document.head.appendChild(script);
  }).finally(() => {
    gsiScriptPromise = null;
  });

  return gsiScriptPromise;
}

const GOOGLE_G_LOGO_SVG = '<svg viewBox="0 0 48 48" width="20" height="20"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

function isMobileDevice() {
  if (navigator.userAgentData?.mobile) return true;
  const ua = navigator.userAgent || '';
  // iPadOS se apresenta como Mac; o toque denuncia.
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

// No celular o GSI so usa o seletor nativo (FedCM) do botao no Chrome de
// Android; nos demais (iPhone, Samsung Internet, Edge, Opera, webviews) o
// botao oficial abre o cartao /gsi/select de desktop numa aba inteira. Nesses
// casos o botao proprio abre a pagina normal de conta do Google.
function shouldUseGooglePagePopup() {
  if (!isMobileDevice()) return false;
  const ua = navigator.userAgent || '';
  const fedcmButton = gsiState.fedcmButton
    && 'IdentityCredential' in window
    && /Android/.test(ua)
    && /Chrome\//.test(ua)
    && !/SamsungBrowser|EdgA|OPR\/|; wv\)/.test(ua);
  return !fedcmButton;
}

function openGooglePagePopup(entry) {
  const { rawNonce, hashedNonce } = gsiState;
  if (!rawNonce || !hashedNonce) return;
  const state = bytesToBase64Url(window.crypto.getRandomValues(new Uint8Array(16)));
  savePendingGooglePage({ state, rawNonce });
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: `${window.location.origin}${GOOGLE_PAGE_CALLBACK_PATH}`,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: hashedNonce,
    state,
    prompt: 'select_account',
    hl: 'pt-BR'
  });
  // Precisa ser sincrono no clique: o Safari bloqueia window.open depois de um await.
  const popup = window.open(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    'codequiz_google_login',
    'popup,width=480,height=640'
  );
  if (!popup) {
    clearPendingGooglePage();
    entry.onError?.(createAuthError('auth/popup-blocked', 'Popup blocked'));
  }
}

function renderGooglePageButton(entry, width) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cq-google-page-btn';
  button.style.width = `${width}px`;
  button.innerHTML = `<span class="cq-google-page-btn__logo" aria-hidden="true">${GOOGLE_G_LOGO_SVG}</span>`
    + '<span class="cq-google-page-btn__label">Continuar com o Google</span>';
  button.addEventListener('click', () => openGooglePagePopup(entry));
  entry.container.appendChild(button);
}

// Resultado da janela do Google (pagina /auth/google) para o login pendente.
function consumeGooglePageResult() {
  const pending = readPendingGooglePage();
  if (!pending) return;
  const result = takeGooglePageResult(pending.state);
  if (!result) return;
  clearPendingGooglePage();
  if (result.idToken) {
    void handleGoogleCredential({ credential: result.idToken }, pending.rawNonce);
    return;
  }
  // access_denied: o usuario fechou ou cancelou a escolha de conta.
  if (result.error === 'access_denied') return;
  const error = createAuthError('auth/internal-error', result.error || 'Google sign in failed');
  gsiState.buttons.forEach((entry) => {
    try {
      entry.onError?.(error);
    } catch {
      // ignore UI callback errors
    }
  });
}

function renderButtonInto(entry) {
  const googleId = window.google?.accounts?.id;
  if (!googleId?.renderButton || !entry?.container?.isConnected) return;
  entry.container.innerHTML = '';
  const measuredWidth = Math.floor(Number(entry.container.clientWidth || 0));
  if (shouldUseGooglePagePopup()) {
    renderGooglePageButton(entry, Math.max(200, Math.min(400, measuredWidth || Number(entry.width || 320))));
    return;
  }
  googleId.renderButton(entry.container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    logo_alignment: 'left',
    locale: 'pt-BR',
    width: Math.max(200, Math.min(400, measuredWidth || Number(entry.width || 320)))
  });
}

async function prepareGsi(forceNewNonce = false) {
  if (gsiState.preparePromise) return gsiState.preparePromise;
  if (gsiState.initialized && gsiState.rawNonce && !forceNewNonce) return undefined;

  gsiState.preparePromise = (async () => {
    if (!GOOGLE_OAUTH_CLIENT_ID) {
      throw createAuthError('auth/operation-not-supported', 'Missing NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID');
    }
    await loadGoogleGsiScript();
    const googleId = window.google?.accounts?.id;
    if (!googleId?.initialize) {
      throw createAuthError('auth/operation-not-supported', 'Google Identity unavailable');
    }

    if (gsiState.fedcmButton && readFedcmButtonOff()) gsiState.fedcmButton = false;
    if (gsiState.fedcmButton) installFedcmButtonWatcher();

    const { rawNonce, hashedNonce } = await createNoncePair();
    gsiState.rawNonce = rawNonce;
    gsiState.hashedNonce = hashedNonce;
    googleId.initialize({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      nonce: hashedNonce,
      auto_select: false,
      cancel_on_tap_outside: false,
      itp_support: true,
      use_fedcm_for_prompt: true,
      // No Chrome/Edge o botao abre o seletor de conta nativo (FedCM) por cima
      // do app, sem nova aba. O GSI so usa FedCM quando o navegador suporta o
      // modo botao; nos demais (Safari, Firefox) cai no popup classico abaixo.
      // Onde o FedCM existe mas falha, installFedcmButtonWatcher() desliga.
      use_fedcm_for_button: gsiState.fedcmButton,
      ux_mode: 'popup',
      callback: (response) => {
        void handleGoogleCredential(response);
      }
    });
    gsiState.initialized = true;
    gsiState.buttons.forEach((entry) => renderButtonInto(entry));
  })().finally(() => {
    gsiState.preparePromise = null;
  });

  return gsiState.preparePromise;
}

async function exchangeGoogleCredential(credential = '', rawNonce = '') {
  const supabase = getSupabase();
  if (!supabase) {
    throw createAuthError('auth/operation-not-supported', 'Supabase nao configurado');
  }
  const token = String(credential || '').trim();
  if (!token) {
    throw createAuthError('auth/invalid-credential', 'Google credential missing');
  }
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token,
    nonce: rawNonce || undefined
  });
  if (error) {
    throw createAuthError('auth/internal-error', error.message || 'Supabase sign in failed');
  }
  const user = normalizeSupabaseUser(data?.user || data?.session?.user || null);
  if (!user) {
    throw createAuthError('auth/internal-error', 'Supabase session missing user');
  }
  // Garante que o app receba o usuario mesmo se o evento SIGNED_IN chegar depois.
  if (String(firebaseAuth.currentUser?.uid || '') !== user.uid) {
    emitAuthState(user);
  }
  return user;
}

async function handleGoogleCredential(response = {}, rawNonceOverride = '') {
  const credential = String(response?.credential || '').trim();
  const rawNonce = rawNonceOverride || gsiState.rawNonce;
  const pendingPrompt = gsiState.pendingPrompt;
  gsiState.pendingPrompt = null;
  const buttonEntries = pendingPrompt ? [] : Array.from(gsiState.buttons);

  buttonEntries.forEach((entry) => {
    try {
      entry.onStart?.();
    } catch {
      // ignore UI callback errors
    }
  });

  try {
    const user = await exchangeGoogleCredential(credential, rawNonce);
    pendingPrompt?.resolve({
      user,
      providerId: AUTH_PROVIDER_ID,
      operationType: 'signIn'
    });
  } catch (error) {
    if (pendingPrompt) {
      pendingPrompt.reject(error);
    } else {
      buttonEntries.forEach((entry) => {
        try {
          entry.onError?.(error);
        } catch {
          // ignore UI callback errors
        }
      });
    }
  } finally {
    // Cada nonce vale para uma unica credencial.
    void prepareGsi(true).catch(() => null);
  }
}

class GoogleProviderCompat {
  constructor() {
    this.customParameters = {};
  }

  setCustomParameters(params = {}) {
    const safe = params && typeof params === 'object' ? params : {};
    this.customParameters = {
      ...this.customParameters,
      ...safe
    };
  }
}

export const googleProvider = new GoogleProviderCompat();

export const firebaseAuth = {
  currentUser: null
};

googleProvider.setCustomParameters({ prompt: 'select_account' });
if (typeof window !== 'undefined') {
  hydrateAuthState();
  subscribeGooglePageResult(consumeGooglePageResult);
  // A aba pode ter sido recarregada enquanto o usuario estava na janela do Google.
  consumeGooglePageResult();
}

export function onAuthStateChanged(_auth, callback) {
  if (typeof callback !== 'function') return () => { };
  hydrateAuthState();
  let active = true;
  const listener = (user) => {
    if (active) callback(user);
  };
  initialSessionPromise.then(() => {
    if (!active) return;
    authListeners.add(listener);
    callback(firebaseAuth.currentUser);
  });
  return () => {
    active = false;
    authListeners.delete(listener);
  };
}

// Abre o One Tap (FedCM) do Google. Se o navegador nao exibir o prompt
// (cooldown, bloqueio etc.), o erro auth/native-prompt-* indica que o usuario
// deve usar o botao oficial renderizado por renderGoogleSignInButton().
export async function signInWithPopup() {
  hydrateAuthState();
  await prepareGsi();
  const googleId = window.google?.accounts?.id;
  if (!googleId?.prompt) {
    throw createAuthError('auth/operation-not-supported', 'Google Identity prompt unavailable');
  }

  if (gsiState.pendingPrompt) {
    gsiState.pendingPrompt.reject(createAuthError('auth/popup-closed-by-user', 'Prompt replaced'));
    gsiState.pendingPrompt = null;
  }

  return new Promise((resolve, reject) => {
    const token = Symbol('prompt');
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      if (gsiState.pendingPrompt?.token === token) gsiState.pendingPrompt = null;
      fn(value);
    };
    gsiState.pendingPrompt = {
      token,
      resolve: (value) => finish(resolve, value),
      reject: (error) => finish(reject, error)
    };

    try {
      googleId.cancel?.();
    } catch {
      // ignore Google prompt cleanup issues
    }

    googleId.prompt((notification) => {
      if (settled || !notification) return;

      if (notification.isNotDisplayed?.()) {
        const reason = String(notification.getNotDisplayedReason?.() || '').trim();
        finish(reject, createAuthError('auth/native-prompt-not-displayed', reason || 'Google prompt not displayed'));
        return;
      }

      if (notification.isSkippedMoment?.()) {
        const reason = String(notification.getSkippedReason?.() || '').trim();
        finish(reject, createAuthError('auth/native-prompt-skipped', reason || 'Google prompt skipped'));
        return;
      }

      if (notification.isDismissedMoment?.()) {
        const reason = String(notification.getDismissedReason?.() || '').trim().toLowerCase();
        if (reason === 'credential_returned') return;
        finish(reject, createAuthError('auth/popup-closed-by-user', reason || 'Google prompt dismissed'));
      }
    });
  });
}

export function isNativePromptUnavailableError(error) {
  return NATIVE_PROMPT_ERROR_CODES.has(String(error?.code || '').trim().toLowerCase());
}

// Renderiza o botao oficial "Continuar com Google" dentro de container.
// onStart: credencial recebida, login em andamento. onError: falha no login.
// onFallback: o seletor nativo falhou e o botao passou para o popup; o usuario
// precisa tocar de novo.
export function renderGoogleSignInButton(container, handlers = {}) {
  if (typeof window === 'undefined' || !container) return () => { };
  hydrateAuthState();
  const entry = {
    container,
    width: handlers.width,
    onStart: handlers.onStart,
    onError: handlers.onError,
    onFallback: handlers.onFallback
  };
  gsiState.buttons.add(entry);
  prepareGsi()
    .then(() => renderButtonInto(entry))
    .catch((error) => {
      try {
        entry.onError?.(error);
      } catch {
        // ignore UI callback errors
      }
    });
  return () => {
    gsiState.buttons.delete(entry);
  };
}

export async function signInWithRedirect(auth, provider = googleProvider) {
  return signInWithPopup(auth, provider);
}

export async function getRedirectResult() {
  hydrateAuthState();
  return null;
}

export async function signOut() {
  try {
    window.google?.accounts?.id?.disableAutoSelect?.();
    window.google?.accounts?.id?.cancel?.();
  } catch {
    // ignore Google prompt cleanup issues
  }
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut().catch(() => null);
  }
  if (firebaseAuth.currentUser) {
    emitAuthState(null);
  }
}
