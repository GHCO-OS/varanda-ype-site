/**
 * Cloudflare Worker - Coleta de dados de tracking (fingerprint + geo)
 * Projeto: Varanda Ypêªª Site
 * Branch: marketing/tracking-v1
 * Autor: Perplexity AI Assistant
 * Data: 2026-09-14
 */

export default {
  async fetch(request: Request, env: Env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    if (request.method !== 'POST') return new Response('OK', { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });

    try {
      const data = await request.json();
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const country = request.cf?.country || 'unknown';
      const city = request.cf?.city || 'unknown';
      const region = request.cf?.region || 'unknown';
      const timezone = request.cf?.timezone || 'unknown';
      const asn = request.cf?.asn || 'unknown';
      const ua = request.headers.get('User-Agent') || 'unknown';

      const record = { ...data, ip, country, city, region, timezone, asn, ua, receivedAt: new Date().toISOString() };
      const key = `visit:${data.visitorId}:${Date.now()}`;
      
      if (env.TRACKING_KV) {
        await env.TRACKING_KV.put(key, JSON.stringify(record), { expirationTtl: 7776000 });
      }

      console.log(`[TRACKING] ${data.visitorId} from ${city}, ${country}`);
      return new Response(JSON.stringify({ status: 'ok', key, city, country }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (err) {
      console.error('[TRACKING ERROR]', err);
      return new Response(JSON.stringify({ error: 'failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};
