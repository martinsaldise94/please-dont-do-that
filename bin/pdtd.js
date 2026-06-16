#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

const HELP = `PDTD — Please Don't Do That
Scan a frontend project and score how generic it is.

Usage:
  pdtd <command> [options]

Commands:
  scan <path>    Analyze a project and report how generic it is
  roast <path>   Same analysis, blunt tone

Options:
  -v, --version  Print the CLI version
  -h, --help     Show this help

Docs: https://github.com/martinsaldise94/please-dont-do-that
`;

/**
 * Run the CLI with a given argv (process.argv-shaped).
 * Returns the process exit code instead of calling process.exit,
 * so it stays testable.
 */
export function run(argv) {
  const args = argv.slice(2);

  if (args.includes("-v") || args.includes("--version")) {
    process.stdout.write(`${pkg.version}\n`);
    return 0;
  }

  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    process.stdout.write(HELP);
    return 0;
  }

  const command = args[0];
  switch (command) {
    case "scan":
    case "roast":
      process.stderr.write(`'${command}' is not implemented yet.\n`);
      return 1;
    default:
      process.stderr.write(`Unknown command: ${command}\n\n${HELP}`);
      return 1;
  }
}

// Only run when executed directly, not when imported by tests.
if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(run(process.argv));
}
