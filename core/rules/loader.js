const AVAILABLE = new Set(['v1']);

export async function loadRules(version) {
  if (!AVAILABLE.has(version)) {
    throw new Error(`Unknown rules version: "${version}". Available: ${[...AVAILABLE].join(', ')}`);
  }
  const { rules } = await import(`../../rules/${version}/index.js`);
  return rules;
}
