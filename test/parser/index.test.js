import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseProject } from '../../core/parser/index.js';

function makeProject(t, files) {
  const root = mkdtempSync(join(tmpdir(), 'pdtd-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(join(root, rel, '..'), { recursive: true });
    writeFileSync(join(root, rel), content);
  }
  return root;
}

test('file paths are relative to the scanned root with forward slashes', (t) => {
  const root = makeProject(t, {
    'index.html': '<h1>Home</h1>',
    'src/pages/about.html': '<h1>About</h1>',
  });
  const { files } = parseProject(root);
  assert.deepEqual(
    files.map((f) => f.path),
    ['index.html', 'src/pages/about.html'],
  );
});

test('file order does not depend on the platform path separator', (t) => {
  const root = makeProject(t, {
    'a0.html': '<h1>Zero</h1>',
    'a/x.html': '<h1>Nested</h1>',
  });
  const { files } = parseProject(root);
  assert.deepEqual(
    files.map((f) => f.path),
    ['a/x.html', 'a0.html'],
  );
});

test('scanning a single file reports its bare file name', (t) => {
  const root = makeProject(t, { 'landing.html': '<h1>Home</h1>' });
  const { files } = parseProject(join(root, 'landing.html'));
  assert.deepEqual(
    files.map((f) => f.path),
    ['landing.html'],
  );
});
