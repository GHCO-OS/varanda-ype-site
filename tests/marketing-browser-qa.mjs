import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
const checks = [];
try {
  for (const width of [360, 390, 430, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 900 }, isMobile: width < 700, hasTouch: width < 700 });
    const page = await context.newPage();
    await page.goto(`${base}/pedir/ifood/?intent=marmita&utm_source=meta&utm_medium=paid_social&fbclid=test`, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('h1').textContent(), 'Sua marmita de hoje tá aqui.');
    assert.match(await page.locator('[data-hero-image]').getAttribute('src'), /risoto-cuiabano/);
    assert.match(await page.locator('[data-outbound="hero"]').getAttribute('href'), /cefe7c90/);
    const fit = await page.evaluate(() => ({ x: document.documentElement.scrollWidth > document.documentElement.clientWidth, hero: document.querySelector('[data-outbound="hero"]').getBoundingClientRect(), viewport: innerHeight }));
    assert.equal(fit.x, false);
    assert.ok(fit.hero.top >= 0 && fit.hero.top < fit.viewport);
    await fs.mkdir('.codex/qa/marketing', { recursive: true });
    if (width === 390 || width === 1440) {
      await page.screenshot({ path: `.codex/qa/marketing/ifood-marmita-${width}.jpg`, type: 'jpeg', quality: 85, fullPage: false, scale: 'css' });
      await page.screenshot({ path: `.codex/qa/marketing/ifood-marmita-${width}-full.jpg`, type: 'jpeg', quality: 85, fullPage: true, scale: 'css' });
    }
    checks.push(`${width}px: hero, imagem, CTA e viewport OK`);
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const payloads = [];
  await page.route('**/api/marketing-event', async route => { payloads.push(route.request().postDataJSON()); await route.fulfill({ status: 202 }); });
  await page.goto(`${base}/pedir/direto/?intent=executivo&utm_source=google&utm_medium=cpc&gclid=test`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-consent-panel] summary').click();
  await page.locator('[data-consent-all]').click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  const href = await page.locator('[data-outbound="hero"]').getAttribute('href');
  assert.equal(new URL(href).searchParams.get('gclid'), 'test');
  await page.locator('[data-outbound="hero"]').evaluate(link => link.addEventListener('click', event => event.preventDefault(), { once: true }));
  await page.locator('[data-outbound="hero"]').click({ noWaitAfter: true });
  await page.waitForTimeout(100);
  const names = await page.evaluate(() => dataLayer.filter(value => value && typeof value === 'object').map(value => value.event));
  assert.ok(names.includes('outbound_order_click'));
  assert.ok(names.includes('high_intent_session'));
  assert.equal(names.includes('purchase'), false);
  assert.ok(payloads.some(payload => payload.event === 'outbound_order_click'));
  checks.push('consentimento, atribuição direta, outbound e fail-open OK');
  await context.close();

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const plain = await noJs.newPage();
  await plain.goto(`${base}/pedir/99food/`, { waitUntil: 'domcontentloaded' });
  assert.match(await plain.locator('[data-outbound="hero"]').getAttribute('href'), /99app\.com/);
  assert.ok(await plain.locator('h1').isVisible());
  checks.push('sem JavaScript: conteúdo e href oficial OK');
  await noJs.close();

  process.stdout.write(`${checks.join('\n')}\n`);
} finally {
  await browser.close();
}
