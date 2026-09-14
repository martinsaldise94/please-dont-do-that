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

### Industry-aware specificity (engine v2)

Activated by `--industry <id>`. It sharpens the question to:

> Could this site belong to **another business in the same industry** unchanged?

A clinic page that says "excellent care with a holistic approach" could be any of ten thousand clinics. One that says "ACL rehabilitation, dry needling, HCPC" could not.

Each industry has a lexicon in `core/scorer/industries/<id>.js`: concrete vocabulary in exactly three categories, in English and Spanish.

Matching rules:

- Case- and accent-insensitive, whole words and phrases only. Hyphens count as spaces, so `free-range` matches "free range".
- A term matches its plural or singular form (`fichaje` matches "fichajes", `bolígrafos` matches "bolígrafo"). Pairs that fold to the same form count once.
- All-caps acronyms match case-sensitively, so `ESO` does not match the Spanish word "eso".
- A page uses the term set of its detected language. Terms containing a capital letter or a digit (brands, acronyms, proper nouns) also count from the other language, because they read the same in both. `unknown` pages use both sets.
- Each distinct term counts once, since repetition is not specificity.

| Distinct terms matched | Base adjustment |
|---|---|
| 0–2 | 0 |
| 3–5 | +10 |
| 6 or more | +20 |

When the base is positive, a breadth bonus adds +5 per matched category beyond the first, capped at +10. The total ranges from 0 to +30.

**Missing vocabulary never subtracts.** The first version penalised pages with few matches by up to −30. Validation against 43 real small-business homepages showed that almost always meant the lexicon lacked that niche's vocabulary, not that the business was generic. Different-niche pages averaged −20. One or two matches earn nothing either, because isolated hits (a cookie banner, a business name) are noise.

The adjustment is added to `businessSpecificity` before the 0–100 clamp. `aiSmell` and `humanity` are untouched. Without `--industry` the engine v1 value is reported unchanged.

A term earns its place only if a real business in that industry would write it and a generic template for that industry would not. Lexicons therefore exclude buzzwords, words naming the industry itself, and any vocabulary found on the generic corpus pages of that industry.

Canonical ids (aliases in brackets are examples; each lexicon lists its own):

| Id | Example aliases |
|---|---|
| `agencies-portfolio` | design agency, agencia |
| `beauty-wellness` | beauty salon, peluqueria |
| `clinics` | physiotherapy, fisioterapia |
| `ecommerce` | online shop, tienda online |
| `education` | tutoring, academia |
| `fitness-gym` | gym, gimnasio |
| `home-services` | plumber, fontanero |
| `local-retail` | local shop, comercio local |
| `professional-services` | solicitors, abogados |
| `restaurants` | restaurant, restaurante |
| `saas-startup` | saas, software |

An unknown id or alias exits with status 1 and lists the valid ids. The flag never degrades silently to a no-op.

**Known limits.** Each lexicon was derived from one English and one Spanish real-business page. Across the corpus no lexicon scores positive on another industry's pages, but coverage *within* an industry is thin where the corpus is narrow. `saas-startup` leans towards booking software for studios, and `local-retail` towards bookshops and stationers.

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
