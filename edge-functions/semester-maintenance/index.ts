// Edge Function: Manutenção semestral (backup + purga)
// Executa tentar_purga_semestre() via RPC usando SERVICE_ROLE_KEY

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  try {
    console.log('[semester-maintenance] started', new Date().toISOString());
    
    // (Opcional) Adicione chamada de backup aqui antes da purga
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/tentar_purga_semestre`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // ajuste se RPC requer parâmetros
    });
    
    const body = await res.text();
    console.log('[semester-maintenance] rpc status', res.status, body);
    
    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false, status: res.status, body }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ ok: true, body }), { status: 200 });
  } catch (err) {
    console.error('[semester-maintenance] error', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});
