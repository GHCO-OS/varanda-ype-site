import { persistMarketingEvent, serverEvent, structuredError } from '../lib/marketing-store.js';

const sources = Object.freeze({
  mesa: { campaign: 'VY_OFFLINE_CAMPINAS_MESA', content: 'mesa', path: '/pedir/' },
  flyer: { campaign: 'VY_OFFLINE_CAMPINAS_FLYER', content: 'flyer', path: '/pedir/' },
  fachada: { campaign: 'VY_OFFLINE_CAMPINAS_FACHADA', content: 'fachada', path: '/pedir/' },
  cardapio: { campaign: 'VY_OFFLINE_CAMPINAS_CARDAPIO', content: 'cardapio', path: '/pedir/' },
  caixa: { campaign: 'VY_OFFLINE_CAMPINAS_CAIXA', content: 'caixa', path: '/pedir/' },
  nota: { campaign: 'VY_OFFLINE_CAMPINAS_NOTA', content: 'nota', path: '/pedir/' },
  'google/profile': { campaign: 'VY_LOCAL_CAMPINAS_PROFILE', content: 'profile', path: '/' },
  'google/menu': { campaign: 'VY_LOCAL_CAMPINAS_MENU', content: 'menu', path: '/menu/' },
  'google/order': { campaign: 'VY_LOCAL_CAMPINAS_ORDER', content: 'order', path: '/pedir/' },
  'google/directions': { campaign: 'VY_LOCAL_CAMPINAS_DIRECTIONS', content: 'directions', path: '/go/maps' },
});

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' };
export function onRequestGet(context) {
  const parts = Array.isArray(context.params.source) ? context.params.source : [context.params.source];
  const source = parts.filter(Boolean).join('/').toLowerCase();
  const entry = sources[source];
  if (!entry) return new Response('Origem não encontrada.', { status: 404, headers });
  const destination = new URL(entry.path, context.request.url);
  destination.searchParams.set('utm_source', source.startsWith('google/') ? 'google_business_profile' : 'offline');
  destination.searchParams.set('utm_medium', source.startsWith('google/') ? 'organic_local' : 'qr');
  destination.searchParams.set('utm_campaign', entry.campaign);
  destination.searchParams.set('utm_content', entry.content);
  const event = serverEvent(context.request, { event: source.endsWith('directions') ? 'directions_click' : 'secondary_cta_click', landing_variant: 'owned_redirect', detail: { destination: destination.toString(), destination_id: source, source_component: 'redirect' } });
  context.waitUntil(persistMarketingEvent(context.env, event, context.request).catch(error => structuredError('owned_redirect', event.event_id, error)));
  return new Response(null, { status: 302, headers: { ...headers, Location: destination.toString() } });
}
