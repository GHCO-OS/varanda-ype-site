import { destinations as deliveryDestinations } from './delivery.js';

export const siteConfig = Object.freeze({
  name: 'Varanda Ypê',
  siteUrl: 'https://varandaype.com',
  phone: '+551931991971',
  whatsapp: 'https://wa.me/551931991971',
  instagram: 'https://instagram.com/varandaype',
  maps: 'https://share.google/pxyfGTy3KNNdToPxk',
  menu: 'https://varandaype.com/menu/',
  tripadvisor: 'https://www.tripadvisor.com.br/Restaurant_Review-g303605-d34648174-Reviews-Varanda_Ype_Jd_Aurelia-Campinas_State_of_Sao_Paulo.html',
  tripadvisorLocationId: '34648174',
});

export const featureFlags = Object.freeze({
  enableMetaPixel: false,
  enableMetaCapi: false,
  enableGoogleAds: false,
  enableServerGtm: false,
  enableExperiments: true,
  enableInternalAttribution: true,
  enableReviewFlow: false,
});

export const intentKeys = Object.freeze(['marmita', 'executivo', 'grelhado', 'petisco', 'combo']);
export const platformKeys = Object.freeze(['ifood', '99food', 'direto']);

const productSets = Object.freeze({
  default: [
    { id: 'chorizo_executivo', name: 'Chorizo executivo', detail: 'Grelhado com acompanhamentos brasileiros.', image: '/pratos/chorizo.webp', width: 600, height: 600 },
    { id: 'fraldinha', name: 'Fraldinha', detail: 'Carne grelhada e refeição completa.', image: '/pratos/fraldinha.webp', width: 600, height: 600 },
    { id: 'risoto_cuiabano', name: 'Risoto cuiabano', detail: 'Cremoso, bem servido e brasileiro.', image: '/pratos/risoto-cuiabano.webp', width: 600, height: 600 },
  ],
  marmita: [
    { id: 'chorizo_executivo', name: 'Chorizo executivo', detail: 'Almoço bem servido com acompanhamentos.', image: '/pratos/chorizo.webp', width: 600, height: 600 },
    { id: 'fraldinha', name: 'Fraldinha', detail: 'Refeição completa para a rotina.', image: '/pratos/fraldinha.webp', width: 600, height: 600 },
    { id: 'risoto_cuiabano', name: 'Risoto cuiabano', detail: 'Uma opção cremosa e farta.', image: '/pratos/risoto-cuiabano.webp', width: 600, height: 600 },
  ],
  executivo: [
    { id: 'chorizo_executivo', name: 'Chorizo executivo', detail: 'Grelhado com arroz, feijão e acompanhamentos.', image: '/pratos/chorizo.webp', width: 600, height: 600 },
    { id: 'fraldinha', name: 'Fraldinha', detail: 'Almoço bem feito, sem complicação.', image: '/pratos/fraldinha.webp', width: 600, height: 600 },
    { id: 'talharim', name: 'Talharim 4 queijos', detail: 'Massa cremosa para uma refeição completa.', image: '/pratos/talharim.webp', width: 600, height: 600 },
  ],
  grelhado: [
    { id: 'chorizo_executivo', name: 'Chorizo executivo', detail: 'Carne grelhada com acompanhamentos.', image: '/pratos/chorizo.webp', width: 600, height: 600 },
    { id: 'fraldinha', name: 'Fraldinha', detail: 'Grelhada e servida como comida de verdade.', image: '/pratos/fraldinha.webp', width: 600, height: 600 },
    { id: 'jantinha', name: 'Jantinha Expressa', detail: 'Dois espetos e acompanhamentos brasileiros.', image: '/pratos/jantinha-2-espetos-varanda-ype-campinas.webp', width: 1200, height: 675 },
  ],
  petisco: [
    { id: 'calabresa_fritas', name: 'Calabresa com fritas', detail: 'Porção para dividir e prosear.', image: '/porcoes/calabresa-com-fritas.webp', width: 600, height: 600 },
    { id: 'isca_mignon', name: 'Isca de mignon', detail: 'Petisco de carne para a mesa.', image: '/porcoes/isca-cordao-mignon.webp', width: 600, height: 600 },
    { id: 'tulipa_frita', name: 'Tulipa frita', detail: 'Crocante e feita para compartilhar.', image: '/porcoes/tulipa-frita.webp', width: 600, height: 600 },
  ],
  combo: [
    { id: 'chorizo_executivo', name: 'Prato completo', detail: 'Grelhado e acompanhamentos para matar a fome.', image: '/pratos/chorizo.webp', width: 600, height: 600 },
    { id: 'risoto_cuiabano', name: 'Risoto cuiabano', detail: 'Refeição cremosa e bem servida.', image: '/pratos/risoto-cuiabano.webp', width: 600, height: 600 },
    { id: 'talharim', name: 'Talharim', detail: 'Massa cremosa com carne grelhada.', image: '/pratos/talharim.webp', width: 600, height: 600 },
  ],
});

export const intents = Object.freeze({
  default: { headline: 'Comida de verdade. Do nosso fogão pra sua mesa.', subheadline: 'Marmitas • Executivos • Grelhados • Massas', hero: '/pratos/chorizo.webp', heroAlt: 'Chorizo grelhado do Varanda Ypê com acompanhamentos', products: productSets.default },
  marmita: { headline: 'Sua marmita de hoje tá aqui.', subheadline: 'Almoço bem servido para pedir sem complicação.', hero: '/pratos/risoto-cuiabano.webp', heroAlt: 'Refeição do Varanda Ypê para o almoço', products: productSets.marmita },
  executivo: { headline: 'Almoço bem feito, sem complicação.', subheadline: 'Pratos executivos, grelhados e acompanhamentos brasileiros.', hero: '/pratos/fraldinha.webp', heroAlt: 'Fraldinha grelhada do Varanda Ypê', products: productSets.executivo },
  grelhado: { headline: 'Grelhado de verdade, feito na hora.', subheadline: 'Carnes e acompanhamentos para uma refeição completa.', hero: '/pratos/chorizo.webp', heroAlt: 'Carne grelhada no Varanda Ypê', products: productSets.grelhado },
  petisco: { headline: 'Hoje pede uma porção.', subheadline: 'Petiscos para dividir, jantar e aproveitar a mesa.', hero: '/porcoes/calabresa-com-fritas.webp', heroAlt: 'Porção de calabresa com fritas do Varanda Ypê', products: productSets.petisco },
  combo: { headline: 'Seu pedido completo começa aqui.', subheadline: 'Escolha o que combina com a sua fome no cardápio do dia.', hero: '/pratos/talharim.webp', heroAlt: 'Talharim cremoso servido no Varanda Ypê', products: productSets.combo },
});

export const platforms = Object.freeze({
  ifood: { name: 'iFood', cta: 'Pedir pelo iFood', destination(intent) { return intent === 'marmita' ? deliveryDestinations.ifood_marmitas : deliveryDestinations.ifood_restaurante; } },
  '99food': { name: '99Food', cta: 'Pedir pelo 99Food', destination(intent) { return intent === 'marmita' ? deliveryDestinations.food99_marmitas : deliveryDestinations.food99_restaurante; } },
  direto: { name: 'Pedido direto', cta: 'Pedir direto no Varanda', destination() { return deliveryDestinations.expresso_varanda; } },
});

export const redirectTargets = Object.freeze({
  ifood: { event: 'outbound_order_click', destination(intent) { return platforms.ifood.destination(intent).url; } },
  '99food': { event: 'outbound_order_click', destination(intent) { return platforms['99food'].destination(intent).url; } },
  direto: { event: 'outbound_order_click', destination() { return platforms.direto.destination().url; }, preserveAttribution: true },
  whatsapp: { event: 'whatsapp_click', destination: () => siteConfig.whatsapp },
  maps: { event: 'directions_click', destination: () => siteConfig.maps },
  instagram: { event: 'secondary_cta_click', destination: () => siteConfig.instagram },
  'google-review': { event: 'review_click', destination: () => siteConfig.maps },
  tripadvisor: { event: 'review_click', destination: () => siteConfig.tripadvisor },
});

export const campaignKeys = Object.freeze([
  'utm_source','utm_medium','utm_campaign','utm_id','utm_content','utm_term','utm_source_platform',
  'gclid','gbraid','wbraid','fbclid','msclkid','campaign_id','campaign_name','adgroup_id','adgroup_name',
  'adset','adset_id','ad_id','ad_name','creative','offer','audience','placement','site_source','keyword',
  'matchtype','match_type','device','network','experiment','variant','platform','intent',
]);

export function cleanParam(value, max = 256) {
  return typeof value === 'string' ? value.trim().slice(0, max).replace(/[\u0000-\u001f\u007f]/g, '') : '';
}

export function normalizeCampaign(search, advertisingAllowed = true) {
  const query = search instanceof URLSearchParams ? search : new URLSearchParams(search || '');
  const adOnly = new Set(['gclid','gbraid','wbraid','fbclid','msclkid']);
  return Object.fromEntries(campaignKeys.flatMap(key => {
    if (!advertisingAllowed && adOnly.has(key)) return [];
    const value = cleanParam(query.get(key));
    return value ? [[key, value]] : [];
  }));
}

export function validPlatform(value) { return platformKeys.includes(value) ? value : null; }
export function validIntent(value) { return intentKeys.includes(value) ? value : 'default'; }
export function landingPath(platform) { return platform ? `/pedir/${platform}/` : '/pedir/'; }
export function destinationFor(platform, intent = 'default') {
  const item = platforms[validPlatform(platform)];
  if (!item) return null;
  const destination = item.destination(validIntent(intent));
  const id = Object.entries(deliveryDestinations).find(([, value]) => value === destination)?.[0];
  return { ...destination, id };
}
