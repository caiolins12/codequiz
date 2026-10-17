# Deploy: Vercel + Supabase

Brain Versus Brain (BVB Game). Frontend na Vercel (projeto `bvb-game` em
`caiolins12's projects`, endereço `brain-versus-brain.vercel.app`; o antigo
`learnquiz.vercel.app` fica em outra conta e não recebe mais deploys), banco e login no Supabase
(projeto `learnquiz`, ref `znfikxpmraklqrwqxepg`, região São Paulo).

## Como o banco funciona

O app usa uma API no estilo Realtime Database (`ref/get/set/update/runTransaction/onValue`
em `src/codequiz/lib/dbClient.js`). No Supabase isso vira:

- Tabela `private.db_nodes`: uma linha por "shard" (dois primeiros segmentos do caminho,
  ex.: `users/<uid>`, `pvp_matches/<id>`), com o conteúdo em `jsonb` e uma revisão (`rev`).
- Funções RPC `public.db_get`, `db_set`, `db_update`, `db_tx`, `db_revs`, `db_ping`.
  A tabela não é exposta; todo acesso passa pelas funções, que aplicam as regras:
  - só usuários logados leem/escrevem;
  - `users/<id>`, `user_stats/<id>`, `quiz_results/<quiz>/<id>`: o próprio usuário ou bots `bot_sys_codequiz_*`;
  - `user_shop/<id>`, `presence/<id>`, `cloud_saves/<id>`: só o próprio usuário (`cloud_saves` também só ele lê);
  - ninguém (exceto a chave service_role) lê a raiz ou apaga coleções inteiras.
- `onValue` faz polling em lote: uma chamada `db_revs` por ciclo e só baixa o valor dos caminhos que mudaram.
- Um job `pg_cron` diário remove marcadores de remoção (tombstones) com mais de 2 dias.

## Login com Google

Supabase Auth com provedor Google em modo ID token: o navegador recebe o token pelo
Google Identity Services (botão oficial / One Tap) e chama `supabase.auth.signInWithIdToken`
com nonce. Não usa client secret nem redirect URI.

- Client ID: projeto Google Cloud `learnquiz-489618`.
- Se o app ganhar um domínio novo, adicione-o em **Origens JavaScript autorizadas** do
  client OAuth no Google Cloud Console (o `gcloud` não edita clients OAuth web).

## Variáveis de ambiente

Frontend (Vercel e `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` = `https://znfikxpmraklqrwqxepg.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = chave publishable do projeto
- `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` = client ID web do Google
- `NEXT_PUBLIC_DB_POLL_INTERVAL_MS` = opcional (padrão `1200`)

Scripts administrativos (`.env.supabase.local`, nunca commitar):

- `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (service_role), `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`

Sem `NEXT_PUBLIC_SUPABASE_URL` em desenvolvimento, o app usa um banco em memória local.

## Comandos

```bash
npm run db:push        # aplica migrations em supabase/migrations
npm run seed:bots      # cria/atualiza os bots do sistema no banco
npm run recalc:pvp:dry # recalcula histórico PvP (simulação)
npm run deploy:vercel  # deploy de produção na Vercel
```

Configuração do Auth (provedor Google, URLs) fica em `supabase/config.toml` e é aplicada com
`supabase config push`.
