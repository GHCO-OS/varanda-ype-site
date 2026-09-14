# Sistema de Tracking - Varanda Ypêªª Site

## Status
✅ Branch `marketing/tracking-v1` criada  
✅ Worker `functions/collect.ts` implementado  
✅ FingerprintJS v4 integration pronta  
✅ ConsentBanner LGPD pronto  
✅ Hook useConsent pronto  
✅ KV `TRACKING_KV` configurado (ID: 1c965d6b0c4e4892809f83538aaff618)  
✅ wrangler.jsonc atualizado  
⬜  Testes em homologaÃ§Ã¼êªªo  
⬜  Deploy em produÃ§Ã¼êªªo  

## Arquitetura

```
Browser → FingerprintJS → Worker /collect → KV Storage
          ↓
    ConsentBanner (LGPD)
          ↓
    Eventos (scroll, CTA)
```

## Uso no App

```tsx
import { ConsentBanner } from './components/ConsentBanner';
import { useConsent } from './hooks/useConsent';
import { trackEvent } from './lib/tracking/fingerprint';

function App() {
  const { consent, visitorId, handleAccept, handleReject, isConsented } = useConsent();

  useEffect(() => {
    if (isConsented) trackEvent('pageview', { path: location.pathname });
  }, [location.pathname, isConsented]);

  return (
    <>
      <ConsentBanner onAccept={handleAccept} onReject={handleReject} />
    </>
  );
}
```

## Track de Eventos

```tsx
// Clique em CTA (WhatsApp/iFood)
<button onClick={() => trackEvent('cta_click', { target: 'whatsapp' })}>
  Pedir no WhatsApp
</button>

// Scroll 50%
useEffect(() => {
  const onScroll = () => {
    const percent = (scrollY + innerHeight) / document.body.scrollHeight * 100;
    if (percent >= 50 && !scrolled) {
      setScrolled(true);
      trackEvent('scroll_50', { path: location.pathname });
    }
  };
  window.addEventListener('scroll', onScroll);
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

## Limites Free Tier

| Recurso | Limite |
|---|---|
| KV writes | 1.000/dia |
| Workers requests | 100.000/dia |
| FingerprintJS | 40-60% unicidade |

## PrÃ¼êª³ximos Passos

1. **Instalar dependÃªncia:**
   ```bash
   npm install @fingerprintjs/fingerprintjs
   ```

2. **Testar em homologaÃ§Ã¼êªªo:**
   ```bash
   npm run dev
   ```

3. **Deploy:**
   ```bash
   wrangler deploy --branch marketing/tracking-v1
   ```

## Autor

**Perplexity AI Assistant** - 2026-09-14
