import { campaignKeys } from './delivery.js';

const allowedFields = new Set([
  'event_id', 'occurred_at', 'visit_id', 'session_id', 'lead_type', 'whatsapp', 'email',
  'operation', 'page_path', 'referrer', ...campaignKeys, 'incentive', 'source_component',
  'lead_consent', 'consent_analytics', 'consent_ads',
]);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const operations = new Set(['restaurante', 'marmitas', 'hamburgueria', 'home', 'delivery', 'hub']);
const components = new Set(['popup', 'floating_button', 'form_footer']);

const cleanString = (value, max = 256) => {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') throw new Error('invalid_string');
  const clean = value.trim().replace(/[\u0000-\u001f]/g, '').slice(0, max);
  return clean || null;
};

export function validateLead(input, now = Date.now()) {
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('object_required');
  if (Object.keys(input).some(key => !allowedFields.has(key))) throw new Error('unknown_field');
  if (!uuid.test(input.event_id) || (input.visit_id && !uuid.test(input.visit_id)) || (input.session_id && !uuid.test(input.session_id))) throw new Error('invalid_id');
  if (typeof input.occurred_at !== 'string' || !Number.isFinite(Date.parse(input.occurred_at)) || Math.abs(now - Date.parse(input.occurred_at)) > 86400000) throw new Error('invalid_timestamp');
  if (!['whatsapp', 'email', 'both'].includes(input.lead_type)) throw new Error('invalid_lead_type');
  if (!operations.has(input.operation) || !components.has(input.source_component) || input.page_path !== (input.operation === 'hub' ? '/delivery/' : `/delivery/${input.operation}/`)) throw new Error('invalid_context');
  if (input.lead_consent !== true || typeof input.consent_analytics !== 'boolean' || typeof input.consent_ads !== 'boolean') throw new Error('consent_required');
  const whatsapp = cleanString(input.whatsapp, 15)?.replace(/\D/g, '') || null;
  const email = cleanString(input.email, 120)?.toLowerCase() || null;
  if (whatsapp && !/^\d{10,15}$/.test(whatsapp)) throw new Error('invalid_whatsapp');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error('invalid_email');
  if ((input.lead_type === 'whatsapp' || input.lead_type === 'both') && !whatsapp) throw new Error('whatsapp_required');
  if ((input.lead_type === 'email' || input.lead_type === 'both') && !email) throw new Error('email_required');
  if (!input.consent_ads && ['gclid', 'gbraid', 'wbraid', 'fbclid'].some(key => input[key])) throw new Error('ads_consent_required');
  const output = { ...input, whatsapp, email };
  for (const [key, value] of Object.entries(output)) {
    if (typeof value === 'string' && !['whatsapp', 'email'].includes(key)) output[key] = cleanString(value);
  }
  if (output.referrer) {
    const url = new URL(output.referrer);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== output.referrer) throw new Error('invalid_referrer');
  }
  return Object.fromEntries(Object.entries(output).filter(([, value]) => value != null && value !== ''));
}
