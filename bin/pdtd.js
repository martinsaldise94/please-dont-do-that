#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs, MISSING_VALUE } from '../cli/args.js';
import { runScan } from '../core/scanner.js';
import { formatHuman } from '../cli/output/human.js';
import { formatRoast } from '../cli/output/roast.js';
import { formatJSON } from '../cli/output/json.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const HELP = `PDTD — Please Don't Do That
Scan a frontend project and score how generic it is.

Usage:
  pdtd <command> [options]

Commands:
  scan <path>    Analyze a project and report how generic it is
  roast <path>   Same analysis, blunt tone

Options:
  --json         Output machine-readable JSON
  --rules <v>    Pin a rules version (default: v1)
  --industry <n> Score against an industry lexicon (11 ids, see docs/scoring.md)
  -v, --version  Print the CLI version
  -h, --help     Show this help

Docs: https://github.com/martinsaldise94/please-dont-do-that
`;

export async function run(argv) {
  const opts = parseArgs(argv);

  if (opts.version) {
    process.stdout.write(`${pkg.version}\n`);
    return 0;
  }

  if (opts.help || !opts.command) {
    process.stdout.write(HELP);
    return 0;
  }

  if (opts.command === 'scan' || opts.command === 'roast') {
    if (!opts.path) {
      process.stderr.write(`Usage: pdtd ${opts.command} <path>\n`);
      return 1;
    }

    if (opts.industry === MISSING_VALUE) {
      process.stderr.write('Error: --industry requires a value\n');
      return 1;
    }

    try {
      const result = await runScan(opts.path, {
        rulesVersion: opts.rules,
        industry: opts.industry,
      });

      if (opts.json) {
        process.stdout.write(formatJSON(result) + '\n');
      } else if (opts.command === 'roast') {
        process.stdout.write(formatRoast(result));
      } else {
        process.stdout.write(formatHuman(result));
      }
      return 0;
    } catch (err) {
      process.stderr.write(`Error: ${err.message}\n`);
      return 1;
    }
  }

  process.stderr.write(`Unknown command: ${opts.command}\n\n${HELP}`);
  return 1;
}

if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  run(process.argv)
    .then((code) => process.exit(code))
    .catch((err) => {
      process.stderr.write(`Fatal: ${err.message}\n`);
      process.exit(1);
    });
}
