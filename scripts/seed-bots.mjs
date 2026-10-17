// Cria/atualiza os bots do sistema (perfil, stats e config) no banco do Supabase,
// reaproveitando ensureSystemBots() do app. Usa a chave service_role de
// .env.supabase.local. Uso: npm run seed:bots
import { createRequire, registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { loadLocalEnv } = require('./lib/load-env');

loadLocalEnv();
if (!process.env.SUPABASE_SECRET_KEY) {
  console.error('SUPABASE_SECRET_KEY ausente em .env.supabase.local.');
  process.exit(1);
}
// O app le a chave publica do Supabase; aqui ela e trocada pela service_role.
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_SECRET_KEY;

// O codigo do app usa imports relativos sem extensao (resolvidos pelo bundler do Next).
const APP_SRC_URL = new URL('../src/', import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    const isRelative = specifier.startsWith('./') || specifier.startsWith('../');
    const fromAppSource = String(context.parentURL || '').startsWith(APP_SRC_URL);
    if (isRelative && fromAppSource && !/\.[cm]?jsx?$/.test(specifier)) {
      const candidate = new URL(`${specifier}.js`, context.parentURL);
      if (existsSync(fileURLToPath(candidate))) {
        return nextResolve(candidate.href, context);
      }
    }
    return nextResolve(specifier, context);
  }
});

const { ensureSystemBots } = await import('../src/codequiz/lib/repository.js');
const snapshots = await ensureSystemBots({ force: true });
const rows = Array.isArray(snapshots) ? snapshots : [];

rows.forEach((row) => {
  const nickname = String(row?.profile?.nickname || '').trim() || '(sem apelido)';
  console.log(`- ${row?.bot_id}: ${nickname} [${row?.snapshot_source || 'desconhecido'}]`);
});
console.log(`${rows.length} bot(s) sincronizado(s) no Supabase.`);
process.exit(rows.length ? 0 : 1);
