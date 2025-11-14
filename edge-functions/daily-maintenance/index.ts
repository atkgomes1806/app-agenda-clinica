// Edge Function: Geração diária de eventos futuros
// Executa gerar_eventos_futuros() via RPC usando SERVICE_ROLE_KEY

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  try {
    console.log('[daily-maintenance] started', new Date().toISOString());
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/gerar_eventos_futuros`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // ajuste se RPC requer parâmetros
    });
    
    const body = await res.text();
    console.log('[daily-maintenance] rpc status', res.status, body);
    
    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false, status: res.status, body }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ ok: true, body }), { status: 200 });
  } catch (err) {
    console.error('[daily-maintenance] error', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});
