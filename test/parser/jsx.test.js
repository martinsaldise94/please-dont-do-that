import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseJSX } from '../../core/parser/jsx.js';

test('headings spanning several source lines collapse to single spaces', () => {
  const jsx = `export const Hero = () => (
  <h1>
    Streamline Your
    Workflow Forever
  </h1>
);`;
  const r = parseJSX(jsx, 'Hero.jsx');
  assert.deepEqual(r.headings, ['Streamline Your Workflow Forever']);
});
