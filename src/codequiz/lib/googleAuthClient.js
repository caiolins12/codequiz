const GOOGLE_OAUTH_CLIENT_ID = String(
  process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID
  || '953175707283-btrfi33piiigrc5o1hthhcn9fumtsqm3.apps.googleusercontent.com'
).trim();

const GOOGLE_OAUTH_SCOPE = 'openid email profile';
const GOOGLE_GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const AUTH_SESSION_STORAGE_KEY = 'codequiz_google_auth_session_v1';
const AUTH_REDIRECT_PENDING_KEY = 'codequiz_auth_redirect_pending_v1';
const AUTH_PROVIDER_ID = 'google.com';
const NATIVE_PROMPT_ERROR_CODES = new Set([
  'auth/native-prompt-not-displayed',
  'auth/native-prompt-skipped',
  'auth/operation-not-supported'
]);

let gsiScriptPromise = null;
let authHydrated = false;
const authListeners = new Set();

function createAuthError(code, message) {
  const error = new Error(message || 'Google auth failed');
  error.code = String(code || 'auth/internal-error');
  return error;
}

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function normalizeAuthUser(raw = {}) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const uid = String(safe.uid || '').trim();
  if (!uid) return null;
  const displayName = String(safe.displayName || '').trim();
  const email = String(safe.email || '').trim();
  const photoURL = String(safe.photoURL || '').trim();
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

function readPersistedUser() {
  if (!canUseBrowserStorage()) return null;
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeAuthUser(parsed?.user || null);
  } catch {
    return null;
  }
}

function persistUser(user = null) {
  if (!canUseBrowserStorage()) return;
  try {
    if (!user) {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify({
        user: normalizeAuthUser(user),
        updated_at_ms: Date.now()
      })
    );
  } catch {
    // ignore persistence failures
  }
}

function normalizeUserInfoResponse(profile = {}) {
  const safe = profile && typeof profile === 'object' ? profile : {};
  const uid = String(safe.sub || safe.id || '').trim();
  const displayName = String(safe.name || safe.given_name || '').trim();
  const email = String(safe.email || '').trim();
  const photoURL = String(safe.picture || '').trim();
  if (!uid) throw createAuthError('auth/invalid-user-info', 'Google user profile missing sub');
  return normalizeAuthUser({
    uid,
    displayName,
    email,
    photoURL
  });
}

function decodeGoogleCredentialPayload(credential = '') {
  const safeCredential = String(credential || '').trim();
  const [, payloadSegment = ''] = safeCredential.split('.');
  if (!payloadSegment) {
    throw createAuthError('auth/invalid-credential', 'Missing Google credential payload');
  }

  const normalizedBase64 = payloadSegment
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(payloadSegment.length / 4) * 4, '=');

  try {
    const binary = window.atob(normalizedBase64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch {
    throw createAuthError('auth/invalid-credential', 'Failed to decode Google credential');
  }
}

function normalizeGoogleCredentialResponse(response = {}) {
  const safe = response && typeof response === 'object' ? response : {};
  const payload = decodeGoogleCredentialPayload(safe.credential || '');
  return normalizeUserInfoResponse(payload);
}

function emitAuthState(user = null) {
  firebaseAuth.currentUser = normalizeAuthUser(user);
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
  emitAuthState(readPersistedUser());
}

function normalizeGoogleOAuthError(rawError = null) {
  const safe = rawError && typeof rawError === 'object' ? rawError : {};
  const errorCode = String(safe.error || safe.code || safe.type || '').trim().toLowerCase();
  const errorDescription = String(safe.error_description || safe.message || '').trim();

  if (
    errorCode.includes('popup_closed')
    || errorCode.includes('popup-closed')
    || errorCode === 'access_denied'
  ) {
    return createAuthError('auth/popup-closed-by-user', errorDescription || 'Popup closed by user');
  }
  if (
    errorCode.includes('popup_failed_to_open')
    || errorCode.includes('popup-blocked')
  ) {
    return createAuthError('auth/popup-blocked', errorDescription || 'Popup blocked');
  }
  if (errorCode.includes('network')) {
    return createAuthError('auth/network-request-failed', errorDescription || 'Network error');
  }
  if (errorCode.includes('invalid_client')) {
    return createAuthError('auth/operation-not-supported', errorDescription || 'Invalid OAuth client');
  }

  return createAuthError('auth/internal-error', errorDescription || 'Google sign in failed');
}

function loadGoogleGsiScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(createAuthError('auth/operation-not-supported', 'Browser environment required'));
  }
  if (window.google?.accounts?.oauth2) return Promise.resolve();
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

async function fetchGoogleUserInfo(accessToken = '') {
  const safeToken = String(accessToken || '').trim();
  if (!safeToken) throw createAuthError('auth/internal-error', 'Missing access token');

  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {
      Authorization: `Bearer ${safeToken}`
    },
    cache: 'no-store'
  }).catch(() => {
    throw createAuthError('auth/network-request-failed', 'Failed to fetch Google user profile');
  });

  if (!response.ok) {
    throw createAuthError('auth/network-request-failed', 'Google user profile request failed');
  }

  const payload = await response.json().catch(() => null);
  return normalizeUserInfoResponse(payload || {});
}

async function requestAccessTokenWithPopup(prompt = 'select_account') {
  if (!GOOGLE_OAUTH_CLIENT_ID) {
    throw createAuthError('auth/operation-not-supported', 'Missing NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID');
  }

  await loadGoogleGsiScript();

  return new Promise((resolve, reject) => {
    const googleApi = window.google?.accounts?.oauth2;
    if (!googleApi?.initTokenClient) {
      reject(createAuthError('auth/operation-not-supported', 'Google OAuth API unavailable'));
      return;
    }

    const client = googleApi.initTokenClient({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      scope: GOOGLE_OAUTH_SCOPE,
      callback: (response) => {
        if (!response || response.error) {
          reject(normalizeGoogleOAuthError(response));
          return;
        }
        resolve(response);
      },
      error_callback: (error) => {
        reject(normalizeGoogleOAuthError(error));
      }
    });

    try {
      client.requestAccessToken({
        prompt: String(prompt || 'select_account').trim() || 'select_account'
      });
    } catch (error) {
      reject(normalizeGoogleOAuthError(error));
    }
  });
}

async function requestGoogleCredentialWithNativePrompt(mode = 'signin') {
  if (!GOOGLE_OAUTH_CLIENT_ID) {
    throw createAuthError('auth/operation-not-supported', 'Missing NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID');
  }

  await loadGoogleGsiScript();

  return new Promise((resolve, reject) => {
    const googleId = window.google?.accounts?.id;
    if (!googleId?.initialize || !googleId?.prompt) {
      reject(createAuthError('auth/operation-not-supported', 'Google Identity prompt unavailable'));
      return;
    }

    let settled = false;
    const finish = (resolver) => {
      if (settled) return;
      settled = true;
      resolver();
    };

    try {
      googleId.cancel?.();
      googleId.disableAutoSelect?.();
    } catch {
      // ignore Google prompt cleanup issues
    }

    googleId.initialize({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      auto_select: false,
      cancel_on_tap_outside: false,
      context: mode === 'switch' ? 'use' : 'signin',
      itp_support: true,
      use_fedcm_for_prompt: true,
      callback: (response) => {
        if (!response?.credential) {
          finish(() => reject(createAuthError('auth/internal-error', 'Google credential missing')));
          return;
        }
        finish(() => resolve(response));
      }
    });

    googleId.prompt((notification) => {
      if (settled || !notification) return;

      if (notification.isNotDisplayed?.()) {
        const reason = String(notification.getNotDisplayedReason?.() || '').trim();
        finish(() => reject(createAuthError('auth/native-prompt-not-displayed', reason || 'Google prompt not displayed')));
        return;
      }

      if (notification.isSkippedMoment?.()) {
        const reason = String(notification.getSkippedReason?.() || '').trim();
        finish(() => reject(createAuthError('auth/native-prompt-skipped', reason || 'Google prompt skipped')));
        return;
      }

      if (notification.isDismissedMoment?.()) {
        const reason = String(notification.getDismissedReason?.() || '').trim().toLowerCase();
        if (reason === 'credential_returned') return;
        finish(() => reject(createAuthError('auth/popup-closed-by-user', reason || 'Google prompt dismissed')));
      }
    });
  });
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
hydrateAuthState();

export function onAuthStateChanged(_auth, callback) {
  if (typeof callback !== 'function') return () => { };
  hydrateAuthState();
  authListeners.add(callback);
  queueMicrotask(() => callback(firebaseAuth.currentUser));
  return () => {
    authListeners.delete(callback);
  };
}

export async function signInWithPopup(_auth, provider = googleProvider) {
  hydrateAuthState();
  const prompt = String(provider?.customParameters?.prompt || 'select_account').trim() || 'select_account';
  const mode = String(provider?.customParameters?.flowMode || 'signin').trim() || 'signin';
  const preferNativePrompt = provider?.customParameters?.preferNativePrompt !== false;
  let nativeError = null;

  if (preferNativePrompt) {
    try {
      const credentialResponse = await requestGoogleCredentialWithNativePrompt(mode);
      const user = normalizeGoogleCredentialResponse(credentialResponse);
      persistUser(user);
      emitAuthState(user);
      return {
        user,
        providerId: AUTH_PROVIDER_ID,
        operationType: 'signIn',
        credential: {
          idToken: String(credentialResponse.credential || '')
        }
      };
    } catch (error) {
      nativeError = error;
      const code = String(error?.code || '').trim().toLowerCase();
      if (!NATIVE_PROMPT_ERROR_CODES.has(code)) {
        throw error;
      }
    }
  }

  const tokenResponse = await requestAccessTokenWithPopup(prompt).catch((error) => {
    if (nativeError && NATIVE_PROMPT_ERROR_CODES.has(String(nativeError?.code || '').trim().toLowerCase())) {
      throw error;
    }
    throw error;
  });
  const user = await fetchGoogleUserInfo(tokenResponse.access_token);
  persistUser(user);
  emitAuthState(user);

  return {
    user,
    providerId: AUTH_PROVIDER_ID,
    operationType: 'signIn',
    credential: {
      accessToken: String(tokenResponse.access_token || ''),
      tokenType: String(tokenResponse.token_type || 'Bearer'),
      expiresIn: Math.max(0, Number(tokenResponse.expires_in || 0))
    }
  };
}

export async function signInWithRedirect(auth, provider = googleProvider) {
  const result = await signInWithPopup(auth, provider);
  if (canUseBrowserStorage()) {
    try {
      window.localStorage.removeItem(AUTH_REDIRECT_PENDING_KEY);
    } catch {
      // ignore storage failures
    }
  }
  return result;
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
  persistUser(null);
  emitAuthState(null);
}
