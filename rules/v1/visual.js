export const visualRules = [
  {
    id: 'V01',
    dimension: 'visual',
    version: 'v1',
    description: 'Excessive gradient usage (Tailwind classes or CSS linear-gradient)',
    run(model) {
      const hits = [];
      for (const file of model.files) {
        const gradientClasses = [...file.cssClasses].filter((c) =>
          /^(from|to|via)-|^bg-gradient/.test(c)
        );
        const cssGradients = (file.inlineStyles.match(/linear-gradient/g) || []).length;
        const total = gradientClasses.length + cssGradients;
        if (total >= 2) {
          const evidence = gradientClasses.slice(0, 4);
          if (cssGradients > 0) evidence.push(`${cssGradients}× linear-gradient in CSS`);
          hits.push({
            ruleId: 'V01',
            dimension: 'visual',
            severity: total >= 8 ? 'high' : total >= 5 ? 'medium' : 'low',
            message: 'Excessive gradient usage detected',
            evidence,
            location: file.path,
          });
        }
      }
      return hits;
    },
  },

  {
    id: 'V02',
    dimension: 'visual',
    version: 'v1',
    description: 'Decorative blur blob elements',
    run(model) {
      const hits = [];
      for (const file of model.files) {
        const blurClasses = [...file.cssClasses].filter((c) =>
          /blur-(sm|md|lg|xl|2xl|3xl)/.test(c)
        );
        const blurInCss = (file.inlineStyles.match(/filter\s*:\s*blur|backdrop-filter/g) || []).length;
        if (blurClasses.length >= 2 || blurInCss >= 2) {
          hits.push({
            ruleId: 'V02',
            dimension: 'visual',
            severity: 'medium',
            message: 'Decorative blur blob elements detected',
            evidence: blurClasses.slice(0, 3),
            location: file.path,
          });
        }
      }
      return hits;
    },
  },

  {
    id: 'V03',
    dimension: 'visual',
    version: 'v1',
    description: 'Generic SaaS purple/blue/indigo color palette',
    run(model) {
      const hits = [];
      for (const file of model.files) {
        const purpleish = [...file.cssClasses].filter((c) =>
          /purple|violet|indigo/.test(c)
        );
        const blueish = [...file.cssClasses].filter((c) => /\bblue\b|sky|cyan/.test(c));
        const total = purpleish.length + blueish.length;
        if (total >= 4) {
          hits.push({
            ruleId: 'V03',
            dimension: 'visual',
            severity: total >= 8 ? 'medium' : 'low',
            message: 'Generic SaaS color palette detected (purple/blue/indigo)',
            evidence: [...purpleish, ...blueish].slice(0, 5),
            location: file.path,
          });
        }
      }
      return hits;
    },
  },
];
