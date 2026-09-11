import { campaignKeys, destinationFor, landingPath, normalizeCampaign, validIntent, validPlatform } from '../../shared/marketing-config.js';
import { consentLabel, readConsent } from './consent.js';

const VISITOR_KEY = 'vy_vid';
const SESSION_KEY = 'vy_sid';
const LEDGER_KEY = 'vy_attribution_ledger';
const SESSION_STARTED_KEY = 'vy_session_started';
const LAST_SEEN_KEY = 'vy_last_seen';
const SESSION_WINDOW = 30 * 60 * 1000;
const RETURN_WINDOW = 180 * 24 * 60 * 60 * 1000;

function read(storage, key) { try { return storage.getItem(key); } catch { return null; } }
function write(storage, key, value) { try { storage.setItem(key, value); } catch { /* Tracking remains fail-open. */ } }
function remove(storage, key) { try { storage.removeItem(key); } catch { /* Tracking remains fail-open. */ } }
function id(win) { return win.crypto.randomUUID(); }
function originOnly(value) { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.origin : undefined; } catch { return undefined; } }

function cleanObject(input) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}

export function createMarketingTracking(win = window, platformInput = null) {
  let consentOverride;
  const platform = validPlatform(platformInput);
  const query = new URLSearchParams(win.location.search);
  const intent = validIntent(query.get('intent'));
  const pagePath = landingPath(platform);
  const now = Date.now();
  const permissions = () => consentOverride || readConsent(win);
  const canPersist = () => permissions().analytics;
  let visitorId = canPersist() ? read(win.localStorage, VISITOR_KEY) : null;
  let sessionId = canPersist() ? read(win.sessionStorage, SESSION_KEY) : null;
  let sessionStarted = Number(read(win.sessionStorage, SESSION_STARTED_KEY));
  if (!visitorId) visitorId = id(win);
  if (!sessionId || !sessionStarted || now - sessionStarted > SESSION_WINDOW) { sessionId = id(win); sessionStarted = now; }
  const previousSeen = Number(read(win.localStorage, LAST_SEEN_KEY));
  const isReturning = Boolean(canPersist() && previousSeen && now - previousSeen < RETURN_WINDOW);
  let itemViews = 0;
  let highIntentSent = false;

  function persistIdentity() {
    if (!canPersist()) return;
    write(win.localStorage, VISITOR_KEY, visitorId);
    write(win.sessionStorage, SESSION_KEY, sessionId);
    write(win.sessionStorage, SESSION_STARTED_KEY, String(sessionStarted));
    write(win.localStorage, LAST_SEEN_KEY, String(Date.now()));
    try { win.document.cookie = `vy_vid=${visitorId}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`; } catch { /* Cookie optional. */ }
    try { win.document.cookie = `vy_sid=${sessionId}; Max-Age=1800; Path=/; SameSite=Lax; Secure`; } catch { /* Cookie optional. */ }
  }

  function campaign() { return normalizeCampaign(win.location.search, permissions().advertising); }
  function touchpoint() {
    return cleanObject({
      timestamp: new Date().toISOString(), ...campaign(), landing_path: pagePath, intent, platform: platform || query.get('platform') || undefined,
      referrer: originOnly(win.document.referrer), device_category: win.matchMedia?.('(max-width: 767px)').matches ? 'mobile' : 'desktop',
    });
  }

  function ledger() {
    if (!canPersist()) return { first_touch: null, last_touch: null, touchpoints: [] };
    try { return JSON.parse(read(win.localStorage, LEDGER_KEY)) || { first_touch: null, last_touch: null, touchpoints: [] }; } catch { return { first_touch: null, last_touch: null, touchpoints: [] }; }
  }

  function recordTouchpoint() {
    if (!canPersist()) return ledger();
    const current = ledger();
    const point = touchpoint();
    const meaningful = Object.keys(campaign()).length > 0 || Boolean(point.referrer) || !current.first_touch;
    if (meaningful) {
      current.first_touch ||= point;
      current.last_touch = point;
      const signature = JSON.stringify([point.utm_source, point.utm_medium, point.utm_campaign, point.campaign_id, point.landing_path, point.intent, point.platform]);
      const prior = current.touchpoints[current.touchpoints.length - 1];
      if (!prior || prior.signature !== signature) current.touchpoints.push({ ...point, signature });
      current.touchpoints = current.touchpoints.slice(-25);
      write(win.localStorage, LEDGER_KEY, JSON.stringify(current));
    }
    return current;
  }

  persistIdentity();
  let currentLedger = recordTouchpoint();

  function post(event) {
    if (!canPersist()) return;
    const body = JSON.stringify(event);
    let sent = false;
    try { sent = win.navigator.sendBeacon?.('/api/marketing-event', new Blob([body], { type: 'application/json' })) === true; } catch { /* Fetch fallback below. */ }
    if (!sent) {
      try { void win.fetch('/api/marketing-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', keepalive: true, body }).catch(() => {}); } catch { /* Navigation is never blocked. */ }
    }
  }

  function emit(eventName, detail = {}, options = {}) {
    const consent = permissions();
    const safeLocation = new URL(win.location.href);
    safeLocation.search = '';
    for (const [key, value] of Object.entries(campaign())) safeLocation.searchParams.set(key, value);
    const event = cleanObject({
      event: eventName, event_id: options.eventId || id(win), occurred_at: new Date().toISOString(), visitor_id: visitorId, session_id: sessionId,
      site: 'varanda_ype', page_path: pagePath, page_location: safeLocation.toString(), referrer: originOnly(win.document.referrer),
      platform: platform || undefined, intent, landing_variant: query.get('variant') || `${platform || 'selector'}_${intent}`,
      touchpoint_count: currentLedger.touchpoints.length, is_returning: isReturning,
      consent_state: consentLabel(consent), consent_analytics: consent.analytics, consent_advertising: consent.advertising,
      consent_personalization: consent.personalization, ...campaign(), ...detail,
    });
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push(event);
    post(event);
    if (eventName === 'item_view') itemViews += 1;
    if (!highIntentSent && (eventName === 'outbound_order_click' || itemViews >= 2)) {
      highIntentSent = true;
      emit('high_intent_session', { metadata: { rule: eventName === 'outbound_order_click' ? 'outbound_order_click' : 'two_item_views' } });
    }
    return event;
  }

  function href() {
    const destination = destinationFor(platform, intent);
    if (!destination) return landingPath(null);
    if (destination.partner !== 'direct') return destination.url;
    const url = new URL(destination.url);
    for (const [key, value] of Object.entries(campaign())) if (campaignKeys.includes(key)) url.searchParams.set(key, value);
    url.searchParams.set('intent', intent);
    return url.toString();
  }

  return {
    state: () => ({ visitor_id: visitorId, session_id: sessionId, platform, intent, campaign: campaign(), ledger: currentLedger, is_returning: isReturning, consent: permissions() }),
    emit,
    href,
    setConsent(value) {
      consentOverride = value;
      if (value.analytics) { persistIdentity(); currentLedger = recordTouchpoint(); }
      else { remove(win.localStorage, VISITOR_KEY); remove(win.sessionStorage, SESSION_KEY); remove(win.sessionStorage, SESSION_STARTED_KEY); remove(win.localStorage, LEDGER_KEY); }
    },
  };
}

export { LEDGER_KEY, SESSION_KEY, VISITOR_KEY };
