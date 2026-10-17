-- CodeQuiz: banco em arvore JSON sobre Postgres.
--
-- O app usa uma API no estilo Realtime Database (ref/get/set/update/transaction
-- por caminho, ex.: "users/<uid>/nickname"). Cada "shard" (os dois primeiros
-- segmentos do caminho, ex.: "users/<uid>", "pvp_matches/<id>") vira uma linha
-- em db_nodes. Caminhos mais profundos sao lidos/escritos dentro do jsonb da
-- linha. O acesso acontece apenas pelas funcoes RPC public.db_*, que aplicam
-- as regras de permissao por usuario (auth.uid()).
--
-- rev: numero de revisao global e monotono. Toda escrita numa colecao roda sob
-- um advisory lock da colecao, entao a maior rev de uma colecao muda sempre que
-- algo dentro dela muda (inclusive remocoes, que viram tombstones value = null).

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create sequence if not exists private.db_rev_seq;

create table if not exists private.db_nodes (
  path text primary key,
  top text not null,
  value jsonb,
  rev bigint not null,
  updated_at timestamptz not null default now()
);

create index if not exists db_nodes_top_rev_idx on private.db_nodes (top, rev desc);
create index if not exists db_nodes_tombstones_idx on private.db_nodes (updated_at) where value is null;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function private.db_segments(p_path text)
returns text[]
language sql
immutable
as $$
  select coalesce(
    array_remove(string_to_array(btrim(btrim(coalesce(p_path, '')), '/'), '/'), ''),
    '{}'::text[]
  )
$$;

create or replace function private.db_null_if_json_null(p_value jsonb)
returns jsonb
language sql
immutable
as $$
  select case when p_value is null or jsonb_typeof(p_value) = 'null' then null else p_value end
$$;

create or replace function private.db_set_deep(p_target jsonb, p_path text[], p_value jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  base jsonb := case when jsonb_typeof(p_target) = 'object' then p_target else '{}'::jsonb end;
begin
  if coalesce(array_length(p_path, 1), 0) = 0 then
    return p_value;
  end if;
  if array_length(p_path, 1) = 1 then
    if p_value is null then
      return base - p_path[1];
    end if;
    return base || jsonb_build_object(p_path[1], p_value);
  end if;
  return base || jsonb_build_object(
    p_path[1],
    private.db_set_deep(base -> p_path[1], p_path[2:], p_value)
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
$$;

create or replace function private.db_is_bot_id(p_id text)
returns boolean
language sql
immutable
as $$
  select coalesce(p_id, '') ~ '^bot_sys_codequiz_[A-Za-z0-9_]+$'
$$;

create or replace function private.db_can_read(p_segs text[])
returns boolean
language plpgsql
stable
as $$
declare
  n int := coalesce(array_length(p_segs, 1), 0);
  uid text := auth.uid()::text;
begin
  if private.db_is_service() then
    return true;
  end if;
  if uid is null or n = 0 then
    return false;
  end if;
  if p_segs[1] = 'cloud_saves' then
    return n >= 2 and p_segs[2] = uid;
  end if;
  return true;
end;
$$;

create or replace function private.db_can_write(p_segs text[])
returns boolean
language plpgsql
stable
as $$
declare
  n int := coalesce(array_length(p_segs, 1), 0);
  uid text := auth.uid()::text;
  top text := p_segs[1];
begin
  if private.db_is_service() then
    return true;
  end if;
  if uid is null or n = 0 then
    return false;
  end if;
  if n = 1 then
    -- O app faz transacoes na colecao inteira apenas para salas de equipe/eliminacao.
    return top in ('pvp_team_rooms', 'pvp_elimination_rooms');
  end if;
  if top in ('users', 'user_stats') then
    return p_segs[2] = uid or private.db_is_bot_id(p_segs[2]);
  end if;
  if top = 'quiz_results' then
    return n >= 3 and (p_segs[3] = uid or private.db_is_bot_id(p_segs[3]));
  end if;
  if top in ('user_shop', 'cloud_saves', 'presence') then
    return p_segs[2] = uid;
  end if;
  return true;
end;
$$;

create or replace function private.db_lock_tops(p_tops text[])
returns void
language plpgsql
as $$
declare
  t text;
begin
  for t in select distinct x from unnest(p_tops) as x where x is not null order by 1 loop
    perform pg_advisory_xact_lock(hashtextextended('codequiz_db:' || t, 0));
  end loop;
end;
$$;

create or replace function private.db_rev(p_segs text[])
returns bigint
language plpgsql
stable
as $$
declare
  n int := coalesce(array_length(p_segs, 1), 0);
  result bigint;
begin
  if n = 0 then
    select max(d.rev) into result from private.db_nodes d;
  elsif n = 1 then
    select max(d.rev) into result from private.db_nodes d where d.top = p_segs[1];
  else
    select d.rev into result from private.db_nodes d where d.path = p_segs[1] || '/' || p_segs[2];
  end if;
  return coalesce(result, 0);
end;
$$;

create or replace function private.db_read(p_segs text[])
returns jsonb
language plpgsql
stable
as $$
declare
  n int := coalesce(array_length(p_segs, 1), 0);
  result jsonb;
begin
  if n = 0 then
    select jsonb_object_agg(s.top, s.obj) into result
    from (
      select d.top, jsonb_object_agg(split_part(d.path, '/', 2), d.value) as obj
      from private.db_nodes d
      where d.value is not null
      group by d.top
    ) s;
  elsif n = 1 then
    select jsonb_object_agg(split_part(d.path, '/', 2), d.value) into result
    from private.db_nodes d
    where d.top = p_segs[1] and d.value is not null;
  elsif n = 2 then
    select d.value into result from private.db_nodes d where d.path = p_segs[1] || '/' || p_segs[2];
  else
    select d.value #> p_segs[3:n] into result from private.db_nodes d where d.path = p_segs[1] || '/' || p_segs[2];
  end if;
  return private.db_null_if_json_null(result);
end;
$$;

-- Escrita sem checagem de permissao; quem chama ja segura os locks das colecoes.
create or replace function private.db_write(p_segs text[], p_value jsonb)
returns void
language plpgsql
as $$
declare
  n int := coalesce(array_length(p_segs, 1), 0);
  v jsonb := private.db_null_if_json_null(p_value);
  shard text;
  cur jsonb;
  next_value jsonb;
  child record;
begin
  if n = 0 then
    if v is not null and jsonb_typeof(v) <> 'object' then
      raise exception 'db: valor da raiz precisa ser objeto' using errcode = '22023';
    end if;
    update private.db_nodes d
      set value = null, rev = nextval('private.db_rev_seq'), updated_at = now()
      where d.value is not null
        and (v is null or not (v ? d.top));
    if v is not null then
      for child in select key, value from jsonb_each(v) loop
        perform private.db_write(array[child.key], child.value);
      end loop;
    end if;
    return;
  end if;

  if n = 1 then
    if v is not null and jsonb_typeof(v) <> 'object' then
      raise exception 'db: colecao "%" precisa ser objeto', p_segs[1] using errcode = '22023';
    end if;
    update private.db_nodes d
      set value = null, rev = nextval('private.db_rev_seq'), updated_at = now()
      where d.top = p_segs[1]
        and d.value is not null
        and (v is null or not (v ? split_part(d.path, '/', 2)));
    if v is not null then
      for child in select key, value from jsonb_each(v) loop
        perform private.db_write(array[p_segs[1], child.key], child.value);
      end loop;
    end if;
    return;
  end if;

  shard := p_segs[1] || '/' || p_segs[2];
  select d.value into cur from private.db_nodes d where d.path = shard;

  if n = 2 then
    next_value := v;
  else
    if v is null and cur is null then
      return;
    end if;
    next_value := private.db_set_deep(cur, p_segs[3:n], v);
  end if;

  if next_value is not distinct from cur then
    return;
  end if;

  insert into private.db_nodes as d (path, top, value, rev, updated_at)
  values (shard, p_segs[1], next_value, nextval('private.db_rev_seq'), now())
  on conflict (path) do update
    set value = excluded.value, rev = excluded.rev, updated_at = excluded.updated_at;
end;
$$;

create or replace function private.db_all_tops()
returns text[]
language sql
stable
as $$
  select coalesce(array_agg(distinct d.top), '{}'::text[]) from private.db_nodes d
$$;

-- ---------------------------------------------------------------------------
-- RPC publica (PostgREST)
-- ---------------------------------------------------------------------------

create or replace function public.db_ping()
returns jsonb
language sql
stable
as $$
  select jsonb_build_object('ok', true, 'now_ms', floor(extract(epoch from clock_timestamp()) * 1000)::bigint)
$$;

create or replace function public.db_get(p_path text)
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
  if not private.db_can_read(segs) then
    raise exception 'db: leitura negada em "%"', coalesce(p_path, '') using errcode = '42501';
  end if;
  result := private.db_read(segs);
  return jsonb_build_object(
    'ok', true,
    'exists', result is not null,
    'value', result,
    'rev', private.db_rev(segs)
  );
end;
$$;

create or replace function public.db_revs(p_paths text[])
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  p text;
  segs text[];
  result jsonb := '{}'::jsonb;
begin
  foreach p in array coalesce(p_paths, '{}'::text[]) loop
    segs := private.db_segments(p);
    if private.db_can_read(segs) then
      result := result || jsonb_build_object(coalesce(p, ''), private.db_rev(segs));
    end if;
  end loop;
  return result;
end;
$$;

create or replace function public.db_set(p_path text, p_value jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  segs text[] := private.db_segments(p_path);
begin
  if not private.db_can_write(segs) then
    raise exception 'db: escrita negada em "%"', coalesce(p_path, '') using errcode = '42501';
  end if;
  if coalesce(array_length(segs, 1), 0) = 0 then
    perform private.db_lock_tops(
      private.db_all_tops()
      || case
        when jsonb_typeof(p_value) = 'object' then array(select jsonb_object_keys(p_value))
        else '{}'::text[]
      end
    );
  else
    perform private.db_lock_tops(array[segs[1]]);
  end if;
  perform private.db_write(segs, p_value);
  return jsonb_build_object('ok', true, 'rev', private.db_rev(segs));
end;
$$;

-- p_patch e json (nao jsonb) para preservar a ordem das chaves do update().
create or replace function public.db_update(p_path text, p_patch json)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text[] := private.db_segments(p_path);
  entry record;
  target text[];
  tops text[] := '{}';
  touched text[] := '{}';
begin
  if p_patch is null or json_typeof(p_patch) <> 'object' then
    raise exception 'db: patch precisa ser objeto' using errcode = '22023';
  end if;

  for entry in select key, value from json_each(p_patch) loop
    target := base || private.db_segments(entry.key);
    if not private.db_can_write(target) then
      raise exception 'db: escrita negada em "%"', array_to_string(target, '/') using errcode = '42501';
    end if;
    if coalesce(array_length(target, 1), 0) = 0 then
      raise exception 'db: update na raiz exige caminhos' using errcode = '22023';
    end if;
    tops := tops || target[1];
  end loop;

  perform private.db_lock_tops(tops);

  for entry in select key, value from json_each(p_patch) loop
    target := base || private.db_segments(entry.key);
    perform private.db_write(target, entry.value::jsonb);
    touched := touched || array_to_string(target, '/');
  end loop;

  return jsonb_build_object('ok', true, 'touched_paths', to_jsonb(touched));
end;
$$;

create or replace function public.db_tx(p_path text, p_expected_rev bigint, p_value jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  segs text[] := private.db_segments(p_path);
  current_rev bigint;
begin
  if coalesce(array_length(segs, 1), 0) = 0 then
    raise exception 'db: transacao na raiz nao suportada' using errcode = '22023';
  end if;
  if not private.db_can_read(segs) or not private.db_can_write(segs) then
    raise exception 'db: transacao negada em "%"', coalesce(p_path, '') using errcode = '42501';
  end if;

  perform private.db_lock_tops(array[segs[1]]);
  current_rev := private.db_rev(segs);

  if current_rev <> coalesce(p_expected_rev, 0) then
    return jsonb_build_object(
      'ok', true,
      'committed', false,
      'value', private.db_read(segs),
      'rev', current_rev
    );
  end if;

  perform private.db_write(segs, p_value);
  return jsonb_build_object(
    'ok', true,
    'committed', true,
    'value', private.db_read(segs),
    'rev', private.db_rev(segs)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Permissoes
-- ---------------------------------------------------------------------------

revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all sequences in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;

revoke all on function public.db_get(text) from public, anon;
revoke all on function public.db_revs(text[]) from public, anon;
revoke all on function public.db_set(text, jsonb) from public, anon;
revoke all on function public.db_update(text, json) from public, anon;
revoke all on function public.db_tx(text, bigint, jsonb) from public, anon;

grant execute on function public.db_ping() to anon, authenticated, service_role;
grant execute on function public.db_get(text) to authenticated, service_role;
grant execute on function public.db_revs(text[]) to authenticated, service_role;
grant execute on function public.db_set(text, jsonb) to authenticated, service_role;
grant execute on function public.db_update(text, json) to authenticated, service_role;
grant execute on function public.db_tx(text, bigint, jsonb) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Limpeza diaria de tombstones (remocoes antigas)
-- ---------------------------------------------------------------------------

create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'codequiz-db-tombstones',
  '17 7 * * *',
  $$delete from private.db_nodes where value is null and updated_at < now() - interval '2 days'$$
);
