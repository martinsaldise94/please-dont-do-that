import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runScan } from '../core/scanner.js';

const generic = fileURLToPath(new URL('../corpus/generic/clinics/claude-en-01', import.meta.url));
const schema = JSON.parse(
  readFileSync(new URL('../schemas/scan-output-v2.json', import.meta.url), 'utf8'),
);

const sorted = (obj) => Object.keys(obj).sort();

for (const industry of [null, 'clinics']) {
  test(`scan output carries exactly the schema v2 top-level keys (industry: ${industry})`, async () => {
    const result = await runScan(generic, { industry });
    assert.deepEqual(sorted(result), sorted(schema.properties));
    assert.deepEqual([...schema.required].sort(), sorted(schema.properties));
    assert.equal(result.schemaVersion, schema.properties.schemaVersion.const);
  });
}

test('industrySignals carries exactly its declared keys', async () => {
  const result = await runScan(generic, { industry: 'clinics' });
  const declared = schema.properties.industrySignals;
  assert.deepEqual(sorted(result.industrySignals), sorted(declared.properties));
  assert.ok(
    result.industrySignals.matchedTerms.length <= declared.properties.matchedTerms.maxItems,
  );
  const { minimum, maximum } = declared.properties.adjustment;
  assert.ok(
    result.industrySignals.adjustment >= minimum && result.industrySignals.adjustment <= maximum,
  );
});

test('every issue uses only the declared issue keys', async () => {
  const result = await runScan(generic);
  const declared = schema.properties.issues.items;
  for (const issue of result.issues) {
    for (const key of Object.keys(issue)) {
      assert.ok(key in declared.properties, `undeclared issue key: ${key}`);
    }
    for (const key of declared.required) {
      assert.ok(key in issue, `missing required issue key: ${key}`);
    }
  }
});
