# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Greenfield. As of this writing the repository contains only the project spec (`README.md`) and this file — no source code, build tooling, or tests exist yet. There are therefore **no build/lint/test commands to run yet**. When scaffolding, the stack implied by the spec is a Node CLI distributed via npm/npx (`npx pdtd`). Establish `package.json`, the test runner, and lint config before writing feature code, and update this file with the real commands once they exist.

## What PDTD is (and is not)

PDTD is a CLI that scans a frontend project and scores how *generic* it is — i.e. whether the site is specific to its business or could belong to thousands of other companies. It targets the homogeneous patterns that AI codegen tools (Claude, ChatGPT, Lovable, Bolt, v0, Cursor) tend to emit.

It explicitly does **not** try to detect "was this made by AI." The whole product is framed around one question: *could this site belong to another business unchanged?* If yes → penalize heavily. Keep this framing central when designing rules and scoring — it is the thing that distinguishes PDTD from generic code-quality / a11y / SEO / perf linters.

## Architecture

The intended layout (see `README.md` for the canonical tree):

- `cli/` — argument parsing, command dispatch (`scan`, `roast`), output formatting (human + `--json`).
- `core/parser/` — turns frontend source into an AST / analyzable model.
- `core/rules/` — rule engine that runs detection rules against the parsed model.
- `core/scorer/` — aggregates rule hits into the published scores.
- `rules/v1/`, `rules/v2/`, ... — the actual detection rules, versioned as independent, swappable sets.
- `prompts/` — prompt assets for LLM-assisted scoring (engine v3) and agent usage.
- `docs/`.

The non-obvious design keystone is **three independent versioning layers** — do not conflate them:

1. **CLI version** — SemVer of the tool itself.
2. **Engine version** — the analysis motor: `v1` AST+heuristics → `v2` advanced scoring → `v3` LLM-assisted.
3. **Rules version** — selectable at runtime via `pdtd scan . --rules v2`. Engine and rules are intended to be interchangeable.

### Versioning invariants (treat as hard constraints)

- **Never change scan output without a MAJOR bump.** Output is a contract other tools/agents integrate against.
- **Scans must be reproducible** — same input + same engine + same rules version → same output.
- The CLI must not break integrations without notice.

These constraints mean: add new detections under a new `rules/vN`, don't silently mutate existing rule output; keep scoring deterministic (be deliberate about where/whether engine v3's LLM scoring is allowed to introduce nondeterminism).

## The scoring model

Three scores, all 0–100, are the product's core output:

- **AI Smell Score** — prevalence of generic-landing patterns.
- **Business Specificity Score** — how specific the site is to its actual business.
- **Humanity Score** — presence of real vs. generic/invented elements.

Detection spans four dimensions: **Copy** (empty buzzwords like innovation/excellence/solutions, generic CTAs), **Layout** (classic SaaS template, repeated cards, predictable structure), **Visual** (excessive gradients, blur blobs, generic Tailwind look), and **Credibility** (fake testimonials, sourceless stats, invented dashboards).

## Commands the CLI must support

```bash
pdtd scan .                          # default human-readable report
pdtd roast .                         # same analysis, blunt tone
pdtd scan . --json                   # machine-readable (the stable integration contract)
pdtd scan . --rules v2               # pin a rules version
pdtd scan . --industry physiotherapy # industry-aware specificity scoring
```

## Future direction

PDTD is meant to close a loop with coding agents (MCP/agent flow): *agent generates site → PDTD scores + lists issues → agent improves output.* The `--json` output and the prompt assets in `prompts/` are what make PDTD usable as an agent "skill," so keep that interface stable and machine-consumable.
