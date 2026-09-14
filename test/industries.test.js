import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, matchTerms, computeIndustrySignals } from '../core/scorer/industry-signals.js';
import { resolveIndustry } from '../core/scorer/industries/index.js';

test('normalize lowercases and strips accents', () => {
  assert.equal(normalize('Punción Seca'), 'puncion seca');
  assert.equal(normalize('CIÁTICA'), 'ciatica');
});

test('matchTerms finds single-word terms case-insensitively', () => {
  const found = matchTerms('We treat Sciatica daily.', ['sciatica', 'whiplash']);
  assert.deepEqual(found, ['sciatica']);
});

test('matchTerms finds multi-word phrases', () => {
  const found = matchTerms('We offer dry needling and manual therapy.', [
    'dry needling',
    'manual therapy',
    'shockwave',
  ]);
  assert.deepEqual(found, ['dry needling', 'manual therapy']);
});

test('matchTerms matches across accents in either direction', () => {
  assert.deepEqual(matchTerms('Tratamos la ciatica.', ['ciática']), ['ciática']);
  assert.deepEqual(matchTerms('Tratamos la ciática.', ['ciatica']), ['ciatica']);
});

test('matchTerms respects word boundaries', () => {
  assert.deepEqual(matchTerms('Our therapist is here.', ['the']), []);
  assert.deepEqual(matchTerms('Registered with the HCPC.', ['HCPC']), ['HCPC']);
});

test('matchTerms returns terms in declaration order, not text order', () => {
  const found = matchTerms('whiplash then sciatica', ['sciatica', 'whiplash']);
  assert.deepEqual(found, ['sciatica', 'whiplash']);
});

test('matchTerms counts a repeated term once', () => {
  const found = matchTerms('sciatica sciatica sciatica', ['sciatica']);
  assert.deepEqual(found, ['sciatica']);
});

const FAKE = {
  id: 'fake',
  aliases: [],
  terms: {
    en: {
      alpha: ['aaa', 'bbb', 'ccc'],
      beta: ['ddd', 'eee', 'fff'],
      gamma: ['ggg', 'hhh', 'iii'],
    },
    es: {
      alpha: ['jjj'],
      beta: ['kkk'],
      gamma: ['lll'],
    },
  },
};

function model(bodyText, lang = 'en') {
  return { files: [{ path: 't.html', bodyText }], lang };
}

test('zero matched terms gives the full -30 penalty', () => {
  const s = computeIndustrySignals(model('generic filler copy'), FAKE);
  assert.deepEqual(s.matchedTerms, []);
  assert.deepEqual(s.matchedCategories, []);
  assert.deepEqual(s.missingCategories, ['alpha', 'beta', 'gamma']);
  assert.equal(s.adjustment, -30);
});

test('one term in one category gives -10 with no breadth bonus', () => {
  const s = computeIndustrySignals(model('aaa'), FAKE);
  assert.equal(s.adjustment, -10);
  assert.deepEqual(s.matchedCategories, ['alpha']);
});

test('breadth bonus applies to a negative base', () => {
  const s = computeIndustrySignals(model('aaa ddd'), FAKE);
  assert.equal(s.adjustment, -5);
  assert.deepEqual(s.matchedCategories, ['alpha', 'beta']);
});

test('three terms across two categories gives +10 base +5 breadth', () => {
  const s = computeIndustrySignals(model('aaa bbb ddd'), FAKE);
  assert.equal(s.adjustment, 15);
});

test('six terms across three categories gives +20 base +10 breadth', () => {
  const s = computeIndustrySignals(model('aaa bbb ccc ddd eee ggg'), FAKE);
  assert.equal(s.adjustment, 30);
});

test('breadth bonus is capped at +10', () => {
  const s = computeIndustrySignals(model('aaa bbb ccc ddd eee fff ggg hhh iii'), FAKE);
  assert.equal(s.adjustment, 30);
});

test('spanish model uses the spanish term set only', () => {
  const s = computeIndustrySignals(model('aaa kkk', 'es'), FAKE);
  assert.deepEqual(s.matchedTerms, ['kkk']);
  assert.equal(s.adjustment, -10);
});

test('unknown language unions both term sets', () => {
  const s = computeIndustrySignals(model('aaa kkk', 'unknown'), FAKE);
  assert.deepEqual(s.matchedTerms, ['aaa', 'kkk']);
});

test('matchedTerms is capped at 12 entries', () => {
  const wide = {
    ...FAKE,
    terms: {
      en: {
        alpha: Array.from({ length: 20 }, (_, i) => `t${i}`),
        beta: [],
        gamma: [],
      },
      es: { alpha: [], beta: [], gamma: [] },
    },
  };
  const s = computeIndustrySignals(model(wide.terms.en.alpha.join(' ')), wide);
  assert.equal(s.matchedTerms.length, 12);
});

test('signals are identical across repeated runs', () => {
  const a = computeIndustrySignals(model('aaa ddd ggg'), FAKE);
  const b = computeIndustrySignals(model('aaa ddd ggg'), FAKE);
  assert.deepEqual(a, b);
});

test('resolveIndustry matches a canonical id', () => {
  assert.equal(resolveIndustry('clinics')?.id, 'clinics');
});

test('resolveIndustry matches an alias', () => {
  assert.equal(resolveIndustry('physiotherapy')?.id, 'clinics');
  assert.equal(resolveIndustry('fisioterapia')?.id, 'clinics');
});

test('resolveIndustry is case and accent insensitive', () => {
  assert.equal(resolveIndustry('CLÍNICAS')?.id, 'clinics');
});

test('resolveIndustry returns null for unknown or empty input', () => {
  assert.equal(resolveIndustry('taxidermy'), null);
  assert.equal(resolveIndustry(null), null);
  assert.equal(resolveIndustry(''), null);
});

test('clinics lexicon scores a real specific page positively', () => {
  const body =
    'Registered with HCPC and members of the Chartered Society of Physiotherapy. ' +
    'Emma specialises in lumbar spine disorders and ACL rehabilitation. ' +
    'Diego offers dry needling and post-operative shoulder rehabilitation.';
  const s = computeIndustrySignals(model(body), resolveIndustry('clinics'));
  assert.ok(s.adjustment > 0, `expected a positive adjustment, got ${s.adjustment}`);
});

test('clinics lexicon penalises generic clinic copy', () => {
  const body =
    'We provide excellent care with a holistic approach. ' +
    'Our dedicated team is committed to your wellbeing. Book now.';
  const s = computeIndustrySignals(model(body), resolveIndustry('clinics'));
  assert.equal(s.adjustment, -30);
});
