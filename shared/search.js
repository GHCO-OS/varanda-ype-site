// Accent- and synonym-aware search over the menu catalogue, plus the piece that
// makes /menu/ and /rotisseria/ discoverable from each other: a unified section
// list so a Sunday-only item still shows up (linking out to /rotisseria/) when
// someone searches the regular online menu. Pure and framework-agnostic so it's
// usable from the UI and from tests without pulling in React.
import { fullMenuSections } from './menu-data.js';
import { rotisseriaAssados } from './rotisseria-data.js';

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// Grounded in this menu's own vocabulary, not a generic thesaurus — each key expands
// to itself plus its listed synonyms whenever a query token matches any of them.
export const SYNONYMS = Object.freeze({
  frango: ['galinha', 'ave', 'galeto'],
  peixe: ['tilapia', 'salmao'],
  carne: ['bovino', 'boi', 'contrafile'],
  suino: ['porco', 'pernil', 'panceta', 'bacon'],
  cerveja: ['chopp', 'chope'],
  refrigerante: ['refri'],
  fritas: ['batata'],
  mandioca: ['aipim', 'macaxeira'],
  porcao: ['petisco', 'belisco', 'beliscar'],
  molho: ['vinagrete'],
  domingo: ['assado', 'assados', 'rotisseria'],
  espeto: ['espetinho', 'espetinhos'],
  queijo: ['catupiry', 'provolone', 'mussarela'],
  sanduiche: ['lanche'],
});

function synonymSet(token) {
  const set = new Set([token]);
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    const group = [key, ...synonyms].map(normalizeText);
    if (group.includes(token)) group.forEach((word) => set.add(word));
  }
  return set;
}

function haystack(item) {
  return normalizeText([item.name, item.meta, item.desc, item.note].filter(Boolean).join(' '));
}

/** True if every query token (or one of its synonyms) appears somewhere in the item. */
export function matchesQuery(item, query) {
  const trimmed = (query || '').trim();
  if (!trimmed) return true;
  const text = haystack(item);
  const tokens = normalizeText(trimmed).split(/\s+/).filter(Boolean);
  return tokens.every((token) => [...synonymSet(token)].some((word) => text.includes(word)));
}

/** Filters menu-data-shaped sections by query, synonym-aware and accent-insensitive. */
export function searchMenu(sections, query) {
  return sections
    .map((section) => ({ ...section, items: section.items.filter((item) => matchesQuery(item, query)) }))
    .filter((section) => section.items.length > 0);
}

const ROTISSERIA_NOTE = 'Só aos domingos, das 11h às 15h, por peso (1 kg, 500 g ou 250 g).';

/** The regular menu plus a Rotisseria & Assados section, so it's a normal category to
 * browse and a normal thing to find by search — not a page only discoverable by luck. */
export function buildSearchableSections() {
  const rotisseriaSection = {
    id: 'rotisseria',
    emoji: '🍗',
    title: 'Rotisseria & Assados (domingo)',
    note: ROTISSERIA_NOTE,
    sundayOnly: true,
    link: '/rotisseria/',
    items: rotisseriaAssados.map((item) => ({
      name: item.name,
      price: `R$ ${item.prices[2]} (250 g) a R$ ${item.prices[0]} (1 kg)`,
      meta: item.note || null,
      desc: ROTISSERIA_NOTE,
      sundayOnly: true,
      link: '/rotisseria/',
    })),
  };
  return [...fullMenuSections, rotisseriaSection];
}
