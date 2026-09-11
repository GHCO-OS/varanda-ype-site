# Deployment e integrações

## Cloudflare Pages + D1

1. Corrigir a autenticação: `npx wrangler login` ou token com permissões Pages/D1. O token testado em 11/09/2026 retornou `Invalid access token (9109)`.
2. Executar `powershell -ExecutionPolicy Bypass -File scripts/setup-delivery-d1.ps1`. O script reutiliza `varanda-delivery-db`, atualiza `wrangler.jsonc` e aplica 0001–0003 sem criar banco duplicado.
3. Confirmar `d1_databases` com binding `DELIVERY_DB`; executar `npx wrangler types` após o binding.
4. `npm run lint && npm test && npm run build`.
5. Preview: `npx wrangler pages dev dist --d1 DELIVERY_DB=<database_id>` ou fluxo Pages do projeto.
6. Dry run/config e deploy pelo pipeline existente. Não publicar sem conferir o projeto Pages correto.
7. Verificar `/api/health/tracking`, logs estruturados e migrations.

## GTM/GA4/Google Ads

- Preservar o único `GTM-56F5TM96`.
- Criar variáveis Data Layer para platform, intent, landing_variant, creative, audience e offer.
- Mapear eventos conforme EVENT_SPEC. `outbound_order_click` pode ser key event provisório; microeventos ficam secondary.
- `purchase` somente com order_id, value e BRL confirmados.
- BigQuery: GA4 Admin → Product links → BigQuery Links; escolher projeto/região e export diário/streaming conforme custo.
- Enhanced Conversions/offline: somente dado voluntário, normalizado e SHA-256 conforme especificação atual. Adapter aguarda fonte de pedido.

## sGTM / Stape / Meta CAPI

Status: WAITING CREDENTIAL. Domínio recomendado `metrics.varandaype.com`. Criar CNAME conforme instrução atual do provedor, container Server GTM e secrets `META_CAPI_TOKEN`, `GA4_API_SECRET`. Browser/server devem compartilhar `event_id`. Nunca versionar tokens. Publicar somente após Test Events provar deduplicação.

## Variáveis

Consultar `.env.example`. IDs públicos ainda exigem configuração; tokens são somente secrets Cloudflare. Feature flags server-side começam desligadas.

## Rollback

Backup lógico: branch `backup/performance-marketing-before-20260911`. O código novo está em `feat/performance-marketing-first-party-20260911`. Não use reset destrutivo; reverta o commit de feature ou redeploy do deployment anterior do Pages.
