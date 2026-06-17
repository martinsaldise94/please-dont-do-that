export const layoutRules = [
  {
    id: 'L01',
    dimension: 'layout',
    version: 'v1',
    description: 'Classic SaaS landing page template (hero + features + testimonials)',
    run(model) {
      const hits = [];
      for (const file of model.files) {
        const s = file.sectionTypes;
        const score = [s.has('hero'), s.has('features'), s.has('testimonials'), s.has('pricing')]
          .filter(Boolean).length;
        if (score >= 2) {
          hits.push({
            ruleId: 'L01',
            dimension: 'layout',
            severity: score >= 3 ? 'high' : 'medium',
            message: 'Classic SaaS landing page template detected',
            evidence: [...s].filter((t) => ['hero', 'features', 'testimonials', 'pricing'].includes(t)),
            location: file.path,
          });
        }
      }
      return hits;
    },
  },

  {
    id: 'L02',
    dimension: 'layout',
    version: 'v1',
    description: 'Repeated feature card pattern (3+ cards)',
    run(model) {
      const hits = [];
      for (const file of model.files) {
        if (file.featureCardCount >= 3) {
          hits.push({
            ruleId: 'L02',
            dimension: 'layout',
            severity: file.featureCardCount >= 6 ? 'high' : 'medium',
            message: `Repeated feature card pattern (${file.featureCardCount} cards detected)`,
            evidence: [`${file.featureCardCount} cards`],
            location: file.path,
          });
        }
      }
      return hits;
    },
  },

  {
    id: 'L03',
    dimension: 'layout',
    version: 'v1',
    description: 'Predictable hero layout (heading + CTA + hero section)',
    run(model) {
      const hits = [];
      for (const file of model.files) {
        if (file.headings.length > 0 && file.ctaTexts.length > 0 && file.sectionTypes.has('hero')) {
          hits.push({
            ruleId: 'L03',
            dimension: 'layout',
            severity: 'low',
            message: 'Predictable hero layout detected',
            evidence: [file.headings[0]].filter(Boolean),
            location: file.path,
          });
        }
      }
      return hits;
    },
  },
];
