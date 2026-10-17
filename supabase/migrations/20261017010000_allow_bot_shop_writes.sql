-- O bootstrap dos bots (ensureSystemBots) grava user_shop/<botId> pelo cliente.
-- Libera ids de bot em user_shop, como já acontece em users e user_stats.

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

revoke all on function private.db_can_write(text[]) from public, anon, authenticated;
