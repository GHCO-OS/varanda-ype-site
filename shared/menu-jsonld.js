// Reads only schema.org JSON-LD a site already publishes for search engines to
// consume (the same markup Google reads to build rich results) — never the
// rendered DOM, never an authenticated view. No personal-data field exists in
// Menu/MenuItem/Product/Offer, so nothing here can capture a person's data.
const MENU_TYPES = new Set(['Menu', 'MenuSection', 'MenuItem']);
const PRODUCT_TYPES = new Set(['Product', 'Offer']);

function blocksFromHtml(html) {
  const blocks = [];
  const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    try { blocks.push(JSON.parse(match[1])); } catch { /* Skip malformed blocks. */ }
  }
  return blocks;
}

function flatten(node, out = []) {
  if (Array.isArray(node)) { node.forEach(item => flatten(item, out)); return out; }
  if (!node || typeof node !== 'object') return out;
  out.push(node);
  for (const value of Object.values(node)) if (value && typeof value === 'object') flatten(value, out);
  if (node['@graph']) flatten(node['@graph'], out);
  return out;
}

/** Extracts { name, description, price, currency } for each menu item / product found in the page's JSON-LD. */
export function extractMenuItems(html) {
  const nodes = blocksFromHtml(html).flatMap(block => flatten(block));
  const items = [];
  for (const node of nodes) {
    const types = [].concat(node['@type'] || []);
    if (!types.some(type => MENU_TYPES.has(type) || PRODUCT_TYPES.has(type))) continue;
    if (!node.name) continue;
    const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers;
    items.push({
      name: String(node.name).trim(),
      description: node.description ? String(node.description).trim().slice(0, 500) : null,
      price: offer?.price ?? node.price ?? null,
      currency: offer?.priceCurrency ?? node.priceCurrency ?? null,
    });
  }
  return items;
}
