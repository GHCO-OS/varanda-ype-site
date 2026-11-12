import test from 'node:test';
import assert from 'node:assert/strict';
import { pageFingerprint, updateSitemap } from '../scripts/sitemap-lastmod.mjs';

const page = (body, asset = 'index-AAA.js') => `<html><head><title>T</title></head><body>${body}<script src="/assets/${asset}"></script></body></html>`;
const xml = '<urlset><url><loc>https://varandaype.com/menu/</loc><lastmod>2026-01-01</lastmod></url></urlset>';

test('fingerprint ignores hashed asset names but not content', () => {
  assert.equal(pageFingerprint(page('<h1>Oi</h1>')), pageFingerprint(page('<h1>Oi</h1>', 'index-BBB.js')));
  assert.notEqual(pageFingerprint(page('<h1>Oi</h1>')), pageFingerprint(page('<h1>Olá</h1>')));
});

test('lastmod moves only when the rendered page changes', () => {
  const first = updateSitemap(xml, () => page('<h1>Oi</h1>'), {}, '2026-11-12');
  assert.ok(first.xml.includes('<lastmod>2026-11-12</lastmod>'));
  const same = updateSitemap(xml, () => page('<h1>Oi</h1>', 'index-CCC.js'), first.state, '2026-12-01');
  assert.ok(same.xml.includes('<lastmod>2026-11-12</lastmod>'));
  assert.equal(same.changed, false);
  const edited = updateSitemap(xml, () => page('<h1>Novo</h1>'), first.state, '2026-12-01');
  assert.ok(edited.xml.includes('<lastmod>2026-12-01</lastmod>'));
});

test('URLs without a built page keep their existing lastmod', () => {
  const result = updateSitemap(xml, () => null, {}, '2026-11-12');
  assert.ok(result.xml.includes('<lastmod>2026-01-01</lastmod>'));
});
