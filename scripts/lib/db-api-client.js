/* eslint-disable no-console */
function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function normalizePath(path = '') {
  const safe = String(path || '').trim();
  if (!safe || safe === '/') return '';
  return safe.replace(/^\/+/, '').replace(/\/+$/, '');
}

function resolveDbConfig() {
  const baseUrl = normalizeBaseUrl(
    process.env.DB_WORKER_URL
    || process.env.NEXT_PUBLIC_DB_WORKER_URL
  );
  const token = String(
    process.env.DB_WORKER_TOKEN
    || process.env.NEXT_PUBLIC_DB_WORKER_TOKEN
    || ''
  ).trim();

  if (!baseUrl) {
    throw new Error(
      'DB_WORKER_URL ausente. Defina DB_WORKER_URL (ou NEXT_PUBLIC_DB_WORKER_URL) para usar os scripts.'
    );
  }

  return { baseUrl, token };
}

async function callDbApi(config, route, payload = {}) {
  const endpoint = `${config.baseUrl}${route}`;
  const headers = {
    'Content-Type': 'application/json'
  };
  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `DB API error (${response.status} ${response.statusText}) em ${route}: ${body || 'sem detalhes'}`
    );
  }

  return response.json();
}

function createDbApiClient() {
  const config = resolveDbConfig();

  return {
    async get(path = '') {
      const payload = await callDbApi(config, '/db/get', {
        path: normalizePath(path)
      });
      return payload?.value ?? null;
    },

    async set(path = '', value = null) {
      await callDbApi(config, '/db/set', {
        path: normalizePath(path),
        value: value ?? null
      });
    },

    async update(path = '', patch = {}) {
      await callDbApi(config, '/db/update', {
        path: normalizePath(path),
        patch: patch && typeof patch === 'object' ? patch : {}
      });
    }
  };
}

module.exports = {
  createDbApiClient
};
