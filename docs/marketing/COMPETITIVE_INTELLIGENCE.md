# MARKET_INTELLIGENCE

Objetivo: observar demanda e temas criativos agregados, nunca pessoas. Fontes permitidas: Meta Ads Library, Google Ads Transparency Center, SERPs, Google Trends/Keyword Planner e, opcionalmente, Semrush, Similarweb e SpyFu contratados.

Schema: `competitor`, `channel`, `creative_theme`, `offer`, `headline`, `landing_page`, `keyword_theme`, `date_seen`, `notes`, `source_url`, `collection_method`.

Processo: revisão humana quinzenal; registrar somente páginas/anúncios públicos; transformar padrões em hipótese própria. Não copiar peças, contornar CAPTCHA/autenticação, violar ToS nem coletar dados pessoais. Automação só quando uma API oficial ou contrato permitir.

Interfaces opcionais em `shared/marketing-providers.js`: CompetitiveKeywordProvider, TrafficIntelligenceProvider e AdIntelligenceProvider. Sem assinatura, o site funciona normalmente.

Clusters próprios: fome agora, almoço rápido, comida caseira, prato completo, economia, família, petisco à noite, grelhado e sem tempo para cozinhar. Parâmetros: `intent`, `audience`, `creative`.

Geointeligência futura deve agregar por bairro/CEP suficientemente amplo: sessões, outbound, pedidos confirmados, ticket e ROAS. Nunca armazenar localização individual precisa ou IP bruto como identificador.
