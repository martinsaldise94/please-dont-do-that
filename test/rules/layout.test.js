import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutRules } from '../../rules/v1/layout.js';

function makeModel({ sectionTypes = new Set(), featureCardCount = 0, headings = [], ctaTexts = [] } = {}) {
  return { files: [{ path: 'test.html', sectionTypes, featureCardCount, headings, ctaTexts }] };
}

const [L01, L02, L03] = layoutRules;

test('L01: fires when hero + features + testimonials all present', () => {
  const model = makeModel({ sectionTypes: new Set(['hero', 'features', 'testimonials']) });
  const hits = L01.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].severity, 'high');
});

test('L01: fires with medium severity for 2 sections', () => {
  const model = makeModel({ sectionTypes: new Set(['hero', 'features']) });
  const hits = L01.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].severity, 'medium');
});

test('L01: does not fire with only one section', () => {
  const model = makeModel({ sectionTypes: new Set(['hero']) });
  assert.equal(L01.run(model).length, 0);
});

test('L02: fires for 3+ feature cards', () => {
  const model = makeModel({ featureCardCount: 3 });
  const hits = L02.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].ruleId, 'L02');
});

test('L02: does not fire for fewer than 3 cards', () => {
  const model = makeModel({ featureCardCount: 2 });
  assert.equal(L02.run(model).length, 0);
});

test('L03: fires on hero + heading + CTA combo', () => {
  const model = makeModel({
    sectionTypes: new Set(['hero']),
    headings: ['Transform Your Business'],
    ctaTexts: ['Get Started'],
  });
  const hits = L03.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].severity, 'low');
});

test('L03: does not fire without a hero section', () => {
  const model = makeModel({ headings: ['Hello'], ctaTexts: ['Click here'] });
  assert.equal(L03.run(model).length, 0);
});
