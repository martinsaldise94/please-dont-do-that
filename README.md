# Please Don't Do That (PDTD)

## Visión

PDTD es un CLI que analiza proyectos frontend y detecta patrones que hacen que una web parezca genérica, especialmente aquellos introducidos por herramientas de IA como Claude, ChatGPT, Lovable, Bolt, v0 o Cursor.

No intenta detectar si una web ha sido creada por IA.

Su objetivo es responder a una pregunta mucho más útil:

> ¿Esta web es específica para el negocio o podría pertenecer a miles de empresas distintas?

---

## Propuesta de valor

La mayoría de herramientas analizan:

* Calidad del código
* Rendimiento
* Accesibilidad
* SEO

PDTD analiza:

* Especificidad del negocio
* Originalidad del copy
* Credibilidad
* Patrones repetitivos de IA

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

## ARQUITECTURA

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

## 🧠 SISTEMA DE VERSIONES (CLAVE)

PDTD usa 3 capas de versionado independientes:

### 1. CLI VERSION (SemVer)

```txt
MAJOR.MINOR.PATCH
```

* PATCH → fixes internos
* MINOR → nuevas features
* MAJOR → breaking changes

Ej:

* 0.1.0 MVP
* 0.2.0 roast mode
* 0.3.0 LLM scoring
* 1.0.0 stable

### 2. ENGINE VERSION

Motor de análisis:

* v1 → heurísticas AST
* v2 → scoring avanzado
* v3 → LLM-assisted scoring

Ej:

```txt
Engine: AST+Heuristics v1
```

### 3. RULES VERSION

Reglas independientes:

```txt
rules/v1/
rules/v2/
rules/v3/
```

Uso:

```bash
pdtd scan . --rules v2
```

### 🧪 PRINCIPIO DE VERSIONADO

* Nunca cambiar output sin MAJOR
* Siempre reproducible
* Engine y rules son intercambiables
* CLI nunca debe romper integraciones sin aviso

---

## 📊 MÉTRICAS

### AI Smell Score

Detecta patrones de landing genérica.

### Business Specificity Score

Mide si la web es realmente específica del negocio.

> ¿Podría esta web ser de otra empresa sin cambios?

### Humanity Score

Mide presencia de elementos reales vs genéricos.

---

## 🧩 DETECCIÓN

### Copy

* innovation / excellence / solutions
* CTAs genéricos
* lenguaje vacío

### Layout

* SaaS template clásico
* cards repetidas
* estructura predecible

### Visual

* gradients excesivos
* blur blobs
* diseño genérico Tailwind

### Credibilidad

* testimonios falsos
* stats sin fuente
* dashboards inventados

---

## ⚙️ MODOS

```bash
pdtd scan .
pdtd roast .
pdtd scan . --json
pdtd scan . --industry physiotherapy
```

---

## 🚀 FUTURO (MCP / AGENTES)

Flujo:

```txt
Agent generates website
→ PDTD analyzes
→ Score + issues
→ Agent improves output
```

---

## 📦 DISTRIBUCIÓN

### Estrategia recomendada

* GitHub → v0.1 (validación)
* npm → v0.2+ (adopción)
* npx pdtd → uso masivo

---

## 🧠 AGENT PROMPT (USO DIRECTO EN IA)

Este bloque es para usar PDTD como "skill" en un agente:

### INSTRUCCIÓN PARA AGENTE

Eres un sistema de análisis frontend llamado PDTD.

Tu objetivo es evaluar si una web generada por IA es genérica o específica.

Debes:

1. Detectar patrones típicos de landing genérica
2. Evaluar especificidad del negocio
3. Penalizar lenguaje vacío
4. Detectar estructura SaaS repetitiva
5. Evaluar credibilidad del contenido

### OUTPUT OBLIGATORIO

Devuelve siempre:

* AI Smell Score (0-100)
* Business Specificity Score (0-100)
* Lista de issues
* Recomendaciones concretas

### PRINCIPIO CENTRAL

Si la web podría pertenecer a otra empresa sin cambios → penaliza fuertemente.

### ESTILO DE RESPUESTA

* directo
* técnico
* sin explicación innecesaria
* orientado a mejora del código

### FINAL

PDTD no detecta IA.

Detecta falta de especificidad real en el producto o negocio.
