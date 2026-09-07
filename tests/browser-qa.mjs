import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { destinations, operations } from '../shared/delivery.js';

// Browser is supplied by the persistent QA session or the CLI runner.
export async function runBrowserChecks(browser, base='http://127.0.0.1:8788') {
  const context=await browser.newContext();
  await context.route('https://www.googletagmanager.com/**',route=>route.abort());
  const page=await context.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  const checks=[];
  for(const width of [360,390,430,768,1440]) {
    await page.setViewportSize({width,height:900});
    for(const op of ['hub',...Object.keys(operations)]) {
      const path=op==='hub'?'/delivery/':`/delivery/${op}/`;
      const response=await page.goto(`${base}${path}?utm_source=meta&gclid=test&fbclid=test`);
      assert.equal(response.status(),200);
      await page.locator('[data-initialized="true"]').waitFor();
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),`https://varandaype.com${path}`);
      const bounds=await page.locator('.router-choice').evaluateAll(links=>links.map(l=>{const b=l.getBoundingClientRect();return {right:b.right,bottom:b.bottom,height:b.height};}));
      for(const b of bounds){assert.ok(b.right<=width);assert.ok(b.height>=44);assert.ok(b.bottom<=900);}
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      assert.equal(await page.evaluate(()=>dataLayer.filter(e=>e.event==='delivery_hub_view').length),1);
      checks.push(`${width}px ${op}: status/canonical/buttons/view OK`);
      if(width===390 || width===1440) {
        await fs.mkdir('.codex/qa/delivery',{recursive:true});
        await page.screenshot({path:`.codex/qa/delivery/${op}-${width}.png`,fullPage:true,scale:'css'});
      }
    }
  }
  // Click every official destination and inspect actual navigation interception.
  const payloads=[];
  await context.route('**/api/delivery-click',async route=>{payloads.push(route.request().postDataJSON());await route.fulfill({status:204});});
  for(const [id,destination] of Object.entries(destinations)) {
    await page.goto(`${base}/delivery/${destination.operation}/?utm_source=google&utm_medium=cpc&gclid=test&campaign_id=123`);
    await page.locator('summary').click();
    await page.getByRole('button',{name:'Aceitar',exact:true}).click();
    let navigation;
    const pattern=new URL(destination.url).origin+'/**';
    await context.route(pattern,async route=>{navigation=route.request().url();await route.fulfill({status:200,contentType:'text/html',body:'<h1>Destino de teste</h1>'});});
    payloads.length=0;
    const destinationLink=page.locator(`[data-destination="${id}"]`);
    if (destination.partner==='direct' && await destinationLink.count()===0) {
      assert.ok(await page.locator('.router-disabled').isDisabled());
      await context.unroute(pattern);
      checks.push(`${id}: correctly unavailable outside 11h–15h; no marketplace impact`);
      continue;
    }
    await destinationLink.click();
    await page.getByRole('heading',{name:'Destino de teste'}).waitFor();
    assert.ok(navigation);
    const emitted=payloads.filter(e=>e.destination_id===id);
    assert.ok(emitted.some(e=>e.event==='delivery_click'));
    assert.equal(emitted.filter(e=>e.event==='partner_click').length,destination.partner==='direct'?0:1);
    assert.equal(new Set(emitted.map(e=>e.event_id)).size,emitted.length);
    assert.ok(!payloads.some(e=>['Purchase','purchase','InitiateCheckout'].includes(e.event)));
    if(destination.partner==='direct')assert.equal(new URL(navigation).searchParams.get('gclid'),'test');
    else assert.equal(navigation,destination.url);
    await context.unroute(pattern);
    checks.push(`${id}: consent, click, beacon, navigation OK`);
  }
  await page.goto(base+'/delivery/?utm_source=meta&fbclid=internal');
  await page.getByRole('link',{name:/Marmitaria Varanda/}).click();
  assert.equal(new URL(page.url()).searchParams.get('fbclid'),'internal');
  await page.locator('summary').click(); await page.getByRole('button',{name:'Rejeitar',exact:true}).click();
  payloads.length=0;
  await page.reload();
  await page.locator('[data-initialized="true"]').waitFor();
  assert.equal(payloads.length,0);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('vy_delivery_session')),null);
  checks.push('internal attribution preserved; reject disables transmission and clears session');
  let leadPayload;
  await context.route('**/api/lead-capture',async route=>{
    if(route.request().method()==='GET') await route.fulfill({status:204});
    else {leadPayload=route.request().postDataJSON();await route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});}
  });
  await page.goto(base+'/delivery/marmitas/?utm_source=meta');
  await page.evaluate(()=>document.dispatchEvent(new MouseEvent('mouseout',{clientY:0,relatedTarget:null})));
  const leadDialog=page.locator('[data-lead-dialog]'); await leadDialog.waitFor({state:'visible'});
  await leadDialog.locator('[name="whatsapp"]').fill('(19) 99999-9999');
  await leadDialog.locator('[name="lead_consent"]').check();
  await leadDialog.locator('.lead-submit').click();
  await leadDialog.getByText('Cadastro recebido. Obrigado!').waitFor();
  assert.equal(leadPayload.whatsapp,'(19) 99999-9999'); assert.equal(leadPayload.lead_consent,true);
  assert.equal(await page.evaluate(()=>dataLayer.filter(e=>e.event==='lead_capture').length),1);
  checks.push('lead dialog: exit intent, consent, API and dataLayer OK');
  await context.close();
  const nojs=await browser.newContext({javaScriptEnabled:false});
  const plain=await nojs.newPage();
  for(const [id,destination] of Object.entries(destinations)) {
    const pattern=new URL(destination.url).origin+'/**';
    await nojs.route(pattern,route=>route.fulfill({status:200,contentType:'text/html',body:'<h1>Sem JavaScript</h1>'}));
    await plain.goto(`${base}/delivery/${destination.operation}/`);
    assert.equal(await plain.locator(`[data-destination="${id}"]`).getAttribute('href'),destination.url);
    await plain.locator(`[data-destination="${id}"]`).click();
    await plain.getByRole('heading',{name:'Sem JavaScript'}).waitFor();
    await nojs.unroute(pattern);
  }
  await nojs.close();
  assert.deepEqual(errors,[]);
  checks.push('7 destinations work with JavaScript disabled; no page errors');
  return checks;
}
