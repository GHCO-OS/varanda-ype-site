CREATE TABLE IF NOT EXISTS delivery_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  occurred_at TEXT NOT NULL,
  visit_id TEXT,
  session_id TEXT,
  lead_type TEXT NOT NULL CHECK(lead_type IN ('whatsapp', 'email', 'both')),
  whatsapp TEXT,
  email TEXT,
  operation TEXT NOT NULL,
  page_path TEXT NOT NULL,
  referrer TEXT,
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, utm_id TEXT, utm_content TEXT, utm_term TEXT,
  gclid TEXT, fbclid TEXT, campaign_id TEXT, adset_id TEXT, ad_id TEXT,
  incentive TEXT,
  source_component TEXT NOT NULL,
  lead_consent INTEGER NOT NULL CHECK(lead_consent = 1),
  consent_analytics INTEGER NOT NULL,
  consent_ads INTEGER NOT NULL,
  payload TEXT NOT NULL CHECK(json_valid(payload)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_occurred_at ON delivery_leads(occurred_at);
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp ON delivery_leads(whatsapp);
CREATE INDEX IF NOT EXISTS idx_leads_email ON delivery_leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_visit_id ON delivery_leads(visit_id);
CREATE INDEX IF NOT EXISTS idx_leads_session_id ON delivery_leads(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_operation ON delivery_leads(operation, occurred_at);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON delivery_leads(campaign_id);
