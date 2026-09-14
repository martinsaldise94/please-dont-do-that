/**
 * Calibration tests: run the scanner on corpus examples and verify that each
 * example's scores fall within the expectedScores ranges declared in meta.json.
 *
 * These are the "ground truth" tests. If they fail, it means either:
 *  a) The rules need tuning, or
 *  b) The corpus meta.json expected ranges need adjustment.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runScan } from '../../core/scanner.js';

const corpusRoot = fileURLToPath(new URL('../../corpus', import.meta.url));

// A representative sample from each class to keep CI fast.
const SAMPLE = [
  // generic (aiSmell should be high, businessSpecificity low)
  'generic/clinics/claude-en-01',
  'generic/saas-startup/claude-en-01',
  'generic/fitness-gym/claude-es-01',
  'generic/restaurants/claude-en-01',
  // specific (aiSmell should be low, businessSpecificity high)
  'specific/clinics/clarke-martinez-physio-en',
  'specific/saas-startup/patchboard-en',
  'specific/home-services/brightwater-plumbing-en',
  'specific/professional-services/whitfield-solicitors-en',
];

for (const rel of SAMPLE) {
  test(`calibration: ${rel}`, async () => {
    const dir = join(corpusRoot, rel);
    const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'));
    const result = await runScan(dir);

    const { aiSmell: aiRange, businessSpecificity: bsRange } = meta.expectedScores;

    assert.ok(
      result.scores.aiSmell >= aiRange[0] && result.scores.aiSmell <= aiRange[1],
      `${rel} — aiSmell ${result.scores.aiSmell} not in [${aiRange}]`,
    );
    assert.ok(
      result.scores.businessSpecificity >= bsRange[0] &&
        result.scores.businessSpecificity <= bsRange[1],
      `${rel} — businessSpecificity ${result.scores.businessSpecificity} not in [${bsRange}]`,
    );
  });
}

// the product claim: naming the industry must sharpen the generic/specific split,
// not merely shift both scores in the same direction
for (const specificRel of SAMPLE.filter((rel) => rel.startsWith('specific/'))) {
  const meta = JSON.parse(readFileSync(join(corpusRoot, specificRel, 'meta.json'), 'utf8'));
  const genericRel = `generic/${meta.industry}/claude-${meta.language}-01`;

  test(`separation widens with --industry ${meta.industry} (${meta.language})`, async () => {
    const gap = async (opts) => {
      const generic = await runScan(join(corpusRoot, genericRel), opts);
      const specific = await runScan(join(corpusRoot, specificRel), opts);
      return specific.scores.businessSpecificity - generic.scores.businessSpecificity;
    };

    const plainGap = await gap({});
    const industryGap = await gap({ industry: meta.industry });

    assert.ok(
      industryGap > plainGap,
      `${meta.industry}: gap did not widen — without ${plainGap}, with ${industryGap}`,
    );
  });
}
