const VALID_DIMS = new Set(['copy', 'layout', 'visual', 'credibility']);
const VALID_SEVS = new Set(['high', 'medium', 'low']);
const VALID_LANGS = new Set(['en', 'es', 'unknown']);

export function validateOutput(obj) {
  const errors = [];

  const required = ['schemaVersion', 'pdtdVersion', 'engineVersion', 'rulesVersion', 'detectedLang', 'scores', 'issues'];
  for (const field of required) {
    if (!(field in obj)) errors.push(`Missing required field: ${field}`);
  }

  if (obj.schemaVersion !== '1') errors.push(`schemaVersion must be "1", got "${obj.schemaVersion}"`);
  if (obj.pdtdVersion && !/^\d+\.\d+\.\d+$/.test(obj.pdtdVersion)) errors.push('pdtdVersion must be semver (x.y.z)');
  if (obj.engineVersion && !/^v\d+$/.test(obj.engineVersion)) errors.push('engineVersion must match v{n}');
  if (obj.rulesVersion && !/^v\d+$/.test(obj.rulesVersion)) errors.push('rulesVersion must match v{n}');
  if (obj.detectedLang && !VALID_LANGS.has(obj.detectedLang)) errors.push(`detectedLang must be one of: ${[...VALID_LANGS].join(', ')}`);

  if (obj.scores && typeof obj.scores === 'object') {
    for (const key of ['aiSmell', 'businessSpecificity', 'humanity']) {
      const v = obj.scores[key];
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 100) {
        errors.push(`scores.${key} must be integer 0–100`);
      }
    }
  }

  if (Array.isArray(obj.issues)) {
    for (let i = 0; i < obj.issues.length; i++) {
      const issue = obj.issues[i];
      if (!issue.ruleId) errors.push(`issues[${i}].ruleId is required`);
      if (!VALID_DIMS.has(issue.dimension)) errors.push(`issues[${i}].dimension invalid`);
      if (!VALID_SEVS.has(issue.severity)) errors.push(`issues[${i}].severity invalid`);
      if (!issue.message) errors.push(`issues[${i}].message is required`);
    }
  }

  return { valid: errors.length === 0, errors };
}
