import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { isPathAllowed } from '../shared/robots.js';
import { extractMenuItems } from '../shared/menu-jsonld.js';
import { searchAdsByPageId } from '../shared/ad-library-client.js';
import { parseArgs } from '../scripts/competitive-scan.mjs';

const PERSONAL_DATA_HINTS = ['name', 'email', 'phone', 'whatsapp', 'handle', 'user', 'author', 'reviewer', 'cpf'];

test('competitor_intelligence schema has no personal-data column, by construction', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(fs.readFileSync('migrations/0004_competitor_intelligence.sql', 'utf8'));
  const columns = db.prepare("PRAGMA table_info('competitor_intelligence')").all().map(row => row.name);
  assert.ok(columns.includes('competitor') && columns.includes('channel'));
  for (const column of columns) {
    for (const hint of PERSONAL_DATA_HINTS) assert.ok(!column.toLowerCase().includes(hint), `column "${column}" looks like it could hold personal data`);
  }
  assert.deepEqual(db.prepare("SELECT DISTINCT channel FROM competitor_intelligence").all(), []);
});

test('robots.txt gate blocks a disallowed path and fails closed on fetch errors', async () => {
  const fetchImpl = async () => ({ ok: true, text: async () => 'User-agent: *\nDisallow: /private/\nAllow: /private/menu\n' });
  assert.equal(await isPathAllowed('https://example.com', '/private/', fetchImpl), false);
  assert.equal(await isPathAllowed('https://example.com', '/private/menu', fetchImpl), true);
  assert.equal(await isPathAllowed('https://example.com', '/cardapio/', fetchImpl), true);
  assert.equal(await isPathAllowed('https://example.com', '/x/', async () => { throw new Error('network'); }), false);
});

test('menu JSON-LD extraction reads only structured product/menu data', () => {
  const html = `<html><head><script type="application/ld+json">
    {"@context":"https://schema.org","@type":"Menu","hasMenuSection":[{"@type":"MenuSection","hasMenuItem":[
      {"@type":"MenuItem","name":"Marmita executiva","description":"Arroz, feijao, carne e salada","offers":{"price":"24.90","priceCurrency":"BRL"}}
    ]}]}
  </script></head><body></body></html>`;
  const items = extractMenuItems(html);
  assert.equal(items.length, 1);
  assert.deepEqual(items[0], { name: 'Marmita executiva', description: 'Arroz, feijao, carne e salada', price: '24.90', currency: 'BRL' });
});

test('menu JSON-LD extraction ignores pages with no structured data', () => {
  assert.deepEqual(extractMenuItems('<html><body><div>Marmita R$ 24,90</div></body></html>'), []);
});

test('Meta Ad Library client refuses to run without an access token', async () => {
  await assert.rejects(() => searchAdsByPageId('123', {}), /provider_not_configured/);
});

test('parseArgs reads --flag value the same as --flag=value (regression: npm/CI pass space-separated args)', () => {
  assert.deepEqual(
    parseArgs(['--sql-out', '/tmp/competitive-intel.sql']),
    { config: 'config/competitors.json', db: null, sqlOut: '/tmp/competitive-intel.sql' },
  );
  assert.deepEqual(
    parseArgs(['--sql-out=/tmp/competitive-intel.sql', '--config=custom.json']),
    { config: 'custom.json', db: null, sqlOut: '/tmp/competitive-intel.sql' },
  );
  assert.deepEqual(parseArgs([]), { config: 'config/competitors.json', db: null, sqlOut: null });
});

test('Meta Ad Library client maps the official API response, never personal viewer data', async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({ data: [{ id: 'ad_1', page_name: 'Concorrente X', ad_creative_bodies: ['Peça já!'], ad_creative_link_titles: ['Marmita 20% off'], ad_delivery_start_time: '2026-09-01', ad_snapshot_url: 'https://www.facebook.com/ads/library/?id=ad_1' }] }),
  });
  const ads = await searchAdsByPageId('123', { accessToken: 'token', fetchImpl });
  assert.deepEqual(ads, [{ adId: 'ad_1', pageName: 'Concorrente X', headline: 'Marmita 20% off', creativeTheme: 'Peça já!', startedAt: '2026-09-01', sourceUrl: 'https://www.facebook.com/ads/library/?id=ad_1' }]);
});
