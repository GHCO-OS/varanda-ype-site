# Tracking QA

## Automatizado

- [x] UTMs e click IDs allowlisted.
- [x] first touch não é sobrescrito; last touch é atualizado; intermediários são preservados.
- [x] UUID de evento é único.
- [x] destinos por plataforma/intenção e redirect allowlist.
- [x] rejeição não persiste visitor/ledger e não bloqueia links.
- [x] experimento persiste variante.
- [x] migration cria tabelas, índices e view.
- [x] canonical limpo; `/pedir` noindex e fora do sitemap.
- [x] ausência de evento `purchase` nos cliques.

## Manual após deploy

- [ ] GTM Preview: triggers dos eventos da EVENT_SPEC sem duplicação.
- [ ] GA4 DebugView: sessão/origem/platform/intent/landing_variant.
- [ ] Meta Test Events: `PageView`, `ViewContent` e custom `OutboundOrder`; nunca Purchase no clique.
- [ ] Deduplicação browser/server com mesmo `event_id` quando sGTM/CAPI for ativado.
- [ ] Google Ads diagnostics e key event `outbound_order_click` como provisório/secundário conforme bidding.
- [ ] Consent Mode: default denied; aceitar/rejeitar/personalizar e revisitar.
- [ ] Meta/Google com `gclid`, `gbraid`, `wbraid`, `fbclid`, ValueTrack e macros Meta.
- [ ] Safari iPhone, Chrome Android, Edge/Chrome desktop e bloqueador de anúncios.
- [ ] Links oficiais abrem os apps; se `/go` prejudicar deep linking, usar URL HTTPS direta + beacon.
- [ ] Health check `/api/health/tracking` retorna 200 com D1 ativo.

Nunca fechar QA usando somente Network/Data Layer: confirmar navegação real e ausência de duplicação na plataforma.
