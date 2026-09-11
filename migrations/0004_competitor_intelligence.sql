-- Aggregate, non-personal competitive intelligence only. By design this table has
-- no name/email/phone/handle/user-id column: individual reviewers or page owners
-- are never recorded here, only a competitor's own public business content.
CREATE TABLE IF NOT EXISTS competitor_intelligence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competitor TEXT NOT NULL,
  channel TEXT NOT NULL CHECK(channel IN ('own_site', 'meta_ads')),
  creative_theme TEXT,
  offer TEXT,
  headline TEXT,
  landing_page TEXT,
  keyword_theme TEXT,
  date_seen TEXT NOT NULL,
  notes TEXT,
  source_url TEXT NOT NULL,
  collection_method TEXT NOT NULL CHECK(collection_method IN ('jsonld', 'ad_library_api')),
  payload TEXT NOT NULL CHECK(json_valid(payload)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_competitor_intel_competitor ON competitor_intelligence(competitor, date_seen);
CREATE INDEX IF NOT EXISTS idx_competitor_intel_channel ON competitor_intelligence(channel, date_seen);
