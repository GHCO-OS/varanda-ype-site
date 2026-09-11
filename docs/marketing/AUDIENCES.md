# Públicos e lifecycle

Segmentos conceituais, criados nas plataformas apenas após validação de consentimento e volume mínimo:

- Meta: `LP_VIEW_7D/30D`, `OUTBOUND_IFOOD_7D`, `OUTBOUND_99FOOD_7D`, `OUTBOUND_DIRECT_7D`, `INTENT_MARMITA|EXECUTIVO|GRELHADOS|PETISCOS|COMBOS_14D`, `HIGH_INTENT_NO_PURCHASE_7D`, `PURCHASE_30D/90D`, `REPEAT_CUSTOMER`.
- GA4/Google Ads: High intent, no outbound, outbound por plataforma, retorno e intenção de categoria.
- Aquisição deve excluir compradores recentes quando houver confirmação real. Recompra usa campanha separada.

Lifecycle: `PROSPECT → VISITOR → HIGH_INTENT → OUTBOUND → CUSTOMER → REPEAT_CUSTOMER → DORMANT`. Hoje o ledger comprova até OUTBOUND. CUSTOMER em diante exige pedido real reconciliado por `order_id`/click ID/dado voluntário.

High intent atual: ao menos um `outbound_order_click` ou duas visualizações de itens. É sinal interno, não compra.
