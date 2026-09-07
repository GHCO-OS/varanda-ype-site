import { validateLead } from '../../shared/lead-event.js';

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' };
const reply = (status, body) => Response.json(body, { status, headers });

export async function onRequest({ request, env }) {
  if (request.method === 'GET') return env.DELIVERY_DB ? new Response(null, { status: 204, headers }) : reply(503, { error: 'storage_unavailable' });
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' });
  if (request.headers.get('Origin') !== new URL(request.url).origin) return reply(403, { error: 'origin_not_allowed' });
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply(415, { error: 'json_required' });
  if (Number(request.headers.get('Content-Length')) > 8192) return reply(413, { error: 'payload_too_large' });
  let lead;
  try {
    const body = await request.text();
    if (!body || new TextEncoder().encode(body).length > 8192) return reply(413, { error: 'payload_too_large' });
    lead = validateLead(JSON.parse(body));
  } catch { return reply(400, { error: 'invalid_lead' }); }
  if (!env.DELIVERY_DB) return reply(503, { error: 'storage_unavailable' });
  try {
    const rateKey = lead.session_id || lead.visit_id || lead.event_id;
    const recent = await env.DELIVERY_DB.prepare('SELECT COUNT(*) AS total FROM delivery_leads WHERE COALESCE(session_id, visit_id, event_id) = ? AND created_at > ?')
      .bind(rateKey, new Date(Date.now() - 60000).toISOString()).first();
    if (Number(recent?.total || 0) >= 5) return reply(429, { error: 'rate_limited' });
    const result = await env.DELIVERY_DB.prepare(`INSERT OR IGNORE INTO delivery_leads
      (event_id, occurred_at, visit_id, session_id, lead_type, whatsapp, email, operation, page_path, referrer,
       utm_source, utm_medium, utm_campaign, utm_id, utm_content, utm_term, gclid, fbclid, campaign_id, adset_id,
       ad_id, incentive, source_component, lead_consent, consent_analytics, consent_ads, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`)
      .bind(
        lead.event_id, lead.occurred_at, lead.visit_id, lead.session_id, lead.lead_type, lead.whatsapp || null,
        lead.email || null, lead.operation, lead.page_path, lead.referrer || null, lead.utm_source || null,
        lead.utm_medium || null, lead.utm_campaign || null, lead.utm_id || null, lead.utm_content || null,
        lead.utm_term || null, lead.gclid || null, lead.fbclid || null, lead.campaign_id || null,
        lead.adset_id || null, lead.ad_id || null, lead.incentive || null, lead.source_component,
        lead.consent_analytics ? 1 : 0, lead.consent_ads ? 1 : 0, JSON.stringify(lead), new Date().toISOString(),
      ).run();
    return reply(200, { ok: true, deduplicated: result?.meta?.changes === 0 });
  } catch { return reply(503, { error: 'storage_unavailable' }); }
}
