# Campaign URLs e UTM governance

Convenção: `BRAND_OBJECTIVE_GEO_OFFER_DATE`. Exemplo: `VY_SALES_CAMPINAS_MARMITA_202609`. Conteúdo: `FORMAT_HOOK_CREATIVE_VERSION`, por exemplo `STORY_MARMITA_FRANGO_V03`. Na URL use minúsculas e underscores.

## Exemplos

- Meta feed marmita: `https://varandaype.com/pedir/ifood/?intent=marmita&utm_source=meta&utm_medium=paid_social&utm_campaign=vy_sales_campinas_marmita_202609&utm_content=feed_marmita_frango_v03&campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}&placement={{placement}}&site_source={{site_source_name}}`
- Meta story marmita: troque `utm_content` por `story_marmita_frango_v03`.
- Google Search marmita: `https://varandaype.com/pedir/ifood/?intent=marmita`.
- Google Search restaurante: `https://varandaype.com/pedir/direto/?intent=executivo`.
- Final URL Suffix Google: `utm_source=google&utm_medium=cpc&utm_campaign=vy_sales_campinas_restaurante_202609&utm_id={campaignid}&campaign_id={campaignid}&adgroup_id={adgroupid}&ad_id={creative}&utm_term={keyword}&keyword={keyword}&matchtype={matchtype}&device={device}&network={network}`.
- Google Maps/GBP: `https://varandaype.com/r/google/order` e `https://varandaype.com/r/google/directions`.
- QR impresso: `https://varandaype.com/r/flyer` (trocar pela origem física correta).
- WhatsApp: `https://varandaype.com/pedir/?utm_source=whatsapp&utm_medium=referral&utm_campaign=vy_owned_campinas_delivery_202609`.
- Instagram bio: `https://varandaype.com/pedir/?utm_source=instagram&utm_medium=organic_social&utm_campaign=vy_owned_campinas_bio_202609`.

## Builder local

`npm run campaign:url -- --platform=ifood --source=meta --medium=paid_social --campaign=vy_sales_campinas_marmita_202609 --content=story_marmita_frango_v03 --intent=marmita --audience=almoco_trabalho --creative=marmita_frango_closeup_v3`

Canonical nunca inclui query. UTMs nunca entram no sitemap. iFood/99Food recebem link oficial limpo; Expresso recebe atribuição por ser subdomínio próprio.
