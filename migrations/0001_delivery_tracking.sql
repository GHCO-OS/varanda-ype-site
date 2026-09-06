CREATE TABLE IF NOT EXISTS delivery_tracking_events (
  event_id TEXT PRIMARY KEY,
  occurred_at TEXT NOT NULL,
  event_name TEXT NOT NULL,
  visit_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  partner TEXT,
  destination_id TEXT,
  page_path TEXT NOT NULL,
  campaign_id TEXT,
  gclid TEXT,
  fbclid TEXT,
  consent_analytics INTEGER NOT NULL,
  consent_ads INTEGER NOT NULL,
  payload TEXT NOT NULL CHECK(json_valid(payload)),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_delivery_occurred ON delivery_tracking_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_delivery_operation ON delivery_tracking_events(operation, occurred_at);
CREATE INDEX IF NOT EXISTS idx_delivery_partner ON delivery_tracking_events(partner, occurred_at);
CREATE INDEX IF NOT EXISTS idx_delivery_campaign ON delivery_tracking_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_delivery_gclid ON delivery_tracking_events(gclid);
CREATE INDEX IF NOT EXISTS idx_delivery_fbclid ON delivery_tracking_events(fbclid);
CREATE INDEX IF NOT EXISTS idx_delivery_visit ON delivery_tracking_events(visit_id);
CREATE INDEX IF NOT EXISTS idx_delivery_session ON delivery_tracking_events(session_id, created_at);
