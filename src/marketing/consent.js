const CONSENT_KEY = 'vy_consent_v2';
const LEGACY_KEY = 'vy_consent';

export const defaultConsent = Object.freeze({ necessary: true, analytics: false, advertising: false, personalization: false });

export function readConsent(win = window) {
  try {
    const stored = JSON.parse(win.localStorage.getItem(CONSENT_KEY));
    if (stored?.version === 2) return { necessary: true, analytics: stored.analytics === true, advertising: stored.advertising === true, personalization: stored.personalization === true };
  } catch { /* Storage and malformed legacy values are non-fatal. */ }
  try {
    const legacy = win.localStorage.getItem(LEGACY_KEY);
    if (legacy === 'granted') return { necessary: true, analytics: true, advertising: true, personalization: true };
    if (legacy === 'denied') return { ...defaultConsent };
  } catch { /* Storage is optional. */ }
  return { ...defaultConsent };
}

export function hasConsentChoice(win = window) {
  try { return Boolean(win.localStorage.getItem(CONSENT_KEY) || win.localStorage.getItem(LEGACY_KEY)); } catch { return false; }
}

export function saveConsent(choice, win = window) {
  const value = { version: 2, necessary: true, analytics: choice.analytics === true, advertising: choice.advertising === true, personalization: choice.personalization === true, updated_at: new Date().toISOString() };
  try {
    win.localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
    win.localStorage.setItem(LEGACY_KEY, value.analytics && value.advertising ? 'granted' : 'denied');
    if (!value.analytics) {
      win.localStorage.removeItem('vy_vid');
      win.localStorage.removeItem('vy_attribution_ledger');
      win.localStorage.removeItem('vy_last_seen');
      win.sessionStorage.removeItem('vy_sid');
      win.sessionStorage.removeItem('vy_session_started');
      win.sessionStorage.removeItem('vy_delivery_session');
    }
  } catch { /* Choice still applies for this page. */ }
  try { win.document.cookie = `vy_consent_state=a${Number(value.analytics)}d${Number(value.advertising)}p${Number(value.personalization)}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`; } catch { /* Cookie is optional. */ }
  if (!value.analytics) {
    try { win.document.cookie = 'vy_vid=; Max-Age=0; Path=/; SameSite=Lax; Secure'; win.document.cookie = 'vy_sid=; Max-Age=0; Path=/; SameSite=Lax; Secure'; } catch { /* Cookie cleanup optional. */ }
  }
  win.dataLayer = win.dataLayer || [];
  const gtag = win.gtag || function () { win.dataLayer.push(arguments); };
  gtag('consent', 'update', {
    analytics_storage: value.analytics ? 'granted' : 'denied',
    ad_storage: value.advertising ? 'granted' : 'denied',
    ad_user_data: value.advertising ? 'granted' : 'denied',
    ad_personalization: value.personalization ? 'granted' : 'denied',
  });
  win.dispatchEvent?.(new CustomEvent('vy:consent', { detail: value }));
  return value;
}

export function consentLabel(value) {
  if (!value.analytics && !value.advertising && !value.personalization) return 'necessary';
  return [value.analytics && 'analytics', value.advertising && 'advertising', value.personalization && 'personalization'].filter(Boolean).join('+');
}

export { CONSENT_KEY };
