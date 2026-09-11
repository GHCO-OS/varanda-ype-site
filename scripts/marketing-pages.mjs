import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { intents, platformKeys } from '../shared/marketing-config.js';
import { escapeHtml, marketingMarkup, marketingMetadata } from '../src/marketing/page.js';

const template = await fs.readFile('dist/index.html', 'utf8');
await build({ configFile: false, publicDir: false, build: { outDir: 'dist', emptyOutDir: false, lib: { entry: 'src/marketing/client.js', formats: ['es'], fileName: () => 'marketing-assets/client.js' }, minify: true } });
await fs.mkdir('dist/marketing-assets', { recursive: true });
await fs.writeFile('dist/marketing-assets/landing.css', `${await fs.readFile('src/marketing/landing.css', 'utf8')}\n${await fs.readFile('src/marketing/accessibility.css', 'utf8')}`);

for (const platform of [null, ...platformKeys]) {
  const meta = marketingMetadata(platform);
  let head = template.slice(0, template.indexOf('</head>'));
  head = head.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace(/<script type="module"[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<link[^>]*href="\/assets\/[^"]+"[^>]*>/g, '')
    .replace(/<link[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^"]*"[^>]*>/g, '')
    .replace(/<link[^>]*rel="(?:preload|modulepreload)"[^>]*>/g, '')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(meta.description)}" />`)
    .replace(/<meta\s+name="robots"[^>]*>/, '<meta name="robots" content="noindex,follow,max-image-preview:large" />')
    .replace(/<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${meta.canonical}" />`);
  for (const [key, value] of Object.entries({ 'og:title': meta.title, 'og:description': meta.description, 'og:url': meta.canonical, 'og:type': 'website', 'twitter:title': meta.title, 'twitter:description': meta.description })) {
    head = head.replace(new RegExp(`<meta\\s+(?:name|property)="${key}"\\s+content="[^"]*"\\s*/>`), `<meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${escapeHtml(value)}" />`);
  }
  head = head.replace(/<meta\s+property="og:image"[^>]*>/, '<meta property="og:image" content="https://varandaype.com/pratos/chorizo.webp" />')
    .replace(/<meta\s+name="twitter:image"[^>]*>/, '<meta name="twitter:image" content="https://varandaype.com/pratos/chorizo.webp" />');
  const defaultIntent = intents.default;
  head += `<link rel="preload" as="font" type="font/woff2" href="/fonts/fraunces-latin-600-900.woff2" crossorigin /><link rel="preload" as="image" href="${defaultIntent.hero}" fetchpriority="high" /><link rel="stylesheet" href="/marketing-assets/landing.css" /><script type="module" src="/marketing-assets/client.js"></script>`;
  const html = `${head}</head><body>${marketingMarkup(platform)}</body></html>`;
  const dir = platform ? path.join('dist', 'pedir', platform) : path.join('dist', 'pedir');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), html);
}
