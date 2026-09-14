import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const bin = fileURLToPath(new URL('../bin/pdtd.js', import.meta.url));
const corpusGeneric = fileURLToPath(
  new URL('../corpus/generic/clinics/claude-en-01', import.meta.url),
);
const corpusSpecific = fileURLToPath(
  new URL('../corpus/specific/clinics/clarke-martinez-physio-en', import.meta.url),
);

function runCli(args, opts = {}) {
  try {
    const stdout = execFileSync(process.execPath, [bin, ...args], {
      encoding: 'utf8',
      timeout: opts.timeout ?? 15000,
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout?.toString() ?? '',
      stderr: err.stderr?.toString() ?? '',
    };
  }
}

test('--version prints the package version', () => {
  const { code, stdout } = runCli(['--version']);
  assert.equal(code, 0);
  assert.match(stdout.trim(), /^\d+\.\d+\.\d+$/);
});

test('--help prints usage and the available commands', () => {
  const { code, stdout } = runCli(['--help']);
  assert.equal(code, 0);
  assert.match(stdout, /Usage:/);
  assert.match(stdout, /scan/);
  assert.match(stdout, /roast/);
});

test('no arguments shows help and exits 0', () => {
  const { code, stdout } = runCli([]);
  assert.equal(code, 0);
  assert.match(stdout, /Usage:/);
});

test('an unknown command exits non-zero', () => {
  const { code, stderr } = runCli(['frobnicate']);
  assert.notEqual(code, 0);
  assert.match(stderr, /Unknown command/);
});

test('scan without a path exits non-zero', () => {
  const { code, stderr } = runCli(['scan']);
  assert.notEqual(code, 0);
  assert.match(stderr, /Usage:/);
});

test('scan on a non-existent path exits non-zero with error', () => {
  const { code, stderr } = runCli(['scan', '/nonexistent/path/xyz']);
  assert.notEqual(code, 0);
  assert.match(stderr, /Error/i);
});

test('scan on a generic corpus example exits 0 and prints scores', () => {
  const { code, stdout } = runCli(['scan', corpusGeneric]);
  assert.equal(code, 0);
  assert.match(stdout, /AI Smell Score/);
  assert.match(stdout, /Business Specificity/);
  assert.match(stdout, /Humanity Score/);
});

test('scan --json outputs valid JSON conforming to schema v2', () => {
  const { code, stdout } = runCli(['scan', corpusGeneric, '--json']);
  assert.equal(code, 0);
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.schemaVersion, '2');
  assert.match(parsed.pdtdVersion, /^\d+\.\d+\.\d+$/);
  assert.equal(parsed.engineVersion, 'v1');
  assert.equal(parsed.rulesVersion, 'v1');
  assert.ok(['en', 'es', 'unknown'].includes(parsed.detectedLang));
  assert.ok(parsed.scores.aiSmell >= 0 && parsed.scores.aiSmell <= 100);
  assert.ok(parsed.scores.businessSpecificity >= 0 && parsed.scores.businessSpecificity <= 100);
  assert.ok(parsed.scores.humanity >= 0 && parsed.scores.humanity <= 100);
  assert.ok(Array.isArray(parsed.issues));
});

test('generic corpus example scores higher AI Smell than specific', () => {
  const { stdout: gOut } = runCli(['scan', corpusGeneric, '--json']);
  const { stdout: sOut } = runCli(['scan', corpusSpecific, '--json']);
  const generic = JSON.parse(gOut);
  const specific = JSON.parse(sOut);
  assert.ok(
    generic.scores.aiSmell > specific.scores.aiSmell,
    `Expected generic aiSmell (${generic.scores.aiSmell}) > specific aiSmell (${specific.scores.aiSmell})`,
  );
});

test('--rules unknown-version exits non-zero', () => {
  const { code, stderr } = runCli(['scan', corpusGeneric, '--rules', 'v99']);
  assert.notEqual(code, 0);
  assert.match(stderr, /Error/i);
});

test('roast outputs different header than scan', () => {
  const { code: rCode, stdout: rOut } = runCli(['roast', corpusGeneric]);
  const { code: sCode, stdout: sOut } = runCli(['scan', corpusGeneric]);
  assert.equal(rCode, 0);
  assert.equal(sCode, 0);
  assert.match(rOut, /Roast Mode/);
  assert.doesNotMatch(rOut, /Scan Results/);
  assert.doesNotMatch(sOut, /Roast Mode/);
});

test('roast --json produces same scores as scan --json', () => {
  const { stdout: rOut } = runCli(['roast', corpusGeneric, '--json']);
  const { stdout: sOut } = runCli(['scan', corpusGeneric, '--json']);
  const roast = JSON.parse(rOut);
  const scan = JSON.parse(sOut);
  assert.deepEqual(roast.scores, scan.scores);
  assert.deepEqual(roast.issues, scan.issues);
});

test('scan --industry with an unknown id exits non-zero', () => {
  const { code, stderr } = runCli(['scan', corpusGeneric, '--industry', 'taxidermy']);
  assert.notEqual(code, 0);
  assert.match(stderr, /Unknown industry/i);
});

test('scan --industry with no value exits non-zero instead of eating the next flag', () => {
  const { code, stderr } = runCli(['scan', corpusGeneric, '--industry', '--json']);
  assert.notEqual(code, 0);
  assert.match(stderr, /--industry/);
});

test('scan --industry as the last argument exits non-zero', () => {
  const { code, stderr } = runCli(['scan', corpusGeneric, '--industry']);
  assert.notEqual(code, 0);
  assert.match(stderr, /--industry requires a value/);
});

test('scan --industry with a valid id exits 0 and reports engine v2', () => {
  const { code, stdout } = runCli(['scan', corpusGeneric, '--industry', 'clinics', '--json']);
  assert.equal(code, 0);
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.engineVersion, 'v2');
  assert.equal(parsed.industry, 'clinics');
});
