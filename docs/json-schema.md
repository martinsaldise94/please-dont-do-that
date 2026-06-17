# PDTD `--json` Output Contract

The `pdtd scan <path> --json` command produces a machine-readable JSON object.  
**This output is a public contract.** Its shape never changes without a MAJOR CLI version bump.

The schema is defined in [`schemas/scan-output-v1.json`](../schemas/scan-output-v1.json).

---

## Example output

```json
{
  "schemaVersion": "1",
  "pdtdVersion": "0.1.0",
  "engineVersion": "v1",
  "rulesVersion": "v1",
  "detectedLang": "en",
  "scores": {
    "aiSmell": 82,
    "businessSpecificity": 18,
    "humanity": 10
  },
  "issues": [
    {
      "ruleId": "C01",
      "dimension": "copy",
      "severity": "high",
      "message": "Generic buzzwords detected",
      "evidence": ["innovation", "excellence", "solutions", "seamless", "leverage"],
      "location": "index.html"
    },
    {
      "ruleId": "L01",
      "dimension": "layout",
      "severity": "high",
      "message": "Classic SaaS landing page template detected",
      "evidence": ["hero", "features", "testimonials"],
      "location": "index.html"
    }
  ]
}
```

---

## Fields

| Field | Type | Notes |
|---|---|---|
| `schemaVersion` | `"1"` | Always the string `"1"` for schema v1 |
| `pdtdVersion` | SemVer string | CLI version that produced the output |
| `engineVersion` | `"v1"` / `"v2"` / `"v3"` | Analysis engine used |
| `rulesVersion` | `"v1"` / `"v2"` / … | Rule set used (selected via `--rules`) |
| `detectedLang` | `"en"` / `"es"` / `"unknown"` | Content language detected in the project |
| `scores.aiSmell` | integer 0–100 | Generic landing-page pattern density |
| `scores.businessSpecificity` | integer 0–100 | How specific to this actual business |
| `scores.humanity` | integer 0–100 | Real, verifiable elements present |
| `issues[].ruleId` | string | Stable ID — never changes within a rules version |
| `issues[].dimension` | `copy` / `layout` / `visual` / `credibility` | Detection dimension |
| `issues[].severity` | `high` / `medium` / `low` | Impact weight |
| `issues[].message` | string | Human-readable description |
| `issues[].evidence` | string[] | Excerpts or class names that triggered the rule |
| `issues[].location` | string | File path relative to scanned root |

---

## Versioning policy

- **Schema version** (`schemaVersion`) is independent of CLI SemVer.
- Schema v1 is frozen. New fields can never be added without a MAJOR bump.
- Agents and integrations should pin to `schemaVersion: "1"` and reject unknown values.
