# Please Don't Do That (PDTD)

## Vision

PDTD is a CLI that analyzes frontend projects and detects patterns that make a website look generic — especially those introduced by AI tools like Claude, ChatGPT, Lovable, Bolt, v0, or Cursor.

It does not try to detect whether a website was created by AI.

Its goal is to answer a much more useful question:

> Is this website specific to the business, or could it belong to thousands of different companies?

---

## Value proposition

Most tools analyze:

* Code quality
* Performance
* Accessibility
* SEO

PDTD analyzes:

* Business specificity
* Copy originality
* Credibility
* Repetitive AI patterns

Tagline:

> Stop your AI from generating the same landing page over and over again.

---

## CLI

```bash
pdtd scan .
```

Output:

```txt
AI Smell Score: 78/100
Business Specificity: 23/100

❌ Generic hero
❌ Generic CTA
❌ Repeated feature cards
❌ Suspicious statistics
❌ Generic testimonials
```

---

## ARCHITECTURE

```txt
please-dont-do-that/

├── cli/
├── core/
│   ├── parser/
│   ├── rules/
│   ├── scorer/
├── rules/
│   ├── v1/
│   ├── v2/
├── prompts/
└── docs/
```

---

## 🧠 VERSIONING SYSTEM (KEY)

PDTD uses 3 independent versioning layers:

### 1. CLI VERSION (SemVer)

```txt
MAJOR.MINOR.PATCH
```

* PATCH → internal fixes
* MINOR → new features
* MAJOR → breaking changes

E.g.:

* 0.1.0 MVP
* 0.2.0 roast mode
* 0.3.0 LLM scoring
* 1.0.0 stable

### 2. ENGINE VERSION

Analysis engine:

* v1 → AST heuristics
* v2 → advanced scoring
* v3 → LLM-assisted scoring

E.g.:

```txt
Engine: AST+Heuristics v1
```

### 3. RULES VERSION

Independent rules:

```txt
rules/v1/
rules/v2/
rules/v3/
```

Usage:

```bash
pdtd scan . --rules v2
```

### 🧪 VERSIONING PRINCIPLE

* Never change output without a MAJOR bump
* Always reproducible
* Engine and rules are interchangeable
* The CLI must never break integrations without notice

---

## 📊 METRICS

### AI Smell Score

Detects generic landing-page patterns.

### Business Specificity Score

Measures whether the website is truly specific to the business.

> Could this website belong to another company without changes?

### Humanity Score

Measures the presence of real vs. generic elements.

---

## 🧩 DETECTION

### Copy

* innovation / excellence / solutions
* generic CTAs
* empty language

### Layout

* classic SaaS template
* repeated cards
* predictable structure

### Visual

* excessive gradients
* blur blobs
* generic Tailwind look

### Credibility

* fake testimonials
* sourceless stats
* invented dashboards

---

## ⚙️ MODES

```bash
pdtd scan .
pdtd roast .
pdtd scan . --json
pdtd scan . --industry physiotherapy
```

---

## 🚀 FUTURE (MCP / AGENTS)

Flow:

```txt
Agent generates website
→ PDTD analyzes
→ Score + issues
→ Agent improves output
```

---

## 📦 DISTRIBUTION

### Recommended strategy

* GitHub → v0.1 (validation)
* npm → v0.2+ (adoption)
* npx pdtd → mass usage

---

## 🧠 AGENT PROMPT (DIRECT USE IN AI)

This block is for using PDTD as a "skill" within an agent:

### INSTRUCTION FOR THE AGENT

You are a frontend analysis system called PDTD.

Your goal is to evaluate whether an AI-generated website is generic or specific.

You must:

1. Detect typical generic landing-page patterns
2. Evaluate business specificity
3. Penalize empty language
4. Detect repetitive SaaS structure
5. Evaluate content credibility

### REQUIRED OUTPUT

Always return:

* AI Smell Score (0-100)
* Business Specificity Score (0-100)
* List of issues
* Concrete recommendations

### CORE PRINCIPLE

If the website could belong to another company without changes → penalize heavily.

### RESPONSE STYLE

* direct
* technical
* no unnecessary explanation
* oriented toward code improvement

### FINAL

PDTD does not detect AI.

It detects a lack of real specificity in the product or business.
