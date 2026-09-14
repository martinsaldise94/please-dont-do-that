# PDTD `--json` Output Contract

The `pdtd scan <path> --json` command produces a machine-readable JSON object.  
**This output is a public contract.** Its shape never changes without a MAJOR CLI version bump.

The current schema is [`schemas/scan-output-v2.json`](../schemas/scan-output-v2.json), emitted by pdtd 0.2.x.
[`schemas/scan-output-v1.json`](../schemas/scan-output-v1.json) stays on disk unchanged: it documents what 0.1.x emitted.

---

## Example output

With `--industry clinics`:

```json
{
  "schemaVersion": "2",
  "pdtdVersion": "0.2.0",
  "engineVersion": "v2",
  "rulesVersion": "v1",
  "detectedLang": "en",
  "industry": "clinics",
  "industrySignals": {
    "matchedTerms": ["dry needling", "McKenzie Method", "HCPC", "MCSP", "sciatica"],
    "matchedCategories": ["treatments", "bodies", "conditions"],
    "missingCategories": [],
    "adjustment": 20
  },
  "scores": {
    "aiSmell": 20,
    "businessSpecificity": 100,
    "humanity": 75
  },
  "issues": [
    {
      "ruleId": "L01",
      "dimension": "layout",
      "severity": "medium",
      "message": "Classic SaaS landing page template detected",
      "evidence": ["hero", "testimonials"],
      "location": "index.html"
    }
  ]
}
```

Without `--industry` the shape is identical: `engineVersion` is `"v1"`, and `industry` and `industrySignals` are both `null`. One shape, always, so consumers never branch on flags.

---

## Fields

| Field | Type | Notes |
|---|---|---|
| `schemaVersion` | `"2"` | Always the string `"2"` for schema v2 |
| `pdtdVersion` | SemVer string | CLI version that produced the output |
| `engineVersion` | `"v1"` / `"v2"` | `"v2"` only when `--industry` is supplied |
| `rulesVersion` | `"v1"` / `"v2"` / … | Rule set used (selected via `--rules`) |
| `detectedLang` | `"en"` / `"es"` / `"unknown"` | Content language detected in the project |
| `industry` | string / `null` | Canonical industry id the scan was scored against |
| `industrySignals` | object / `null` | Industry vocabulary breakdown, see below |
| `industrySignals.matchedTerms` | string[] (max 12) | Distinct lexicon terms found, in lexicon declaration order |
| `industrySignals.matchedCategories` | string[] | Lexicon categories with at least one match |
| `industrySignals.missingCategories` | string[] | Lexicon categories with no match |
| `industrySignals.adjustment` | integer −30…+30 | Total applied to `businessSpecificity` (base + breadth bonus) |
| `scores.aiSmell` | integer 0–100 | Generic landing-page pattern density |
| `scores.businessSpecificity` | integer 0–100 | How specific to this actual business; includes `adjustment` |
| `scores.humanity` | integer 0–100 | Real, verifiable elements present |
| `issues[].ruleId` | string | Stable ID — never changes within a rules version |
| `issues[].dimension` | `copy` / `layout` / `visual` / `credibility` | Detection dimension |
| `issues[].severity` | `high` / `medium` / `low` | Impact weight |
| `issues[].message` | string | Human-readable description |
| `issues[].evidence` | string[] | Excerpts or class names that triggered the rule |
| `issues[].location` | string | File path relative to the scanned root, always with `/` |

`adjustment` makes the score reconstructible: `businessSpecificity` is the engine v1 value plus `adjustment`, clamped to 0–100.

---

## Changes from schema v1

- Added `industry` and `industrySignals` (both required, nullable).
- `engineVersion` can now be `"v2"`.
- `issues[].location` now honours its documented meaning. 0.1.x emitted the path as typed relative to the working directory, with `\` on Windows; 0.2.x emits it relative to the scanned root with `/` on every platform, and files are ordered by that path.
- Evidence strings are cleaner: headings and CTAs collapse line breaks, statistics keep decimals and thousands separators whole, and text from adjacent block elements no longer fuses into one word. This moved `aiSmell` on a few generic corpus pages whose statistics were mis-detected.

---

## Versioning policy

- **Schema version** (`schemaVersion`) is independent of CLI SemVer.
- Schema v2 is frozen. New fields can never be added without a MAJOR bump.
- Agents and integrations should pin to `schemaVersion: "2"` and reject unknown values.
