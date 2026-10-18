const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { test } = require('node:test');
const { transformSync } = require('next/dist/build/swc');
const { createAppLoader } = require('./support/load-app.cjs');

// Regras de criação de bot (docs/BOT_CREATION_GUIDE.md) conferidas para todo o roster.
// O roster fica em repository.js, então aqui ele é carregado de verdade (sem banco:
// o cliente do Supabase só nasce quando alguém usa).
function loadRealModule(relativePath) {
  const root = path.resolve(__dirname, '..');
  const sourceRoot = path.join(root, 'src', 'codequiz');
  const cache = new Map();
  function load(filePath) {
    const filename = require.resolve(path.resolve(root, filePath));
    if (!filename.startsWith(`${sourceRoot}${path.sep}`)) return require(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = new Module(filename, module);
    loaded.filename = filename;
    loaded.paths = Module._nodeModulePaths(path.dirname(filename));
    cache.set(filename, loaded);
    loaded.require = (specifier) => {
      if (!specifier.startsWith('.')) return require(require.resolve(specifier, { paths: loaded.paths }));
      return load(path.resolve(path.dirname(filename), specifier));
    };
    const { code } = transformSync(fs.readFileSync(filename, 'utf8'), {
      filename,
      jsc: { parser: { syntax: 'ecmascript', jsx: true }, target: 'es2022' },
      module: { type: 'commonjs' }
    });
    loaded._compile(code, filename);
    loaded.loaded = true;
    return loaded.exports;
  }
  return load(relativePath);
}

const repository = loadRealModule('src/codequiz/lib/repository.js');
const progression = loadRealModule('src/codequiz/lib/botProgression.js');
const shop = loadRealModule('src/codequiz/lib/shop.js');
const helpers = createAppLoader()('src/codequiz/app/helpers.js');

const BOT_IDS = repository.SYSTEM_BOT_IDS;
const normalizeNickname = (value) => String(value || '').replace(/[^A-Za-z0-9]/g, '').toLowerCase();

test('roster: ids estáveis e únicos com o prefixo dos bots', () => {
  assert.ok(BOT_IDS.length >= 19);
  assert.equal(new Set(BOT_IDS).size, BOT_IDS.length);
  BOT_IDS.forEach((botId) => {
    assert.match(botId, /^bot_sys_codequiz_[a-z0-9_]+$/);
    assert.ok(repository.isSystemBotUserId(botId));
  });
});

test('roster: apelido de jogador (3 a 12 caracteres), reservado e sem repetir', () => {
  const seen = new Set();
  BOT_IDS.forEach((botId) => {
    const profile = repository.getSystemBotFallbackProfile(botId);
    const nickname = String(profile.nickname || '');
    assert.equal(profile.id, botId);
    assert.ok(nickname.length >= 3 && nickname.length <= 12, `${botId}: ${nickname}`);
    assert.match(nickname, /^[A-Za-z0-9_]+$/);
    const normalized = normalizeNickname(nickname);
    assert.ok(!seen.has(normalized), `apelido repetido: ${nickname}`);
    seen.add(normalized);
    assert.equal(repository.validateNicknameInput(nickname.replace(/_/g, '')).errorCode, 'nickname/reserved');
    assert.ok(['male', 'female', 'neutral'].includes(profile.bot_gender), botId);
    assert.ok(['provocador', 'analitico', 'calmo'].includes(profile.bot_personality), botId);
    assert.equal(profile.bot_strength, 'forte');
  });
});

test('roster: cada bot nasce como jogador novo, já com o próprio emoji de assinatura', () => {
  const signatures = new Set();
  BOT_IDS.forEach((botId) => {
    const style = progression.SYSTEM_BOT_STYLES[botId];
    assert.ok(style, `${botId} sem estilo em SYSTEM_BOT_STYLES`);
    const signature = shop.getShopItem(style.signatureEmoji);
    assert.ok(signature && signature.type === 'emoji', `${botId}: ${style.signatureEmoji}`);
    assert.equal(signature.rarity, 'common');
    assert.ok(signature.price > 0 && signature.price <= progression.BOT_STARTING_COINS, botId);
    assert.ok(!signatures.has(style.signatureEmoji), `emoji de assinatura repetido: ${style.signatureEmoji}`);
    signatures.add(style.signatureEmoji);
    assert.ok(['impulsivo', 'poupador', 'equilibrado', 'colecionador'].includes(style.spending), botId);
    style.favorites.forEach((itemId) => assert.ok(shop.getShopItem(itemId), `${botId}: item ${itemId} não existe`));

    const loadout = progression.buildInitialSystemBotLoadout(botId);
    assert.equal(loadout.inventory.equipped.emoji, style.signatureEmoji, botId);
    assert.equal(loadout.inventory.equipped.frame, 'frame_default');
    assert.equal(loadout.inventory.equipped.background, 'bg_default');
    assert.equal(loadout.coins, progression.BOT_STARTING_COINS - signature.price);
  });
});

test('roster: pool próprio de 6 emojis de batalha e estilo de jogo definido', () => {
  const allowed = new Set(helpers.POPULAR_WHATSAPP_EMOJIS);
  const pools = new Set();
  BOT_IDS.forEach((botId) => {
    const ownPool = helpers.BOT_EMOJI_POOL_BY_BOT_ID[botId];
    assert.ok(Array.isArray(ownPool) && ownPool.length === 6, `${botId} sem pool próprio de 6 emojis`);
    // O que vale na partida: emoji fora do seletor de batalha é trocado por um padrão.
    const pool = helpers.getBotEmojiPool('calmo', botId);
    assert.equal(new Set(pool).size, 6, botId);
    pool.forEach((emoji) => assert.ok(allowed.has(emoji), `${botId}: ${emoji} fora do seletor`));
    pools.add(pool.join(''));
    assert.ok(helpers.BOT_PLAY_STYLES[helpers.getBotPlayStyleKey(botId)], `${botId} sem estilo de jogo`);
  });
  assert.equal(pools.size, BOT_IDS.length);
});
