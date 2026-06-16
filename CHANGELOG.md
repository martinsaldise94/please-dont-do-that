# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Project scaffolding: `package.json` (ESM, `node:test` runner, `c8` coverage),
  ESLint + Prettier config, and a GitHub Actions CI workflow.
- Minimal `pdtd` CLI binary supporting `--version`, `--help`, and command
  dispatch for `scan` / `roast` (not implemented yet).
- Integration tests covering the CLI entry point.
