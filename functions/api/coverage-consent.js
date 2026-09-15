import { normalizeCep, distanceKm } from '../../shared/coverage.js';

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff', 'Content-Type': 'application/json' };
const reply = (status, payload) => new Response(JSON.stringify(payload), { status, headers });
const STORE = { lat: -22.9010251, lon: -47.09676 };

export async function onRequestPost(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' });
  if (request.headers.get('Origin') !== new URL(request.url).origin) return reply(403, { error: 'origin_not_allowed' });
  let body;
  try { body = await request.json(); } catch { return reply(400, { error: 'invalid_json' }); }
  if (body?.consent_coverage !== true) return reply(400, { error: 'coverage_consent_required' });
  const cep = normalizeCep(body.cep);
  if (!cep) return reply(400, { error: 'invalid_cep' });
  const now = new Date().toISOString();
  const consentId = crypto.randomUUID();
  let address = {};
  try {
    const via = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { headers: { Accept: 'application/json' } });
    if (via.ok) address = await via.json();
  } catch { /* classification can continue as unknown */ }
  let distance = null;
  try {
    const geo = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&country=Brazil&postalcode=${cep}`, { headers: { Accept: 'application/json', 'User-Agent': 'VarandaYpe-Coverage/1.0' } });
    const rows = geo.ok ? await geo.json() : [];
    if (rows[0]?.lat && rows[0]?.lon) distance = distanceKm(STORE.lat, STORE.lon, Number(rows[0].lat), Number(rows[0].lon));
  } catch { /* unknown is safer than guessing */ }
  const status = distance == null ? 'unknown' : distance <= 5 ? 'within_5km' : 'outside_5km';
  if (env.DELIVERY_DB) {
    try {
      await env.DELIVERY_DB.prepare(`INSERT INTO coverage_consents (consent_id,created_at,visitor_id,session_id,cep,cep_prefix,city,region,distance_km,coverage_status,consent_purpose,consent_version,campaign,landing_path) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
        consentId, now, body.visitor_id || null, body.session_id || null, cep, cep.slice(0, 3), address.localidade || null, address.uf || null, distance, status, 'delivery_coverage', '2026-09-14', body.campaign || null, body.landing_path || null
      ).run();
    } catch (error) { console.error(JSON.stringify({ message: 'coverage_persistence_failed', error: error?.message || 'unknown' })); }
  }
  return reply(200, { ok: true, consent_id: consentId, coverage_status: status, distance_km: distance == null ? null : Math.round(distance * 10) / 10, city: address.localidade || null, region: address.uf || null });
}
