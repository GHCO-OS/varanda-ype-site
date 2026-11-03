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
test('HomePage preserves existing content and links to vacancies',()=>{
  const after=fs.readFileSync('src/App.jsx','utf8');
  const section=s=>s.slice(s.indexOf('export function HomePage()'),s.indexOf('export function PrivacyPage()')).replace(/\r\n/g,'\n');
  // Reviewed Home changes: vacancies link, accessible restaurant photo gallery, the
  // 2026-11-03 home simplification (single hero CTA, "O que a casa tem" gallery, "Onde
  // atende e quando" visit section), and the 2026-11-03 removal of all Burgers N' Smoke
  // mentions (brand discontinued).
  assert.ok(section(after).includes('<a href="/vagas/">Vagas</a>'));
  const preserved = section(after).replace('            <a href="/vagas/">Vagas</a>\n', '');
  assert.ok(section(after).includes('<AmbienceGallery />'));
  assert.ok(!section(after).toLowerCase().includes('burger'));
  assert.equal(createHash('sha256').update(preserved).digest('hex'),'ec123debb5d48bf0993eedeb0378e6608e7639768ae6a12dcd322abf46c70beb');
});
