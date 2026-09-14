import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeScores } from '../core/scorer/index.js';
import { resolveIndustry } from '../core/scorer/industries/index.js';

function makeModel(bodyText = '') {
  return { files: [{ path: 'test.html', bodyText }], lang: 'en' };
}

test('all scores are integers in 0–100 range', () => {
  const { scores } = computeScores(makeModel(), []);
  for (const key of ['aiSmell', 'businessSpecificity', 'humanity']) {
    assert.ok(Number.isInteger(scores[key]), `${key} must be integer`);
    assert.ok(scores[key] >= 0 && scores[key] <= 100, `${key} must be 0–100`);
  }
});

test('no hits → AI Smell is 0', () => {
  const { scores } = computeScores(makeModel(), []);
  assert.equal(scores.aiSmell, 0);
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
  const { scores } = computeScores(makeModel(), hits);
  assert.equal(scores.aiSmell, 100);
});

test('specific address boosts businessSpecificity', () => {
  const body = 'Visit us at 12 Otley Road, Headingley LS6 2AL. Call 0113 245 6789.';
  const { scores } = computeScores(makeModel(body), []);
  assert.ok(scores.businessSpecificity > 40, `Expected >40, got ${scores.businessSpecificity}`);
});

test('credential number boosts humanity', () => {
  const body =
    'James Clarke MCSP SRA 412885 treats patients at our clinic. Price £45 per session. Price £60 per hour.';
  const { scores } = computeScores(makeModel(body), []);
  assert.ok(scores.humanity > 30, `Expected >30, got ${scores.humanity}`);
});

test('generic text produces low humanity', () => {
  const body = 'We offer innovative solutions to transform your business seamlessly.';
  const { scores } = computeScores(makeModel(body), []);
  assert.equal(scores.humanity, 0);
});

test('no industry profile leaves businessSpecificity untouched', () => {
  const body = 'Visit us at 12 Otley Road, Headingley LS6 2AL. Call 0113 245 6789.';
  const withoutArg = computeScores(makeModel(body), []);
  const withNull = computeScores(makeModel(body), [], null);
  assert.equal(withoutArg.scores.businessSpecificity, withNull.scores.businessSpecificity);
  assert.equal(withoutArg.industrySignals, null);
});

test('industry profile applies its adjustment to businessSpecificity', () => {
  const body = 'We provide excellent care with a holistic approach. Book now.';
  const base = computeScores(makeModel(body), []);
  const scored = computeScores(makeModel(body), [], resolveIndustry('clinics'));
  assert.equal(scored.industrySignals.adjustment, -30);
  assert.equal(
    scored.scores.businessSpecificity,
    Math.max(0, base.scores.businessSpecificity - 30),
  );
});

test('adjusted businessSpecificity stays clamped to 0-100', () => {
  const { scores } = computeScores(makeModel('nothing specific'), [], resolveIndustry('clinics'));
  assert.ok(scores.businessSpecificity >= 0 && scores.businessSpecificity <= 100);
});
