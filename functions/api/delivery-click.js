import { validateEvent } from '../../shared/delivery-event.js';
const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' };
const reply = (status, error) => Response.json({ error }, { status, headers });
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return reply(405, 'method_not_allowed');
  if (request.headers.get('Origin') !== new URL(request.url).origin) return reply(403, 'origin_not_allowed');
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply(415, 'json_required');
  if (Number(request.headers.get('Content-Length')) > 8192) return reply(413, 'payload_too_large');
  let event;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply(400, 'body_required');
    let size = 0;
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 8192) { await reader.cancel(); return reply(413, 'payload_too_large'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    event = validateEvent(JSON.parse(new TextDecoder().decode(bytes)));
  } catch { return reply(400, 'invalid_event'); }
  // Never report successful persistence when no database is bound.
  if (!env.DELIVERY_DB) return reply(503, 'storage_unavailable');
  try {
    const duplicate = await env.DELIVERY_DB.prepare('SELECT event_id FROM delivery_tracking_events WHERE event_id = ?').bind(event.event_id).first();
    if (duplicate) return new Response(null, { status: 204, headers });
    const count = await env.DELIVERY_DB.prepare('SELECT COUNT(*) AS total FROM delivery_tracking_events WHERE session_id = ? AND created_at > ?').bind(event.session_id, new Date(Date.now() - 60000).toISOString()).first();
    if (count.total >= 120) return reply(429, 'rate_limited');
    await env.DELIVERY_DB.prepare(`INSERT OR IGNORE INTO delivery_tracking_events
      (event_id, occurred_at, event_name, visit_id, session_id, operation, partner, destination_id, page_path, campaign_id, gclid, fbclid, consent_analytics, consent_ads, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      event.event_id, event.occurred_at, event.event, event.visit_id, event.session_id, event.operation,
      event.partner || null, event.destination_id || null, event.page_path, event.campaign_id || event.utm_id || null,
      event.gclid || null, event.fbclid || null, 1, event.consent_ads ? 1 : 0, JSON.stringify(event), new Date().toISOString(),
    ).run();
    return new Response(null, { status: 204, headers });
  } catch { return reply(503, 'storage_unavailable'); }
}
