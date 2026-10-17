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

function deepClone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function isObjectLike(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
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

function corsHeaders(request, env) {
  const allowMethods = 'GET,POST,OPTIONS';
  const allowHeaders = 'Content-Type, Authorization';
  const configured = String(env.ALLOWED_ORIGIN || '*').trim();
  const origin = request.headers.get('Origin') || '';
  const headers = {
    'Access-Control-Allow-Methods': allowMethods,
    'Access-Control-Allow-Headers': allowHeaders,
    Vary: 'Origin'
  };

  if (!configured || configured === '*') {
    headers['Access-Control-Allow-Origin'] = '*';
    return headers;
  }

  const allowedList = configured
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (origin && allowedList.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else {
    headers['Access-Control-Allow-Origin'] = allowedList[0] || configured;
  }
  return headers;
}

function jsonResponse(request, env, payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(request, env)
    }
  });
}

function errorResponse(request, env, message, status = 400) {
  return jsonResponse(request, env, { ok: false, error: message }, status);
}

function isAuthorized(request, env) {
  const token = String(env.API_TOKEN || '').trim();
  if (!token) return true;
  const authHeader = String(request.headers.get('Authorization') || '');
  return authHeader === `Bearer ${token}`;
}

export class QuizDurableDb {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.loaded = false;
    this.data = {};
    this.revisions = { '': 1 };
    this.revisionCounter = 1;
  }

  async ensureLoaded() {
    if (this.loaded) return;
    const [data, revisions, revisionCounter] = await Promise.all([
      this.state.storage.get('db_state'),
      this.state.storage.get('db_revisions'),
      this.state.storage.get('db_revision_counter')
    ]);
    this.data = data && typeof data === 'object' ? data : {};
    this.revisions = revisions && typeof revisions === 'object' ? revisions : { '': 1 };
    this.revisionCounter = Math.max(1, Number(revisionCounter || 1));
    this.loaded = true;
  }

  async persist() {
    await Promise.all([
      this.state.storage.put('db_state', this.data),
      this.state.storage.put('db_revisions', this.revisions),
      this.state.storage.put('db_revision_counter', this.revisionCounter)
    ]);
  }

  bumpRevision(path = '') {
    const safePath = normalizePath(path);
    this.revisionCounter += 1;
    this.revisions[safePath] = this.revisionCounter;
  }

  touchPath(path = '') {
    const safePath = normalizePath(path);
    const ancestors = getAncestorPaths(safePath);
    ancestors.forEach((ancestor) => this.bumpRevision(ancestor));

    if (!safePath) {
      Object.keys(this.revisions).forEach((key) => {
        if (!key) return;
        this.bumpRevision(key);
      });
      return;
    }

    const prefix = `${safePath}/`;
    Object.keys(this.revisions).forEach((key) => {
      if (key.startsWith(prefix)) {
        this.bumpRevision(key);
      }
    });
  }

  getEffectiveRevision(path = '') {
    const safePath = normalizePath(path);
    const ancestors = getAncestorPaths(safePath);
    let maxRev = 0;
    ancestors.forEach((ancestor) => {
      const rev = Math.max(0, Number(this.revisions[ancestor] || 0));
      if (rev > maxRev) maxRev = rev;
    });
    return maxRev;
  }

  applyUpdate(basePath = '', patch = {}) {
    const safePatch = isObjectLike(patch) ? patch : {};
    const touchedPaths = [];
    Object.entries(safePatch).forEach(([relativePath, value]) => {
      const fullPath = joinPaths(basePath, relativePath);
      this.data = writeNodeValue(this.data, fullPath, value);
      touchedPaths.push(fullPath);
    });
    touchedPaths.forEach((path) => this.touchPath(path));
    return touchedPaths;
  }

  async handleGet(request) {
    const payload = await request.json().catch(() => ({}));
    const path = normalizePath(payload.path);
    const value = readNodeValue(this.data, path);
    const rev = this.getEffectiveRevision(path);
    return jsonResponse(request, this.env, {
      ok: true,
      exists: value !== undefined && value !== null,
      value: value === undefined ? null : value,
      rev
    });
  }

  async handleSet(request) {
    const payload = await request.json().catch(() => ({}));
    const path = normalizePath(payload.path);
    this.data = writeNodeValue(this.data, path, payload.value ?? null);
    this.touchPath(path);
    await this.persist();
    return jsonResponse(request, this.env, { ok: true, path });
  }

  async handleUpdate(request) {
    const payload = await request.json().catch(() => ({}));
    const path = normalizePath(payload.path);
    if (!isObjectLike(payload.patch)) {
      return errorResponse(request, this.env, 'patch precisa ser um objeto', 400);
    }
    const touchedPaths = this.applyUpdate(path, payload.patch);
    await this.persist();
    return jsonResponse(request, this.env, {
      ok: true,
      path,
      touched_paths: touchedPaths
    });
  }

  async handleTransaction(request) {
    const payload = await request.json().catch(() => ({}));
    const path = normalizePath(payload.path);
    const expectedRev = Math.max(0, Number(payload.expected_rev || 0));
    const currentRev = this.getEffectiveRevision(path);
    const currentValue = readNodeValue(this.data, path);

    if (currentRev !== expectedRev) {
      return jsonResponse(request, this.env, {
        ok: true,
        committed: false,
        value: currentValue === undefined ? null : currentValue,
        rev: currentRev
      });
    }

    this.data = writeNodeValue(this.data, path, payload.value ?? null);
    this.touchPath(path);
    await this.persist();
    const nextValue = readNodeValue(this.data, path);
    return jsonResponse(request, this.env, {
      ok: true,
      committed: true,
      value: nextValue === undefined ? null : nextValue,
      rev: this.getEffectiveRevision(path)
    });
  }

  async fetch(request) {
    await this.ensureLoaded();

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, this.env)
      });
    }

    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse(request, this.env, {
        ok: true,
        status: 'healthy',
        revision: this.getEffectiveRevision('')
      });
    }

    if (request.method !== 'POST') {
      return errorResponse(request, this.env, 'metodo nao suportado', 405);
    }

    if (url.pathname === '/db/get') return this.handleGet(request);
    if (url.pathname === '/db/set') return this.handleSet(request);
    if (url.pathname === '/db/update') return this.handleUpdate(request);
    if (url.pathname === '/db/tx') return this.handleTransaction(request);

    return errorResponse(request, this.env, 'rota nao encontrada', 404);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env)
      });
    }

    if (!isAuthorized(request, env)) {
      return errorResponse(request, env, 'unauthorized', 401);
    }

    const id = env.QUIZ_DB.idFromName(String(env.DB_INSTANCE_NAME || 'learnquiz-prod'));
    const stub = env.QUIZ_DB.get(id);
    return stub.fetch(request);
  }
};
