import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { runScan } from '../core/scanner.js';

const generic = fileURLToPath(new URL('../corpus/generic/clinics/claude-en-01', import.meta.url));

test('scan without an industry emits null industry fields', async () => {
  const result = await runScan(generic);
  assert.equal(result.schemaVersion, '2');
  assert.equal(result.engineVersion, 'v1');
  assert.equal(result.industry, null);
  assert.equal(result.industrySignals, null);
});

test('an industry alias resolves and reports engine v2', async () => {
  const result = await runScan(generic, { industry: 'physiotherapy' });
  assert.equal(result.engineVersion, 'v2');
  assert.equal(result.industry, 'clinics');
  assert.equal(typeof result.industrySignals.adjustment, 'number');
});

test('an unknown industry throws listing the valid ids', async () => {
  await assert.rejects(
    () => runScan(generic, { industry: 'taxidermy' }),
    (err) => err.message.includes('taxidermy') && err.message.includes('clinics'),
  );
});

test('industry scoring leaves aiSmell and humanity untouched', async () => {
  const plain = await runScan(generic);
  const scored = await runScan(generic, { industry: 'clinics' });
  assert.equal(plain.scores.aiSmell, scored.scores.aiSmell);
  assert.equal(plain.scores.humanity, scored.scores.humanity);
});

test('issue locations are relative to the scanned root', async () => {
  const result = await runScan(generic);
  assert.ok(result.issues.length > 0);
  for (const issue of result.issues) assert.equal(issue.location, 'index.html');
});
