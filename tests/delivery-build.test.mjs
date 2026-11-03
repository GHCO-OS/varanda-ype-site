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
  // atende e quando" visit section), the 2026-11-03 removal of all Burgers N' Smoke
  // mentions (brand discontinued), the 2026-11-03 removal of TripAdvisor plus the
  // icon-led footer "Siga e fale com a gente" social grid (Instagram highlighted), and
  // the 2026-11-03 photo/layout refresh (costela hero photo, bento-style "O que a casa
  // tem" with real photography only, dead stock-photo arrays removed).
  assert.ok(section(after).includes('<a href="/vagas/">Vagas</a>'));
  const preserved = section(after).replace('            <a href="/vagas/">Vagas</a>\n', '');
  assert.ok(section(after).includes('<AmbienceGallery />'));
  assert.ok(!section(after).toLowerCase().includes('burger'));
  assert.ok(!section(after).toLowerCase().includes('tripadvisor'));
  assert.equal(createHash('sha256').update(preserved).digest('hex'),'6eba0409f42f26fb733fb68fdb8e5e4e1baeb98a855eddaccc14b926ae58c01e');
});
