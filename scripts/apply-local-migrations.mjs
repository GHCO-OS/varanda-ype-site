import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const databasePath = process.argv[2];
if (!databasePath) throw new Error('Usage: node scripts/apply-local-migrations.mjs <sqlite-path>');
const database = new DatabaseSync(databasePath);
for (const file of ['migrations/0001_delivery_tracking.sql', 'migrations/0002_leads_capture.sql', 'migrations/0003_marketing_attribution.sql', 'migrations/0004_competitor_intelligence.sql', 'migrations/0005_coverage_consents.sql']) database.exec(fs.readFileSync(file, 'utf8'));
process.stdout.write(`${JSON.stringify(database.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all())}\n`);
