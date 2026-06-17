import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { discoverFiles } from '../../core/parser/discover.js';

const corpusDir = fileURLToPath(new URL('../../corpus/generic/clinics/claude-en-01', import.meta.url));
const corpusRoot = fileURLToPath(new URL('../../corpus/generic/clinics', import.meta.url));

test('discovers index.html in a corpus folder', () => {
  const files = discoverFiles(corpusDir);
  assert.ok(files.some((f) => f.endsWith('index.html')));
});

test('returns sorted paths (deterministic order)', () => {
  const files = discoverFiles(corpusRoot);
  const sorted = [...files].sort();
  assert.deepEqual(files, sorted);
});

test('does not include .json files', () => {
  const files = discoverFiles(corpusDir);
  assert.ok(files.every((f) => !f.endsWith('.json')));
});

test('returns empty array for empty or non-existent directory', () => {
  // Non-existent path — discover returns [] instead of throwing
  const files = discoverFiles('/nonexistent/path/xyz');
  assert.deepEqual(files, []);
});
