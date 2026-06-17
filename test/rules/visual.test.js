import { test } from 'node:test';
import assert from 'node:assert/strict';
import { visualRules } from '../../rules/v1/visual.js';

function makeModel({ cssClasses = new Set(), inlineStyles = '' } = {}) {
  return { files: [{ path: 'test.html', cssClasses, inlineStyles }] };
}

const [V01, V02, V03] = visualRules;

test('V01: fires on Tailwind gradient classes', () => {
  const model = makeModel({ cssClasses: new Set(['from-blue-500', 'to-purple-600', 'via-indigo-400', 'bg-gradient-to-r']) });
  const hits = V01.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].ruleId, 'V01');
});

test('V01: fires on CSS linear-gradient in inline styles', () => {
  const styles = 'background: linear-gradient(to right, #6366f1, #8b5cf6); background: linear-gradient(135deg, #4f46e5, #7c3aed); background: linear-gradient(to bottom, #1e40af, #3b82f6);';
  const model = makeModel({ inlineStyles: styles });
  const hits = V01.run(model);
  assert.ok(hits.length > 0);
});

test('V01: does not fire for a single gradient class', () => {
  const model = makeModel({ cssClasses: new Set(['from-blue-500']) });
  assert.equal(V01.run(model).length, 0);
});

test('V02: fires on multiple blur classes', () => {
  const model = makeModel({ cssClasses: new Set(['blur-xl', 'blur-2xl', 'rounded-full']) });
  const hits = V02.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].ruleId, 'V02');
});

test('V02: does not fire on a single blur class', () => {
  const model = makeModel({ cssClasses: new Set(['blur-xl']) });
  assert.equal(V02.run(model).length, 0);
});

test('V03: fires on heavy purple/blue Tailwind usage', () => {
  const model = makeModel({ cssClasses: new Set(['text-purple-600', 'bg-indigo-500', 'border-blue-400', 'hover:bg-indigo-600', 'text-blue-800']) });
  const hits = V03.run(model);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].ruleId, 'V03');
});

test('V03: does not fire on modest color usage', () => {
  const model = makeModel({ cssClasses: new Set(['text-purple-600', 'bg-white', 'text-gray-800']) });
  assert.equal(V03.run(model).length, 0);
});
