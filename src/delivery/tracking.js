import { campaignParams, clickKeys, destinations, deliveryPath } from '../../shared/delivery.js';

const SESSION_KEY = 'vy_delivery_session';
const SESSION_WINDOW = 30 * 60 * 1000;
// A single runtime per document prevents duplicate views during repeated initialization.
export function createDeliveryTracking(win, operation) {
  const uuid = () => win.crypto.randomUUID();
  const visitId = uuid();
  let session;
  let consentOverride;
  const read = (key) => { try { return win.localStorage.getItem(key); } catch { return null; } };
  const consent = () => { const value = consentOverride ?? read('vy_consent'); return { analytics: value !== 'denied', ads: value === 'granted' }; };
  const referrer = (() => { try { return new URL(win.document.referrer).origin; } catch { return undefined; } })();
  const touch = () => ({ ...campaignParams(win.location.search, consent().ads), page_path: deliveryPath(operation), ...(referrer ? { referrer } : {}), timestamp: new Date().toISOString() });
  function state() {
    if (!consent().analytics) {
      session = undefined;
      try { win.sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage is optional. */ }
      return null;
    }
    const now = Date.now();
    if (!session) {
      try { session = JSON.parse(win.sessionStorage.getItem(SESSION_KEY)); } catch { /* Fresh session. */ }
    }
    if (!session || !session.first || !session.last || !/^[a-f0-9-]{36}$/.test(session.id) || !Number.isFinite(session.lastAt) || now - session.lastAt > SESSION_WINDOW) {
      session = { id: uuid(), first: touch(), last: touch(), lastAt: now };
    }
    if (session.visit !== visitId) {
      if (Object.keys(campaignParams(win.location.search, consent().ads)).length) session.last = touch();
      session.visit = visitId;
    }
    if (!consent().ads) for (const key of clickKeys) { delete session.first[key]; delete session.last[key]; }
    session.lastAt = now;
    try { win.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* Memory fallback. */ }
    return session;
  }
  function emit(name, extra = {}) {
    try {
      const current = state();
      const permissions = consent();
      const params = permissions.analytics ? { ...current.last, ...campaignParams(win.location.search, permissions.ads) } : {};
      delete params.timestamp;
      delete params.referrer;
      delete params.page_path;
      const event = {
        event: name, site: 'varanda_ype', event_id: uuid(), occurred_at: new Date().toISOString(),
        operation, landing_variant: operation === 'hub' ? 'hub' : 'operation', page_path: deliveryPath(operation),
        consent_analytics: permissions.analytics, consent_ads: permissions.ads,
        ...(current ? { visit_id: visitId, session_id: current.id, ...params, ...(referrer ? { referrer } : {}) } : {}),
        ...extra,
      };
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push(event);
      if (current) {
        const body = JSON.stringify(event);
        let sent = false;
        try { sent = win.navigator.sendBeacon?.('/api/delivery-click', new Blob([body], { type: 'application/json' })); } catch { /* Try fetch. */ }
        if (!sent) { try { win.fetch('/api/delivery-click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true, credentials: 'same-origin' }).catch(() => {}); } catch { /* Navigation remains available. */ } }
      }
      return event;
    } catch { return null; }
  }
  function href(id) {
    const destination = destinations[id];
    if (!destination) return '#';
    if (destination.partner !== 'direct') return destination.url;
    const current = state();
    if (!current) return destination.url;
    const params = { ...campaignParams(new URLSearchParams(current.last), consent().ads), ...campaignParams(win.location.search, consent().ads) };
    const url = new URL(destination.url);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    return url.href;
  }
  return {
    emit, href, state,
    leadContext() {
      const permissions = consent();
      const current = state();
      const params = current ? { ...current.last, ...campaignParams(win.location.search, permissions.ads) } : {};
      delete params.timestamp;
      delete params.page_path;
      delete params.referrer;
      return {
        event_id: uuid(), occurred_at: new Date().toISOString(), operation,
        page_path: deliveryPath(operation), consent_analytics: permissions.analytics,
        consent_ads: permissions.ads, ...(current ? { visit_id: visitId, session_id: current.id, ...params } : {}),
        ...(referrer ? { referrer } : {}),
      };
    },
    setConsent(value) { consentOverride = value; state(); },
    internalHref(op) {
      const params = new URLSearchParams(campaignParams(win.location.search));
      return deliveryPath(op) + (params.size ? `?${params}` : '');
    },
    click(id, position) {
      const destination = destinations[id];
      if (!destination || destination.operation !== operation) return;
      const payload = { partner: destination.partner, destination_id: id, cta_position: position };
      emit('delivery_click', payload);
      if (destination.partner !== 'direct') emit('partner_click', payload);
    },
  };
}
