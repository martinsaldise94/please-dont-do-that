export const credibilityRules = [
  {
    id: 'CR01',
    dimension: 'credibility',
    version: 'v1',
    description: 'Suspicious testimonials (star ratings, anonymous or thin attribution)',
    run(model) {
      const hits = [];
      for (const file of model.files) {
        const starCount = (file.bodyText.match(/★{3,}|[⭐]{3,}|5\s*\/\s*5|5\s+stars?|5\s+estrellas?/gi) || []).length;
        if (file.testimonialCount >= 2 && starCount >= 2) {
          hits.push({
            ruleId: 'CR01',
            dimension: 'credibility',
            severity: 'high',
            message: 'Multiple testimonials with star ratings — likely placeholder',
            evidence: [`${file.testimonialCount} testimonials`, `${starCount} star-rating patterns`],
            location: file.path,
          });
        } else if (file.testimonialCount >= 1) {
          hits.push({
            ruleId: 'CR01',
            dimension: 'credibility',
            severity: 'medium',
            message: 'Testimonials without verifiable attribution',
            evidence: [`${file.testimonialCount} testimonials`],
            location: file.path,
          });
        }
      }
      return hits;
    },
  },

  {
    id: 'CR02',
    dimension: 'credibility',
    version: 'v1',
    description: 'Sourceless statistics (percentages, large numbers without attribution)',
    run(model) {
      const hits = [];
      for (const file of model.files) {
        if (file.statPatterns.length >= 2) {
          hits.push({
            ruleId: 'CR02',
            dimension: 'credibility',
            severity: file.statPatterns.length >= 4 ? 'high' : 'medium',
            message: 'Unattributed statistics detected',
            evidence: file.statPatterns.slice(0, 4),
            location: file.path,
          });
        }
      }
      return hits;
    },
  },
];
