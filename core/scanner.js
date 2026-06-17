import { readFileSync } from 'node:fs';
import { parseProject } from './parser/index.js';
import { loadRules } from './rules/loader.js';
import { runEngine } from './rules/engine.js';
import { computeScores } from './scorer/index.js';

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

export async function runScan(targetPath, { rulesVersion = 'v1' } = {}) {
  const model = parseProject(targetPath);
  const rules = await loadRules(rulesVersion);
  const hits = runEngine(model, rules);
  const scores = computeScores(model, hits);

  return {
    schemaVersion: '1',
    pdtdVersion: pkg.version,
    engineVersion: 'v1',
    rulesVersion,
    detectedLang: model.lang,
    scores,
    issues: hits,
  };
}
