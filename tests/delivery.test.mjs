import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { destinations, operations, campaignParams } from '../shared/delivery.js';
import { createDeliveryTracking } from '../src/delivery/tracking.js';
import { validateEvent } from '../shared/delivery-event.js';
import { onRequest } from '../functions/api/delivery-click.js';
import { deliveryMarkup } from '../src/delivery/page.js';
import { isDirectOrderAvailable, getDirectOrderMessage, saoPauloMinutes } from '../shared/delivery-hours.js';
import { validateLead } from '../shared/lead-event.js';
import { onRequest as captureLead } from '../functions/api/lead-capture.js';

const storage = () => { const map = new Map(); return { getItem: k => map.get(k) || null, setItem: (k,v) => map.set(k,v), removeItem: k => map.delete(k) }; };
function browser(search = '', consent = 'granted') {
  const win = { crypto: { randomUUID }, localStorage: storage(), sessionStorage: storage(), location: { search }, document: { referrer: 'https://google.com/search?private=secret' }, dataLayer: [], sent: [], navigator: {}, fetch: () => Promise.resolve() };
  win.navigator.sendBeacon = (url, data) => { win.sent.push({url,data}); return true; };
  if (consent) win.localStorage.setItem('vy_consent', consent);
  return win;
}
test('seven authoritative destinations separated by operation; plain HTML anchors', () => {
  assert.equal(Object.keys(destinations).length, 7);
  for (const [operation, config] of Object.entries(operations)) {
    const html = deliveryMarkup(operation);
    for (const id of config.destinations) { assert.equal(destinations[id].operation, operation); assert.ok(html.includes(`data-destination="${id}"`)); }
    const foreign = Object.entries(destinations).filter(([,d]) => d.operation !== operation);
    for (const [id] of foreign) assert.ok(!html.includes(`data-destination="${id}"`));
    assert.ok(!html.includes('target="_blank"'));
  }
});
test('direct-order schedule uses São Paulo time and keeps an HTML fallback link', () => {
  const at = hour => new Date(`2026-09-07T${String(hour).padStart(2,'0')}:00:00-03:00`);
  assert.equal(saoPauloMinutes(at(11)), 660);
  assert.equal(isDirectOrderAvailable(at(11)), true);
  assert.equal(isDirectOrderAvailable(at(14)), true);
  assert.equal(isDirectOrderAvailable(at(15)), false);
  assert.match(getDirectOrderMessage(at(20)), /peça pelos apps/);
  assert.ok(deliveryMarkup('restaurante').includes(`href="${destinations.expresso_varanda.url}"`));
});
test('campaign allowlist preserves raw values; click IDs require advertising consent', () => {
  const raw = '?utm_source=Meta&fbclid=test&gclid=test2&ad_id=123&email=private&url=https://evil.com';
  assert.deepEqual(campaignParams(raw), {utm_source:'Meta',gclid:'test2',fbclid:'test',ad_id:'123'});
  assert.equal(campaignParams(raw,false).fbclid,undefined);
});
test('Meta entry, one view, two distinct click events, no sales event', () => {
  const win = browser('?utm_source=meta&utm_medium=paid_social&utm_campaign=test&campaign_id=123&adset_id=456&ad_id=789&fbclid=test');
  const tracker = createDeliveryTracking(win, 'marmitas');
  tracker.emit('delivery_hub_view'); tracker.click('ifood_marmitas','primary');
  assert.deepEqual(win.dataLayer.map(e=>e.event), ['delivery_hub_view','delivery_click','partner_click']);
  assert.equal(new Set(win.dataLayer.map(e=>e.event_id)).size,3);
  win.dataLayer.forEach(e=>validateEvent(e));
  assert.equal(win.sent.length,3);
  assert.equal(win.dataLayer[0].fbclid,'test');
  assert.equal(win.dataLayer[0].referrer,'https://google.com');
  assert.equal(tracker.href('ifood_marmitas'),destinations.ifood_marmitas.url);
});
test('Google to direct preserves attribution; first/session stable, last changes with explicit campaign', () => {
  const win = browser('?utm_source=google&utm_medium=cpc&campaign_id=123&adgroup_id=456&ad_id=789&keyword=restaurante&matchtype=p&device=m&gclid=test');
  const one = createDeliveryTracking(win,'restaurante');
  const first = one.emit('delivery_hub_view');
  assert.equal(new URL(one.href('expresso_varanda')).searchParams.get('gclid'),'test');
  win.location.search='?utm_source=meta&fbclid=second';
  const two = createDeliveryTracking(win,'restaurante'); const second = two.emit('delivery_hub_view');
  assert.equal(first.session_id,second.session_id); assert.notEqual(first.visit_id,second.visit_id);
  assert.equal(two.state().first.utm_source,'google'); assert.equal(two.state().last.utm_source,'meta');
  two.click('expresso_varanda','primary');
  assert.equal(win.dataLayer.filter(e=>e.event==='partner_click').length,0);
});
test('reject clears session; navigation survives failed storage, beacon and fetch', () => {
  const win = browser('?gclid=test','denied'); const tracker=createDeliveryTracking(win,'restaurante');
  const event=tracker.emit('delivery_hub_view');
  assert.equal(event.visit_id,undefined); assert.equal(event.gclid,undefined); assert.equal(win.sent.length,0);
  assert.equal(tracker.href('expresso_varanda'),destinations.expresso_varanda.url);
  win.localStorage.setItem('vy_consent','granted');
  win.navigator.sendBeacon=()=>{throw new Error('offline');}; win.fetch=()=>{throw new Error('offline');};
  assert.doesNotThrow(()=>tracker.click('ifood_restaurante','primary'));
  win.localStorage.setItem('vy_consent','denied'); tracker.state();
  assert.equal(win.sessionStorage.getItem('vy_delivery_session'),null);
});
test('default consent strips advertising identifiers and emits optional fields only',()=>{
  const win=browser('?fbclid=test',null); const event=createDeliveryTracking(win,'marmitas').emit('delivery_hub_view');
  assert.equal(event.consent_ads,false); assert.equal(event.fbclid,undefined); assert.equal(event.campaign_id,undefined);
});
test('accepting consent in the same visit restores current click IDs to direct URL',()=>{
  const win=browser('?gclid=test',null); const tracker=createDeliveryTracking(win,'restaurante');
  assert.equal(new URL(tracker.href('expresso_varanda')).searchParams.has('gclid'),false);
  tracker.setConsent('granted');
  assert.equal(new URL(tracker.href('expresso_varanda')).searchParams.get('gclid'),'test');
});
const request = (body, extra={}) => new Request('https://varandaype.com/api/delivery-click',{method:'POST',headers:{Origin:'https://varandaype.com','Content-Type':'application/json',...extra},body:JSON.stringify(body)});
test('endpoint rejects unknown fields, foreign origins, invalid destinations, oversized bodies and false sales',async()=>{
  const event=createDeliveryTracking(browser(),'restaurante').emit('delivery_click',{partner:'ifood',destination_id:'ifood_restaurante',cta_position:'primary'});
  for(const bad of [{...event,password:'secret'},{...event,event:'Purchase'},{...event,destination_id:'ifood_marmitas'},{...event,consent_ads:false,gclid:'x'}]) assert.equal((await onRequest({request:request(bad),env:{}})).status,400);
  assert.equal((await onRequest({request:request(event,{Origin:'https://evil.com'}),env:{}})).status,403);
  assert.equal((await onRequest({request:request({...event,utm_campaign:'x'.repeat(9000)}),env:{}})).status,413);
  assert.equal((await onRequest({request:request(event),env:{}})).status,503);
});
test('endpoint persists validated event and responds only after storage success; UUID duplicate ignored',async()=>{
  const events=new Map(); const env={DELIVERY_DB:{prepare(sql){return {bind(...values){return {async first(){return sql.includes('COUNT')?{total:0}:events.get(values[0]);},async run(){events.set(values[0],{event_id:values[0],values});}};}};}}};
  const event=createDeliveryTracking(browser(),'restaurante').emit('delivery_hub_view');
  assert.equal((await onRequest({request:request(event),env})).status,204);
  assert.equal((await onRequest({request:request(event),env})).status,204);
  assert.equal(events.size,1);
});
test('lead schema requires explicit contact consent and sanitizes submitted fields', async () => {
  const win=browser('?utm_source=meta');
  const context=createDeliveryTracking(win,'marmitas').leadContext();
  const lead={...context,lead_type:'both',whatsapp:'(19) 99999-9999',email:' TEST@EXAMPLE.COM ',lead_consent:true,source_component:'popup'};
  const clean=validateLead(lead);
  assert.equal(clean.whatsapp,'19999999999'); assert.equal(clean.email,'test@example.com');
  assert.throws(()=>validateLead({...lead,lead_consent:false}));
  assert.equal((await captureLead({request:new Request('https://varandaype.com/api/lead-capture',{headers:{Origin:'https://varandaype.com'}}),env:{}})).status,503);
  assert.equal((await captureLead({request:new Request('https://varandaype.com/api/lead-capture',{method:'POST',headers:{Origin:'https://varandaype.com','Content-Type':'application/json'},body:JSON.stringify(lead)}),env:{}})).status,503);
});
