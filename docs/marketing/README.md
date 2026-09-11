# Performance marketing first-party — Varanda Ypê

Status em 11/09/2026. Este diretório é a fonte operacional para aquisição, atribuição e QA. O clique para marketplace é intenção forte; `purchase` só pode nascer de uma transação confirmada.

## Auditoria inicial

- Stack: React 19 + Vite 7, SPA com pré-renderização própria e páginas estáticas especializadas.
- Hosting: Cloudflare Pages; Pages Functions em `functions/`; CDN e headers via `_headers`.
- Dados: binding D1 `DELIVERY_DB` previsto, mas ainda ausente de `wrangler.jsonc` porque a autenticação Cloudflare local está inválida.
- Analytics: um único container GTM `GTM-56F5TM96`; Consent Mode v2 antes do bootstrap. Não há tag GA4 ou Meta duplicada no código.
- SEO: metadata, canonical, JSON-LD Restaurant, robots e sitemap existentes; páginas orgânicas locais já cobrem restaurante, almoço, marmitas, grelhados e delivery.
- Baseline: lint, 15 testes e build aprovados antes desta evolução. Bundle principal gzip 82,49 kB; router delivery 3,78 kB gzip.
- Problemas corrigidos: atribuição limitada à sessão, ausência de visitor ledger/touchpoints, consentimento binário, inexistência de motor `/pedir`, redirects próprios e taxonomia ampla.

## Status real

| Camada | Status | Observação |
|---|---|---|
| `/pedir/*`, UTM, dataLayer, first/last touch | IMPLEMENTED | Validado localmente por testes e browser QA |
| D1 schema + Pages Functions | IMPLEMENTED | WAITING CREDENTIAL para criar/bindar banco remoto |
| GTM Web | CONFIGURED previamente | Container preservado; novos triggers precisam publicação manual |
| GA4 / Google Ads | PREPARED | IDs/tags reais e DebugView dependem do container/contas |
| Meta Pixel | PREPARED no GTM | Não há Pixel duplicado no código; Test Events depende da conta |
| Meta CAPI / sGTM / Stape | WAITING CREDENTIAL | Nenhum token no frontend; DNS e checklist em DEPLOYMENT.md |
| Purchase / receita / recompra | FUTURE | Exige confirmação real do Expresso/marketplace/CRM |
| Dashboard | IMPLEMENTED como dataset/view | `marketing_daily_performance`; Looker depende do D1 ativo |

Lighthouse local final da landing iFood/marmita: Performance 98, Acessibilidade 100, Boas Práticas 100; FCP 0,9 s, LCP 1,9 s, TBT 130 ms e CLS 0. SEO marcou 69 de forma esperada porque a landing publicitária é deliberadamente `noindex,follow`.

## Rotas

- `/pedir/`: escolha do canal.
- `/pedir/ifood`, `/pedir/99food`, `/pedir/direto`: motor único de pré-conversão.
- `?intent=marmita|executivo|grelhado|petisco|combo`: fotografia, headline e itens reais.
- `/go/ifood|99food|direto|whatsapp|maps|instagram|google-review`: redirect allowlisted.
- `/r/mesa|flyer|fachada|cardapio|caixa|nota` e `/r/google/profile|menu|order|directions`: entrada própria rastreável.
- `/cookies`: política e categorias de consentimento.

Arquivos centrais: `shared/marketing-config.js`, `src/marketing/tracking.js`, `functions/lib/marketing-store.js`, `migrations/0003_marketing_attribution.sql`.
