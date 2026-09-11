import { campaignKeys, cleanParam, destinationFor, platformKeys } from './marketing-config.js';

export const eventNames = Object.freeze([
  'page_view','landing_view','platform_view','intent_detected','hero_cta_view','hero_cta_click',
  'menu_section_view','item_view','item_click','platform_selector_view','platform_select','secondary_cta_click',
  'sticky_cta_click','outbound_order_click','whatsapp_click','phone_click','directions_click','review_click',
  'channel_subscribe_click','promo_view','promo_click','return_visit','high_intent_session','experiment_exposure',
]);

const baseFields = [
  'event','event_id','occurred_at','visitor_id','session_id','site','page_path','page_location','referrer',
  'platform','intent','landing_variant','experiment_id','variant_id','cta_position','destination','destination_id',
  'item_id','item_name','source_component','touchpoint_count','is_returning','consent_state','consent_analytics',
  'consent_advertising','consent_personalization','metadata', ...campaignKeys,
];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanMetadata(value) {
  if (!value || Array.isArray(value) || typeof value !== 'object') return undefined;
  const entries = Object.entries(value).slice(0, 20).flatMap(([key, item]) => {
    const cleanKey = cleanParam(key, 64);
    if (!/^[a-z0-9_]+$/i.test(cleanKey)) return [];
    if (typeof item === 'boolean' || typeof item === 'number') return [[cleanKey, item]];
    const cleanValue = cleanParam(item, 256);
    return cleanValue ? [[cleanKey, cleanValue]] : [];
  });
  return entries.length ? Object.fromEntries(entries) : undefined;
}

export function validateMarketingEvent(input, now = Date.now()) {
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('object_required');
  if (Object.keys(input).some(key => !baseFields.includes(key))) throw new Error('unknown_field');
  if (!eventNames.includes(input.event) || input.site !== 'varanda_ype') throw new Error('invalid_event');
  if (!uuid.test(input.event_id) || !uuid.test(input.visitor_id) || !uuid.test(input.session_id)) throw new Error('invalid_id');
  if (!Number.isFinite(Date.parse(input.occurred_at)) || Math.abs(now - Date.parse(input.occurred_at)) > 86400000) throw new Error('invalid_timestamp');
  if (typeof input.page_path !== 'string' || !input.page_path.startsWith('/') || input.page_path.length > 256) throw new Error('invalid_path');
  if (input.platform && !platformKeys.includes(input.platform)) throw new Error('invalid_platform');
  if (input.consent_analytics !== true || typeof input.consent_advertising !== 'boolean' || typeof input.consent_personalization !== 'boolean') throw new Error('consent_required');
  const result = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === 'metadata') { const metadata = cleanMetadata(value); if (metadata) result.metadata = metadata; continue; }
    if (typeof value === 'boolean' || typeof value === 'number') { result[key] = value; continue; }
    const clean = cleanParam(value, key === 'page_location' || key === 'destination' ? 1024 : 256);
    if (!clean) throw new Error('invalid_value');
    result[key] = clean;
  }
  if (input.event === 'outbound_order_click') {
    const expected = destinationFor(input.platform, input.intent);
    if (!expected || !input.destination) throw new Error('invalid_destination');
    const actualUrl = new URL(input.destination);
    const expectedUrl = new URL(expected.url);
    if (actualUrl.origin !== expectedUrl.origin || actualUrl.pathname !== expectedUrl.pathname) throw new Error('invalid_destination');
  }
  return result;
}
