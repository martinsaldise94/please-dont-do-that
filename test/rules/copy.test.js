import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyRules } from '../../rules/v1/copy.js';

function makeModel(bodyText, ctaTexts = [], lang = 'en') {
  return { files: [{ path: 'test.html', bodyText, ctaTexts, lang }] };
}

const [C01, C02, C03] = copyRules;

// ── C01 — Buzzwords ──────────────────────────────────────────────────────────

test('C01: fires on multiple English buzzwords', () => {
  const model = makeModel('We offer innovative solutions with excellence and seamless synergy.');
  const hits = C01.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].ruleId, 'C01');
});

test('C01: fires on multiple Spanish buzzwords', () => {
  const model = makeModel('Ofrecemos soluciones innovadoras con excelencia y transformación digital.', [], 'es');
  const hits = C01.run(model);
  assert.ok(hits.length > 0);
});

test('C01: does not fire on one buzzword alone', () => {
  const model = makeModel('We build innovative apps.');
  const hits = C01.run(model);
  assert.equal(hits.length, 0);
});

test('C01: marks high severity for many buzzwords', () => {
  const model = makeModel('innovative excellence solutions revolutionary cutting-edge state-of-the-art world-class seamless');
  const hits = C01.run(model);
  assert.equal(hits[0].severity, 'high');
});

// ── C02 — Generic CTA ────────────────────────────────────────────────────────

test('C02: fires on English generic CTAs', () => {
  const model = makeModel('', ['Get Started', 'Book a Demo', 'Learn More']);
  const hits = C02.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].ruleId, 'C02');
});

test('C02: fires on Spanish generic CTAs', () => {
  const model = makeModel('', ['Comenzar ahora', 'Prueba gratis'], 'es');
  const hits = C02.run(model);
  assert.ok(hits.length > 0);
});

test('C02: does not fire on specific CTA text', () => {
  const model = makeModel('', ['Call 0113 245 6789', 'Visit us at 12 Otley Road']);
  const hits = C02.run(model);
  assert.equal(hits.length, 0);
});

// ── C03 — Trust language ─────────────────────────────────────────────────────

test('C03: fires on English trust claims', () => {
  const model = makeModel('Trusted by thousands of businesses worldwide. Join millions of happy customers.');
  const hits = C03.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].ruleId, 'C03');
});

test('C03: fires on Spanish trust claims', () => {
  const model = makeModel('Miles de clientes confían en nosotros cada día.', [], 'es');
  const hits = C03.run(model);
  assert.ok(hits.length > 0);
});

test('C03: does not fire on specific numbers with context', () => {
  const model = makeModel('James Clarke has 12 years of experience treating NHS patients.');
  const hits = C03.run(model);
  assert.equal(hits.length, 0);
});
