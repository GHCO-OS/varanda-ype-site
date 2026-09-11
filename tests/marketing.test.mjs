import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { destinationFor, normalizeCampaign, redirectTargets } from '../shared/marketing-config.js';
import { validateMarketingEvent } from '../shared/marketing-event.js';
import { assignExperiment } from '../src/marketing/experiment.js';
import { saveConsent } from '../src/marketing/consent.js';
import { createMarketingTracking, LEDGER_KEY, VISITOR_KEY } from '../src/marketing/tracking.js';
import { redirectDestination } from '../functions/lib/marketing-store.js';
import { onRequestGet as redirect } from '../functions/go/[target].js';

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
}

function browser(search = '', consent = { version: 2, analytics: true, advertising: true, personalization: false }, sharedLocal = storage()) {
  if (consent) sharedLocal.setItem('vy_consent_v2', JSON.stringify(consent));
  const win = {
    crypto: { randomUUID }, localStorage: sharedLocal, sessionStorage: storage(), dataLayer: [],
    location: { search, href: `https://varandaype.com/pedir/ifood/${search}`, pathname: '/pedir/ifood/' },
    document: { referrer: 'https://www.google.com/search?q=private', cookie: '' }, navigator: {},
    matchMedia: () => ({ matches: true }), fetch: () => Promise.reject(new Error('offline')),
  };
  return win;
}

test('normalizer keeps known campaign fields and never accepts arbitrary redirect data', () => {
  assert.deepEqual(normalizeCampaign('?utm_source=Meta&msclkid=x&password=no', false), { utm_source: 'Meta' });
  assert.equal(redirectDestination('evil', new URL('https://varandaype.com/go/evil?url=https://evil.com')), null);
  assert.ok(redirectTargets.ifood);
});

test('platform and intent select the correct central destination', () => {
  assert.match(destinationFor('ifood', 'marmita').url, /cefe7c90/);
  assert.match(destinationFor('99food', 'marmita').url, /ceXoR0/);
  assert.equal(destinationFor('direto', 'grelhado').url, 'https://expresso.varandaype.com');
});

test('visitor, session, first touch and last touch persist with consent', () => {
  const local = storage();
  const firstWindow = browser('?utm_source=google&utm_medium=cpc&gclid=one&intent=marmita', undefined, local);
  const firstTracker = createMarketingTracking(firstWindow, 'ifood');
  const first = firstTracker.state();
  assert.equal(first.ledger.first_touch.utm_source, 'google');
  const secondWindow = browser('?utm_source=meta&utm_medium=paid_social&fbclid=two&intent=marmita', undefined, local);
  const second = createMarketingTracking(secondWindow, 'ifood').state();
  assert.equal(second.visitor_id, first.visitor_id);
  assert.equal(second.ledger.first_touch.utm_source, 'google');
  assert.equal(second.ledger.last_touch.utm_source, 'meta');
  assert.equal(second.ledger.touchpoints.length, 2);
  assert.ok(local.getItem(VISITOR_KEY)); assert.ok(local.getItem(LEDGER_KEY));
});

test('rejected analytics leaves no persistent visitor or attribution ledger', () => {
  const local = storage();
  const win = browser('?utm_source=meta&fbclid=x', { version: 2, analytics: false, advertising: false, personalization: false }, local);
  const tracker = createMarketingTracking(win, 'ifood');
  const event = tracker.emit('landing_view');
  assert.equal(event.fbclid, undefined);
  assert.equal(local.getItem(VISITOR_KEY), null);
  assert.equal(local.getItem(LEDGER_KEY), null);
});

test('revoking analytics clears first-party identity and ledger', () => {
  const win = browser();
  createMarketingTracking(win, 'ifood');
  assert.ok(win.localStorage.getItem(VISITOR_KEY));
  win.dispatchEvent = () => {};
  globalThis.CustomEvent ||= class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
  saveConsent({ analytics: false, advertising: false, personalization: false }, win);
  assert.equal(win.localStorage.getItem(VISITOR_KEY), null);
  assert.equal(win.localStorage.getItem(LEDGER_KEY), null);
});

test('events use unique IDs, outbound is not purchase, and direct preserves attribution', () => {
  const win = browser('?utm_source=google&gclid=x&intent=grelhado');
  const tracker = createMarketingTracking(win, 'direto');
  const one = tracker.emit('landing_view');
  const two = tracker.emit('outbound_order_click', { destination: tracker.href(), destination_id: 'expresso_varanda', cta_position: 'hero' });
  assert.notEqual(one.event_id, two.event_id);
  assert.equal(win.dataLayer.some(event => event.event === 'purchase'), false);
  assert.equal(new URL(tracker.href()).searchParams.get('gclid'), 'x');
  assert.doesNotThrow(() => validateMarketingEvent(two));
});

test('experiment assignment stays stable for a visitor', () => {
  const win = browser();
  const first = assignExperiment(win, randomUUID(), 'cta-copy', ['control', 'direct']);
  assert.equal(assignExperiment(win, randomUUID(), 'cta-copy', ['control', 'direct']), first);
});

test('redirect is allowlisted, no-store and never waits for analytics', () => {
  let background;
  const request = new Request('https://varandaype.com/go/ifood?intent=marmita', { headers: { Cookie: `vy_vid=${randomUUID()}; vy_sid=${randomUUID()}; vy_consent_state=a1d1p0` } });
  const response = redirect({ request, params: { target: 'ifood' }, env: {}, waitUntil(task) { background = task; } });
  assert.equal(response.status, 302);
  assert.match(response.headers.get('location'), /cefe7c90/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.ok(background instanceof Promise);
});

test('marketing migration creates ledger tables and reporting view', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(fs.readFileSync('migrations/0003_marketing_attribution.sql', 'utf8'));
  const names = db.prepare("SELECT name FROM sqlite_master WHERE type IN ('table','view')").all().map(row => row.name);
  for (const name of ['marketing_visitors','marketing_sessions','marketing_touchpoints','marketing_events','marketing_conversions','marketing_experiments','marketing_daily_performance']) assert.ok(names.includes(name));
});
