import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText, matchesQuery, searchMenu, buildSearchableSections, SYNONYMS } from '../shared/search.js';
import { fullMenuSections } from '../shared/menu-data.js';
import { rotisseriaAssados } from '../shared/rotisseria-data.js';

test('normalizeText folds accents and case', () => {
  assert.equal(normalizeText('Jantinha Expressa'), 'jantinha expressa');
  assert.equal(normalizeText('Tilápia à Milanesa'), 'tilapia a milanesa');
});

test('matchesQuery is accent-insensitive and requires every token', () => {
  const item = { name: 'Tilápia Fresca', desc: 'Filé grelhado com legumes.' };
  assert.ok(matchesQuery(item, 'tilapia'));
  assert.ok(matchesQuery(item, 'TILÁPIA'));
  assert.ok(matchesQuery(item, 'tilapia legumes'));
  assert.ok(!matchesQuery(item, 'tilapia frita'));
});

test('matchesQuery expands synonyms both ways', () => {
  const frango = { name: 'Frango Kids', desc: 'Acompanha arroz, feijão e batata frita.' };
  assert.ok(matchesQuery(frango, 'galinha'));
  assert.ok(matchesQuery(frango, 'galeto'));
  const chopp = { name: 'Chopp Itaipava' };
  assert.ok(matchesQuery(chopp, 'cerveja'));
});

test('every synonym group is reachable from any of its own words', () => {
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    for (const word of [key, ...synonyms]) {
      const item = { name: key };
      assert.ok(matchesQuery(item, word), `"${word}" should match an item literally named "${key}"`);
    }
  }
});

test('searchMenu filters items within sections and drops empty sections', () => {
  const sections = [
    { id: 'a', items: [{ name: 'Fraldinha Assada' }, { name: 'Risoto Milanês' }] },
    { id: 'b', items: [{ name: 'Suco natural' }] },
  ];
  const result = searchMenu(sections, 'fraldinha');
  assert.deepEqual(result.map((s) => s.id), ['a']);
  assert.equal(result[0].items.length, 1);
});

test('searchMenu with an empty query returns everything untouched', () => {
  assert.deepEqual(searchMenu(fullMenuSections, ''), fullMenuSections);
  assert.deepEqual(searchMenu(fullMenuSections, '   '), fullMenuSections);
});

test('buildSearchableSections folds in every rotisseria item as Sunday-only, linking to /rotisseria/', () => {
  const sections = buildSearchableSections();
  assert.equal(sections.length, fullMenuSections.length + 1);
  const rotisseria = sections.at(-1);
  assert.equal(rotisseria.id, 'rotisseria');
  assert.equal(rotisseria.items.length, rotisseriaAssados.length);
  for (const item of rotisseria.items) {
    assert.equal(item.sundayOnly, true);
    assert.equal(item.link, '/rotisseria/');
  }
});

test('a menu-wide search for "domingo" or "assado" surfaces the rotisseria section', () => {
  const sections = buildSearchableSections();
  assert.ok(searchMenu(sections, 'domingo').some((s) => s.id === 'rotisseria'));
  assert.ok(searchMenu(sections, 'assado').some((s) => s.id === 'rotisseria'));
  assert.ok(searchMenu(sections, 'cupim').some((s) => s.id === 'rotisseria'));
});
