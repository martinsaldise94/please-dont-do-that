import { test } from 'node:test';
import assert from 'node:assert/strict';
import { credibilityRules } from '../../rules/v1/credibility.js';

function makeModel({ bodyText = '', testimonialCount = 0, statPatterns = [] } = {}) {
  return { files: [{ path: 'test.html', bodyText, testimonialCount, statPatterns }] };
}

const [CR01, CR02] = credibilityRules;

test('CR01: fires high on multiple testimonials with star ratings', () => {
  const model = makeModel({
    bodyText: '★★★★★ Great service. ★★★★★ Highly recommend.',
    testimonialCount: 2,
  });
  const hits = CR01.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].severity, 'high');
});

test('CR01: fires medium on single testimonial without stars', () => {
  const model = makeModel({ testimonialCount: 1 });
  const hits = CR01.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].severity, 'medium');
});

test('CR01: does not fire when there are no testimonials', () => {
  const model = makeModel({ testimonialCount: 0 });
  assert.equal(CR01.run(model).length, 0);
});

test('CR02: fires on multiple sourceless stats', () => {
  const model = makeModel({ statPatterns: ['98%', '5,000+ clients', '£2M'] });
  const hits = CR02.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].ruleId, 'CR02');
});

test('CR02: fires high severity on 4+ stats', () => {
  const model = makeModel({ statPatterns: ['98%', '5,000+ clients', '£2M', '99% uptime'] });
  assert.equal(CR02.run(model)[0].severity, 'high');
});

test('CR02: does not fire on zero or one stat', () => {
  assert.equal(CR02.run(makeModel({ statPatterns: [] })).length, 0);
  assert.equal(CR02.run(makeModel({ statPatterns: ['98%'] })).length, 0);
});
