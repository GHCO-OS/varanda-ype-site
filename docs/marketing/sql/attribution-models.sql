-- First click: primeiro touchpoint antes de cada outbound/purchase confirmado.
WITH ordered AS (
  SELECT c.conversion_id, c.conversion_type, c.occurred_at conversion_at, t.*,
    ROW_NUMBER() OVER (PARTITION BY c.conversion_id ORDER BY t.occurred_at) first_rank,
    ROW_NUMBER() OVER (PARTITION BY c.conversion_id ORDER BY t.occurred_at DESC) last_rank,
    COUNT(*) OVER (PARTITION BY c.conversion_id) touch_count
  FROM marketing_conversions c
  JOIN marketing_touchpoints t ON t.visitor_id=c.visitor_id AND t.occurred_at<=c.occurred_at
)
SELECT conversion_id, conversion_type, source, medium, campaign, campaign_id,
  CASE WHEN first_rank=1 THEN 1.0 ELSE 0 END first_click_credit,
  CASE WHEN last_rank=1 THEN 1.0 ELSE 0 END last_click_credit,
  1.0/touch_count linear_credit,
  CASE WHEN touch_count=1 THEN 1.0 WHEN first_rank=1 OR last_rank=1 THEN 0.4 ELSE 0.2/MAX(touch_count-2,1) END position_based_credit
FROM ordered;
