CREATE TABLE IF NOT EXISTS marketing_visitors (
  visitor_id TEXT PRIMARY KEY,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  lifecycle_stage TEXT NOT NULL CHECK(lifecycle_stage IN ('PROSPECT','VISITOR','HIGH_INTENT','OUTBOUND','CUSTOMER','REPEAT_CUSTOMER','DORMANT'))
);
CREATE INDEX IF NOT EXISTS idx_marketing_visitors_last_seen ON marketing_visitors(last_seen_at);

CREATE TABLE IF NOT EXISTS marketing_sessions (
  session_id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  landing_path TEXT NOT NULL,
  platform TEXT,
  intent TEXT,
  FOREIGN KEY(visitor_id) REFERENCES marketing_visitors(visitor_id)
);
CREATE INDEX IF NOT EXISTS idx_marketing_sessions_visitor ON marketing_sessions(visitor_id, started_at);

CREATE TABLE IF NOT EXISTS marketing_touchpoints (
  touchpoint_id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  source TEXT, medium TEXT, campaign TEXT, campaign_id TEXT, content TEXT, term TEXT,
  ad_id TEXT, adset_id TEXT, creative TEXT,
  landing_path TEXT NOT NULL, intent TEXT, platform TEXT, referrer TEXT, device_category TEXT,
  geo_coarse_json TEXT CHECK(geo_coarse_json IS NULL OR json_valid(geo_coarse_json)),
  consent_state TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_marketing_touchpoints_visitor ON marketing_touchpoints(visitor_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_marketing_touchpoints_campaign ON marketing_touchpoints(campaign_id, occurred_at);

CREATE TABLE IF NOT EXISTS marketing_events (
  event_id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  event_name TEXT NOT NULL,
  page_path TEXT NOT NULL,
  platform TEXT, intent TEXT, source TEXT, medium TEXT, campaign TEXT, campaign_id TEXT,
  creative TEXT, keyword TEXT, destination_id TEXT, consent_state TEXT NOT NULL,
  geo_coarse_json TEXT CHECK(geo_coarse_json IS NULL OR json_valid(geo_coarse_json)),
  metadata_json TEXT NOT NULL CHECK(json_valid(metadata_json)),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_marketing_events_time ON marketing_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_marketing_events_session ON marketing_events(session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_marketing_events_platform ON marketing_events(platform, occurred_at);
CREATE INDEX IF NOT EXISTS idx_marketing_events_intent ON marketing_events(intent, occurred_at);
CREATE INDEX IF NOT EXISTS idx_marketing_events_campaign ON marketing_events(campaign_id, occurred_at);

CREATE TABLE IF NOT EXISTS marketing_conversions (
  conversion_id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  conversion_type TEXT NOT NULL CHECK(conversion_type IN ('OUTBOUND','ORDER','PURCHASE','REPEAT_PURCHASE')),
  platform TEXT, intent TEXT, destination_id TEXT,
  order_id TEXT UNIQUE, revenue REAL, currency TEXT, confirmed INTEGER NOT NULL DEFAULT 0,
  source_event_id TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_marketing_conversions_visitor ON marketing_conversions(visitor_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_marketing_conversions_type ON marketing_conversions(conversion_type, occurred_at);

CREATE TABLE IF NOT EXISTS marketing_experiments (
  experiment_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  assigned_at TEXT NOT NULL,
  PRIMARY KEY(experiment_id, visitor_id)
);

CREATE VIEW IF NOT EXISTS marketing_daily_performance AS
SELECT date(occurred_at) AS day, COALESCE(platform, 'unknown') AS platform, COALESCE(intent, 'default') AS intent,
  COUNT(DISTINCT session_id) AS sessions,
  SUM(CASE WHEN event_name='landing_view' THEN 1 ELSE 0 END) AS landing_views,
  SUM(CASE WHEN event_name='outbound_order_click' THEN 1 ELSE 0 END) AS outbound_clicks,
  SUM(CASE WHEN event_name='high_intent_session' THEN 1 ELSE 0 END) AS high_intent_sessions
FROM marketing_events GROUP BY date(occurred_at), COALESCE(platform, 'unknown'), COALESCE(intent, 'default');
