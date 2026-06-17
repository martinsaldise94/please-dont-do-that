# Landing Page Generation Prompt — English

Use this prompt to generate test pages for the PDTD corpus.
Replace all `{{VARIABLES}}` before sending to an AI tool.

---

## Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{INDUSTRY}}` | Industry slug from corpus | `clinics` |
| `{{BUSINESS_TYPE}}` | Human-readable business type | `physiotherapy clinic` |
| `{{BUSINESS_NAME}}` | Fictitious or real business name | `NovaCare Physio` |
| `{{CITY}}` | City (only for specific) | `Manchester` |
| `{{ADDRESS}}` | Street address (only for specific) | `14 Oak Street` |
| `{{EXTRA_DETAILS}}` | Specific details that make it real | see industry table below |

### Industry reference

| `{{INDUSTRY}}` | `{{BUSINESS_TYPE}}` | Generic `{{EXTRA_DETAILS}}` | Specific `{{EXTRA_DETAILS}}` |
|---|---|---|---|
| `clinics` | physiotherapy clinic | — | Named practitioners, conditions treated, real prices, booking link |
| `beauty-wellness` | beauty salon / spa | — | Specific treatments, staff names, price list, location photos |
| `ecommerce` | online store | — | Real product names, SKUs, shipping zones, return policy details |
| `local-retail` | local shop | — | Opening hours, exact address, product categories, parking info |
| `restaurants` | restaurant / café | — | Menu dishes with prices, chef name, reservation system, cuisine origin |
| `fitness-gym` | gym / fitness studio | — | Class timetable, trainer bios, membership tiers with prices |
| `professional-services` | law firm / accountant / consultant | — | Specific legal areas, named partners, case types, fee structure |
| `home-services` | plumber / electrician / cleaner | — | Service area postcodes, call-out fee, response time, certifications |
| `agencies-portfolio` | design / dev / marketing agency | — | Real past clients, named team, specific tech stack, process |
| `education` | school / tutoring / online course | — | Curriculum details, teacher credentials, intake dates, fees |
| `saas-startup` | SaaS product | — | Specific feature set, pricing tiers, integration list, target user |

---

## Prompt A — Generic (→ `corpus/generic/`)

> You are a web developer. Create a complete, self-contained landing page (all CSS inline in `<style>`) for a **{{BUSINESS_TYPE}}** called **"{{BUSINESS_NAME}}"**.
>
> Include these sections:
> - Hero with headline and CTA button
> - 3–4 feature or service cards
> - Testimonials section (2–3 quotes)
> - A "Why choose us?" or stats section
> - Footer with contact and social links
>
> Use a modern, professional look with a clean color palette.
> Do not add any real address, phone number, or specific staff names.
> Output only the complete HTML file. No explanations.

**Expected result:** high AI Smell, low Business Specificity. Scores: `aiSmell [70,100]`, `businessSpecificity [0,30]`.

---

## Prompt B — Specific (→ `corpus/specific/`)

> You are a web developer. Create a complete, self-contained landing page (all CSS inline in `<style>`) for a real **{{BUSINESS_TYPE}}** called **"{{BUSINESS_NAME}}"**, located at **{{ADDRESS}}, {{CITY}}**.
>
> The business has these specific characteristics:
> {{EXTRA_DETAILS}}
>
> Requirements:
> - Use the actual business name, address, and phone number throughout
> - Name real staff members and their credentials
> - List concrete services/products with specific prices in local currency
> - Write copy that only makes sense for THIS specific business — not a template
> - Include a real opening hours table
> - No generic placeholder text anywhere
>
> Output only the complete HTML file. No explanations.

**Expected result:** low AI Smell, high Business Specificity. Scores: `aiSmell [0,30]`, `businessSpecificity [70,100]`.

---

## After generating

1. Save the HTML as `index.html` in the correct corpus folder
2. Copy `corpus/_templates/meta.json`, fill it in, and save alongside it
3. Set `expectedScores` based on which prompt you used (A or B)
