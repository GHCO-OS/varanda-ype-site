import { createDeliveryTracking } from './tracking.js';

export function initDelivery(win = window) {
  const root = win.document.querySelector('[data-delivery-operation]');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const tracker = createDeliveryTracking(win, root.dataset.deliveryOperation);
  const refreshLinks = () => {
    root.querySelectorAll('[data-destination]').forEach(link => { link.href = tracker.href(link.dataset.destination); });
    root.querySelectorAll('[data-operation-link]').forEach(link => { link.href = tracker.internalHref(link.dataset.operationLink); });
  };
  refreshLinks();
  tracker.emit('page_view', { path: win.location.pathname, title: win.document.title });
  tracker.emit('delivery_hub_view');
  root.querySelectorAll('[data-destination]').forEach((link, index) => {
    link.addEventListener('click', () => { tracker.click(link.dataset.destination, index === 0 ? 'primary' : 'secondary'); });
  });
  const status = root.querySelector('[data-consent-status]');
  root.querySelectorAll('[data-consent]').forEach(button => button.addEventListener('click', () => {
    const value = button.dataset.consent;
    tracker.setConsent(value);
    try { win.localStorage.setItem('vy_consent', value); } catch { /* Links remain functional. */ }
    win.gtag?.('consent', 'update', { analytics_storage: value, ad_storage: value, ad_user_data: value, ad_personalization: value });
    tracker.emit(value === 'granted' ? 'consent_accept' : 'consent_reject');
    tracker.state();
    refreshLinks();
    status.textContent = value === 'granted' ? 'Preferência salva: medição e anúncios permitidos.' : 'Preferência salva: medição e anúncios rejeitados.';
  }));
  if (import.meta.env.DEV) {
    const debug = root.querySelector('[data-debug]');
    if (debug && new URLSearchParams(win.location.search).has('debug')) { debug.hidden = false; debug.textContent = JSON.stringify(tracker.state(), null, 2); }
  }
}
if (typeof window !== 'undefined') initDelivery();
