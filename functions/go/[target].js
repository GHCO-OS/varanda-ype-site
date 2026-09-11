import { persistMarketingEvent, redirectDestination, serverEvent, structuredError } from '../lib/marketing-store.js';

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' };
export function onRequestGet(context) {
  const target = String(context.params.target || '').toLowerCase();
  const requestUrl = new URL(context.request.url);
  const resolved = redirectDestination(target, requestUrl);
  if (!resolved) return new Response('Destino não encontrado.', { status: 404, headers });
  const platform = ['ifood', '99food', 'direto'].includes(target) ? target : undefined;
  const event = serverEvent(context.request, { event: resolved.event, platform, intent: resolved.intent, detail: { destination: resolved.url, destination_id: resolved.destinationId, cta_position: 'alias' } });
  context.waitUntil(persistMarketingEvent(context.env, event, context.request).catch(error => structuredError('redirect', event.event_id, error)));
  return new Response(null, { status: 302, headers: { ...headers, Location: resolved.url } });
}
