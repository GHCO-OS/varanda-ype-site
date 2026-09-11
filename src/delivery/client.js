import { createDeliveryTracking } from './tracking.js';
import { getDirectOrderMessage, isDirectOrderAvailable } from '../../shared/delivery-hours.js';

const LEAD_DISMISSED = 'vy_lead_dialog_dismissed';

function setupLeadDialog(win, root, tracker) {
  const dialog = root.querySelector('[data-lead-dialog]');
  const form = root.querySelector('[data-lead-form]');
  if (!dialog || !form) return;
  let dismissed = false;
  let available = false;
  let pendingShow = false;
  try { dismissed = win.sessionStorage.getItem(LEAD_DISMISSED) === '1'; } catch { /* Storage is optional. */ }
  const remember = () => { try { win.sessionStorage.setItem(LEAD_DISMISSED, '1'); } catch { /* Storage is optional. */ } };
  const show = () => {
    if (!available) { pendingShow = true; return; }
    if (dismissed || dialog.open) return;
    dismissed = true; remember(); dialog.showModal();
  };
  const onExit = event => { if (event.clientY <= 0 && !event.relatedTarget) show(); };
  let timer;
  win.document.addEventListener('mouseout', onExit, { once: true });
  win.fetch('/api/lead-capture', { method: 'GET', credentials: 'same-origin' }).then(response => {
    if (!response.ok || dismissed) return;
    available = true;
    if (pendingShow) show();
    else timer = win.setTimeout(show, 12000);
  }).catch(() => {});
  dialog.addEventListener('close', remember);
  const type = form.elements.lead_type;
  const whatsapp = root.querySelector('[data-lead-whatsapp]');
  const email = root.querySelector('[data-lead-email]');
  const sync = () => {
    whatsapp.hidden = type.value === 'email'; email.hidden = type.value === 'whatsapp';
    form.elements.whatsapp.required = type.value !== 'email'; form.elements.email.required = type.value !== 'whatsapp';
  };
  type.addEventListener('change', sync); sync();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const status = root.querySelector('[data-lead-status]');
    const button = form.querySelector('[type="submit"]');
    if (!form.reportValidity()) return;
    button.disabled = true; status.textContent = 'Salvando…';
    const payload = {
      ...tracker.leadContext(), lead_type: type.value,
      whatsapp: form.elements.whatsapp.value || undefined, email: form.elements.email.value || undefined,
      lead_consent: true, source_component: 'popup',
    };
    try {
      const response = await win.fetch('/api/lead-capture', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('capture_failed');
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({ event: 'lead_capture', site: 'varanda_ype', operation: payload.operation, lead_type: payload.lead_type, source_component: 'popup', event_id: payload.event_id });
      status.textContent = 'Cadastro recebido. Obrigado!';
      win.setTimeout(() => dialog.close(), 900);
    } catch {
      status.textContent = 'Não foi possível salvar agora. Tente novamente em instantes.'; button.disabled = false;
    }
  });
  dialog.addEventListener('close', () => { if (timer) win.clearTimeout(timer); win.document.removeEventListener('mouseout', onExit); });
}

export function initDelivery(win = window) {
  const root = win.document.querySelector('[data-delivery-operation]');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const tracker = createDeliveryTracking(win, root.dataset.deliveryOperation);
  const direct = root.querySelector('[data-destination="expresso_varanda"]');
  if (direct && !isDirectOrderAvailable()) {
    const disabled = win.document.createElement('button');
    disabled.type = 'button'; disabled.disabled = true; disabled.className = `${direct.className} router-disabled`;
    disabled.setAttribute('aria-disabled', 'true'); disabled.innerHTML = direct.innerHTML;
    direct.replaceWith(disabled);
    const note = root.querySelector('[data-direct-order-note]');
    note.hidden = false; note.textContent = getDirectOrderMessage();
  }
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
    const allowed = value === 'granted';
    const saved = { version: 2, analytics: allowed, advertising: allowed, personalization: allowed };
    try {
      win.localStorage.setItem('vy_consent_v2', JSON.stringify(saved));
      win.localStorage.setItem('vy_consent', value);
      if (!allowed) {
        ['vy_vid', 'vy_attribution_ledger'].forEach(key => win.localStorage.removeItem(key));
        ['vy_sid', 'vy_delivery_session'].forEach(key => win.sessionStorage.removeItem(key));
      }
      win.document.cookie = `vy_consent_state=a${Number(allowed)}d${Number(allowed)}p${Number(allowed)}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
    } catch { /* Links remain functional. */ }
    win.gtag?.('consent', 'update', { analytics_storage: value, ad_storage: value, ad_user_data: value, ad_personalization: value });
    tracker.setConsent({ analytics: allowed, ads: allowed });
    tracker.emit(value === 'granted' ? 'consent_accept' : 'consent_reject');
    tracker.state();
    refreshLinks();
    status.textContent = value === 'granted' ? 'Preferência salva: medição e anúncios permitidos.' : 'Preferência salva: medição e anúncios rejeitados.';
  }));
  setupLeadDialog(win, root, tracker);
  if (import.meta.env.DEV) {
    const debug = root.querySelector('[data-debug]');
    if (debug && new URLSearchParams(win.location.search).has('debug')) { debug.hidden = false; debug.textContent = JSON.stringify(tracker.state(), null, 2); }
  }
}
if (typeof window !== 'undefined') initDelivery();
