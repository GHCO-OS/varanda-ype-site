# Automação de CI e inteligência competitiva

Criado e mantido pelo agente **GLM-5.3** (setembro/2026).

## CI (`.github/workflows/ci.yml`)

Em todo push ou pull request para a `main`: `npm ci` → `npm run lint` → `npm test` → `npm run build` (o mesmo pipeline que o Cloudflare Pages executa no deploy). Node 22, conforme `.node-version`.

## Cron de inteligência competitiva (`.github/workflows/competitive-intel.yml`)

Toda segunda-feira às 09:00 BRT (12:00 UTC), também disparável manualmente (`workflow_dispatch`):

1. Restaura `config/competitors.json` do secret `COMPETITORS_JSON` (o arquivo é gitignored porque o repositório é público).
2. Roda `npm run competitive:scan -- --sql-out /tmp/competitive-intel.sql` — coleta apenas JSON-LD público (com checagem de robots.txt que falha fechado) e a API oficial do Meta Ad Library.
3. Se houver linhas, aplica no D1 `varanda-delivery-db` (tabela `competitor_intelligence`) via `wrangler d1 execute --remote`.
4. Guarda o SQL coletado como artefato de auditoria por 90 dias.

## Secrets necessários (Settings → Secrets and variables → Actions)

| Secret | O que é | Obrigatório |
|---|---|---|
| `COMPETITORS_JSON` | Lista de concorrentes no formato de `config/competitors.example.json` | Sim (o job falha com erro claro sem ele) |
| `META_AD_LIBRARY_TOKEN` | Token de app da Meta Ad Library API | Somente para a fonte `meta_ads` (o scan pula sem ele) |
| `CLOUDFLARE_API_TOKEN` | Token da Cloudflare com permissão de escrita no D1 `varanda-delivery-db` | Sim para gravar no D1 |

A revisão humana quinzenal descrita em `COMPETITIVE_INTELLIGENCE.md` continua sendo o processo de análise; a automação apenas preenche a tabela.
