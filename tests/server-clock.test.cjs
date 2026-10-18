const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const { createServerClock } = load('src/codequiz/lib/serverClock.js');

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

test('relógios locais divergentes convergem no horário do servidor com metade do RTT', async () => {
  const serverMs = 1_800_000_000_000;
  let monotonicA = 100;
  let monotonicB = 10000;
  const pendingA = deferred();
  const pendingB = deferred();
  const clockA = createServerClock({
    readTime: () => pendingA.promise,
    wallNow: () => serverMs - 3_600_000,
    monotonicNow: () => monotonicA
  });
  const clockB = createServerClock({
    readTime: () => pendingB.promise,
    wallNow: () => serverMs + 7_200_000,
    monotonicNow: () => monotonicB
  });
  assert.notEqual(clockA.getServerNowMs(), clockB.getServerNowMs());
  const syncA = clockA.syncServerClock();
  const syncB = clockB.syncServerClock();
  monotonicA += 100;
  monotonicB += 100;
  pendingA.resolve(serverMs);
  pendingB.resolve(serverMs);
  assert.equal(await syncA, true);
  assert.equal(await syncB, true);
  assert.equal(clockA.getServerNowMs(), serverMs + 50);
  assert.equal(clockA.getServerNowMs(), clockB.getServerNowMs());
  monotonicA += 1234;
  monotonicB += 1234;
  assert.equal(clockA.getServerNowMs(), serverMs + 1284);
  assert.equal(clockA.getServerNowMs(), clockB.getServerNowMs());
});

test('antes da amostra usa Date; depois, mudanças do relógio local não alteram o tempo', async () => {
  let wallMs = 1000;
  let monotonicMs = 50;
  const clock = createServerClock({
    readTime: async () => 10000,
    wallNow: () => wallMs,
    monotonicNow: () => monotonicMs
  });
  assert.equal(clock.getServerNowMs(), 1000);
  wallMs = 5000;
  assert.equal(clock.getServerNowMs(), 5000);
  assert.equal(await clock.syncServerClock(), true);
  wallMs = -1000000;
  monotonicMs += 40;
  assert.equal(clock.getServerNowMs(), 10040);
  wallMs = 9000000;
  monotonicMs += 20;
  assert.equal(clock.getServerNowMs(), 10060);
});

test('sincronizações simultâneas compartilham a requisição e novas chamadas buscam nova amostra', async () => {
  let calls = 0;
  let pending = deferred();
  const clock = createServerClock({
    readTime: () => { calls += 1; return pending.promise; },
    wallNow: () => 100,
    monotonicNow: () => 20
  });
  const first = clock.syncServerClock();
  assert.equal(clock.syncServerClock(), first);
  assert.equal(calls, 1);
  pending.resolve(10000);
  assert.equal(await first, true);
  pending = deferred();
  const second = clock.syncServerClock();
  assert.notEqual(second, first);
  assert.equal(calls, 2);
  pending.resolve(20000);
  assert.equal(await second, true);
  assert.equal(clock.getServerNowMs(), 20000);
});

test('falhas e amostras inválidas preservam a última âncora e permitem tentar de novo', async () => {
  let monotonicMs = 0;
  let readTime = async () => { throw new Error('offline'); };
  const clock = createServerClock({
    readTime: () => readTime(),
    wallNow: () => 777,
    monotonicNow: () => monotonicMs
  });
  assert.equal(await clock.syncServerClock(), false);
  assert.equal(clock.getServerNowMs(), 777);
  readTime = async () => 10000;
  assert.equal(await clock.syncServerClock(), true);
  monotonicMs += 100;
  readTime = () => { throw new Error('synchronous failure'); };
  assert.equal(await clock.syncServerClock(), false);
  assert.equal(clock.getServerNowMs(), 10100);
  for (const invalid of [null, undefined, 0, -1, NaN, Infinity, '20000']) {
    readTime = async () => invalid;
    monotonicMs += 100;
    assert.equal(await clock.syncServerClock(), false);
    assert.equal(clock.getServerNowMs(), 10000 + monotonicMs);
  }
  readTime = async () => 30000;
  assert.equal(await clock.syncServerClock(), true);
  assert.equal(clock.getServerNowMs(), 30000);
});
