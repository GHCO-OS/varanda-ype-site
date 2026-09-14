/**
 * FingerprintJS v4 - Coleta de fingerprint do navegador
 * Projeto: Varanda Ypêªª Site
 * Branch: marketing/tracking-v1
 * Autor: Perplexity AI Assistant
 * Data: 2026-09-14
 */

export interface FingerprintResult {
  visitorId: string;
  confidence: number;
}

export interface TrackingData {
  visitorId: string;
  confidence: number;
  screen: { w: number; h: number; cd: number; pr: number };
  nav: { lang: string; plat: string; hc: number | null; dm: number | null; tz: string };
  url: string;
  referrer: string;
  ts: number;
}

const WORKER_URL = '/collect';

export async function initFingerprint(consented: boolean): Promise<FingerprintResult | null> {
  if (!consented) {
    console.log('[FP] Consentimento não dado, pulando fingerprint');
    return null;
  }

  try {
    const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const visitorId = result.visitorId;

    const screenData = {
      w: window.screen.width,
      h: window.screen.height,
      cd: window.screen.colorDepth,
      pr: window.devicePixelRatio
    };

    const navData = {
      lang: navigator.language,
      plat: navigator.platform,
      hc: navigator.hardwareConcurrency,
      dm: navigator.deviceMemory || null,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    const trackingData: TrackingData = {
      visitorId,
      confidence: result.confidence.score,
      screen: screenData,
      nav: navData,
      url: location.href,
      referrer: document.referrer,
      ts: Date.now()
    };

    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackingData),
      keepalive: true
    }).catch(() => {});

    console.log('[FP] Visitor ID:', visitorId);

    return { visitorId, confidence: result.confidence.score };
  } catch (err) {
    console.error('[FP ERROR]', err);
    return null;
  }
}

export function trackEvent(eventName: string, eventData: Record<string, any>) {
  const visitorId = localStorage.getItem('fp_visitorId');
  if (!visitorId) return;

  fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorId, eventType: eventName, eventData, url: location.href, ts: Date.now() }),
    keepalive: true
  }).catch(() => {});
}
