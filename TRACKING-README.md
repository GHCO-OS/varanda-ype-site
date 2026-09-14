# 🎯 Projeto de Tracking - Varanda Ypêªª Site

## Status: ✅ PRONTO PARA TESTES

**Branch:** `marketing/tracking-v1`  
**Autor da ImplementaÃ§Ã¼êªªo:** Perplexity AI Assistant  
**Data:** 2026-09-14  

---

## 📦 O que foi implementado

| Arquivo | DescriÃ§Ã¼êªªo |
|---|---|
| `functions/collect.ts` | Worker Cloudflare que recebe fingerprint + geo |
| `src/lib/tracking/fingerprint.ts` | IntegraÃ§Ã¼êªªo FingerprintJS v4 |
| `src/components/ConsentBanner.tsx` | Banner LGPD (Aceitar/Recusar) |
| `src/hooks/useConsent.ts` | Hook React para consentimento |
| `wrangler.jsonc` | KV binding configurado |
| `docs/tracking.md` | DocumentaÃ§Ã¼êªªo completa |
| `docs/DEPLOY.md` | Guia de deploy |

---

## 🚀 PrÃ¼êª³ximos Passos

### 1. Instalar dependÃªncia
```bash
npm install @fingerprintjs/fingerprintjs
```

### 2. Integrar no App
```tsx
// src/App.tsx
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
      {/* resto do app */}
    </>
  );
}
```

### 3. Testar
```bash
npm run dev
wrangler deploy --branch marketing/tracking-v1
```

### 4. Merge para main (apÃ¼êª³s testes)
```bash
git checkout main
git merge marketing/tracking-v1
git push origin main
```

---

## 📊 Arquitetura

```
Browser → FingerprintJS → Worker /collect → KV TRACKING_KV
          ↓
    ConsentBanner (LGPD)
          ↓
    Eventos (scroll, CTA, pageview)
```

---

## ⚠️ Importante

- **KV Namespace:** `TRACKING_KV` (ID: `1c965d6b0c4e4892809f83538aaff618`)
- **Limite free:** 1.000 writes/dia no KV
- **RetenÃ§Ã¼êªªo:** 90 dias (TTL automå³³tico)
- **LGPD:** Banner com consentimento explå³³cito (nÃ¼êªªo usar "ao prosseguir, concorda")

---

## 📞 Suporte

DocumentaÃ§Ã¼êªªo completa em `docs/tracking.md` e `docs/DEPLOY.md`.

**Autor:** Perplexity AI Assistant  
**Contato:** cuiabar@cuiabar.net  
