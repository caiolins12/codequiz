# Deploy: Vercel + Cloudflare Durable Objects

## 1) Publicar o banco no Cloudflare

```bash
cd workers/durable-db
npm install
npx wrangler deploy
```

Depois do deploy, copie a URL do Worker (`https://<nome>.workers.dev`).

## 2) Configurar variaveis no frontend (Vercel)

No projeto da Vercel, configure:

- `NEXT_PUBLIC_DB_WORKER_URL` = URL do Worker
- `NEXT_PUBLIC_DB_WORKER_TOKEN` = token Bearer (somente se `API_TOKEN` estiver definido no Worker)
- `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` = Client ID OAuth Web do Google Cloud
- `NEXT_PUBLIC_DB_POLL_INTERVAL_MS` = opcional (ex: `1200`)
- `NEXT_PUBLIC_DB_OPERATION_TIMEOUT_MS` = opcional (ex: `12000`)

Se quiser fallback local em memoria durante desenvolvimento:

- `NEXT_PUBLIC_DB_ALLOW_MEMORY_FALLBACK` = `1`

## 3) Configurar variaveis no Worker (Cloudflare)

No `wrangler.toml` ou painel:

- `ALLOWED_ORIGIN` = dominio do app em producao (ex: `https://seu-app.vercel.app`)
- `API_TOKEN` = opcional (se definido, o frontend deve enviar `NEXT_PUBLIC_DB_WORKER_TOKEN`)

## 3.1) Google OAuth

O frontend usa Google OAuth direto pelo navegador (Google Identity Services).
Nesse fluxo, o `client secret` nao deve ser exposto no cliente.

## 4) Deploy do frontend na Vercel

```bash
npm install
npm run build:vercel
```

Ou via CLI:

```bash
npm run deploy:vercel
```

## 5) Scripts administrativos

Os scripts de manutencao agora usam o Worker:

- `npm run recalc:pvp:dry`
- `npm run recalc:pvp`
- `npm run season:reset:s1:dry`
- `npm run season:reset:s1`

Variaveis para scripts:

- `DB_WORKER_URL`
- `DB_WORKER_TOKEN` (opcional)
