# Presença local

NAP encontrado no site: Varanda Ypê; Av. Brigadeiro Rafael Tobias de Aguiar, 1121, Jardim Aurélia, Campinas/SP; (19) 3199-1971. Validar no Google Business Profile e Apple Business Connect antes de qualquer alteração externa.

## Checklist

- Google Business Profile: nome, categoria, endereço, telefone, URL, horários, menu, delivery e vínculo com Google Ads.
- Search Console: enviar sitemap, inspecionar URLs orgânicas, canonical escolhido, Core Web Vitals e queries locais.
- Performance Max `VARANDA | LOCAL | CAMPINAS`: separar almoço, jantar, delivery, família, marmita e grelhados; objetivos calls/directions/store visits apenas se elegíveis.
- Waze: registrar `NOT AVAILABLE / NOT ELIGIBLE` se a conta não receber inventário/metas locais do ecossistema Google; não simular suporte.
- Apple Maps: reivindicar local, horários, telefone, fotos e action link compatível. UTM `utm_source=apple_maps&utm_medium=organic_local` ou `showcase`.
- Tripadvisor: URL confirmada — `https://www.tripadvisor.com.br/Restaurant_Review-g303605-d34648174-Reviews-Varanda_Ype_Jd_Aurelia-Campinas_State_of_Sao_Paulo.html` (locationId `34648174`). Ativado em `shared/marketing-config.js` (`siteConfig.tripadvisor`, `redirectTargets.tripadvisor` → `/go/tripadvisor`), no `sameAs` do JSON-LD e no widget "Avalie no Tripadvisor" (topo discreto + rodapé da Home, `TripAdvisorWidget` em `App.jsx`).

## Correção de dado incorreto em agregador

O endereço oficial (Av. Brigadeiro Rafael Tobias de Aguiar, 1121) aparece em `informacoesdobrasil.com.br` associado a uma revenda de veículos — negócio anterior no local, encerrado há ~5 anos. Não há processo de correção documentado publicamente nesse agregador (página bloqueou acesso automatizado); a correção precisa ser solicitada manualmente pelo titular do CNPJ atual, citando o direito de retificação (LGPD art. 18, IX).

Rotas rastreáveis GBP: `/r/google/profile`, `/r/google/menu`, `/r/google/order`, `/r/google/directions`.
