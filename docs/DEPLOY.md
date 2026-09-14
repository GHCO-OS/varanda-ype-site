# Guia de Deploy - Tracking Stack

## ✅ Checklist de ImplantaÃ§Ã¼êªªo

### 1. Instalar dependÃªncia
```bash
npm install @fingerprintjs/fingerprintjs
```

### 2. Verificar arquivos
- [x] `functions/collect.ts` - Worker
- [x] `src/lib/tracking/fingerprint.ts` - Fingerprint
- [x] `src/components/ConsentBanner.tsx` - Banner LGPD
- [x] `src/hooks/useConsent.ts` - Hook
- [x] `wrangler.jsonc` - KV binding configurado
- [x] `docs/tracking.md` - DocumentaÃ§Ã¼êªªo

### 3. Testar localmente
```bash
npm run dev
```

Acesse `http://localhost:5173` e verifique:
- Banner aparece apÃ¼êª³s 2s
- Ao clicar "Aceitar", fingerprint ÃÂ© coletado
- Worker `/collect` responde (ver console)

### 4. Deploy em homologaÃ§Ã¼êªªo
```bash
wrangler deploy --branch marketing/tracking-v1
```

### 5. Validar no Cloudflare Dashboard
- Workers → `varanda-ype-site` → Logs
- KV → `TRACKING_KV` → Browse (ver chaves `visit:*`)

### 6. Merge para main (apÃ¼êª³s testes)
```bash
git checkout main
git merge marketing/tracking-v1
git push origin main
wrangler deploy
```

## Monitoramento

### Logs do Worker
```bash
wrangler tail --name varanda-ype-site
```

### Verificar KV
```bash
wrangler kv:key list --namespace-id 1c965d6b0c4e4892809f83538aaff618
```

## Autor

**Perplexity AI Assistant** - 2026-09-14
