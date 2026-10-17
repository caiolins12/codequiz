// Reset do estado local do navegador quando o jogo recomeça do zero
// (migração para o Supabase e novo visual em 10/2026). Roda uma vez por
// navegador, antes dos outros módulos lerem o localStorage, para que
// progresso/cache antigos não sejam sincronizados de volta para o banco.

const STORAGE_EPOCH_KEY = 'codequiz_storage_epoch';
const STORAGE_EPOCH = '2026-10-ui-redesign-reset';
const PRESERVED_KEYS = new Set([
  STORAGE_EPOCH_KEY,
  'codequiz_cookie_consent_v1',
  'codequiz_cookie_consent',
  'codequiz_audio_settings_v1'
]);
const LEGACY_PREFIXES = ['codequiz_', 'firebase:'];
// Sessão do Supabase: o jogador continua logado depois do reset.
const PRESERVED_PREFIXES = ['codequiz_supabase_auth_v1'];

function resetLocalStateIfNeeded() {
  if (typeof window === 'undefined') return;
  try {
    const storage = window.localStorage;
    if (!storage || storage.getItem(STORAGE_EPOCH_KEY) === STORAGE_EPOCH) return;
    const keysToRemove = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key || PRESERVED_KEYS.has(key)) continue;
      if (PRESERVED_PREFIXES.some((prefix) => key.startsWith(prefix))) continue;
      if (LEGACY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => storage.removeItem(key));
    storage.setItem(STORAGE_EPOCH_KEY, STORAGE_EPOCH);
  } catch {
    // storage indisponível (modo privado, bloqueado): nada a limpar
  }
}

resetLocalStateIfNeeded();
