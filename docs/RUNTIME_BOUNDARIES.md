# Runtime Boundaries (Source of Truth)

Este documento evita regressões por lógica duplicada em arquivos diferentes.

## Frontend (runtime ativo)

- Entrada principal: `app/page.js` -> `src/codequiz/CodeQuizApp.jsx`
- Lógica de dados/repositório: `src/codequiz/lib/repository.js`
- Regras de domínio compartilhadas no frontend: `src/codequiz/lib/*.js`

## Backend (runtime ativo)

- Banco remoto: Supabase (Postgres). Schema e regras em `supabase/migrations/`.
- Login: Supabase Auth com Google (`src/codequiz/lib/googleAuthClient.js`).
- Cliente de acesso ao banco: `src/codequiz/lib/dbClient.js`

## Estrutura única

- O runtime de frontend é exclusivamente Next (`app/` + `src/`).
- Não existe mais app estático legado paralelo (`index.html`/`game.js`/`questions.js`).

## Bot automation

- A automação atual fica no cliente/repositório, com a persistência remota atendida pelas funções RPC do Supabase.
- `runBotArenaAutomationTick` continua sendo a rotina central do app para esse fluxo.

## Classes/força dos bots

- Fonte frontend/repository: `src/codequiz/lib/repository.js` (`SYSTEM_BOT_ROSTER`).
- Não existe cópia paralela no backend.
- A fonte de verdade deve permanecer concentrada no frontend/repository.
