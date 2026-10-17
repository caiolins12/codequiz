/* eslint-disable no-console */
const { loadLocalEnv } = require('./load-env');

function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function normalizePath(path = '') {
  const safe = String(path || '').trim();
  if (!safe || safe === '/') return '';
  return safe.replace(/^\/+/, '').replace(/\/+$/, '');
}

function resolveDbConfig() {
  loadLocalEnv();
  const baseUrl = normalizeBaseUrl(
    process.env.SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const serviceKey = String(process.env.SUPABASE_SECRET_KEY || '').trim();

  if (!baseUrl || !serviceKey) {
    throw new Error(
      'SUPABASE_URL/SUPABASE_SECRET_KEY ausentes. Defina-os em .env.supabase.local para usar os scripts.'
    );
  }

  return { baseUrl, serviceKey };
}

async function callRpc(config, fn, args = {}) {
  const headers = {
    'Content-Type': 'application/json',
    apikey: config.serviceKey
  };
  // Chaves legadas (JWT) precisam ir tambem no Authorization para o PostgREST.
  if (config.serviceKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${config.serviceKey}`;
  }

  const response = await fetch(`${config.baseUrl}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(args)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `DB API error (${response.status} ${response.statusText}) em ${fn}: ${body || 'sem detalhes'}`
    );
  }

  return response.json();
}

function createDbApiClient() {
  const config = resolveDbConfig();

  return {
    async get(path = '') {
      const payload = await callRpc(config, 'db_get', {
        p_path: normalizePath(path)
      });
      return payload?.value ?? null;
    },

    async set(path = '', value = null) {
      await callRpc(config, 'db_set', {
        p_path: normalizePath(path),
        p_value: value ?? null
      });
    },

    async update(path = '', patch = {}) {
      await callRpc(config, 'db_update', {
        p_path: normalizePath(path),
        p_patch: patch && typeof patch === 'object' ? patch : {}
      });
    }
  };
}

module.exports = {
  createDbApiClient
};
