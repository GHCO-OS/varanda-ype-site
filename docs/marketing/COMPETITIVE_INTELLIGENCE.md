# MARKET_INTELLIGENCE

Objetivo: observar demanda e temas criativos agregados, nunca pessoas. Fontes permitidas: Meta Ads Library, Google Ads Transparency Center, SERPs, Google Trends/Keyword Planner e, opcionalmente, Semrush, Similarweb e SpyFu contratados.

Schema: `competitor`, `channel`, `creative_theme`, `offer`, `headline`, `landing_page`, `keyword_theme`, `date_seen`, `notes`, `source_url`, `collection_method`.

Processo: revisão humana quinzenal; registrar somente páginas/anúncios públicos; transformar padrões em hipótese própria. Não copiar peças, contornar CAPTCHA/autenticação, violar ToS nem coletar dados pessoais. Automação só quando uma API oficial ou contrato permitir.

Interfaces opcionais em `shared/marketing-providers.js`: CompetitiveKeywordProvider, TrafficIntelligenceProvider e AdIntelligenceProvider. Sem assinatura, o site funciona normalmente.

## Coleta automatizada (`npm run competitive:scan`)

`scripts/competitive-scan.mjs` automatiza só as duas fontes que não exigem contornar nada:

1. **`own_site`** — lê o JSON-LD (`Menu`/`MenuItem`/`Product`) que o próprio concorrente publica em seu site para o Google indexar. Antes de buscar qualquer URL, checa `robots.txt` (`shared/robots.js`) e desiste se houver `Disallow`; nunca faz login, nunca renderiza JS, nunca lê o DOM.
2. **`meta_ads`** — usa a API oficial do Meta Ad Library (`shared/ad-library-client.js`), a mesma ferramenta pública de `facebook.com/ads/library`. Exige `META_AD_LIBRARY_TOKEN` (token de app Meta, sem gasto em anúncios); sem o token, a chamada falha em vez de simular dados.

Configuração em `config/competitors.json` (gitignored; copie `config/competitors.example.json`), uma lista de `{ name, menuUrl, metaPageId }`.

**Isto não substitui Google Maps, TripAdvisor, Instagram ou qualquer plataforma que exija login/CAPTCHA para navegar — essas continuam fora do escopo.** A tabela `competitor_intelligence` (`migrations/0004_competitor_intelligence.sql`) não tem e nunca deve ganhar coluna de nome/e-mail/telefone/handle: um teste (`tests/competitive-intel.test.mjs`) garante isso na CI. Raspar avaliação/perfil de pessoa física é tratamento de dado pessoal sem base legal (LGPD art. 7º) e, quando envolve burlar autenticação, quebra de contrato e possível violação da Lei 12.737/12 — nenhuma instrução de "por sua conta e risco" muda essa análise, porque a responsabilidade é da empresa (e de quem manteve o mecanismo), não de quem pediu.

Clusters próprios: fome agora, almoço rápido, comida caseira, prato completo, economia, família, petisco à noite, grelhado e sem tempo para cozinhar. Parâmetros: `intent`, `audience`, `creative`.

Geointeligência futura deve agregar por bairro/CEP suficientemente amplo: sessões, outbound, pedidos confirmados, ticket e ROAS. Nunca armazenar localização individual precisa ou IP bruto como identificador.
