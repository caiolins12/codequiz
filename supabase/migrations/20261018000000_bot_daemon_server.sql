-- Automacao dos bots no servidor e painel admin restrito ao dono.
--
-- Desde a saida do Firebase a automacao dos bots (duelos e quizzes entre bots)
-- so rodava no navegador em modo de desenvolvimento, entao em producao ela
-- nunca executava. Agora o pg_cron chama, a cada 2 minutos, a rota
-- /api/bot-daemon do site, que roda um ciclo de runBotArenaAutomationTick.
--
-- A rota nao guarda chave nenhuma: a cada chamada o banco gera um token
-- aleatorio de vida curta (private.db_daemon_tokens) e o envia no corpo do
-- POST. A rota repassa o token no cabecalho x-codequiz-daemon-token, e as
-- requisicoes com token valido valem como servico em private.db_is_service().
-- Com a automacao desligada no painel (e nada em andamento), a rota nem e
-- chamada. public.db_get_recent deixa o ciclo ler de pvp_matches so as
-- partidas abertas ou recentes. O painel admin passa a exigir tambem o e-mail
-- caiolins12@gmail.com (private.db_is_admin).

create extension if not exists pg_net with schema extensions;

create table if not exists private.db_daemon_tokens (
  token text primary key,
  expires_at timestamptz not null
);

revoke all on table private.db_daemon_tokens from public, anon, authenticated;

create or replace function private.db_daemon_token_ok()
returns boolean
language plpgsql
stable
as $$
declare
  headers text := current_setting('request.headers', true);
  tok text;
begin
  if headers is null or headers = '' then
    return false;
  end if;
  tok := nullif(headers::json ->> 'x-codequiz-daemon-token', '');
  if tok is null then
    return false;
  end if;
  return exists (
    select 1 from private.db_daemon_tokens t
    where t.token = tok and t.expires_at > now()
  );
end;
$$;

create or replace function private.db_is_service()
returns boolean
language sql
stable
as $$
  select coalesce(auth.role(), '') = 'service_role'
      or session_user in ('postgres', 'supabase_admin')
      or private.db_daemon_token_ok()
$$;

-- Admin: precisa estar em private.db_admins e ser a conta caiolins12@gmail.com.
create or replace function private.db_is_admin()
returns boolean
language sql
stable
as $$
  select auth.uid() is not null
     and exists (
       select 1
       from private.db_admins a
       join auth.users u on u.id = a.uid
       where a.uid = auth.uid()
         and lower(u.email) = 'caiolins12@gmail.com'
     )
$$;

-- A rota confere o token antes de rodar o ciclo.
create or replace function public.db_daemon_check()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.db_daemon_token_ok()
$$;

-- Leitura enxuta de uma colecao: so as linhas "abertas" (status de partida em
-- andamento) ou gravadas nos ultimos p_window_ms. O ciclo dos bots le pvp_matches
-- varias vezes e so precisa dessas linhas; ler a colecao inteira custaria trafego
-- que cresce com o historico.
create or replace function public.db_get_recent(p_path text, p_window_ms bigint)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  segs text[] := private.db_segments(p_path);
  result jsonb;
begin
  if coalesce(array_length(segs, 1), 0) <> 1 then
    raise exception 'db: leitura recente so vale para colecoes' using errcode = '22023';
  end if;
  if not private.db_can_read(segs) then
    raise exception 'db: leitura negada em "%"', coalesce(p_path, '') using errcode = '42501';
  end if;
  select jsonb_object_agg(split_part(d.path, '/', 2), d.value) into result
  from private.db_nodes d
  where d.top = segs[1]
    and d.value is not null
    and (
      d.updated_at > now() - make_interval(secs => greatest(0, coalesce(p_window_ms, 0)) / 1000.0)
      or coalesce(d.value ->> 'status', '') in ('pending_accept', 'active', 'round_result', 'matched', 'starting')
    );
  return jsonb_build_object(
    'ok', true,
    'exists', result is not null,
    'value', private.db_null_if_json_null(result),
    'rev', private.db_rev(segs)
  );
end;
$$;

-- Dispara um ciclo da automacao (chamado pelo pg_cron).
create or replace function private.bot_daemon_kick()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  control jsonb;
  arena_status text;
  quiz_status text;
  master_on boolean;
  wanted boolean;
  tok text;
begin
  delete from private.db_daemon_tokens where expires_at < now() - interval '5 minutes';

  select d.value into control from private.db_nodes d where d.path = 'pvp_bots_state/daemon_control';
  select d.value ->> 'status' into arena_status from private.db_nodes d where d.path = 'pvp_bots_state/arena_state';
  select d.value ->> 'status' into quiz_status from private.db_nodes d where d.path = 'pvp_bots_state/arena_quiz_state';

  -- Mesmos padroes do app (normalizeBotArenaDaemonControl): sem registro, ligado.
  master_on := coalesce((control ->> 'arena_enabled')::boolean, true);
  wanted := master_on and (
    coalesce((control ->> 'pvp_enabled')::boolean, true)
    or coalesce((control ->> 'quiz_enabled')::boolean, true)
  );
  -- Desligada, ainda roda para encerrar o duelo/quiz que ficou em andamento.
  if not wanted and coalesce(arena_status, '') <> 'active' and coalesce(quiz_status, '') <> 'active' then
    return;
  end if;

  tok := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into private.db_daemon_tokens (token, expires_at)
  values (tok, now() + interval '3 minutes');

  perform net.http_post(
    url := 'https://brain-versus-brain.vercel.app/api/bot-daemon',
    body := jsonb_build_object('token', tok),
    headers := jsonb_build_object('Content-Type', 'application/json'),
    timeout_milliseconds := 60000
  );
end;
$$;

revoke all on function private.db_daemon_token_ok() from public, anon, authenticated;
revoke all on function private.db_is_service() from public, anon, authenticated;
revoke all on function private.db_is_admin() from public, anon, authenticated;
revoke all on function private.bot_daemon_kick() from public, anon, authenticated;

revoke all on function public.db_daemon_check() from public;
grant execute on function public.db_daemon_check() to anon, authenticated, service_role;

revoke all on function public.db_get_recent(text, bigint) from public;
grant execute on function public.db_get_recent(text, bigint) to anon, authenticated, service_role;

-- A rota chama as RPCs sem login (papel anon). Sem token valido, as regras de
-- private.db_can_read/db_can_write continuam negando tudo ao anon.
grant execute on function public.db_get(text) to anon;
grant execute on function public.db_revs(text[]) to anon;
grant execute on function public.db_set(text, jsonb) to anon;
grant execute on function public.db_update(text, json) to anon;
grant execute on function public.db_tx(text, bigint, jsonb) to anon;

select cron.schedule(
  'codequiz-bot-daemon',
  '*/2 * * * *',
  $$select private.bot_daemon_kick()$$
);
