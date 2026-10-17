# Durable DB Worker

Worker para substituir o Realtime Database com Cloudflare Workers + Durable Objects.

## Endpoints

- `POST /db/get` body: `{ "path": "users/abc" }`
- `POST /db/set` body: `{ "path": "users/abc", "value": { ... } }`
- `POST /db/update` body: `{ "path": "users", "patch": { "abc/nickname": "novo" } }`
- `POST /db/tx` body: `{ "path": "users/abc", "expected_rev": 10, "value": { ... } }`
- `GET /health`

## Deploy

```bash
cd workers/durable-db
npm install
npx wrangler deploy
```

## Variaveis

- `ALLOWED_ORIGIN`: origem permitida para CORS (use `*` para liberar).
- `DB_INSTANCE_NAME`: nome logico da instancia Durable Object.
- `API_TOKEN`: opcional, token Bearer exigido em todas as rotas.
