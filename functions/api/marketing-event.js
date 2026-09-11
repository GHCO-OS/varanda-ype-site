import { validateMarketingEvent } from '../../shared/marketing-event.js';
import { isObviousBot, persistMarketingEvent, readCapped, structuredError } from '../lib/marketing-store.js';

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' };
const reply = (status, error) => Response.json({ error }, { status, headers });

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return reply(405, 'method_not_allowed');
  if (request.headers.get('Origin') !== new URL(request.url).origin) return reply(403, 'origin_not_allowed');
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply(415, 'json_required');
  if (Number(request.headers.get('Content-Length')) > 12288) return reply(413, 'payload_too_large');
  if (isObviousBot(request)) return new Response(null, { status: 204, headers });
  let event;
  try {
    const bytes = await readCapped(request, 12288);
    if (bytes === null) return reply(413, 'payload_too_large');
    if (!bytes.length) return reply(400, 'invalid_event');
    event = validateMarketingEvent(JSON.parse(new TextDecoder().decode(bytes)));
  } catch { return reply(400, 'invalid_event'); }
  if (!event.consent_analytics) return new Response(null, { status: 204, headers });
  if (!env.DELIVERY_DB) return reply(503, 'storage_unavailable');
  const task = persistMarketingEvent(env, event, request).catch(error => structuredError('api', event.event_id, error));
  context.waitUntil(task);
  return new Response(null, { status: 202, headers });
}
