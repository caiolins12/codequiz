import { NextResponse } from 'next/server';
import { isDaemonTokenValid, setDbGetCacheTtlMs, setDbRecentReadWindows } from '../../../src/codequiz/lib/dbClient';
import { setSupabaseRequestHeaders } from '../../../src/codequiz/lib/supabaseClient';
import { runBotDaemonCycle } from '../../../src/codequiz/lib/repository';

// Automação dos bots no servidor. O pg_cron do Supabase (private.bot_daemon_kick,
// supabase/migrations/*_bot_daemon_server.sql) faz um POST a cada 2 minutos com um
// token aleatório de vida curta; com ele as RPCs do banco valem como serviço. A rota
// não guarda chave nenhuma: sem um token válido, não faz nada.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
// Perto do banco (Supabase em sa-east-1): cada ciclo faz dezenas de RPCs em sequência.
export const preferredRegion = 'gru1';

const TOKEN_PATTERN = /^[0-9a-f]{64}$/;

export async function POST(request) {
  let token = '';
  try {
    const body = await request.json();
    token = String(body?.token || '').trim().toLowerCase();
  } catch {
    token = '';
  }
  if (!TOKEN_PATTERN.test(token)) {
    return NextResponse.json({ ok: false, error: 'token_invalido' }, { status: 401 });
  }

  setSupabaseRequestHeaders({ 'x-codequiz-daemon-token': token });
  // O ciclo relê as mesmas coleções várias vezes, e de pvp_matches só precisa das
  // partidas abertas ou da última hora (o histórico inteiro só gastaria tráfego).
  setDbGetCacheTtlMs(8000);
  setDbRecentReadWindows({ pvp_matches: 60 * 60 * 1000 });
  const valid = await isDaemonTokenValid().catch(() => false);
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'token_invalido' }, { status: 401 });
  }

  const result = await runBotDaemonCycle();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
