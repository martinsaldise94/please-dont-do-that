import { readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const IGNORE_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build', 'out', '.cache', 'coverage', '.svelte-kit', '.nuxt']);
const SUPPORTED_EXTS = new Set(['.html', '.htm', '.jsx', '.tsx', '.js', '.ts']);

export function discoverFiles(rootPath) {
  const found = [];

  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
          walk(join(dir, entry.name));
        }
      } else if (entry.isFile()) {
        if (SUPPORTED_EXTS.has(extname(entry.name).toLowerCase())) {
          found.push(join(dir, entry.name));
        }
      }
    }
  }

  walk(rootPath);
  return found.sort();
}
