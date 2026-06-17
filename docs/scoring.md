# PDTD Scoring Methodology

Three scores, each 0–100. All deterministic: same input + same engine + same rules → same output.

---

## AI Smell Score

Measures how much the site matches generic AI-generated landing-page patterns.

**Higher = more generic. Lower = more distinctive.**

### Formula

```
aiSmell = Σ (dimensionWeight[d] × dimensionScore[d])
```

Dimension weights (sum to 1):

| Dimension | Weight |
|---|---|
| Copy | 0.40 |
| Layout | 0.30 |
| Visual | 0.20 |
| Credibility | 0.10 |

Dimension score (0–100):

```
dimensionScore[d] = min(100, (Σ severityWeight[hit] / maxPossible[d]) × 100)
```

Severity weights:

| Severity | Weight |
|---|---|
| high | 3 |
| medium | 2 |
| low | 1 |

`maxPossible[d]` = number of rules in dimension × 3 (all firing at high severity).

---

## Business Specificity Score

Measures whether the site is genuinely specific to its business.
**The core question: could this site belong to another company unchanged?**

**Higher = more specific to this business.**

### Formula

```
businessSpecificity = inverseGenericness + specificitySignals
```

| Part | Max contribution | What it measures |
|---|---|---|
| inverseGenericness | 50 pts | `(100 − aiSmell) × 0.5` |
| specificitySignals | 50 pts | Positive specificity signals detected |

Specificity signals (additive, capped at 50):

| Signal | Points |
|---|---|
| Physical street address | 25 |
| Postal/ZIP code | 10 |
| Phone number | 15 |
| Specific price with currency (per price, up to 3) | 8 |
| Professional credential/licence number | 20 |

---

## Humanity Score

Measures the presence of real, verifiable elements as opposed to invented placeholders.

**Higher = more real. Lower = more placeholder.**

### Formula

Additive signal score, capped at 100:

| Signal | Points |
|---|---|
| Physical street address | 25 |
| Phone number | 10 |
| Named person with professional credential | 20 |
| Licence/registration number (Gas Safe, SRA, CIF, CFCM…) | 25 |
| Specific price with currency (2+ found) | 20 |

---

## Weights versioning

Weights are tied to the **rules version**, not the CLI version.  
A rules version update that changes weights must increment the rules version (`v2`, `v3`, …).  
Engine v1 uses the weights above.
