import { cleanParam, intents, validPlatform } from '../../shared/marketing-config.js';
import { assignExperiment } from './experiment.js';
import { readConsent, saveConsent } from './consent.js';
import { createMarketingTracking } from './tracking.js';

function observeOnce(win, selector, callback) {
  const elements = [...win.document.querySelectorAll(selector)];
  if (!elements.length) return;
  if (!('IntersectionObserver' in win)) { elements.forEach(callback); return; }
  const observer = new win.IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target); callback(entry.target);
  }), { threshold: 0.35 });
  elements.forEach(element => observer.observe(element));
}

export function initMarketingLanding(win = window) {
  const root = win.document.querySelector('[data-marketing-platform]');
  if (!root || root.dataset.initialized) return null;
  root.dataset.initialized = 'true';
  const platform = validPlatform(root.dataset.marketingPlatform);
  const tracker = createMarketingTracking(win, platform);
  const state = tracker.state();

  if (platform && state.intent !== 'default') {
    const variant = intents[state.intent];
    root.querySelector('[data-hero-headline]').textContent = variant.headline;
    root.querySelector('[data-hero-subheadline]').textContent = variant.subheadline;
    const hero = root.querySelector('[data-hero-image]');
    hero.src = variant.hero; hero.alt = variant.heroAlt;
    root.querySelector('[data-food-grid]').innerHTML = variant.products.map(product => `<a class="food-card" href="#order" data-item-id="${product.id}" data-item-name="${product.name}"><img src="${product.image}" alt="${product.name} do Varanda Ypê" width="${product.width}" height="${product.height}" loading="lazy" decoding="async"><span><strong>${product.name}</strong><small>${product.detail}</small></span></a>`).join('');
  }

  tracker.emit('page_view');
  tracker.emit('landing_view');
  if (state.is_returning) tracker.emit('return_visit');
  if (platform) tracker.emit('platform_view');
  else tracker.emit('platform_selector_view');
  if (state.intent !== 'default') tracker.emit('intent_detected');

  root.querySelectorAll('[data-platform-link]').forEach(link => link.addEventListener('click', () => tracker.emit('platform_select', { platform: link.dataset.platformLink, cta_position: 'selector' })));
  root.querySelectorAll('[data-outbound]').forEach(link => {
    link.href = tracker.href();
    link.addEventListener('click', () => {
      const position = link.dataset.outbound;
      tracker.emit(position === 'sticky' ? 'sticky_cta_click' : position === 'hero' ? 'hero_cta_click' : 'secondary_cta_click', { cta_position: position });
      tracker.emit('outbound_order_click', { cta_position: position, destination: link.href, destination_id: root.querySelector('[data-destination-id]')?.dataset.destinationId });
    });
  });
  root.querySelectorAll('[data-item-id]').forEach(item => item.addEventListener('click', () => tracker.emit('item_click', { item_id: item.dataset.itemId, item_name: item.dataset.itemName })));
  observeOnce(win, '[data-outbound="hero"]', () => tracker.emit('hero_cta_view', { cta_position: 'hero' }));
  observeOnce(win, '[data-menu-section]', () => tracker.emit('menu_section_view'));
  observeOnce(win, '[data-item-id]', item => tracker.emit('item_view', { item_id: item.dataset.itemId, item_name: item.dataset.itemName }));

  const panel = root.querySelector('[data-consent-panel]');
  if (panel) {
    const current = readConsent(win);
    for (const key of ['analytics', 'advertising', 'personalization']) panel.querySelector(`[name="${key}"]`).checked = current[key];
    const apply = value => {
      const saved = saveConsent(value, win); tracker.setConsent(saved);
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({ event: saved.analytics || saved.advertising || saved.personalization ? 'consent_accept' : 'consent_reject', site: 'varanda_ype', consent_analytics: saved.analytics, consent_advertising: saved.advertising, consent_personalization: saved.personalization });
      panel.querySelector('[data-consent-status]').textContent = 'Preferências salvas.';
    };
    panel.querySelector('[data-consent-save]').addEventListener('click', () => apply(Object.fromEntries(['analytics', 'advertising', 'personalization'].map(key => [key, panel.querySelector(`[name="${key}"]`).checked]))));
    panel.querySelector('[data-consent-all]').addEventListener('click', () => apply({ analytics: true, advertising: true, personalization: true }));
  }

  const experimentId = cleanParam(new URLSearchParams(win.location.search).get('experiment'), 64);
  if (experimentId) {
    const variantId = assignExperiment(win, state.visitor_id, experimentId, ['control', 'direct']);
    tracker.emit('experiment_exposure', { experiment_id: experimentId, variant_id: variantId });
    if (variantId === 'direct') root.querySelectorAll('[data-outbound]').forEach(link => { if (link.dataset.outbound !== 'sticky') link.textContent = `Pedir agora no ${platform === 'direto' ? 'Varanda' : platform === 'ifood' ? 'iFood' : '99Food'}`; });
  }

  if (import.meta.env.DEV || import.meta.env.VITE_TRACKING_DEBUG === 'true') {
    const debug = root.querySelector('[data-tracking-debug]');
    if (debug && new URLSearchParams(win.location.search).has('debug')) {
      debug.hidden = false;
      const safe = tracker.state();
      safe.visitor_id = `${safe.visitor_id.slice(0, 8)}…`; safe.session_id = `${safe.session_id.slice(0, 8)}…`;
      debug.textContent = JSON.stringify(safe, null, 2); console.table(safe.campaign);
    }
  }
  return tracker;
}

if (typeof window !== 'undefined') initMarketingLanding();
