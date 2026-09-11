# Dataset de performance

O D1 expõe a view `marketing_daily_performance`. Ela distingue data, plataforma e intenção com sessions, landing views, outbound clicks e high intent. Receita, CPA e ROAS permanecem nulos até haver `purchase` confirmado e custo importado.

```sql
-- Hoje / ontem / 7 dias / 30 dias: altere o intervalo.
SELECT *, ROUND(100.0*outbound_clicks/NULLIF(landing_views,0),2) outbound_ctr
FROM marketing_daily_performance
WHERE day >= date('now','-7 days') ORDER BY day DESC, platform, intent;

-- Fonte, campanha, criativo e keyword.
SELECT source, medium, campaign, campaign_id, creative, keyword,
  COUNT(DISTINCT session_id) sessions,
  SUM(event_name='outbound_order_click') outbound_clicks
FROM marketing_events
WHERE occurred_at >= datetime('now','-30 days')
GROUP BY source, medium, campaign, campaign_id, creative, keyword;

-- Dayparting.
SELECT strftime('%w',occurred_at) weekday, strftime('%H',occurred_at) hour, intent, platform,
  COUNT(DISTINCT session_id) sessions, SUM(event_name='outbound_order_click') outbound_clicks
FROM marketing_events GROUP BY weekday, hour, intent, platform;
```

Para Looker Studio, prefira export controlado/connector com credenciais server-side. Não publique endpoint D1 sem autenticação. Filtros: hoje, ontem, 7, 30 e período customizado.
