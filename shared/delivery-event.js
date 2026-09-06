import { campaignKeys, clickKeys, destinations, deliveryPath } from './delivery.js';
const fields = ['event','site','event_id','occurred_at','visit_id','session_id','operation','partner','destination_id','page_path','referrer','landing_variant','cta_position','consent_analytics','consent_ads','path','title', ...campaignKeys];
const names = ['delivery_hub_view','delivery_click','partner_click','page_view','consent_accept','consent_reject'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validateEvent(input, now = Date.now()) {
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Object required');
  if (Object.keys(input).some(key => !fields.includes(key))) throw new Error('Unknown field');
  if (!names.includes(input.event) || input.site !== 'varanda_ype') throw new Error('Invalid event');
  if (!['hub','restaurante','marmitas','hamburgueria'].includes(input.operation)) throw new Error('Invalid operation');
  if (input.page_path !== deliveryPath(input.operation)) throw new Error('Invalid path');
  if (input.landing_variant !== (input.operation === 'hub' ? 'hub' : 'operation')) throw new Error('Invalid variant');
  if (![input.event_id,input.visit_id,input.session_id].every(value => uuid.test(value))) throw new Error('Invalid ID');
  if (input.consent_analytics !== true || typeof input.consent_ads !== 'boolean') throw new Error('Consent required');
  if (!input.consent_ads && clickKeys.some(key => input[key])) throw new Error('Advertising consent required');
  if (typeof input.occurred_at !== 'string' || !Number.isFinite(Date.parse(input.occurred_at)) || Math.abs(now - Date.parse(input.occurred_at)) > 86400000) throw new Error('Invalid timestamp');
  for (const [key,value] of Object.entries(input)) {
    if (key.startsWith('consent_')) continue;
    if (typeof value !== 'string' || !value.length || value.length > 256 || /[\u0000-\u001f]/.test(value)) throw new Error('Invalid value');
  }
  if (input.referrer) { const url = new URL(input.referrer); if (!['https:', 'http:'].includes(url.protocol) || url.origin !== input.referrer) throw new Error('Invalid referrer'); }
  if (['delivery_click','partner_click'].includes(input.event)) {
    const destination = destinations[input.destination_id];
    if (!destination || destination.operation !== input.operation || destination.partner !== input.partner) throw new Error('Invalid destination');
    if (!['primary','secondary','alias'].includes(input.cta_position)) throw new Error('Invalid position');
    if (input.event === 'partner_click' && destination.partner === 'direct') throw new Error('Not a marketplace');
  } else if (input.destination_id || input.partner || input.cta_position) throw new Error('Unexpected destination');
  return input;
}
