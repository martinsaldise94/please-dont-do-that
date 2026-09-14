import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize } from '../core/scorer/industry-signals.js';
import { INDUSTRIES, INDUSTRY_IDS, resolveIndustry } from '../core/scorer/industries/index.js';
import { EN_BUZZWORDS } from '../rules/v1/dictionaries/en.js';
import { ES_BUZZWORDS } from '../rules/v1/dictionaries/es.js';

function* eachTerm() {
  for (const industry of INDUSTRIES) {
    for (const lang of ['en', 'es']) {
      for (const [category, terms] of Object.entries(industry.terms[lang])) {
        for (const term of terms) yield { industry, lang, category, term };
      }
    }
  }
}

test('every canonical id has a registered profile', () => {
  assert.deepEqual(INDUSTRIES.map((i) => i.id).sort(), [...INDUSTRY_IDS].sort());
});

test('every profile declares three categories, identical in both languages', () => {
  for (const industry of INDUSTRIES) {
    const en = Object.keys(industry.terms.en);
    const es = Object.keys(industry.terms.es);
    assert.equal(en.length, 3, `${industry.id}: expected 3 categories, got ${en.length}`);
    assert.deepEqual(en, es, `${industry.id}: category keys differ between en and es`);
  }
});

test('every category has at least five terms in both languages', () => {
  for (const industry of INDUSTRIES) {
    for (const lang of ['en', 'es']) {
      for (const [category, terms] of Object.entries(industry.terms[lang])) {
        assert.ok(
          terms.length >= 5,
          `${industry.id}.${lang}.${category}: only ${terms.length} terms`,
        );
      }
    }
  }
});

test('no lexicon term duplicates a buzzword', () => {
  const banned = new Set([...EN_BUZZWORDS, ...ES_BUZZWORDS].map((w) => normalize(w)));
  for (const { industry, term } of eachTerm()) {
    assert.ok(
      !banned.has(normalize(term)),
      `${industry.id}: "${term}" is a buzzword and carries no industry signal`,
    );
  }
});

test('no lexicon term is a word from the industry id itself', () => {
  for (const { industry, term } of eachTerm()) {
    const idWords = industry.id.split('-').map(normalize);
    assert.ok(
      !idWords.includes(normalize(term)),
      `${industry.id}: "${term}" names the industry itself, so a generic template says it too`,
    );
  }
});

test('no term appears twice within one language of a profile', () => {
  for (const industry of INDUSTRIES) {
    for (const lang of ['en', 'es']) {
      const all = Object.values(industry.terms[lang]).flat().map(normalize);
      const dupes = all.filter((t, i) => all.indexOf(t) !== i);
      assert.deepEqual(dupes, [], `${industry.id}.${lang}: duplicated terms`);
    }
  }
});

test('every term is a non-empty trimmed string', () => {
  for (const { industry, lang, category, term } of eachTerm()) {
    assert.ok(
      typeof term === 'string' && term.length > 0 && term === term.trim(),
      `${industry.id}.${lang}.${category}: bad term ${JSON.stringify(term)}`,
    );
  }
});

test('every profile has at least one alias', () => {
  for (const industry of INDUSTRIES) {
    assert.ok(industry.aliases.length > 0, `${industry.id}: no aliases`);
  }
});

// a shared alias would silently resolve to whichever profile is registered first
test('no alias is claimed by two industries', () => {
  const owners = new Map();
  for (const industry of INDUSTRIES) {
    for (const key of [industry.id, ...industry.aliases].map(normalize)) {
      const owner = owners.get(key);
      assert.ok(!owner || owner === industry.id, `"${key}" claimed by ${owner} and ${industry.id}`);
      owners.set(key, industry.id);
    }
  }
});

test('every alias resolves to its own industry', () => {
  for (const industry of INDUSTRIES) {
    for (const alias of industry.aliases) {
      assert.equal(resolveIndustry(alias)?.id, industry.id, `alias "${alias}"`);
    }
  }
});
