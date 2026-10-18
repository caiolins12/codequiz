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

## Música

- Playlists em `src/codequiz/app/helpers.js`: as composições adicionadas por último abrem a lista; a reprodução segue a ordem da playlist. Cada faixa dura 2 minutos durante partidas e 40 segundos no menu.
- No PvP (duelo, equipes e eliminação), `music_started_at_ms` guarda o início comum da trilha. Partidas antigas usam o início do aceite/criação como alternativa. `lib/musicPlayback.js` calcula a faixa e sua posição a partir desse início, sem reiniciar entre rodadas.
- `lib/serverClock.js` sincroniza o relógio pelo `db_ping` e usa tempo monotônico para manter os aparelhos alinhados. Reconexão, retorno à aba e reativação do áudio retomam a posição comum. O botão de troca individual fica desativado no PvP.
- `lib/chipMusic.js` agenda as notas no AudioContext, permite entrar numa posição da composição e recupera a fase quando os timers atrasam.

## Bot automation

- Roda no servidor: o pg_cron do Supabase (`private.bot_daemon_kick`, em `supabase/migrations/*_bot_daemon_server.sql`) chama `POST /api/bot-daemon` (`app/api/bot-daemon/route.js`) a cada 2 minutos, só quando a automação está ligada no painel admin (ou há duelo/quiz a encerrar).
- A rota não guarda chave: cada chamada leva um token aleatório de vida curta gerado pelo banco; com ele as RPCs valem como serviço (`private.db_is_service`).
- `runBotDaemonCycle` (repository) roda `runBotArenaAutomationTick` (rotina central do fluxo), tira de `pvp_matches` os duelos entre bots já encerrados (vão para `pvp_bot_match_log/<dia UTC>`, lido só pelo admin, 3 dias de retenção) e grava `pvp_bots_state/daemon_status`.
- No ciclo do servidor, `pvp_matches` é lida só pelas partidas abertas ou da última hora (`db_get_recent`).
- A automação roda sem parar: cada ciclo do servidor começa um duelo entre bots e um quiz solo (os bots progridem sozinhos, sem depender de jogadores). Não há ritmo diário nem cota (já houve e deixava o jogo parado).
- Rodízio equilibrado (`src/codequiz/lib/botBalance.js`), usado no duelo entre bots, no quiz solo e na escolha do bot contra jogadores (inclusive nas salas 2x2/Um contra todos): decide QUEM joga. A fila global dá o tempo de espera, ponderado pelo progresso do bot em relação à média (partidas e pontos no PvP; XP, quizzes e pontos de quiz no quiz). Quem está atrás (ex.: bots novos) volta antes; quem está à frente descansa mais; conforme se equiparam vira rodízio simples. No duelo entre bots, o rival é o da mesma categoria com pontos mais próximos, e o atrasado ganha uma pequena vantagem de precisão (até +7 p.p.).
- `pvp_bots_state/daily_pace` só registra o começo do dia de cada bot e quantos duelos/quizzes o servidor criou hoje (painel admin); não limita nada.
- Em desenvolvimento, `NEXT_PUBLIC_ENABLE_CLIENT_BOT_AUTOMATION=1` ainda roda o passo pelo navegador.

## Classes/força dos bots

- Fonte frontend/repository: `src/codequiz/lib/repository.js` (`SYSTEM_BOT_ROSTER`).
- Não existe cópia paralela no backend.
- A fonte de verdade deve permanecer concentrada no frontend/repository.
