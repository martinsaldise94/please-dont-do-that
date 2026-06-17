import { readFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';
import { discoverFiles } from './discover.js';
import { parseHTML } from './html.js';
import { parseJSX } from './jsx.js';

export function parseProject(targetPath) {
  let stat;
  try {
    stat = statSync(targetPath);
  } catch {
    throw new Error(`Path not found: ${targetPath}`);
  }

  const filePaths = stat.isDirectory() ? discoverFiles(targetPath) : [targetPath];

  if (filePaths.length === 0) {
    return { files: [], lang: 'unknown' };
  }

  const files = filePaths.map((fp) => parseFile(fp)).filter(Boolean);

  const langs = files.map((f) => f.lang).filter((l) => l !== 'unknown');
  const counts = langs.reduce((acc, l) => { acc[l] = (acc[l] || 0) + 1; return acc; }, {});
  const lang = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown';

  return { files, lang };
}

function parseFile(filePath) {
  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }

  const ext = extname(filePath).toLowerCase();
  if (['.jsx', '.tsx'].includes(ext)) return parseJSX(content, filePath);
  return parseHTML(content, filePath);
}
