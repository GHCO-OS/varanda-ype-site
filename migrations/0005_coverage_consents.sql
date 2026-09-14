CREATE TABLE IF NOT EXISTS coverage_consents (
  consent_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  visitor_id TEXT,
  session_id TEXT,
  cep TEXT NOT NULL,
  cep_prefix TEXT,
  city TEXT,
  region TEXT,
  distance_km REAL,
  coverage_status TEXT NOT NULL CHECK (coverage_status IN ('within_5km','outside_5km','unknown')),
  consent_purpose TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  campaign TEXT,
  landing_path TEXT
);
CREATE INDEX IF NOT EXISTS idx_coverage_created_at ON coverage_consents(created_at);
CREATE INDEX IF NOT EXISTS idx_coverage_status ON coverage_consents(coverage_status);
CREATE INDEX IF NOT EXISTS idx_coverage_cep_prefix ON coverage_consents(cep_prefix);

CREATE TABLE IF NOT EXISTS coverage_consent_events (
  event_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('accepted','rejected')),
  visitor_id TEXT,
  session_id TEXT,
  landing_path TEXT,
  region_coarse TEXT,
  campaign TEXT,
  consent_version TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_coverage_events_created_at ON coverage_consent_events(created_at);
