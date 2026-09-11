import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { gzipSync } from 'node:zlib';
import { platforms } from '../shared/marketing-config.js';

test('marketing landings are static, canonical, noindex and keep real hrefs without JS', () => {
  for (const platform of [null, ...Object.keys(platforms)]) {
    const path = platform ? `dist/pedir/${platform}/index.html` : 'dist/pedir/index.html';
    const html = fs.readFileSync(path, 'utf8');
    const canonical = platform ? `https://varandaype.com/pedir/${platform}/` : 'https://varandaype.com/pedir/';
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    assert.ok(html.includes('name="robots" content="noindex,follow'));
    assert.equal((html.match(/GTM-56F5TM96/g) || []).length, 1); // exactly one container bootstrap
    assert.ok(html.includes('href="https://') || !platform);
  }
  assert.ok(gzipSync(fs.readFileSync('dist/marketing-assets/client.js')).length < 7000);
});

test('campaign parameters never enter canonical or sitemap', () => {
  const html = fs.readFileSync('dist/pedir/ifood/index.html', 'utf8');
  assert.equal(/canonical[^>]+(?:utm_|gclid|fbclid)/.test(html), false);
  const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
  assert.equal(sitemap.includes('/pedir/'), false);
  assert.equal(/utm_|gclid|fbclid/.test(sitemap), false);
});
