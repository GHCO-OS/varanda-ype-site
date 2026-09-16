// Collects competitive intelligence from two legal, ToS-respecting sources only:
//  1) a competitor's own public JSON-LD menu markup (own_site) — the same data
//     they publish for Google to read;
//  2) the official Meta Ad Library API (meta_ads) — Meta's own public tool.
// It never logs into anything, never touches a third-party review/maps
// platform, never bypasses a CAPTCHA, and stops on any robots.txt disallow.
// Usage: node scripts/competitive-scan.mjs --config config/competitors.json [--db path.sqlite] [--sql-out out.sql]
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { isPathAllowed, USER_AGENT } from '../shared/robots.js';
import { extractMenuItems } from '../shared/menu-jsonld.js';
import { searchAdsByPageId } from '../shared/ad-library-client.js';

// Accepts both --key=value and --key value (the latter is how npm run
// competitive:scan -- --sql-out out.sql and the workflow invoke it — argv
// splits on the space, so there is no "=" to parse).
function parseArgs(argv) {
  const input = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    if (key.includes('=')) {
      const [name, ...rest] = key.split('=');
      input[name] = rest.join('=');
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      input[key] = next;
      i += 1;
    } else {
      input[key] = true;
    }
  }
  return { config: input.config || 'config/competitors.json', db: input.db || null, sqlOut: input['sql-out'] || null };
}

async function scanOwnSite(competitor) {
  const url = new URL(competitor.menuUrl);
  const allowed = await isPathAllowed(url.origin, url.pathname);
  if (!allowed) { console.error(`[skip] robots.txt disallows ${url}`); return []; }
  const response = await fetch(url.toString(), { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) { console.error(`[skip] ${url} responded ${response.status}`); return []; }
  const items = extractMenuItems(await response.text());
  const now = new Date().toISOString();
  return items.map(item => ({
    competitor: competitor.name, channel: 'own_site', creative_theme: null,
    offer: item.price ? `${item.currency || 'BRL'} ${item.price}` : null, headline: item.name,
    landing_page: url.toString(), keyword_theme: null, date_seen: now,
    notes: item.description, source_url: url.toString(), collection_method: 'jsonld',
    payload: JSON.stringify(item),
  }));
}

async function scanMetaAds(competitor, accessToken) {
  const ads = await searchAdsByPageId(competitor.metaPageId, { accessToken });
  const now = new Date().toISOString();
  return ads.map(ad => ({
    competitor: competitor.name, channel: 'meta_ads', creative_theme: ad.creativeTheme, offer: null,
    headline: ad.headline, landing_page: null, keyword_theme: null, date_seen: ad.startedAt || now,
    notes: null, source_url: ad.sourceUrl, collection_method: 'ad_library_api', payload: JSON.stringify(ad),
  }));
}

function insertSql(row) {
  const columns = Object.keys(row);
  const values = columns.map(key => (row[key] == null ? 'NULL' : `'${String(row[key]).replace(/'/g, "''")}'`));
  return `INSERT INTO competitor_intelligence (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

async function main() {
  const { config, db, sqlOut } = parseArgs(process.argv.slice(2));
  const competitors = JSON.parse(fs.readFileSync(config, 'utf8'));
  const accessToken = process.env.META_AD_LIBRARY_TOKEN;
  const rows = [];
  for (const competitor of competitors) {
    if (competitor.menuUrl) {
      try { rows.push(...await scanOwnSite(competitor)); }
      catch (error) { console.error(`[error] ${competitor.name} own_site: ${error.message}`); }
    }
    if (competitor.metaPageId) {
      if (!accessToken) { console.error(`[skip] ${competitor.name} meta_ads: META_AD_LIBRARY_TOKEN not set`); continue; }
      try { rows.push(...await scanMetaAds(competitor, accessToken)); }
      catch (error) { console.error(`[error] ${competitor.name} meta_ads: ${error.message}`); }
    }
  }
  console.error(`Collected ${rows.length} row(s) from ${competitors.length} competitor(s).`);
  if (db) {
    const { DatabaseSync } = await import('node:sqlite');
    const database = new DatabaseSync(db);
    const statement = database.prepare(`INSERT INTO competitor_intelligence
      (competitor, channel, creative_theme, offer, headline, landing_page, keyword_theme, date_seen, notes, source_url, collection_method, payload)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const row of rows) statement.run(row.competitor, row.channel, row.creative_theme, row.offer, row.headline, row.landing_page, row.keyword_theme, row.date_seen, row.notes, row.source_url, row.collection_method, row.payload);
    console.error(`Wrote ${rows.length} row(s) to ${db}.`);
  }
  if (sqlOut) {
    fs.writeFileSync(sqlOut, rows.map(insertSql).join('\n') + '\n');
    console.error(`Wrote ${rows.length} INSERT statement(s) to ${sqlOut} — apply with: wrangler d1 execute <db-name> --remote --file=${sqlOut}`);
  }
  if (!db && !sqlOut) process.stdout.write(JSON.stringify(rows, null, 2) + '\n');
}

// Only run when executed directly (`node competitive-scan.mjs`), not when a
// test imports parseArgs/insertSql/etc. — importing must not trigger a scan.
// pathToFileURL (not a plain `file://` template) so this also works on Windows.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}

export { insertSql, parseArgs, scanMetaAds, scanOwnSite };
