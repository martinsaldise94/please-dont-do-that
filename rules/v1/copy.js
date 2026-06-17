import { EN_BUZZWORDS, EN_CTA_PHRASES, EN_TRUST_PATTERNS } from './dictionaries/en.js';
import { ES_BUZZWORDS, ES_CTA_PHRASES, ES_TRUST_PATTERNS } from './dictionaries/es.js';

export const copyRules = [
  {
    id: 'C01',
    dimension: 'copy',
    version: 'v1',
    description: 'Generic buzzwords detected in body text',
    run(model) {
      const hits = [];
      for (const file of model.files) {
        const dict = file.lang === 'es' ? ES_BUZZWORDS : EN_BUZZWORDS;
        const text = file.bodyText.toLowerCase();
        const found = dict.filter((w) => text.includes(w.toLowerCase()));
        if (found.length >= 2) {
          hits.push({
            ruleId: 'C01',
            dimension: 'copy',
            severity: found.length >= 5 ? 'high' : found.length >= 3 ? 'medium' : 'low',
            message: 'Generic buzzwords detected',
            evidence: found.slice(0, 6),
            location: file.path,
          });
        }
      }
      return hits;
    },
  },

  {
    id: 'C02',
    dimension: 'copy',
    version: 'v1',
    description: 'Generic CTA button text',
    run(model) {
      const hits = [];
      for (const file of model.files) {
        const dict = file.lang === 'es' ? ES_CTA_PHRASES : EN_CTA_PHRASES;
        const found = dict.filter((phrase) =>
          file.ctaTexts.some((cta) => cta.toLowerCase().includes(phrase.toLowerCase()))
        );
        if (found.length >= 1) {
          hits.push({
            ruleId: 'C02',
            dimension: 'copy',
            severity: found.length >= 3 ? 'high' : found.length >= 2 ? 'medium' : 'low',
            message: 'Generic CTA text detected',
            evidence: found.slice(0, 4),
            location: file.path,
          });
        }
      }
      return hits;
    },
  },

  {
    id: 'C03',
    dimension: 'copy',
    version: 'v1',
    description: 'Empty trust/social-proof language without verifiable data',
    run(model) {
      const hits = [];
      for (const file of model.files) {
        const patterns = file.lang === 'es' ? ES_TRUST_PATTERNS : EN_TRUST_PATTERNS;
        const text = file.bodyText;
        const found = patterns.filter((p) => p.test(text));
        if (found.length > 0) {
          hits.push({
            ruleId: 'C03',
            dimension: 'copy',
            severity: found.length >= 2 ? 'high' : 'medium',
            message: 'Unverifiable trust claims detected',
            evidence: found.map((p) => p.source).slice(0, 3),
            location: file.path,
          });
        }
      }
      return hits;
    },
  },
];
