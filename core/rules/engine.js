// Runs all rules against the model in deterministic order and returns the flat list of hits.
export function runEngine(model, rules) {
  const hits = [];
  for (const rule of rules) {
    const ruleHits = rule.run(model);
    hits.push(...ruleHits);
  }
  return hits;
}
