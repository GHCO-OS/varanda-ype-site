import { destinationFor, normalizeCampaign, redirectTargets, validIntent, validPlatform } from '../../shared/marketing-config.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const botPattern = /bot|crawler|spider|headless|lighthouse|healthcheck|uptime|monitor/i;

export function parseCookies(request) {
  return Object.fromEntries((request.headers.get('Cookie') || '').split(';').flatMap(part => {
    const [key, ...rest] = part.trim().split('=');
    return key ? [[key, decodeURIComponent(rest.join('='))]] : [];
  }));
}

export function isObviousBot(request) { return botPattern.test(request.headers.get('User-Agent') || ''); }

export function redirectDestination(target, url) {
  const entry = redirectTargets[target];
  if (!entry) return null;
  const intent = validIntent(url.searchParams.get('intent'));
  const central = validPlatform(target) ? destinationFor(target, intent) : null;
  const destination = central?.url || entry.destination(intent);
  if (!destination) return null;
  const output = new URL(destination);
  if (entry.preserveAttribution) {
    for (const [key, value] of Object.entries(normalizeCampaign(url.search, true))) output.searchParams.set(key, value);
    output.searchParams.set('intent', intent);
  }
  return { url: output.toString(), event: entry.event, intent, destinationId: central?.id || target };
}

export function serverEvent(request, input = {}) {
  const url = new URL(request.url);
  const cookies = parseCookies(request);
  const consentState = /^a([01])d([01])p([01])$/.exec(cookies.vy_consent_state || '');
  const analytics = consentState?.[1] === '1' && uuid.test(cookies.vy_vid);
  const advertising = consentState?.[2] === '1';
  const personalization = consentState?.[3] === '1';
  const safeUrl = new URL(url.origin + url.pathname);
  for (const [key, value] of Object.entries(normalizeCampaign(url.search, advertising))) safeUrl.searchParams.set(key, value);
  return {
    event: input.event,
    event_id: crypto.randomUUID(),
    occurred_at: new Date().toISOString(),
    visitor_id: uuid.test(cookies.vy_vid) ? cookies.vy_vid : crypto.randomUUID(),
    session_id: uuid.test(cookies.vy_sid) ? cookies.vy_sid : crypto.randomUUID(),
    site: 'varanda_ype',
    page_path: url.pathname,
    page_location: safeUrl.toString(),
    platform: input.platform,
    intent: input.intent || validIntent(url.searchParams.get('intent')),
    landing_variant: input.landing_variant || 'redirect',
    consent_state: analytics ? [analytics && 'analytics', advertising && 'advertising', personalization && 'personalization'].filter(Boolean).join('+') : 'necessary',
    consent_analytics: analytics,
    consent_advertising: advertising,
    consent_personalization: personalization,
    ...normalizeCampaign(url.search, advertising),
    ...input.detail,
  };
}

export async function persistMarketingEvent(env, event, request) {
  if (!env.DELIVERY_DB || !event.consent_analytics || isObviousBot(request)) return { stored: false };
  const now = new Date().toISOString();
  const recent = await env.DELIVERY_DB.prepare(`SELECT COUNT(*) AS total FROM marketing_events WHERE session_id=? AND created_at>?`).bind(event.session_id, new Date(Date.now() - 60000).toISOString()).first();
  if (Number(recent?.total || 0) >= 240) return { stored: false, rateLimited: true };
  const source = event.utm_source || null;
  const medium = event.utm_medium || null;
  const campaign = event.utm_campaign || null;
  const campaignId = event.campaign_id || event.utm_id || null;
  const geo = request.cf ? JSON.stringify({ country: request.cf.country || null, region: request.cf.region || null, city: request.cf.city || null }) : null;
  const statements = [
    env.DELIVERY_DB.prepare(`INSERT INTO marketing_visitors (visitor_id, first_seen_at, last_seen_at, lifecycle_stage) VALUES (?, ?, ?, 'VISITOR') ON CONFLICT(visitor_id) DO UPDATE SET last_seen_at=excluded.last_seen_at`).bind(event.visitor_id, event.occurred_at, now),
    env.DELIVERY_DB.prepare(`INSERT INTO marketing_sessions (session_id, visitor_id, started_at, last_seen_at, landing_path, platform, intent) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(session_id) DO UPDATE SET last_seen_at=excluded.last_seen_at`).bind(event.session_id, event.visitor_id, event.occurred_at, now, event.page_path, event.platform || null, event.intent || null),
    env.DELIVERY_DB.prepare(`INSERT OR IGNORE INTO marketing_events (event_id, visitor_id, session_id, occurred_at, event_name, page_path, platform, intent, source, medium, campaign, campaign_id, creative, keyword, destination_id, consent_state, geo_coarse_json, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(event.event_id, event.visitor_id, event.session_id, event.occurred_at, event.event, event.page_path, event.platform || null, event.intent || null, source, medium, campaign, campaignId, event.creative || event.utm_content || null, event.keyword || event.utm_term || null, event.destination_id || null, event.consent_state, geo, JSON.stringify(event), now),
  ];
  if (['landing_view', 'platform_view'].includes(event.event)) statements.push(env.DELIVERY_DB.prepare(`INSERT OR IGNORE INTO marketing_touchpoints (touchpoint_id, visitor_id, session_id, occurred_at, source, medium, campaign, campaign_id, content, term, ad_id, adset_id, creative, landing_path, intent, platform, referrer, device_category, geo_coarse_json, consent_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(event.event_id, event.visitor_id, event.session_id, event.occurred_at, source, medium, campaign, campaignId, event.utm_content || null, event.utm_term || null, event.ad_id || null, event.adset_id || null, event.creative || null, event.page_path, event.intent || null, event.platform || null, event.referrer || null, event.device || null, geo, event.consent_state));
  if (event.event === 'experiment_exposure') statements.push(env.DELIVERY_DB.prepare(`INSERT OR IGNORE INTO marketing_experiments (experiment_id, visitor_id, variant_id, assigned_at) VALUES (?, ?, ?, ?)`).bind(event.experiment_id, event.visitor_id, event.variant_id, event.occurred_at));
  if (event.event === 'high_intent_session') statements.push(env.DELIVERY_DB.prepare(`UPDATE marketing_visitors SET lifecycle_stage='HIGH_INTENT', last_seen_at=? WHERE visitor_id=? AND lifecycle_stage IN ('PROSPECT','VISITOR')`).bind(now, event.visitor_id));
  if (event.event === 'outbound_order_click') {
    statements.push(env.DELIVERY_DB.prepare(`INSERT OR IGNORE INTO marketing_conversions (conversion_id, visitor_id, session_id, occurred_at, conversion_type, platform, intent, destination_id, revenue, currency, confirmed, source_event_id) VALUES (?, ?, ?, ?, 'OUTBOUND', ?, ?, ?, NULL, NULL, 0, ?)`).bind(event.event_id, event.visitor_id, event.session_id, event.occurred_at, event.platform || null, event.intent || null, event.destination_id || null, event.event_id));
    statements.push(env.DELIVERY_DB.prepare(`UPDATE marketing_visitors SET lifecycle_stage='OUTBOUND', last_seen_at=? WHERE visitor_id=? AND lifecycle_stage NOT IN ('CUSTOMER','REPEAT_CUSTOMER')`).bind(now, event.visitor_id));
  }
  await env.DELIVERY_DB.batch(statements);
  return { stored: true };
}

export function structuredError(scope, eventId, error) {
  console.error(JSON.stringify({ message: 'marketing_event_delivery_failed', scope, event_id: eventId, error: error instanceof Error ? error.message : 'unknown_error' }));
}
