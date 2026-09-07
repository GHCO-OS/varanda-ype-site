# Delivery: roteamento e tracking de primeira parte

Implementação de 6 de setembro de 2026. Código pronto para deploy; este trabalho não publicou em produção nem criou serviços remotos. Não foram alteradas contas Google Ads, Meta, GA4 ou GTM.

## Auditoria e proteção do projeto

- Baseline: `main`, commit `3f8b432`, árvore limpa antes das mudanças. Backup lógico: `backup/delivery-before-20260906`. Implementação: `feat/delivery-first-party-20260906`.
- React 19 / Vite 7; seleção de rotas por pathname em `src/App.jsx`; pré-renderização SSG com `scripts/prerender.mjs`. Cloudflare Pages, assets estáticos/CDN, redirects e CSP em `public/`.
- Não havia Pages Functions, banco, binding D1, API de analytics ou configuração de backend neste repositório. Nenhuma credencial foi adicionada.
- GTM existente: `GTM-56F5TM96`. Consentimento inicializado antes dele no HTML. Não havia implementação independente de GA4, Pixel ou CAPI no código. O conteúdo remoto do container GTM não foi auditado; a ausência no código não prova ausência de tags no container.
- `vy_consent` existente: analytics permitido até rejeição; armazenamento de publicidade, dados de usuário para anúncios e personalização negados até aceitação. Esse comportamento foi preservado, não apresentado como nova avaliação jurídica.
- Já existiam dataLayer, page_view, delivery_click, partner_click e os demais eventos das páginas atuais. Nenhuma segunda tag foi instalada.
- Já existia `/delivery/`, agora substituído por um hub utilitário. O componente Home foi preservado literalmente; teste compara com o backup. O botão atual continua no mesmo lugar. A política de privacidade recebeu uma seção explícita sobre a nova medição.
- Canonical existente usa **https://varandaype.com**, sem www. Mantido para evitar mudança arbitrária da identidade canônica. Canonical, OG e sitemap das novas páginas seguem esse padrão.
- Baseline: build passou; não havia comandos lint/test. Bundle geral: JS 272,26 KB / 80,41 KB gzip; CSS 49,94 KB / 9,62 KB gzip.

## Rotas e destinos

| Rota | Função | Canais |
| --- | --- | --- |
| `/delivery/` | Escolher operação | Restaurante, Marmitaria, Hamburgueria |
| `/delivery/restaurante/` | Como você prefere pedir hoje? | Direto, iFood, 99Food |
| `/delivery/marmitas/` | Pedir sua marmita | 99Food, iFood |
| `/delivery/hamburgueria/` | Pedir Burgers N’ Smoke | iFood, 99Food |

Na rota Restaurante, o Pedido Direto fica ativo diariamente das 11h às 15h no fuso `America/Sao_Paulo`. Fora desse intervalo, o JavaScript o substitui por um controle desabilitado e orienta o cliente a usar os apps. O HTML original conserva o destino real como fallback sem JavaScript.

Fonte única: `shared/delivery.js`. Restaurante e Hamburgueria nunca compartilham botões de canal em suas páginas específicas. Não há pedido direto inventado para Marmitaria ou Hamburgueria.

| destination_id | Destino oficial |
| --- | --- |
| expresso_varanda | https://expresso.varandaype.com |
| ifood_restaurante | https://www.ifood.com.br/delivery/link-cardapio/sitemercado/2ba9a14c-3df9-4725-8b6b-1294c2c1b156 |
| food99_restaurante | https://oia.99app.com/dlp9/C94oJv?area=BR |
| ifood_marmitas | https://www.ifood.com.br/delivery/link-cardapio/sitemercado/cefe7c90-e207-4493-ae9b-6b676c22ecf0 |
| food99_marmitas | https://oia.99app.com/dlp9/ceXoR0?area=BR |
| ifood_hamburgueria | https://www.ifood.com.br/delivery/link-cardapio/sitemercado/14734c59-f45a-41e2-80b0-f1914971f6e1 |
| food99_hamburgueria | https://oia.99app.com/dlp9/X2TmjJ?area=BR |

Para trocar um link, editar somente a configuração, executar build/lint/test e testar o app em aparelho real. Tokens `{{delivery:...}}` nos templates de HTML/redirects são resolvidos durante o build; não publicar `public/` diretamente. Publicar `dist/` pelo fluxo Pages existente, incluindo Functions.

Para adicionar marketplace: cadastrar destino e sua operação, incluí-lo na lista ordenada da operação, adicionar estilo legível se necessário e testes de navegação/schema. Nunca usar query string do visitante para definir um destino livre. Não foram criados aliases opcionais `/go`: os links HTTPS diretos preservam o caminho nativo dos apps; QR e bio devem apontar para a landing da operação.

## Implementação e desempenho

- As quatro páginas são HTML estático completo. Links funcionam sem JS, sem formulário, modal, cadastro, contagem regressiva ou redirecionamento automático.
- `scripts/delivery-pages.mjs` reutiliza o head/consentimento/GTM, remove dependências React, fontes e CSS geral dessas páginas e gera metadata própria. React permanece nas páginas existentes e no fallback de desenvolvimento.
- JS específico aproximadamente **2,50 KB gzip**, sem biblioteca de UI; CSS específico pequeno, fonte do sistema, sem imagem hero. Botões de pelo menos 64px, foco visível e layout sem animações.
- Canonicals não contêm query string; sitemap contém as quatro URLs canônicas. JSON-LD CollectionPage corresponde ao conteúdo utilitário, sem atribuir schema Restaurant à hamburgueria. API envia `X-Robots-Tag: noindex, nofollow`.
- Assets específicos sem hash recebem revalidação para evitar versão antiga após deploy. CSP existente permite o endpoint same-origin.
- LCP <2,5s e CLS <0,1 são objetivos, **não métricas de campo comprovadas**. GTM real, conexão e aparelho influenciam os resultados; acompanhar CWV após publicação.

## IDs, atribuição e consentimento

`visit_id`: UUID criptográfico por documento/entrada. `session_id`: UUID em sessionStorage, janela de 30 minutos de inatividade, restrito à aba/origem. `event_id`: UUID novo por evento. Não há fingerprint, cadastro, ID persistente de cliente nem ligação automática entre dispositivos.

A sessão guarda primeiro toque imutável e último toque atualizado quando uma nova entrada contém parâmetros explícitos. Acesso sem parâmetros não apaga a campanha anterior durante a sessão. Storage indisponível usa memória; rejeição limpa a sessão. First/last touch são estado local de sessão, não um modelo de atribuição multicanal persistente no banco.

Parâmetros aceitos, todos opcionais:

```text
utm_source utm_medium utm_campaign utm_id utm_content utm_term utm_source_platform
gclid gbraid wbraid fbclid
campaign_id campaign_name adgroup_id adset_id ad_id ad_name
placement site_source keyword matchtype device network
```

Valores são preservados em sua capitalização, com trim, limite de 256 caracteres e remoção de caracteres de controle; não são normalizados arbitrariamente. Campos vazios/desconhecidos são descartados. Nunca colocar email, telefone, CPF ou conteúdo pessoal em UTMs. Referrer registra somente a origem, sem caminho/query.

- Estado inicial herdado: permite sessão e medição analítica, mas **não captura/envia click IDs publicitários** até aceitação.
- `vy_consent=granted`: aceita analytics e publicidade; inclui click IDs quando presentes.
- `vy_consent=denied`: não transmite à API nem armazena IDs/atribuição. Eventos operacionais anônimos continuam no dataLayer com consentimento negado, sem visit_id/session_id/UTMs. As tags GTM devem respeitar Consent Mode e suas verificações adicionais.
- Preferências de medição são inline, no rodapé; não interrompem o pedido. Reutilizam `consent_accept`, `consent_reject` e os quatro estados Google existentes. Aceitação/rejeição funcionam mesmo se storage falhar durante a página.
- Links internos preservam os parâmetros permitidos na URL; isso não significa consentimento para armazená-los/transmiti-los.
- iFood/99Food recebem exclusivamente a URL oficial. Expresso recebe os parâmetros permitidos pelo consentimento, preservando origem de campanha. Sem JS recebe o link oficial simples.

Propagar parâmetros não prova continuidade GA4 entre subdomínios. Validar no GTM/GA4 do Expresso cookie domain, tag/propriedade usada, referrals e sessão. Este projeto não altera o código do Expresso nem comprova compras lá.

## Eventos e fluxo

| Evento | Quando | Observação |
| --- | --- | --- |
| delivery_hub_view | Uma vez por entrada em qualquer das quatro páginas | Único nome novo |
| delivery_click | Escolha de canal | Restaurante, marmitas ou hamburgueria |
| partner_click | Mesma ação, somente marketplace | Não emitido para direct |
| page_view | Entrada na página | Reutiliza evento existente |
| consent_accept / consent_reject | Escolha de medição | Reutiliza eventos existentes |

Payload base: event, site, event_id, occurred_at, operation, landing_variant, page_path, consent_analytics, consent_ads; com permissão: visit_id, session_id, parâmetros presentes e referrer. Clique acrescenta partner, destination_id e cta_position. `operation` é `hub`, `restaurante`, `marmitas` ou `hamburgueria`; `partner` é `ifood`, `99food` ou `direct`.

```json
{
  "event": "delivery_click",
  "site": "varanda_ype",
  "operation": "marmitas",
  "landing_variant": "operation",
  "page_path": "/delivery/marmitas/",
  "partner": "ifood",
  "destination_id": "ifood_marmitas",
  "cta_position": "primary",
  "consent_analytics": true,
  "consent_ads": true
}
```

Exemplo abreviado: o evento real inclui os três UUIDs e occurred_at. Em cada clique marketplace existem dois eventos semânticos distintos, com event_ids distintos. Para medir escolhas, contar **delivery_click**, não a soma delivery_click + partner_click. Nenhum clique gera Purchase, InitiateCheckout ou evento de venda. O schema da API rejeita esses nomes.

Fluxo: dataLayer → sendBeacon JSON → fallback fetch keepalive se Beacon não aceitar o envio → navegação nativa imediata. Nenhum preventDefault/espera pela resposta. Falha de rede, analytics ou banco não bloqueia o pedido. Beacon é melhor esforço, não garantia de entrega; não existe confirmação de persistência antes da navegação.

## API, banco e segurança

Pages Function: `functions/api/delivery-click.js`, **POST /api/delivery-click**. `_routes.json` limita execução de Functions ao endpoint; páginas continuam estáticas.

Schema compartilhado: `shared/delivery-event.js`. JSON estrito, campos enumerados, UUIDv4, timestamp dentro de 24h, operação/path/variante coerentes, destinos em allowlist, referrer somente origem. Limite 8KB incluindo leitura em stream, 256 caracteres por string, origem idêntica à requisição, sem CORS externo, consultas SQL parametrizadas. Nenhum IP bruto é usado como identificador de marketing.

Respostas: 204 gravado/duplicata; 400 inválido; 403 origem; 405 método; 413 tamanho; 415 formato; 429 limite; **503 banco ausente/indisponível**. Nunca simula sucesso de persistência.

Binding necessário apenas para persistência: **DELIVERY_DB**, tipo Cloudflare D1, não uma variável VITE nem segredo de frontend. Migration: `migrations/0001_delivery_tracking.sql`, tabela `delivery_tracking_events`, PK event_id. Colunas indexadas para tempo, operação, parceiro, campaign_id, gclid, fbclid, visit_id e sessão. Payload JSON retém os demais campos validados. Duplicatas são ignoradas por event_id.

Limite aplicativo: 120 eventos/sessão/minuto. É um limitador básico, não proteção completa contra abuso distribuído ou IDs forjados; antes de mídia em escala, avaliar rate limiting/WAF no Cloudflare e limites de armazenamento. Requisições client-side não comprovam identidade ou compra.

### Ativação da persistência no ambiente real

1. Confirmar se há D1 apropriado na conta Cloudflare, fora do repositório. Reutilizá-lo quando adequado; não criar um serviço duplicado.
2. Vincular esse banco como `DELIVERY_DB` ao projeto Pages, separando preview e produção.
3. Aplicar a migration no banco correto, após backup se ele já possuir dados. Exemplo com nome real substituído: `npx wrangler d1 execute NOME_REAL_DO_BANCO --remote --file migrations/0001_delivery_tracking.sql`.
4. Fazer deploy pelo fluxo existente e verificar evento sintético consentido: resposta 204 e uma linha; repetir mesmo UUID não duplica. Sem binding a resposta correta é 503 e a saída continua funcionando.
5. Definir política de retenção/exclusão e acesso restrito antes de armazenar tráfego real. Não foi inventado um prazo de retenção ou agendado expurgo remoto. Revisar a atualização de privacidade conforme a operação efetiva do banco.

Não existe D1 remoto provisionado/verificado neste trabalho. SQL/migration, persistência, deduplicação e limite foram testados localmente com SQLite e interface compatível com D1; a Function foi compilada pelo Wrangler. Não equivale a validar binding real em produção.

O instalador idempotente `scripts/setup-delivery-d1.ps1` verifica a autenticação, reaproveita `varanda-delivery-db` se já existir, cria somente se faltar, atualiza `wrangler.jsonc`, aplica as migrations remotas com backup do Wrangler e lista as tabelas. Execute no PowerShell: `./scripts/setup-delivery-d1.ps1`. Na tentativa de 7 de setembro de 2026, o token configurado neste computador foi recusado pela Cloudflare (`9109`/`10000`); nenhum banco foi criado ou alterado.

## Captura voluntária de contato

As páginas de delivery incluem um diálogo leve acionado após 12 segundos ou intenção de saída no desktop. Fechado ou exibido, não reaparece na mesma aba/sessão. Ele aceita WhatsApp, e-mail ou ambos, exige autorização explícita para comunicações e informa que o cadastro não é necessário para pedir. Nenhum cupom ou desconto foi prometido porque não foi fornecido um incentivo comercial confirmado; o campo `incentive` está preparado para uma campanha futura real.

`POST /api/lead-capture` usa schema fechado, limite de 8KB, same-origin, valida UUID/timestamp/contexto, normaliza telefone/e-mail, exige consentimento do contato e limita cinco tentativas por sessão/minuto. A migration `0002_leads_capture.sql` cria `delivery_leads` e índices. Dados publicitários só são anexados com consentimento de anúncios; com medição rejeitada, o contato ainda pode ser enviado por decisão explícita do usuário, sem visit/session/atribuição. Após gravação confirmada, o dataLayer recebe `lead_capture` sem telefone ou e-mail.

Validação desta evolução: build e lint passaram, **15/15 testes Node passaram**, auditoria npm sem vulnerabilidades conhecidas e QA Chromium passou nas larguras 360, 390, 430, 768 e 1440px. Também foram validados o formulário móvel completo, os sete destinos sem JavaScript e o botão flutuante de WhatsApp em 390px.

## Campanhas e configuração manual

Usar URLs finais permanentes:

```text
https://varandaype.com/delivery/restaurante/
https://varandaype.com/delivery/marmitas/
https://varandaype.com/delivery/hamburgueria/
```

Google Ads: exemplo de Final URL Suffix, sem `?`, para campanhas de pesquisa compatíveis:

```text
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&campaign_id={campaignid}&adgroup_id={adgroupid}&ad_id={creative}&keyword={keyword}&matchtype={matchtype}&device={device}&network={network}
```

Parâmetros variam conforme o tipo de campanha; valores ausentes não quebram o site. Não colocar gclid fixo no anúncio; manter a marcação automática adequada na conta. Referência: [Google Ads — ValueTrack](https://support.google.com/google-ads/answer/6305348?hl=en).

Meta Ads: usar a URL da operação e configurar o campo de parâmetros no Gerenciador. Exemplo a validar no construtor de parâmetros da conta antes de publicar:

```text
utm_source=meta&utm_medium=paid_social&utm_id={{campaign.id}}&campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}&placement={{placement}}&site_source={{site_source_name}}
```

A documentação Meta consultada exigiu login; confirmar as macros disponíveis no Gerenciador. O código não contém macros hardcoded: registra apenas valores recebidos. Outros exemplos: `utm_source=instagram&utm_medium=organic_social`, `utm_source=whatsapp&utm_medium=referral`, `utm_source=qr&utm_medium=offline`; acrescentar utm_campaign quando útil.

GTM/GA4: reutilizar tags existentes e criar gatilho delivery_hub_view, se necessário. Conferir no Preview um único page_view; escolher entre page_view automático da tag e evento existente para não contar duas vezes. Criar apenas dimensões úteis como operation, partner, destination_id, cta_position. UUIDs/click IDs não devem virar dezenas de dimensões de alta cardinalidade. Não configurar os dois eventos de clique como a mesma conversão.

Meta Pixel/CAPI: não instalado/duplicado aqui. Se o container existente enviar DeliveryClick, usar consentimento de marketing e event_id do mesmo evento para eventual deduplicação browser/server. Este endpoint é armazenamento próprio, **não é CAPI**. Nunca mapear clique para Purchase. Purchase depende de integração futura com transação confirmada.

## Testes e QA

```text
npm ci
npm run build
npm run lint
npm test
npm audit
npx wrangler pages dev dist --port 8788 --ip 127.0.0.1 --compatibility-date 2026-09-01
```

Lint cobre os novos módulos JS, função, build especializado e testes; não promete corrigir todos os warnings de código legado. JSX existente é validado pelo build. Vite/lockfile receberam correções compatíveis de segurança, sem trocar o framework.

Testes Node: destinos separados, links HTML, allowlist, Meta/Google, primeiro/último toque, consentimento inclusive aceitação na mesma visita, Beacon falho, ausência de Purchase, schema/API, armazenamento/duplicatas/limite, SSG/canonical/single GTM/sem React e preservação literal da Home.

Resultado da primeira entrega: build e lint passaram, 12/12 testes Node passaram, auditoria npm sem vulnerabilidades conhecidas e `git diff --check` sem erros. A evolução de leads e horários amplia essa cobertura; consulte o relatório do commit correspondente. SQLite em Node emitiu apenas aviso de API experimental.

`tests/browser-qa.mjs` exporta `runBrowserChecks(browser, baseURL)`, para Playwright. QA executado em Chromium desktop com larguras 360, 390, 430, 768 e 1440px: quatro rotas, status 200, canonical limpo com UTM/gclid/fbclid, sem overflow, CTAs acessíveis, um hub_view, sete destinos, Beacon, preservação interna, rejeição e sete navegações sem JS. GTM e destinos externos são interceptados para não contaminar métricas nem fazer pedidos reais.

Capturas locais em `.codex/qa/delivery/` (não versionadas). Android Chrome e iPhone Safari reais, abertura de apps instalados e conteúdo remoto do GTM **não foram comprovados** por emulação de viewport. Edge/WebKit não estavam disponíveis no runtime consultado. Validar em aparelhos antes de escalar mídia.

URLs de teste:

```text
/delivery/marmitas/
/delivery/marmitas/?utm_source=meta&utm_medium=paid_social&utm_campaign=test&campaign_id=123&adset_id=456&ad_id=789&fbclid=test
/delivery/restaurante/?utm_source=google&utm_medium=cpc&campaign_id=123&adgroup_id=456&ad_id=789&keyword=restaurante&matchtype=p&device=m&gclid=test
```

Debug: somente no Vite development, adicionar `?debug=1`; o painel revela estado da sessão quando permitido. O build de produção elimina a execução do debug. Não compartilhar capturas de IDs de tráfego real.

### Checklist após deploy

- Confirmar as quatro páginas e respectivos canonicals no domínio real; sitemap acessível.
- Confirmar endpoints 204 com D1 e rejeição sem transmissão; observar falhas 503/429 sem bloquear CTAs.
- Google/Meta: testar parâmetros dinâmicos, Consent Mode, tags e ausência de conversão de compra em cliques.
- Expresso: validar continuidade de atribuição/sessão com o administrador da plataforma.
- Testar iFood/99Food em Android/iPhone reais, com e sem app instalado.
- Search Console/Bing: enviar sitemap/inspecionar páginas conforme estratégia; não foi solicitada indexação automaticamente.
- Verificar CWV de campo e definir retenção/expurgo de eventos antes da operação persistente.
