/**
 * Hook de Consentimento - Gerencia estado de consentimento LGPD
 * Projeto: Varanda Ypêªª Site
 * Branch: marketing/tracking-v1
 * Autor: Perplexity AI Assistant
 * Data: 2026-09-14
 */

import { useState, useEffect } from 'react';
import { initFingerprint, trackEvent } from '../lib/tracking/fingerprint';

export function useConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    const savedConsent = localStorage.getItem('consent_given');
    if (savedConsent !== null) {
      const isConsented = savedConsent === 'true';
      setConsent(isConsented);
      if (isConsented) {
        const savedVisitorId = localStorage.getItem('fp_visitorId');
        if (savedVisitorId) setVisitorId(savedVisitorId);
      }
    } else {
      setConsent(null);
    }
  }, []);

  const handleAccept = async () => {
    setConsent(true);
    const result = await initFingerprint(true);
    if (result) {
      setVisitorId(result.visitorId);
      localStorage.setItem('fp_visitorId', result.visitorId);
      trackEvent('consent_given', { visitorId: result.visitorId });
    }
  };

  const handleReject = () => {
    setConsent(false);
    trackEvent('consent_rejected', { ts: Date.now() });
  };

  return { consent, visitorId, handleAccept, handleReject, isConsented: consent === true };
}
