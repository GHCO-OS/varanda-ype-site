import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { operations, fillDestinations } from '../shared/delivery.js';
import { deliveryMarkup, deliveryMetadata, escapeHtml } from '../src/delivery/page.js';

const template = await fs.readFile('dist/index.html', 'utf8');
for (const file of ['_redirects', 'ifood/index.html']) {
  await fs.writeFile(`dist/${file}`, fillDestinations(await fs.readFile(`public/${file}`, 'utf8')));
}
await build({ configFile: false, publicDir: false, build: { outDir: 'dist', emptyOutDir: false, lib: { entry: 'src/delivery/client.js', formats: ['es'], fileName: () => 'delivery-assets/client.js' }, minify: true } });
await fs.mkdir('dist/delivery-assets', { recursive: true });
await fs.copyFile('src/delivery/router.css', 'dist/delivery-assets/router.css');
for (const operation of ['hub', ...Object.keys(operations)]) {
  const meta = deliveryMetadata(operation);
  let head = template.slice(0, template.indexOf('</head>'));
  head = head.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace(/<script type="module"[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<link[^>]*(?:rel="(?:stylesheet|preload|modulepreload|preconnect)")[^>]*>/g, '')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${meta.canonical}" />`);
  for (const [key, value] of Object.entries({ description: meta.description, 'og:title': meta.title, 'og:description': meta.description, 'og:url': meta.canonical, 'og:type': 'website', 'twitter:title': meta.title, 'twitter:description': meta.description })) {
    head = head.replace(new RegExp(`<meta\\s+(?:name|property)="${key}"\\s+content="[^"]*"\\s*/>`), `<meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${escapeHtml(value)}" />`);
  }
  const html = `${head}<link rel="stylesheet" href="/delivery-assets/router.css" /><script type="module" src="/delivery-assets/client.js"></script></head><body>${deliveryMarkup(operation)}</body></html>`;
  const dir = operation === 'hub' ? 'dist/delivery' : path.join('dist/delivery', operation);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), html);
}
