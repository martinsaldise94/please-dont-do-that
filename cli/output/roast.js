const SEP = '─'.repeat(44);

const INTROS = [
  [80, "Congratulations. You've built the same website as 40,000 other people. This thing has more AI fingerprints than a ChatGPT terms-of-service page."],
  [60, "Oh wow, a hero section, some feature cards, and a gradient. Bold choices. Truly. Swap the logo and this belongs to your competitor."],
  [40, "Some personality in here, but also enough generic patterns that even the AI is embarrassed."],
  [20, "Actually not bad. A few lazy shortcuts, but there's a real business in here somewhere."],
  [0,  "Genuinely specific. Whoever built this actually thought about it. Rare."],
];

const ROAST_MESSAGES = {
  C01: "Your copy is a buzzword smoothie: blend 'innovation', 'excellence', and 'seamless', add 'holistic', serve lukewarm. Says nothing. Means nothing. Could sell anything.",
  C02: "'Get Started'. Wow. Nobody has ever thought of that CTA before. Truly disruptive.",
  C03: "'Trusted by thousands.' Thousands of who? Your mom? These claims are so vague they're legally meaningless.",
  L01: "Hero → Features → Testimonials → Pricing. You didn't design a website, you filled out a template. Every AI on earth produces this exact structure.",
  L02: "Three cards. Icon, title, two sentences. Repeated forever. This is what happens when AI runs out of actual ideas about your business.",
  L03: "A hero, a heading, and a CTA button. The absolute bare minimum. My microwave has more personality than this layout.",
  V01: "Purple gradient into indigo. Again. The entire AI-generated internet has agreed, without discussion, to use this exact color scheme. You are not special.",
  V02: "Big blurry circles floating in the background doing nothing. This isn't design, it's a fog machine at a school disco.",
  V03: "Purple. Indigo. Blue. Sky. The four horsemen of the AI color palette. At this point just rename the company 'Generic SaaS Corp.'",
  CR01: "These testimonials were definitely written by a real human named Sarah M. who 'can't imagine running her business without it.' Sure, Sarah. Sure.",
  CR02: "'98% satisfaction rate.' From what study? Who ran it? What was the sample size? These stats were generated, not measured.",
};

const ICONS = { high: '❌', medium: '⚠️ ', low: 'ℹ️ ' };

export function formatRoast(result) {
  const { aiSmell, businessSpecificity, humanity } = result.scores;
  const intro = INTROS.find(([threshold]) => aiSmell >= threshold)[1];

  const lines = ['', 'PDTD — Roast Mode 🔥', SEP, ''];
  lines.push(intro);
  lines.push('');

  lines.push(`AI Smell:             ${bar(aiSmell)} ${aiSmell}/100`);
  lines.push(`Business Specificity: ${bar(businessSpecificity)} ${businessSpecificity}/100`);
  lines.push(`Humanity:             ${bar(humanity)} ${humanity}/100`);
  lines.push('');

  if (result.issues.length === 0) {
    lines.push("✅  Nothing to roast here. Genuinely specific site.");
  } else {
    lines.push('Caught red-handed:');
    for (const issue of result.issues) {
      const msg = ROAST_MESSAGES[issue.ruleId] ?? issue.message;
      lines.push(`  ${ICONS[issue.severity]}[${issue.ruleId}] ${msg}`);
      if (issue.evidence?.length) {
        lines.push(`       ${issue.evidence.slice(0, 4).join(', ')}`);
      }
    }
  }

  lines.push('');
  lines.push(`Engine v1 · Rules ${result.rulesVersion} · Lang: ${result.detectedLang} · pdtd ${result.pdtdVersion}`);
  lines.push('');

  return lines.join('\n');
}

function bar(score) {
  const filled = Math.round(score / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}
