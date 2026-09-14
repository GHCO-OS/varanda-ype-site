const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff', 'Content-Type': 'application/json' };
export async function onRequestPost({ request, env }) {
  let body; try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400, headers }); }
  if (!['accepted', 'rejected'].includes(body?.status)) return new Response(JSON.stringify({ error: 'invalid_status' }), { status: 400, headers });
  if (env.DELIVERY_DB) await env.DELIVERY_DB.prepare(`INSERT OR IGNORE INTO coverage_consent_events (event_id,created_at,status,visitor_id,session_id,landing_path,region_coarse,campaign,consent_version) VALUES (?,?,?,?,?,?,?,?,?)`).bind(crypto.randomUUID(), new Date().toISOString(), body.status, body.visitor_id || null, body.session_id || null, body.landing_path || null, body.region_coarse || null, body.campaign || null, '2026-09-14').run();
  return new Response(JSON.stringify({ ok: true }), { status: 202, headers });
}
