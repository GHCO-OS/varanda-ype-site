import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { destinations, operations } from '../shared/delivery.js';
test('SSG canonical, one GTM, no React/fonts, native destinations and minimal payload',()=>{
  for(const op of ['hub',...Object.keys(operations)]) {
    const path=op==='hub'?'/delivery/':`/delivery/${op}/`;
    const html=fs.readFileSync(`dist${path}index.html`,'utf8');
    assert.equal((html.match(/<h1>/g)||[]).length,1);
    assert.ok(html.includes(`rel="canonical" href="https://varandaype.com${path}"`));
    assert.equal((html.match(/'GTM-56F5TM96'/g)||[]).length,1);
    assert.ok(!html.includes('/assets/index-')); assert.ok(!html.includes('fonts.googleapis.com'));
    assert.ok(!html.includes('{{delivery:'));
    for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) assert.equal(JSON.parse(match[1])['@type'],'CollectionPage');
    for(const id of operations[op]?.destinations || []) assert.ok(html.includes(destinations[id].url));
  }
  assert.ok(gzipSync(fs.readFileSync('dist/delivery-assets/client.js')).length<4096);
});
test('HomePage component untouched relative to logical backup',()=>{
  const after=fs.readFileSync('src/App.jsx','utf8');
  const section=s=>s.slice(s.indexOf('export function HomePage()'),s.indexOf('export function PrivacyPage()')).replace(/\r\n/g,'\n');
  // Snapshot updated for <PaymentMethods /> (payment methods section added before the footer,
  // commit 0af11a3); re-verify any further HomePage edit here.
  assert.equal(createHash('sha256').update(section(after)).digest('hex'),'4456d8df27a1bd45134b016eeac26675c5324b53727308d4f0513316791ebc39');
});
