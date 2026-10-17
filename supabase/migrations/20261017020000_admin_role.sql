-- Painel admin: acesso por papel no servidor em vez de senha no cliente.
--
-- Administradores ficam em private.db_admins (uid de auth.users). A tabela nao
-- e exposta pela API; o cliente so consegue perguntar "eu sou admin?" pela RPC
-- public.db_is_admin(). As escritas exclusivas do painel (hoje o interruptor
-- da automacao dos bots em pvp_bots_state/daemon_control) passam a exigir esse
-- papel em private.db_can_write. Leituras continuam como antes.
--
-- A migracao nao cadastra ninguem (o repositorio e publico). Para promover a
-- conta do dono, rode uma vez no projeto linkado:
--   supabase db query --linked "insert into private.db_admins (uid, note)
--     select id, 'dono' from auth.users where email = '<email do dono>'
--     on conflict (uid) do nothing returning uid"

create table if not exists private.db_admins (
  uid uuid primary key references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

revoke all on table private.db_admins from public, anon, authenticated;

create or replace function private.db_is_admin()
returns boolean
language sql
stable
as $$
  select auth.uid() is not null
     and exists (select 1 from private.db_admins a where a.uid = auth.uid())
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
  if top = 'pvp_bots_state' and p_segs[2] = 'daemon_control' then
    -- Interruptores da automacao dos bots: so o painel admin grava.
    return private.db_is_admin();
  end if;
  if top in ('users', 'user_stats', 'user_shop') then
    return p_segs[2] = uid or private.db_is_bot_id(p_segs[2]);
  end if;
  if top = 'quiz_results' then
    return n >= 3 and (p_segs[3] = uid or private.db_is_bot_id(p_segs[3]));
  end if;
  if top in ('cloud_saves', 'presence') then
    return p_segs[2] = uid;
  end if;
  return true;
end;
$$;

create or replace function public.db_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.db_is_admin()
$$;

revoke all on function private.db_is_admin() from public, anon, authenticated;
revoke all on function private.db_can_write(text[]) from public, anon, authenticated;

revoke all on function public.db_is_admin() from public, anon;
grant execute on function public.db_is_admin() to authenticated, service_role;
