export const destinations = Object.freeze({
  expresso_varanda: { operation: 'restaurante', partner: 'direct', label: 'Pedir direto', url: 'https://expresso.varandaype.com' },
  ifood_restaurante: { operation: 'restaurante', partner: 'ifood', label: 'Pedir no iFood', url: 'https://www.ifood.com.br/delivery/link-cardapio/sitemercado/2ba9a14c-3df9-4725-8b6b-1294c2c1b156' },
  food99_restaurante: { operation: 'restaurante', partner: '99food', label: 'Pedir no 99Food', url: 'https://oia.99app.com/dlp9/C94oJv?area=BR' },
  food99_marmitas: { operation: 'marmitas', partner: '99food', label: 'Pedir no 99Food', url: 'https://oia.99app.com/dlp9/ceXoR0?area=BR' },
  ifood_marmitas: { operation: 'marmitas', partner: 'ifood', label: 'Pedir no iFood', url: 'https://www.ifood.com.br/delivery/link-cardapio/sitemercado/cefe7c90-e207-4493-ae9b-6b676c22ecf0' },
  ifood_hamburgueria: { operation: 'hamburgueria', partner: 'ifood', label: 'Pedir no iFood', url: 'https://www.ifood.com.br/delivery/link-cardapio/sitemercado/14734c59-f45a-41e2-80b0-f1914971f6e1' },
  food99_hamburgueria: { operation: 'hamburgueria', partner: '99food', label: 'Pedir no 99Food', url: 'https://oia.99app.com/dlp9/X2TmjJ?area=BR' },
});
export const operations = Object.freeze({
  restaurante: { name: 'Restaurante Varanda Ypê', headline: 'Como você prefere pedir hoje?', description: 'Escolha seu canal de pedido.', destinations: ['expresso_varanda', 'ifood_restaurante', 'food99_restaurante'] },
  marmitas: { name: 'Marmitaria Varanda Ypê', headline: 'Pedir sua marmita', description: 'Escolha o aplicativo e veja o cardápio disponível.', destinations: ['food99_marmitas', 'ifood_marmitas'] },
  hamburgueria: { name: 'Burgers N’ Smoke', headline: 'Pedir Burgers N’ Smoke', description: 'O cardápio da hamburgueria nos seus aplicativos.', destinations: ['ifood_hamburgueria', 'food99_hamburgueria'] },
});
export const campaignKeys = ['utm_source','utm_medium','utm_campaign','utm_id','utm_content','utm_term','utm_source_platform','gclid','gbraid','wbraid','fbclid','campaign_id','campaign_name','adgroup_id','adset_id','ad_id','ad_name','placement','site_source','keyword','matchtype','device','network'];
export const clickKeys = ['gclid','gbraid','wbraid','fbclid'];
export function campaignParams(search, adsAllowed = true) {
  const params = new URLSearchParams(search);
  return Object.fromEntries(campaignKeys.filter(key => adsAllowed || !clickKeys.includes(key)).flatMap(key => {
    const value = params.get(key)?.trim();
    return value ? [[key, value.slice(0, 256).replace(/[\u0000-\u001f]/g, '')]] : [];
  }));
}
export function deliveryPath(operation = 'hub') {
  return operation === 'hub' ? '/delivery/' : `/delivery/${operation}/`;
}
export function fillDestinations(template) {
  return template.replace(/\{\{delivery:([a-z0-9_]+)\}\}/g, (_, id) => {
    if (!destinations[id]) throw new Error(`Unknown destination: ${id}`);
    return destinations[id].url;
  });
}
