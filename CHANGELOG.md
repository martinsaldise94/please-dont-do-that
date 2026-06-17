# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-06-17

### Added

- Project scaffolding: `package.json` (ESM, `node:test` runner, `c8` coverage),
  ESLint + Prettier config, and a GitHub Actions CI workflow.
- Minimal `pdtd` CLI binary supporting `--version`, `--help`, and command
  dispatch for `scan` / `roast`.
- **Fase 0.5 — Corpus**: 44 Claude-generated HTML examples (22 generic + 22
  specific, EN + ES, 11 industries) with `meta.json` expected score ranges used
  for calibration tests.
- **Fase 0.7 — JSON schema**: `schemas/scan-output-v1.json` (frozen `--json`
  output contract), `docs/json-schema.md`, `docs/scoring.md` (scoring
  methodology).
- **Fase 1 — Parser**: `core/parser/` — HTML two-pass parser (`node-html-parser`),
  JSX text extractor, language detector (EN/ES/unknown), directory walker.
- **Fase 2 — Engine + Rules v1**: rule engine (`core/rules/`), versioned rule
  loader, four rule dimensions — Copy (C01–C03), Layout (L01–L03), Visual
  (V01–V03), Credibility (CR01–CR02) — with EN/ES dictionaries.
- **Fase 3 — Scorer**: `core/scorer/index.js` — weighted dimension scores for
  AI Smell, Business Specificity, and Humanity (all 0–100 integers).
- **Fase 4 — CLI scan**: `pdtd scan <path>` and `pdtd roast <path>` fully
  implemented. Human-readable report with bar charts and severity icons.
  `--json` outputs schema-validated machine-readable result. `--rules <v>`
  allows pinning a rules version. 78 tests, 0 failures.
