import { getSupabase, isSupabaseConfigured } from './supabaseClient';

const DB_OPERATION_TIMEOUT_MS = Math.max(
  1000,
  Number(process.env.NEXT_PUBLIC_DB_OPERATION_TIMEOUT_MS || 12000)
);
const DB_POLL_INTERVAL_MS = Math.max(
  400,
  Number(process.env.NEXT_PUBLIC_DB_POLL_INTERVAL_MS || 1200)
);
const DB_TX_MAX_RETRIES = Math.max(
  1,
  Number(process.env.NEXT_PUBLIC_DB_TX_MAX_RETRIES || 12)
);
const DB_REQUEST_MAX_RETRIES = Math.max(
  0,
  Number(process.env.NEXT_PUBLIC_DB_REQUEST_MAX_RETRIES || 2)
);
const DB_REQUEST_RETRY_BASE_MS = Math.max(
  120,
  Number(process.env.NEXT_PUBLIC_DB_REQUEST_RETRY_BASE_MS || 260)
);
const DB_REQUEST_RETRY_MAX_MS = Math.max(
  DB_REQUEST_RETRY_BASE_MS,
  Number(process.env.NEXT_PUBLIC_DB_REQUEST_RETRY_MAX_MS || 1800)
);
const DB_REQUEST_RETRY_JITTER_MS = Math.max(
  0,
  Number(process.env.NEXT_PUBLIC_DB_REQUEST_RETRY_JITTER_MS || 180)
);
const DB_GET_CACHE_TTL_MS = Math.max(
  0,
  Number(process.env.NEXT_PUBLIC_DB_GET_CACHE_TTL_MS || 180)
);
const DB_SUBSCRIPTION_ERROR_BACKOFF_MAX_MS = Math.max(
  DB_POLL_INTERVAL_MS,
  Number(process.env.NEXT_PUBLIC_DB_SUBSCRIPTION_ERROR_BACKOFF_MAX_MS || 12000)
);
const DB_CONNECTED_PROBE_MIN_INTERVAL_MS = Math.max(
  800,
  Number(process.env.NEXT_PUBLIC_DB_CONNECTED_PROBE_MIN_INTERVAL_MS || 1800)
);
const DB_CONNECTED_PROBE_TIMEOUT_MS = Math.max(
  900,
  Number(process.env.NEXT_PUBLIC_DB_CONNECTED_PROBE_TIMEOUT_MS || 2800)
);

const DB_HIDDEN_POLL_INTERVAL_MS = Math.max(
  DB_POLL_INTERVAL_MS,
  Number(process.env.NEXT_PUBLIC_DB_HIDDEN_POLL_INTERVAL_MS || 5000)
);

const SUPABASE_CONFIGURED = isSupabaseConfigured();
const ENABLE_MEMORY_FALLBACK = (
  String(process.env.NEXT_PUBLIC_DB_ALLOW_MEMORY_FALLBACK || '').trim() === '1'
  || (!SUPABASE_CONFIGURED && process.env.NODE_ENV !== 'production')
);

// Operacoes do banco -> funcoes RPC do Supabase (supabase/migrations/*_codequiz_tree_db.sql).
const DB_RPC_BY_OPERATION = Object.freeze({
  '/db/get': (payload) => ['db_get', { p_path: normalizePath(payload.path) }],
  '/db/set': (payload) => ['db_set', { p_path: normalizePath(payload.path), p_value: payload.value ?? null }],
  '/db/update': (payload) => ['db_update', { p_path: normalizePath(payload.path), p_patch: payload.patch }],
  '/db/tx': (payload) => ['db_tx', {
    p_path: normalizePath(payload.path),
    p_expected_rev: Math.max(0, Number(payload.expected_rev || 0)),
    p_value: payload.value ?? null
  }],
  '/db/revs': (payload) => ['db_revs', { p_paths: (payload.paths || []).map((path) => normalizePath(path)) }],
  '/db/ping': () => ['db_ping', {}],
  '/db/is_admin': () => ['db_is_admin', {}]
});

let workerReachable = true;
let warnedMissingWorkerUrl = false;
const subscriptions = new Map();
const getPathInflight = new Map();
const getPathCache = new Map();
let getCacheVersion = 1;
let workerProbePromise = null;
let workerProbeStartedAtMs = 0;
let pollLoopTimerId = null;
let pollLoopInFlight = false;
let lastHiddenPollAtMs = 0;

const inMemoryState = {
  data: {},
  revisions: { '': 1 },
  revisionCounter: 1
};

function deepClone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function isObjectLike(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizePath(path = '') {
  const safe = String(path || '').trim();
  if (!safe || safe === '/') return '';
  return safe.replace(/^\/+/, '').replace(/\/+$/, '');
}

function splitPath(path = '') {
  const safe = normalizePath(path);
  return safe ? safe.split('/').filter(Boolean) : [];
}

function joinPaths(basePath = '', childPath = '') {
  const safeBase = normalizePath(basePath);
  const safeChild = normalizePath(childPath);
  if (!safeBase) return safeChild;
  if (!safeChild) return safeBase;
  return `${safeBase}/${safeChild}`;
}

function getAncestorPaths(path = '') {
  const segments = splitPath(path);
  const list = [''];
  let cursor = '';
  segments.forEach((segment) => {
    cursor = cursor ? `${cursor}/${segment}` : segment;
    list.push(cursor);
  });
  return list;
}

function pathsOverlap(pathA = '', pathB = '') {
  const a = normalizePath(pathA);
  const b = normalizePath(pathB);
  if (!a || !b) return true;
  if (a === b) return true;
  return a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

class DbSnapshot {
  constructor(value) {
    this._value = value === undefined ? null : deepClone(value);
  }

  exists() {
    return this._value !== null && this._value !== undefined;
  }

  val() {
    return deepClone(this._value);
  }
}

function makeSnapshot(value) {
  return new DbSnapshot(value);
}

function delay(ms = 0) {
  const safeMs = Math.max(0, Number(ms || 0));
  if (!safeMs) return Promise.resolve();
  return new Promise((resolve) => {
    setTimeout(resolve, safeMs);
  });
}

function setWorkerReachable(nextValue) {
  workerReachable = nextValue !== false;
}

function isRetryableHttpStatus(statusCode) {
  const status = Number(statusCode || 0);
  if (!status) return false;
  if (status === 408 || status === 425 || status === 429) return true;
  return status >= 500 && status <= 599;
}

function buildRetryDelayMs(attempt = 0) {
  const safeAttempt = Math.max(0, Number(attempt || 0));
  const growth = Math.min(DB_REQUEST_RETRY_MAX_MS, DB_REQUEST_RETRY_BASE_MS * (2 ** safeAttempt));
  const jitter = DB_REQUEST_RETRY_JITTER_MS > 0
    ? Math.floor(Math.random() * DB_REQUEST_RETRY_JITTER_MS)
    : 0;
  return growth + jitter;
}

function isRetryableWorkerError(error) {
  if (!error) return false;
  if (error.retryable === true) return true;

  const status = Number(error.db_status || error.status || 0);
  if (isRetryableHttpStatus(status)) return true;

  const name = String(error.name || '').trim().toLowerCase();
  if (name === 'aborterror') return true;

  const message = String(error.message || '').trim().toLowerCase();
  if (!message) return false;
  if (message.includes('failed to fetch')) return true;
  if (message.includes('networkerror')) return true;
  if (message.includes('network request failed')) return true;
  if (message.includes('load failed')) return true;
  if (message.includes('timeout')) return true;
  return false;
}

function getCachedPathEntry(path = '') {
  if (DB_GET_CACHE_TTL_MS <= 0) return null;
  const safePath = normalizePath(path);
  const cached = getPathCache.get(safePath);
  if (!cached) return null;
  if (Date.now() > cached.expiresAtMs) {
    getPathCache.delete(safePath);
    return null;
  }
  return {
    value: deepClone(cached.value),
    rev: Math.max(0, Number(cached.rev || 0))
  };
}

function setCachedPathEntry(path = '', value = null, rev = 0) {
  if (DB_GET_CACHE_TTL_MS <= 0) return;
  const safePath = normalizePath(path);
  getPathCache.set(safePath, {
    value: deepClone(value),
    rev: Math.max(0, Number(rev || 0)),
    expiresAtMs: Date.now() + DB_GET_CACHE_TTL_MS
  });
}

function invalidatePathCache(path = '') {
  const safePath = normalizePath(path);
  getCacheVersion += 1;
  if (!getPathCache.size) return;
  Array.from(getPathCache.keys()).forEach((cachedPath) => {
    if (!pathsOverlap(cachedPath, safePath)) return;
    getPathCache.delete(cachedPath);
  });
  Array.from(getPathInflight.keys()).forEach((inflightPath) => {
    if (!pathsOverlap(inflightPath, safePath)) return;
    getPathInflight.delete(inflightPath);
  });
}

function readNodeValue(root, path = '') {
  const segments = splitPath(path);
  if (!segments.length) return deepClone(root);
  let cursor = root;
  for (const segment of segments) {
    if (!cursor || typeof cursor !== 'object' || !(segment in cursor)) return undefined;
    cursor = cursor[segment];
  }
  return deepClone(cursor);
}

function writeNodeValue(root, path = '', value = null) {
  const segments = splitPath(path);
  if (!segments.length) {
    if (value === null || value === undefined) return {};
    return deepClone(value);
  }

  const nextRoot = (
    root && typeof root === 'object' && !Array.isArray(root)
      ? root
      : {}
  );

  let cursor = nextRoot;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const key = segments[index];
    const current = cursor[key];
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }

  const lastKey = segments[segments.length - 1];
  if (value === null || value === undefined) {
    delete cursor[lastKey];
  } else {
    cursor[lastKey] = deepClone(value);
  }
  return nextRoot;
}

function applyUpdateObject(root, basePath = '', patch = {}) {
  const safePatch = isObjectLike(patch) ? patch : {};
  let nextRoot = root;
  const touchedPaths = [];
  Object.entries(safePatch).forEach(([relativePath, value]) => {
    const fullPath = joinPaths(basePath, relativePath);
    nextRoot = writeNodeValue(nextRoot, fullPath, value);
    touchedPaths.push(fullPath);
  });
  return { nextRoot, touchedPaths };
}

function bumpRevision(path = '') {
  const safePath = normalizePath(path);
  inMemoryState.revisionCounter += 1;
  inMemoryState.revisions[safePath] = inMemoryState.revisionCounter;
}

function touchPathRevision(path = '') {
  const safePath = normalizePath(path);
  const ancestors = getAncestorPaths(safePath);
  ancestors.forEach((ancestor) => bumpRevision(ancestor));

  if (!safePath) {
    Object.keys(inMemoryState.revisions).forEach((key) => {
      if (!key) return;
      bumpRevision(key);
    });
    return;
  }

  const prefix = `${safePath}/`;
  Object.keys(inMemoryState.revisions).forEach((key) => {
    if (key.startsWith(prefix)) {
      bumpRevision(key);
    }
  });
}

function getEffectiveRevision(path = '') {
  const safePath = normalizePath(path);
  const ancestors = getAncestorPaths(safePath);
  let maxRev = 0;
  ancestors.forEach((ancestor) => {
    const rev = Number(inMemoryState.revisions[ancestor] || 0);
    if (rev > maxRev) maxRev = rev;
  });
  return maxRev;
}

async function requestInMemory(pathname, payload = {}) {
  const body = payload && typeof payload === 'object' ? payload : {};
  const path = normalizePath(body.path);

  if (pathname === '/db/get') {
    const value = readNodeValue(inMemoryState.data, path);
    const rev = getEffectiveRevision(path);
    return {
      ok: true,
      exists: value !== undefined && value !== null,
      value: value === undefined ? null : value,
      rev
    };
  }

  if (pathname === '/db/set') {
    inMemoryState.data = writeNodeValue(inMemoryState.data, path, body.value ?? null);
    touchPathRevision(path);
    return { ok: true, path };
  }

  if (pathname === '/db/update') {
    if (!isObjectLike(body.patch)) {
      throw new Error('Patch precisa ser um objeto para update().');
    }
    const { nextRoot, touchedPaths } = applyUpdateObject(inMemoryState.data, path, body.patch);
    inMemoryState.data = nextRoot;
    touchedPaths.forEach((touched) => touchPathRevision(touched));
    return { ok: true, touched_paths: touchedPaths };
  }

  if (pathname === '/db/tx') {
    const expectedRev = Number(body.expected_rev || 0);
    const currentRev = getEffectiveRevision(path);
    const currentValue = readNodeValue(inMemoryState.data, path);

    if (currentRev !== expectedRev) {
      return {
        ok: true,
        committed: false,
        value: currentValue === undefined ? null : currentValue,
        rev: currentRev
      };
    }

    inMemoryState.data = writeNodeValue(inMemoryState.data, path, body.value ?? null);
    touchPathRevision(path);
    const nextValue = readNodeValue(inMemoryState.data, path);
    return {
      ok: true,
      committed: true,
      value: nextValue === undefined ? null : nextValue,
      rev: getEffectiveRevision(path)
    };
  }

  if (pathname === '/db/revs') {
    const revs = {};
    (Array.isArray(body.paths) ? body.paths : []).forEach((rawPath) => {
      const safePath = normalizePath(rawPath);
      revs[safePath] = getEffectiveRevision(safePath);
    });
    return revs;
  }

  if (pathname === '/db/ping') {
    return { ok: true, now_ms: Date.now() };
  }

  if (pathname === '/db/is_admin') {
    return false;
  }

  throw new Error(`Operacao de banco invalida: ${pathname}`);
}

async function requestWorker(pathname, payload = {}, options = {}) {
  if (ENABLE_MEMORY_FALLBACK && !SUPABASE_CONFIGURED) {
    if (!warnedMissingWorkerUrl) {
      warnedMissingWorkerUrl = true;
      if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('[dbClient] NEXT_PUBLIC_SUPABASE_URL ausente. Usando banco em memoria local.');
      }
    }
    setWorkerReachable(true);
    return requestInMemory(pathname, payload);
  }

  const supabase = getSupabase();
  if (!supabase) {
    throw new Error(
      'Banco remoto não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  const buildRpc = DB_RPC_BY_OPERATION[pathname];
  if (!buildRpc) {
    throw new Error(`Operacao de banco invalida: ${pathname}`);
  }
  const [rpcName, rpcArgs] = buildRpc(payload && typeof payload === 'object' ? payload : {});
  const safeTimeoutMs = Math.max(900, Number(options?.timeoutMs || DB_OPERATION_TIMEOUT_MS));
  const maxRetries = Math.max(0, Number(options?.maxRetries ?? DB_REQUEST_MAX_RETRIES));
  const markReachability = options?.markReachability !== false;
  let attempt = 0;

  while (attempt <= maxRetries) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), safeTimeoutMs)
      : null;

    try {
      let rpcQuery = supabase.rpc(rpcName, rpcArgs);
      if (controller) rpcQuery = rpcQuery.abortSignal(controller.signal);
      const { data, error, status, statusText } = await rpcQuery;
      if (error) {
        const statusCode = Number(status || 0);
        if (process.env.NODE_ENV !== 'production' && statusCode === 403 && typeof console !== 'undefined') {
          console.warn(`[dbClient] ${rpcName} negado em "${rpcArgs?.p_path ?? ''}"`, rpcArgs?.p_patch ? Object.keys(rpcArgs.p_patch) : '');
        }
        const requestError = new Error(
          `DB request falhou (${statusCode} ${statusText || ''}): ${error.message || 'sem detalhes'}`
        );
        requestError.db_status = statusCode;
        requestError.db_code = String(error.code || '');
        requestError.retryable = statusCode === 0 || isRetryableHttpStatus(statusCode);
        throw requestError;
      }

      if (markReachability) setWorkerReachable(true);
      return data;
    } catch (error) {
      const canRetry = attempt < maxRetries && isRetryableWorkerError(error);
      if (!canRetry) {
        if (markReachability) setWorkerReachable(false);
        throw error;
      }
      await delay(buildRetryDelayMs(attempt));
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    attempt += 1;
  }

  if (markReachability) setWorkerReachable(false);
  throw new Error('DB request falhou apos retries.');
}

function probeWorkerReachability(force = false) {
  if (ENABLE_MEMORY_FALLBACK && !SUPABASE_CONFIGURED) {
    setWorkerReachable(true);
    return Promise.resolve(true);
  }
  if (!SUPABASE_CONFIGURED) {
    setWorkerReachable(false);
    return Promise.resolve(false);
  }
  if (workerProbePromise) return workerProbePromise;

  const nowMs = Date.now();
  const recentProbe = (nowMs - workerProbeStartedAtMs) < DB_CONNECTED_PROBE_MIN_INTERVAL_MS;
  if (!force && recentProbe) {
    return Promise.resolve(workerReachable);
  }

  workerProbeStartedAtMs = nowMs;
  workerProbePromise = requestWorker(
    '/db/ping',
    {},
    {
      maxRetries: 0,
      timeoutMs: Math.min(DB_CONNECTED_PROBE_TIMEOUT_MS, DB_OPERATION_TIMEOUT_MS),
      markReachability: true
    }
  )
    .then(() => {
      setWorkerReachable(true);
      return true;
    })
    .catch(() => false)
    .finally(() => {
      workerProbePromise = null;
    });

  return workerProbePromise;
}

async function fetchPathWithRevision(path = '', options = {}) {
  const safePath = normalizePath(path);
  const forceFresh = options?.forceFresh === true;
  if (!forceFresh) {
    const cached = getCachedPathEntry(safePath);
    if (cached) return cached;
  }

  const inflight = getPathInflight.get(safePath);
  if (inflight) return inflight;

  const requestVersion = getCacheVersion;
  const requestPromise = requestWorker('/db/get', { path: safePath })
    .then((payload) => {
      const next = {
        value: payload?.value ?? null,
        rev: Math.max(0, Number(payload?.rev || 0))
      };
      if (requestVersion === getCacheVersion) {
        setCachedPathEntry(safePath, next.value, next.rev);
      }
      return next;
    })
    .finally(() => {
      if (getPathInflight.get(safePath) === requestPromise) {
        getPathInflight.delete(safePath);
      }
    });

  getPathInflight.set(safePath, requestPromise);
  return requestPromise;
}

function normalizeRefInput(target) {
  if (!target || target.__kind !== 'codequiz_db_ref') {
    throw new Error('Referencia de banco invalida.');
  }
  return target;
}

function triggerSubscriptionRefresh(changedPath = '') {
  const safePath = normalizePath(changedPath);
  subscriptions.forEach((group) => {
    if (!pathsOverlap(group.path, safePath)) return;
    void pollSubscriptionGroup(group, true);
  });
}

function markSubscriptionGroupError(group, error) {
  const nextErrorCount = Math.min(6, Math.max(0, Number(group.errorCount || 0)) + 1);
  group.errorCount = nextErrorCount;
  const backoffMs = Math.min(
    DB_SUBSCRIPTION_ERROR_BACKOFF_MAX_MS,
    DB_POLL_INTERVAL_MS * (2 ** Math.max(0, nextErrorCount - 1))
  );
  const jitterMs = backoffMs > 600 ? Math.floor(Math.random() * 280) : 0;
  group.nextPollAtMs = Date.now() + backoffMs + jitterMs;
  group.listeners.forEach((entry) => {
    if (typeof entry.onError === 'function') entry.onError(error);
  });
}

// Um unico ciclo de polling para todas as assinaturas: busca so as revisoes
// (db_revs, uma requisicao) e baixa o valor apenas dos caminhos que mudaram.
async function pollAllSubscriptionGroups() {
  if (pollLoopInFlight || !subscriptions.size) return;
  const nowMs = Date.now();
  const pageHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
  if (pageHidden) {
    if ((nowMs - lastHiddenPollAtMs) < DB_HIDDEN_POLL_INTERVAL_MS) return;
    lastHiddenPollAtMs = nowMs;
  }

  const dueGroups = Array.from(subscriptions.values()).filter((group) => (
    !group.destroyed
    && !group.inFlight
    && nowMs >= Math.max(0, Number(group.nextPollAtMs || 0))
  ));
  if (!dueGroups.length) return;

  pollLoopInFlight = true;
  try {
    const revs = await requestWorker('/db/revs', { paths: dueGroups.map((group) => group.path) });
    const safeRevs = revs && typeof revs === 'object' ? revs : {};
    dueGroups.forEach((group) => {
      if (group.destroyed) return;
      const hasRev = Object.prototype.hasOwnProperty.call(safeRevs, group.path);
      const remoteRev = hasRev ? Math.max(0, Number(safeRevs[group.path] || 0)) : null;
      if (!group.hasValue || remoteRev === null || remoteRev !== group.lastRev) {
        void pollSubscriptionGroup(group, false, { fresh: true });
        return;
      }
      group.errorCount = 0;
      group.nextPollAtMs = 0;
    });
  } catch (error) {
    dueGroups.forEach((group) => markSubscriptionGroupError(group, error));
  } finally {
    pollLoopInFlight = false;
  }
}

function ensurePollLoop() {
  if (pollLoopTimerId || typeof setInterval === 'undefined') return;
  pollLoopTimerId = setInterval(() => {
    void pollAllSubscriptionGroups();
  }, DB_POLL_INTERVAL_MS);
}

function stopPollLoopIfIdle() {
  if (subscriptions.size || !pollLoopTimerId) return;
  clearInterval(pollLoopTimerId);
  pollLoopTimerId = null;
}

async function pollSubscriptionGroup(group, force = false, options = {}) {
  if (!group || group.destroyed || group.inFlight) return;
  const nowMs = Date.now();
  if (!force && options?.fresh !== true && nowMs < Math.max(0, Number(group.nextPollAtMs || 0))) return;
  group.inFlight = true;
  try {
    const snapshot = await fetchPathWithRevision(group.path, {
      forceFresh: force || options?.fresh === true || Number(group.errorCount || 0) > 0
    });
    const currentValue = snapshot?.value ?? null;
    const currentRev = Math.max(0, Number(snapshot?.rev || 0));
    const changed = force || !group.hasValue || currentRev !== group.lastRev;
    if (changed) {
      group.hasValue = true;
      group.lastRev = currentRev;
      group.listeners.forEach((entry) => {
        try {
          entry.onNext(makeSnapshot(currentValue));
        } catch (error) {
          if (typeof entry.onError === 'function') entry.onError(error);
        }
      });
    }
    group.errorCount = 0;
    group.nextPollAtMs = 0;
  } catch (error) {
    markSubscriptionGroupError(group, error);
  } finally {
    group.inFlight = false;
  }
}

function subscribeConnectedPath(onNext, onError) {
  // Emite so quando o estado muda: cada emissao vira setState no app, e
  // re-renderizar a tela inteira a cada ciclo deixa a interface travando.
  let lastEmitted = null;
  const emit = (force = false) => {
    try {
      const connected = resolveConnectionState();
      if (!force && connected === lastEmitted) return;
      lastEmitted = connected;
      onNext(makeSnapshot(connected));
    } catch (error) {
      if (typeof onError === 'function') onError(error);
    }
  };

  emit(true);

  if (typeof window === 'undefined') {
    return () => { };
  }

  const handleOnline = () => {
    void probeWorkerReachability(true).catch(() => null);
    emit();
  };
  const handleOffline = () => emit();
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  const intervalId = setInterval(() => {
    emit();
  }, Math.max(1000, DB_POLL_INTERVAL_MS));

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    clearInterval(intervalId);
  };
}

function resolveConnectionState() {
  const browserOnline = typeof navigator === 'undefined'
    ? true
    : navigator.onLine !== false;
  if (browserOnline && !workerReachable) {
    void probeWorkerReachability(false).catch(() => null);
  }
  return browserOnline && workerReachable;
}

function createSubscriptionGroup(path = '') {
  const safePath = normalizePath(path);
  const group = {
    path: safePath,
    listeners: new Set(),
    lastRev: -1,
    hasValue: false,
    destroyed: false,
    inFlight: false,
    errorCount: 0,
    nextPollAtMs: 0
  };

  ensurePollLoop();
  void pollSubscriptionGroup(group, true);
  return group;
}

function teardownSubscriptionGroup(group) {
  if (!group) return;
  group.destroyed = true;
  stopPollLoopIfIdle();
}

export const firebaseDb = Object.freeze({
  __kind: 'codequiz_db',
  baseUrl: SUPABASE_CONFIGURED ? 'supabase' : 'memory://local'
});

export function ref(database, path = '') {
  return {
    __kind: 'codequiz_db_ref',
    db: database || firebaseDb,
    path: normalizePath(path)
  };
}

export async function get(targetRef) {
  const safeRef = normalizeRefInput(targetRef);
  if (safeRef.path === '.info/connected') {
    return makeSnapshot(resolveConnectionState());
  }
  const payload = await fetchPathWithRevision(safeRef.path);
  return makeSnapshot(payload.value);
}

// Papel de admin vem do servidor (private.db_admins); o banco em memoria nunca e admin.
export async function isCurrentUserAdmin() {
  const result = await requestWorker('/db/is_admin', {}, { maxRetries: 1, markReachability: false });
  return result === true;
}

export async function set(targetRef, value) {
  const safeRef = normalizeRefInput(targetRef);
  if (safeRef.path === '.info/connected') return;
  await requestWorker('/db/set', {
    path: safeRef.path,
    value: value ?? null
  });
  invalidatePathCache(safeRef.path);
  triggerSubscriptionRefresh(safeRef.path);
}

export async function update(targetRef, patch) {
  const safeRef = normalizeRefInput(targetRef);
  if (safeRef.path === '.info/connected') return;
  if (!isObjectLike(patch)) {
    throw new Error('Patch invalido para update(); esperado objeto.');
  }
  await requestWorker('/db/update', {
    path: safeRef.path,
    patch
  });

  const touched = Object.keys(patch);
  if (!touched.length) {
    invalidatePathCache(safeRef.path);
    triggerSubscriptionRefresh(safeRef.path);
    return;
  }
  touched.forEach((relativePath) => {
    const fullPath = joinPaths(safeRef.path, relativePath);
    invalidatePathCache(fullPath);
    triggerSubscriptionRefresh(fullPath);
  });
}

export async function runTransaction(targetRef, updaterFn) {
  const safeRef = normalizeRefInput(targetRef);
  if (typeof updaterFn !== 'function') {
    throw new Error('runTransaction precisa de uma funcao updater.');
  }
  if (safeRef.path === '.info/connected') {
    return { committed: false, snapshot: makeSnapshot(resolveConnectionState()) };
  }

  let current = await fetchPathWithRevision(safeRef.path, { forceFresh: true });
  let retries = 0;

  while (retries < DB_TX_MAX_RETRIES) {
    const nextInput = deepClone(current.value);
    const nextValue = updaterFn(nextInput);

    if (nextValue === undefined) {
      return {
        committed: false,
        snapshot: makeSnapshot(current.value)
      };
    }

    const response = await requestWorker('/db/tx', {
      path: safeRef.path,
      expected_rev: current.rev,
      value: nextValue ?? null
    });

    if (response?.committed) {
      invalidatePathCache(safeRef.path);
      triggerSubscriptionRefresh(safeRef.path);
      return {
        committed: true,
        snapshot: makeSnapshot(response.value)
      };
    }

    current = {
      value: response?.value ?? null,
      rev: Math.max(0, Number(response?.rev || 0))
    };
    retries += 1;
  }

  throw new Error('Transacao falhou por alta contencao; tente novamente.');
}

export function onValue(targetRef, onNext, onError = null) {
  const safeRef = normalizeRefInput(targetRef);
  if (typeof onNext !== 'function') return () => { };

  if (safeRef.path === '.info/connected') {
    return subscribeConnectedPath(onNext, onError);
  }

  const key = safeRef.path;
  const listener = { onNext, onError };
  let group = subscriptions.get(key);
  if (!group) {
    group = createSubscriptionGroup(key);
    subscriptions.set(key, group);
  }

  group.listeners.add(listener);
  void pollSubscriptionGroup(group, true);

  return () => {
    const activeGroup = subscriptions.get(key);
    if (!activeGroup) return;
    activeGroup.listeners.delete(listener);
    if (activeGroup.listeners.size > 0) return;
    subscriptions.delete(key);
    teardownSubscriptionGroup(activeGroup);
  };
}
