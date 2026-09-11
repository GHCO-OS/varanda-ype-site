const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' };
export async function onRequestGet({ env }) {
  if (!env.DELIVERY_DB) return Response.json({ ok: false, storage: 'unconfigured' }, { status: 503, headers });
  try {
    await env.DELIVERY_DB.prepare('SELECT 1 AS ok').first();
    return Response.json({ ok: true, storage: 'ready' }, { status: 200, headers });
  } catch {
    return Response.json({ ok: false, storage: 'unavailable' }, { status: 503, headers });
  }
}
