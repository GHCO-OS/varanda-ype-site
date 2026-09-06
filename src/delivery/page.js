import { destinations, operations, deliveryPath } from '../../shared/delivery.js';
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function deliveryMetadata(operation = 'hub') {
  const item = operations[operation];
  return { title: item ? `${item.name} | Delivery` : 'Delivery | Varanda Ypê', description: item ? `${item.headline} ${item.description}` : 'Escolha Restaurante, Marmitaria ou Burgers N’ Smoke e peça pelos canais oficiais.', canonical: `https://varandaype.com${deliveryPath(operation)}` };
}
export function deliveryMarkup(operation = 'hub') {
  const item = operations[operation];
  if (!item && operation !== 'hub') throw new Error('Unknown operation');
  const meta = deliveryMetadata(operation);
  const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: meta.title, url: meta.canonical, description: meta.description, inLanguage: 'pt-BR' };
  return `<main class="router-shell ${operation === 'hamburgueria' ? 'router-smoke' : ''}" data-delivery-operation="${operation}">
    <a class="router-back" href="${item ? '/delivery/' : '/'}">← ${item ? 'Outras operações' : 'Voltar ao site'}</a>
    <header><p class="router-brand">${escapeHtml(item?.name || 'Varanda Ypê · Delivery')}</p><h1>${escapeHtml(item?.headline || 'O que você vai pedir hoje?')}</h1><p>${escapeHtml(item?.description || 'Escolha a operação para ver os canais de pedido.')}</p></header>
    <nav class="router-options" aria-label="${item ? 'Canais de pedido' : 'Operações de delivery'}">
    ${item ? item.destinations.map(id => { const d = destinations[id]; return `<a class="router-choice router-${d.partner}" data-destination="${id}" href="${escapeHtml(d.url)}"><span>${escapeHtml(d.label)}</span><span aria-hidden="true">↗</span></a>`; }).join('') : Object.entries(operations).map(([op, info]) => `<a class="router-choice router-operation" data-operation-link="${op}" href="${deliveryPath(op)}"><span>${escapeHtml(info.name)}</span><span aria-hidden="true">→</span></a>`).join('')}
    </nav>
    <p class="router-note">${item ? 'Cardápio, valores e entrega disponíveis no canal escolhido.' : 'Restaurante, Marmitaria e Hamburgueria têm cardápios e canais próprios.'}</p>
    <footer><a href="/privacidade/">Privacidade</a><details><summary>Preferências de medição</summary><p>Usamos a preferência de cookies do site. Você pode aceitar ou rejeitar a medição e os anúncios.</p><div class="router-consent"><button type="button" data-consent="denied">Rejeitar</button><button type="button" data-consent="granted">Aceitar</button></div><p data-consent-status role="status"></p></details></footer>
    <pre data-debug hidden></pre>
    <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
  </main>`;
}
