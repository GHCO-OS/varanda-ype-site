/**
 * Banner de Consentimento LGPD - Discreto
 * Projeto: Varanda Ypêªª Site
 * Branch: marketing/tracking-v1
 * Autor: Perplexity AI Assistant
 * Data: 2026-09-14
 */

import { useState, useEffect } from 'react';

interface ConsentBannerProps {
  onAccept: () => void;
  onReject: () => void;
}

export function ConsentBanner({ onAccept, onReject }: ConsentBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('consent_given');
    if (consent === null) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('consent_given', 'true');
    setVisible(false);
    onAccept();
  };

  const handleReject = () => {
    localStorage.setItem('consent_given', 'false');
    setVisible(false);
    onReject();
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      maxWidth: '320px',
      padding: '16px',
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      zIndex: 9999,
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    }}>
      <div style={{ fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>
        🔒 Privacidade de Dados
      </div>
      <div style={{ color: '#666', marginBottom: '16px' }}>
        Usamos analytics para entender como você usa nosso site e melhorar sua experiência.
        {' '}<a href="/privacidade" style={{ color: '#0066cc', textDecoration: 'underline' }}>Saiba mais</a>.
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleReject}
          style={{
            padding: '8px 16px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            background: '#f5f5f5',
            color: '#333',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Recusar
        </button>
        <button
          onClick={handleAccept}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            background: '#10b981',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
