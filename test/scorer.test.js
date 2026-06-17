import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeScores } from '../core/scorer/index.js';

function makeModel(bodyText = '') {
  return { files: [{ path: 'test.html', bodyText }], lang: 'en' };
}

test('all scores are integers in 0–100 range', () => {
  const scores = computeScores(makeModel(), []);
  for (const key of ['aiSmell', 'businessSpecificity', 'humanity']) {
    assert.ok(Number.isInteger(scores[key]), `${key} must be integer`);
    assert.ok(scores[key] >= 0 && scores[key] <= 100, `${key} must be 0–100`);
  }
});

test('no hits → AI Smell is 0', () => {
  const { aiSmell } = computeScores(makeModel(), []);
  assert.equal(aiSmell, 0);
});

test('all high-severity hits in all dimensions → AI Smell near 100', () => {
  const hits = [
    { dimension: 'copy', severity: 'high' },
    { dimension: 'copy', severity: 'high' },
    { dimension: 'copy', severity: 'high' },
    { dimension: 'layout', severity: 'high' },
    { dimension: 'layout', severity: 'high' },
    { dimension: 'layout', severity: 'high' },
    { dimension: 'visual', severity: 'high' },
    { dimension: 'visual', severity: 'high' },
    { dimension: 'visual', severity: 'high' },
    { dimension: 'credibility', severity: 'high' },
    { dimension: 'credibility', severity: 'high' },
  ];
  const { aiSmell } = computeScores(makeModel(), hits);
  assert.equal(aiSmell, 100);
});

test('specific address boosts businessSpecificity', () => {
  const body = 'Visit us at 12 Otley Road, Headingley LS6 2AL. Call 0113 245 6789.';
  const { businessSpecificity } = computeScores(makeModel(body), []);
  assert.ok(businessSpecificity > 40, `Expected >40, got ${businessSpecificity}`);
});

test('credential number boosts humanity', () => {
  const body = 'James Clarke MCSP SRA 412885 treats patients at our clinic. Price £45 per session. Price £60 per hour.';
  const { humanity } = computeScores(makeModel(body), []);
  assert.ok(humanity > 30, `Expected >30, got ${humanity}`);
});

test('generic text produces low humanity', () => {
  const body = 'We offer innovative solutions to transform your business seamlessly.';
  const { humanity } = computeScores(makeModel(body), []);
  assert.equal(humanity, 0);
});
