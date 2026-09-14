import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalize,
  matchTerms,
  termKey,
  computeIndustrySignals,
} from '../core/scorer/industry-signals.js';
import { resolveIndustry } from '../core/scorer/industries/index.js';

test('normalize lowercases and strips accents', () => {
  assert.equal(normalize('Punción Seca'), 'puncion seca');
  assert.equal(normalize('CIÁTICA'), 'ciatica');
});

test('normalize treats hyphens as spaces', () => {
  assert.equal(normalize('Free-Range  eggs'), 'free range eggs');
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

test('matchTerms matches hyphenated and spaced forms alike', () => {
  assert.deepEqual(matchTerms('Our free range eggs', ['free-range']), ['free-range']);
  assert.deepEqual(matchTerms('Wine by-the-glass', ['by the glass']), ['by the glass']);
});

test('matchTerms accepts the plural of a singular term', () => {
  assert.deepEqual(matchTerms('Control de fichajes', ['fichaje']), ['fichaje']);
  assert.deepEqual(matchTerms('We fit radiators', ['radiator']), ['radiator']);
});

test('matchTerms accepts the singular of a plural term', () => {
  assert.deepEqual(matchTerms('Un bolígrafo Lamy', ['bolígrafos']), ['bolígrafos']);
});

test('plural tolerance does not reach into longer words', () => {
  assert.deepEqual(matchTerms('Our therapists are here', ['therapy']), []);
});

test('all-caps acronyms match case-sensitively', () => {
  assert.deepEqual(matchTerms('Eso es todo lo que hacemos', ['ESO']), []);
  assert.deepEqual(matchTerms('Clases de ESO y Bachillerato', ['ESO']), ['ESO']);
  assert.deepEqual(matchTerms('Lots of reps per set', ['REPS']), []);
});

test('termKey folds a trailing plural so pairs count once', () => {
  assert.equal(termKey('hardbacks'), termKey('hardback'));
  assert.equal(termKey('By-the-Glass'), termKey('by the glass'));
  assert.notEqual(termKey('therapy'), termKey('therapist'));
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

test('zero matched terms gives no adjustment', () => {
  const s = computeIndustrySignals(model('generic filler copy'), FAKE);
  assert.deepEqual(s.matchedTerms, []);
  assert.deepEqual(s.matchedCategories, []);
  assert.deepEqual(s.missingCategories, ['alpha', 'beta', 'gamma']);
  assert.equal(s.adjustment, 0);
});

test('one or two terms give no adjustment and no breadth bonus', () => {
  assert.equal(computeIndustrySignals(model('aaa'), FAKE).adjustment, 0);
  const two = computeIndustrySignals(model('aaa ddd'), FAKE);
  assert.deepEqual(two.matchedCategories, ['alpha', 'beta']);
  assert.equal(two.adjustment, 0);
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

test('the adjustment is never negative', () => {
  for (const body of ['', 'nothing here', 'aaa', 'aaa ddd ggg', 'jjj kkk lll']) {
    const s = computeIndustrySignals(model(body), FAKE);
    assert.ok(s.adjustment >= 0 && s.adjustment <= 30, `${body}: ${s.adjustment}`);
  }
});

test('spanish model ignores lowercase english terms', () => {
  const s = computeIndustrySignals(model('aaa kkk', 'es'), FAKE);
  assert.deepEqual(s.matchedTerms, ['kkk']);
});

test('brands and acronyms from the other language still count', () => {
  const mixed = {
    ...FAKE,
    terms: {
      en: { alpha: ['Lamy', 'fountain pen'], beta: ['DHL'], gamma: [] },
      es: { alpha: ['pluma estilográfica'], beta: [], gamma: [] },
    },
  };
  const s = computeIndustrySignals(model('Plumas Lamy y fountain pen, envío DHL', 'es'), mixed);
  assert.deepEqual(s.matchedTerms, ['Lamy', 'DHL']);
});

test('unknown language unions both term sets', () => {
  const s = computeIndustrySignals(model('aaa kkk', 'unknown'), FAKE);
  assert.deepEqual(s.matchedTerms, ['aaa', 'kkk']);
});

test('singular and plural lexicon entries count as one term', () => {
  const pairs = {
    ...FAKE,
    terms: {
      en: { alpha: ['hardback', 'hardbacks', 'paperback'], beta: ['signed edition'], gamma: [] },
      es: { alpha: [], beta: [], gamma: [] },
    },
  };
  const s = computeIndustrySignals(model('Hardbacks, a hardback and a paperback'), pairs);
  assert.deepEqual(s.matchedTerms, ['hardback', 'paperback']);
});

test('matchedTerms is capped at 12 entries', () => {
  const wide = {
    ...FAKE,
    terms: {
      en: {
        alpha: Array.from({ length: 20 }, (_, i) => `term${String.fromCharCode(97 + i)}x`),
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

test('clinics lexicon gives generic clinic copy no credit', () => {
  const body =
    'We provide excellent care with a holistic approach. ' +
    'Our dedicated team is committed to your wellbeing. Book now.';
  const s = computeIndustrySignals(model(body), resolveIndustry('clinics'));
  assert.equal(s.adjustment, 0);
});
