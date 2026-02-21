# Runtime Boundaries (Source of Truth)

Este documento evita regressões por lógica duplicada em arquivos diferentes.

## Frontend (runtime ativo)

- Entrada principal: `app/page.js` -> `src/codequiz/CodeQuizApp.jsx`
- Lógica de dados/repositório: `src/codequiz/lib/repository.js`
- Regras de domínio compartilhadas no frontend: `src/codequiz/lib/*.js`

## Backend (runtime ativo)

- Automação de bots e reconciliação de partidas: `functions/index.js`
- Regras de segurança Realtime Database: `database.rules.json`

## Estrutura única

- O runtime de frontend é exclusivamente Next (`app/` + `src/`).
- Não existe mais app estático legado paralelo (`index.html`/`game.js`/`questions.js`).

## Bot automation

- Fonte principal de automação contínua: `functions/index.js` (`exports.botArenaDaemon`).
- A automação cliente (`runBotArenaAutomationTick`) é apenas fallback de desenvolvimento
  e fica desativada em produção por padrão.

## Classes/força dos bots

- Fonte frontend/repository: `src/codequiz/lib/repository.js` (`SYSTEM_BOT_ROSTER`).
- Fonte backend/functions: `functions/index.js` (`SYSTEM_BOT_ROSTER`).
- Sempre manter ambos alinhados para evitar comportamento diferente entre
  Bot x Bot, Bot x Usuário e Quiz de bots.
