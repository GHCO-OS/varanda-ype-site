# Event spec

Parâmetros comuns: `event_id`, `visitor_id`, `session_id`, `occurred_at`, `page_path`, `platform`, `intent`, `landing_variant`, UTMs/click IDs permitidos e estado de consentimento. IDs publicitários só são usados com consentimento de publicidade.

| Evento | Gatilho | Parâmetros específicos | Destinos | Conversão? | Remarketing | Consentimento |
|---|---|---|---|---|---|---|
| `page_view` | abertura | — | dataLayer, interno | não | não | análise |
| `landing_view` | entrada `/pedir` | touchpoint_count | dataLayer, interno | não | LP_VIEW | análise |
| `platform_view` | landing de canal | platform | dataLayer, interno | não | plataforma | análise |
| `intent_detected` | intent válido | intent | dataLayer, interno | não | INTENT_* | análise |
| `hero_cta_view` | CTA visível | cta_position | dataLayer, interno | não | não | análise |
| `hero_cta_click` | CTA hero | cta_position | dataLayer, interno | não | engajamento | análise |
| `menu_section_view` | seção visível | — | dataLayer, interno | não | não | análise |
| `item_view` | card visível | item_id, item_name | dataLayer, interno | secundária | intenção | análise |
| `item_click` | toque em card | item_id, item_name | dataLayer, interno | secundária | intenção | análise |
| `platform_selector_view` | hub aberto | — | dataLayer, interno | não | não | análise |
| `platform_select` | canal escolhido | platform | dataLayer, interno | não | plataforma | análise |
| `sticky_cta_click` | CTA mobile | cta_position | dataLayer, interno | não | engajamento | análise |
| `outbound_order_click` | saída ao pedido | destination_id, destination | dataLayer, interno | key event provisório | OUTBOUND_* | análise; ads para click IDs |
| `whatsapp_click` | abre WhatsApp | source_component | dataLayer/interno quando instrumentado | secundária | canal | análise |
| `phone_click` | ligação | — | dataLayer/interno | secundária | não | análise |
| `directions_click` | rota/mapa | — | dataLayer/interno | secundária local | local | análise |
| `review_click` | avaliação | — | dataLayer/interno | não | não | análise |
| `return_visit` | visitor conhecido | is_returning | dataLayer, interno | não | retorno | análise |
| `high_intent_session` | outbound ou 2 item views | metadata.rule | dataLayer, interno | secundária | HIGH_INTENT | análise |
| `experiment_exposure` | experimento opt-in | experiment_id, variant_id | dataLayer, interno | não | análise CRO | análise |
| `order_confirmed` | fonte real futura | order_id | futuro | sim | CUSTOMER | base legal aplicável |
| `purchase` | pagamento confirmado | order_id, value, currency=BRL | futuro GA4/Ads/Meta | primária | PURCHASE | base legal aplicável |
| `purchase_repeat` | 2º+ pedido confirmado | order_id | futuro | primária | REPEAT_CUSTOMER | base legal aplicável |

Os três últimos estão reservados e não são aceitos pelo endpoint atual para impedir venda falsa.
