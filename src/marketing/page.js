import { intents, landingPath, platforms, siteConfig, validIntent, validPlatform } from '../../shared/marketing-config.js';

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function marketingMetadata(platformInput = null) {
  const platform = validPlatform(platformInput);
  const suffix = platform ? ` no ${platforms[platform].name}` : '';
  return {
    title: platform ? `Pedir Varanda Ypê${suffix}` : 'Pedir Varanda Ypê | Escolha o canal',
    description: platform ? `Escolha seu prato e peça Varanda Ypê${suffix}. Comida brasileira em Campinas.` : 'Escolha iFood, 99Food ou pedido direto para pedir Varanda Ypê em Campinas.',
    canonical: `${siteConfig.siteUrl}${landingPath(platform)}`,
  };
}

function platformSelector(search = '') {
  const params = new URLSearchParams(search);
  params.delete('platform');
  return Object.entries(platforms).map(([key, item]) => {
    const query = params.toString();
    return `<a class="platform-card platform-${key}" data-platform-link="${key}" href="${landingPath(key)}${query ? `?${escapeHtml(query)}` : ''}"><span>${escapeHtml(item.name)}</span><span aria-hidden="true">→</span></a>`;
  }).join('');
}

export function marketingMarkup(platformInput = null, intentInput = 'default') {
  const platform = validPlatform(platformInput);
  const intentKey = validIntent(intentInput);
  const intent = intents[intentKey];
  if (!platform) {
    return `<main class="marketing-shell" data-marketing-platform="">
      <header class="selector-header"><a class="brand-link" href="/"><img src="/logo-icon-96.webp" width="72" height="72" alt=""><span>Varanda Ypê</span></a><p class="eyebrow">Pedido rápido</p><h1>Como você prefere pedir hoje?</h1><p>Escolha o canal e vá direto ao pedido.</p></header>
      <nav class="platform-selector" aria-label="Canais de pedido">${platformSelector()}</nav>
      ${marketingFooter()}
    </main>`;
  }
  const platformInfo = platforms[platform];
  const destination = platformInfo.destination(intentKey);
  const products = intent.products.map(product => `<a class="food-card" href="#order" data-item-id="${escapeHtml(product.id)}" data-item-name="${escapeHtml(product.name)}">
    <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)} do Varanda Ypê" width="${product.width}" height="${product.height}" loading="lazy" decoding="async">
    <span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.detail)}</small></span>
  </a>`).join('');
  return `<main class="marketing-landing platform-${platform}" data-marketing-platform="${platform}" data-marketing-intent="${intentKey}">
    <section class="landing-hero">
      <div class="hero-copy"><a class="brand-link" href="/"><img src="/logo-icon-96.webp" width="64" height="64" alt=""><span>Varanda Ypê</span></a><p class="eyebrow">Campinas • comida brasileira</p><h1 data-hero-headline>${escapeHtml(intent.headline)}</h1><p class="hero-sub" data-hero-subheadline>${escapeHtml(intent.subheadline)}</p>
        <a id="order" class="primary-order" data-outbound="hero" data-destination-id="${escapeHtml(destination.id)}" href="${escapeHtml(destination.url)}">${escapeHtml(platformInfo.cta)}</a>
        <p class="microcopy">Entrega rápida • comida preparada todos os dias</p>
      </div>
      <div class="hero-photo"><img data-hero-image src="${escapeHtml(intent.hero)}" alt="${escapeHtml(intent.heroAlt)}" width="600" height="600" loading="eager" decoding="async" fetchpriority="high"></div>
    </section>
    <section class="popular" data-menu-section><div class="section-heading"><p class="eyebrow">Escolha pela fome</p><h2>Mais pedidos</h2></div><div class="food-grid" data-food-grid>${products}</div></section>
    <section class="reasons" aria-label="Por que pedir"><p>Comida preparada diariamente</p><p>Opções para diferentes tamanhos de fome</p><p>Restaurante de Campinas</p><p>Compra pelo canal escolhido</p></section>
    <section class="final-cta"><h2>Seu pedido está a um toque.</h2><a class="primary-order" data-outbound="final" href="${escapeHtml(destination.url)}">${escapeHtml(platformInfo.cta)}</a></section>
    ${marketingFooter()}
    <a class="sticky-order" data-outbound="sticky" href="${escapeHtml(destination.url)}">Pedir agora</a>
  </main>`;
}

function marketingFooter() {
  return `<footer class="marketing-footer"><a href="/privacidade/">Privacidade</a><a href="/cookies/">Cookies</a><details data-consent-panel><summary>Preferências de privacidade</summary><fieldset><legend>Escolha o que permite</legend><label><input type="checkbox" checked disabled> Necessários</label><label><input name="analytics" type="checkbox"> Análise</label><label><input name="advertising" type="checkbox"> Publicidade</label><label><input name="personalization" type="checkbox"> Personalização</label><div><button type="button" data-consent-save>Salvar</button><button type="button" data-consent-all>Aceitar tudo</button></div><p data-consent-status role="status"></p></fieldset></details><pre data-tracking-debug hidden></pre></footer>`;
}
