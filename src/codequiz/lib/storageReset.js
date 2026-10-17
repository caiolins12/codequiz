// Reset do estado local do navegador quando o jogo recomeca do zero
// (migracao para o Supabase em 10/2026). Roda uma vez por navegador, antes
// dos outros modulos lerem o localStorage, para que progresso/cache antigos
// nao sejam sincronizados de volta para o banco novo.

const STORAGE_EPOCH_KEY = 'codequiz_storage_epoch';
const STORAGE_EPOCH = '2026-10-supabase-reset';
const PRESERVED_KEYS = new Set([
  STORAGE_EPOCH_KEY,
  'codequiz_cookie_consent_v1',
  'codequiz_cookie_consent',
  'codequiz_audio_settings_v1'
]);
const LEGACY_PREFIXES = ['codequiz_', 'firebase:'];

function resetLocalStateIfNeeded() {
  if (typeof window === 'undefined') return;
  try {
    const storage = window.localStorage;
    if (!storage || storage.getItem(STORAGE_EPOCH_KEY) === STORAGE_EPOCH) return;
    const keysToRemove = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key || PRESERVED_KEYS.has(key)) continue;
      if (LEGACY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => storage.removeItem(key));
    storage.setItem(STORAGE_EPOCH_KEY, STORAGE_EPOCH);
  } catch {
    // storage indisponivel (modo privado, bloqueado): nada a limpar
  }
}

resetLocalStateIfNeeded();
