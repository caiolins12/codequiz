# Bot Creation Guide (CodeQuiz)

## Objetivo
Este documento define TODO o padrao para criar e manter bots que se passam por jogadores no app.
O bot deve obedecer as mesmas regras de dados, ranking e partida que um usuario real.

## Estado atual da implementacao
- Roster oficial:
  - `bot_sys_codequiz_prime` -> nickname `tr3vo_azul` -> gender `male`
  - `bot_sys_codequiz_orbita` -> nickname `0rbita` -> gender `neutral`
  - `bot_sys_codequiz_zefira` -> nickname `Zefira` -> gender `female`
  - `bot_sys_codequiz_sopro` -> nickname `Sopro` -> gender `female`
  - `bot_sys_codequiz_lua9` -> nickname `lua9` -> gender `female`
  - `bot_sys_codequiz_thiagoara` -> nickname `ThiagoAra` -> gender `male`
  - `bot_sys_codequiz_bdevonly` -> nickname `bDevOnly` -> gender `neutral`
  - `bot_sys_codequiz_flakael` -> nickname `Flakael` -> gender `male`
  - `bot_sys_codequiz_z3n` -> nickname `z3n` -> gender `neutral`
- Total oficial: `9` bots.
- Todos os bots oficiais estao com classe/forca travada em `forte`.
- Cada bot tem personalidade valida (`provocador`, `analitico`, `calmo`).
- Cada bot tem emoji de perfil comum equipado automaticamente por personalidade:
  - `provocador` -> `emoji_common_smart`
  - `analitico` -> `emoji_common_focus`
  - `calmo` -> `emoji_common_happy`

## Regras recentes obrigatorias (atual)
- Bots devem se passar por jogadores:
  - configuracoes de bot nao ficam expostas para usuarios na tela de configuracoes.
- Emojis de batalha de bot:
  - continuam baseados em personalidade.
  - cada bot precisa ter pool proprio de 6 emojis (pode repetir emoji entre bots, mas os 6 nao podem ser identicos para todos).
- Indicadores da arena:
  - `Online` e `Jogadores na fila` devem contabilizar bots junto com humanos.
- Arena bot-vs-bot:
  - regra absoluta: apenas 1 partida bot-vs-bot ativa por vez.
  - obrigatorio manter lock de automacao + validacao adicional de partida bot-vs-bot ativa antes de criar nova.
- Classe/forca do bot:
  - definida pelo desenvolvedor no codigo/config.
  - nao editavel por jogador final.

## Regras obrigatorias de identidade
- `id`:
  - Deve seguir prefixo `bot_sys_codequiz_`.
  - Deve ser unico e estavel (nunca reciclar id de bot removido).
- `nickname`:
  - Reservado no sistema (usuarios nao podem usar).
  - Regras iguais ao usuario:
    - 3 a 24 caracteres.
    - apenas letras e numeros para input de usuario.
  - Observacao:
    - nicknames dos bots podem conter `_` em seed interna (exemplo `tr3vo_azul`),
      mas o bloqueio para usuarios compara versao normalizada sem simbolos.
- `full_name`:
  - Nome de exibicao do bot.
- `bot_gender`:
  - `male`, `female` ou `neutral`.

## Recursos e comportamentos de bot

### 1) Matchmaking
- Usuario entra na fila PVP normalmente.
- Se nao encontrar humano apos 15s, agenda janela aleatoria para bot:
  - `queueBotMatchAtMs = agora + 15000 + random(2500..9000)`.
- No tick de matchmaking:
  - Seleciona bot aleatorio do roster oficial.
  - Adquire lock por par (`user_id` + `bot_id`) em `pvp_pair_locks`.
  - Cria partida com:
    - `is_bot_match: true`
    - `bot_user_id: <id do bot selecionado>`
    - `bot_personality`
    - `bot_strength`
  - Bot entra como `player2` e ja inicia com `player2_accept_state: accepted`.
- Matchmaking respeita categoria/dificuldade da fila do usuario.
- Seleciona bot para usuario via `pvp_bots_state/user_queue/order`:
  - ordem fixa e rotativa.
  - bot ocupado nao pode ser escolhido.
  - ao aceitar confronto com usuario -> vai para o fim da fila.
  - ao recusar confronto -> vai para o fim da fila.

### 1.1) Arena bot-vs-bot continua
- Existe automacao com lock distribuido em `pvp_bots_state/automation_lock`.
- Existe fila dedicada `pvp_bots_state/arena_queue/order`.
- Regras:
  - apenas 1 combate bot-vs-bot em tempo real por vez.
  - os 2 bots selecionados entram em `busy` e vao para o fim da fila da arena.
  - o proximo combate so inicia quando o atual termina.
  - resultado entra em `user_stats` (pontos, xp, vitorias, derrotas, batalhas).
  - bot marcado como `busy` nao pode ser usado para confronto contra usuario.
- Estado da arena em tempo real:
  - `pvp_bots_state/arena_state`
  - `status`, `match_id`, bots participantes, `started_at_ms`, `ends_at_ms`.

### 2) Perguntas e dificuldade
- Perguntas da partida seguem a dificuldade escolhida/categoria da fila.
- Total de rodadas usa `PVP_ROUNDS_PER_MATCH`.
- Temporizador por rodada:
  - `easy: 20s`, `medium: 18s`, `hard: 15s`.

### 3) Resposta do bot
- Bot responde com atraso aleatorio por rodada:
  - intervalo alvo entre `2s` e `6s`.
  - limitado pelo tempo restante da rodada para nao responder apos timeout.
- Taxa de acerto:
  - `fraco: 40%`, `medio: 70%`, `forte: 90%`.
  - Na pratica atual, bots oficiais ficam travados em `forte` (90%).

### 4) Reacoes e emojis do bot
- Pool de emojis depende da personalidade.
- Pode reagir:
  - quando usuario envia emoji.
  - quando bot responde primeiro.
  - na tela de resultado da rodada.
- Intervalos usados:
  - reacao rapida: 1-2s.
  - resultado de rodada: 1-3s.
- Quantidade por gatilho:
  - 1-2 em eventos normais.
  - 2-3 quando usuario erra na tela de resultado.
- Evento enviado em `pvp_matches/<matchId>/emoji_event` com `sender_user_id = bot_user_id`.

### 5) Regras especiais em confronto com usuario
- Recusa de convite:
  - bot decide com chance de 60% de recusar.
- Abandono por desvantagem:
  - se bot estiver perdendo em placar equivalente a `4x1` ou `4x2`,
    ele tem 80% de chance de sair da partida (forfeit).

## Regras de pontuacao/recompensa (mesmas do jogador)

### PVP points
- Vitoria:
  - base `+4`.
  - batalha 6 e 7: `+6`.
  - batalha >= 8: `+8`.
- Derrota:
  - base `-2`.
  - batalha >= 6: `-1`.
- Forfeit:
  - quem sai: `-2`.
  - quem fica: `+4`.

### XP e moedas PVP
- Seguem `PVP_XP_REWARD` e `PVP_COINS_REWARD` por dificuldade e resultado.
- Bot recebe e perde os mesmos valores que um jogador receberia.

### Ranking
- Bot participa de `user_stats` e aparece em ranking global.
- `pvp_points`, `pvp_wins`, `pvp_battles`, `total_xp` e demais campos sao atualizados apos cada partida.

## Estrutura de dados no Firebase (Realtime DB)

### users/<botId>
- `id`, `auth_id`
- `full_name`
- `nickname`
- `avatar`
- `equipped_frame`
- `equipped_background`
- `equipped_emoji`
- `bot_gender`
- `bot_personality`
- `bot_strength`
- `is_system_bot`
- `created_at`, `updated_at`

### user_stats/<botId>
- `user_id`
- `total_xp`, `level`
- `ranking_points`
- `pvp_points`, `pvp_battles`, `pvp_wins`, `pvp_losses`
- `best_streak`, `total_correct`, `total_answered`, `quizzes_completed`
- `topic_progress`, `quiz_best_scores`, `quiz_best_stars`
- `is_system_bot`
- `updated_at`

### pvp_bots_state/configs/<botId>
- `bot_id`
- `nickname`
- `personality`
- `strength` (travado em `forte` para bots oficiais)
- `gender`
- `updated_at`

### pvp_bots_state/config
- Alias de compatibilidade para o bot principal (`bot_sys_codequiz_prime`).

## Regras de seguranca (database.rules.json)
- Escrita em `users/$uid`, `user_stats/$uid`, `pvp_answers/.../$uid` permite:
  - proprio usuario autenticado (`auth.uid === $uid`)
  - ids de bot oficiais por regex:
    - `$uid.matches(/^bot_sys_codequiz_[A-Za-z0-9_]+$/)`

## Fluxo de criacao de novo bot (checklist completo)
1. Definir entrada no roster (`src/codequiz/lib/repository.js`):
   - `id`, `nickname`, `full_name`, `avatar`, `gender`, `default_personality`.
2. Garantir que nickname novo nao conflita com usuario:
   - validacao de nickname reservado usa roster automaticamente.
3. Garantir seed de config:
   - `pvp_bots_state/configs/<botId>` com personalidade valida e `strength=forte`.
4. Garantir seed de perfil:
   - `users/<botId>` com moldura/fundo padrao e emoji comum por personalidade.
5. Garantir seed de stats:
   - `user_stats/<botId>` com estado inicial completo.
6. Confirmar matchmaking:
   - bot pode ser selecionado aleatoriamente no fallback de fila.
7. Confirmar gameplay:
   - resposta automatica, reacoes por emoji, e finalizacao de rodada.
8. Confirmar economia/ranking:
   - ganhos/perdas de PVP, XP e moedas aplicados ao bot.
9. Confirmar regras Firebase:
   - regex de bot cobre o novo id.
10. Validar build e fluxo real:
   - login -> fila -> partida com bot -> resultado -> ranking.

## Arquivos principais envolvidos
- `src/codequiz/lib/repository.js`
- `src/codequiz/CodeQuizApp.jsx`
- `src/codequiz/lib/pvp.js`
- `src/codequiz/lib/constants.js`
- `database.rules.json`

## Observacoes operacionais
- Bots oficiais foram desenhados para parecer jogadores reais:
  - possuem perfil, nivel, pontos e historico persistido.
  - aparecem no ranking com nickname/icone.
  - seguem as mesmas regras de partida e pontuacao.
- Para manter consistencia competitiva, bots oficiais atuais permanecem em `forte`.
