import { computeIndustrySignals } from './industry-signals.js';

const DIMENSION_WEIGHTS = { copy: 0.4, layout: 0.3, visual: 0.2, credibility: 0.1 };
const RULES_PER_DIMENSION = { copy: 3, layout: 3, visual: 3, credibility: 2 };
const SEVERITY_SCORE = { high: 3, medium: 2, low: 1 };

export function computeScores(model, hits, industryProfile = null) {
  const aiSmell = computeAISmell(hits);
  let businessSpecificity = computeBusinessSpecificity(model, aiSmell);

  let industrySignals = null;
  if (industryProfile) {
    industrySignals = computeIndustrySignals(model, industryProfile);
    businessSpecificity += industrySignals.adjustment;
  }

  return {
    scores: {
      aiSmell: clamp(Math.round(aiSmell)),
      businessSpecificity: clamp(Math.round(businessSpecificity)),
      humanity: clamp(Math.round(computeHumanity(model))),
    },
    industrySignals,
  };
}

function computeAISmell(hits) {
  let total = 0;
  for (const [dim, weight] of Object.entries(DIMENSION_WEIGHTS)) {
    const dimHits = hits.filter((h) => h.dimension === dim);
    const maxPossible = RULES_PER_DIMENSION[dim] * 3;
    const raw = dimHits.reduce((sum, h) => sum + (SEVERITY_SCORE[h.severity] ?? 1), 0);
    total += (Math.min(raw, maxPossible) / maxPossible) * 100 * weight;
  }
  return total;
}

function computeBusinessSpecificity(model, aiSmell) {
  const inverseScore = (100 - aiSmell) * 0.5;
  let signals = 0;
  const allText = model.files.map((f) => f.bodyText).join('\n');

  // Street address
  if (
    /\d+\s+[A-Za-záéíóú]{3,}[^\n,]{0,20}(?:Street|Road|Avenue|Lane|Drive|Close|Way|Calle|Carrer|Paseo|Avenida|Plaza|Rua)/i.test(
      allText,
    )
  ) {
    signals += 25;
  }
  // Postal code (UK or ES)
  if (/\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}\b|\b\d{5}\b/.test(allText)) {
    signals += 10;
  }
  // Phone number
  if (/(\+\d{1,3}[\s\-.]?)?\(?\d{3,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}/.test(allText)) {
    signals += 15;
  }
  // Prices with currency
  const prices = allText.match(/[£€$]\s*\d+/g) || [];
  signals += Math.min(prices.length, 3) * 8;
  // Credential / licence number
  if (
    /\b(?:Gas Safe|SRA|MCSP|HPC Reg|CIF|ICAM|CFCM|NIF|AVEN|Col\.|Colegio)\b.*?\d+/i.test(allText)
  ) {
    signals += 20;
  }

  return inverseScore + Math.min(50, signals / 2);
}

function computeHumanity(model) {
  let points = 0;
  const allText = model.files.map((f) => f.bodyText).join('\n');

  // Physical address
  if (
    /\d+\s+[A-Za-záéíóú]{3,}[^\n,]{0,20}(?:Street|Road|Avenue|Calle|Carrer|Paseo|Plaza)/i.test(
      allText,
    )
  ) {
    points += 25;
  }
  // Phone number
  if (/(\+\d{1,3}[\s\-.]?)?\(?\d{3,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}/.test(allText)) {
    points += 10;
  }
  // Named person with professional credential next to their name
  if (
    /\b[A-ZÁÉÍÓÚ][a-záéíóú]+ [A-ZÁÉÍÓÚ][a-záéíóú]+\b/.test(allText) &&
    /\b(?:MCSP|SRA|Gas Safe|CFCM|LLB|PhD|MD|Dra?\.|Colegiado|Col\.)\b/i.test(allText)
  ) {
    points += 20;
  }
  // Licence / registration number
  if (/\b(?:Gas Safe|SRA|MCSP|CIF|ICAM|CFCM)\b[\s\w#nº°]*?\d{4,}/i.test(allText)) {
    points += 25;
  }
  // Specific prices (2+)
  const prices = allText.match(/[£€$]\s*\d+(?:[.,]\d{2})?/g) || [];
  if (prices.length >= 2) points += 20;

  return Math.min(100, points);
}

function clamp(n) {
  return Math.max(0, Math.min(100, n));
}
