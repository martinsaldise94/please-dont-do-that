import { readFileSync } from 'node:fs';
import { parseProject } from './parser/index.js';
import { loadRules } from './rules/loader.js';
import { runEngine } from './rules/engine.js';
import { computeScores } from './scorer/index.js';
import { resolveIndustry, INDUSTRY_IDS } from './scorer/industries/index.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

export async function runScan(targetPath, { rulesVersion = 'v1', industry = null } = {}) {
  const profile = industry ? resolveIndustry(industry) : null;
  if (industry && !profile) {
    throw new Error(`Unknown industry: "${industry}". Available: ${INDUSTRY_IDS.join(', ')}`);
  }

  const model = parseProject(targetPath);
  const rules = await loadRules(rulesVersion);
  const hits = runEngine(model, rules);
  const { scores, industrySignals } = computeScores(model, hits, profile);

  return {
    schemaVersion: '2',
    pdtdVersion: pkg.version,
    engineVersion: profile ? 'v2' : 'v1',
    rulesVersion,
    detectedLang: model.lang,
    industry: profile?.id ?? null,
    industrySignals,
    scores,
    issues: hits,
  };
}
