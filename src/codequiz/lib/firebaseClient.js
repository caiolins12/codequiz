import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { forceLongPolling, getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyByUzpg1nGIC0Oa74T35z9WEUAGcturbNk',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'devquiz-ee979.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://devquiz-ee979-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'devquiz-ee979',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'devquiz-ee979.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '416837704260',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:416837704260:web:c692e2b14550bff637fa11'
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

function isLikelyMobileWeb() {
  if (typeof navigator === 'undefined') return false;
  const ua = String(navigator.userAgent || navigator.vendor || '').toLowerCase();
  const platform = String(navigator.platform || '');
  const touch = Math.max(0, Number(navigator.maxTouchPoints || 0)) > 1;
  const ipadDesktopMode = platform === 'MacIntel' && touch;
  return /android|iphone|ipad|ipod|mobile|iemobile|opera mini/i.test(ua) || ipadDesktopMode;
}

function createFirebaseDatabase(app) {
  try {
    if (typeof window !== 'undefined' && isLikelyMobileWeb()) {
      forceLongPolling();
    }
  } catch {
    // fallback to default transport when forceLongPolling is unavailable
  }
  return getDatabase(app);
}

export const firebaseDb = createFirebaseDatabase(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });
