import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { runScan } from '../core/scanner.js';
import { formatHuman } from '../cli/output/human.js';
import { formatRoast } from '../cli/output/roast.js';

const generic = fileURLToPath(new URL('../corpus/generic/clinics/claude-en-01', import.meta.url));
const specific = fileURLToPath(
  new URL('../corpus/specific/clinics/clarke-martinez-physio-en', import.meta.url),
);

test('human output omits the industry line when there is no industry', async () => {
  const out = formatHuman(await runScan(generic));
  assert.ok(!out.includes('Industry:'));
  assert.ok(out.includes('Engine v1'));
});

test('human output shows the industry and the real engine version', async () => {
  const out = formatHuman(await runScan(generic, { industry: 'clinics' }));
  assert.ok(out.includes('Industry: clinics'));
  assert.ok(out.includes('0/3 signal groups matched'));
  assert.ok(out.includes('Engine v2'));
});

test('human output lists matched terms for a specific page', async () => {
  const out = formatHuman(await runScan(specific, { industry: 'clinics' }));
  assert.ok(out.includes('3/3 signal groups matched'));
  assert.ok(out.includes('dry needling'));
});

test('roast output mentions the industry when supplied', async () => {
  const out = formatRoast(await runScan(generic, { industry: 'clinics' }));
  assert.ok(out.toLowerCase().includes('clinics'));
});

test('roast output stays silent about industry when none is supplied', async () => {
  const out = formatRoast(await runScan(generic));
  assert.ok(!out.includes('Scored as'));
});
