import { parse } from 'node-html-parser';
import { detectLang } from './lang.js';

const SECTION_PATTERNS = {
  hero: /\b(hero|banner|jumbotron|masthead)\b/i,
  features: /\b(features?|benefits?|services?)\b/i,
  testimonials: /\b(testimonials?|reviews?|feedback|quotes?|clientes?)\b/i,
  pricing: /\b(pricing?|plans?|tariff|tiers?|precios?)\b/i,
  cta: /\b(cta|call-to-action|signup|register|contact)\b/i,
  footer: /\bfooter\b/i,
  stats: /\b(stats?|statistics?|numbers?|metrics?)\b/i,
};

const HEADING_SECTION_HINTS = {
  features: /why choose|what we offer|our services|nuestros servicios|por qué elegirnos/i,
  testimonials: /what.+say|testimonial|review|what our clients|lo que dicen|opiniones/i,
  pricing: /pricing|plans?|price|precios?|planes?/i,
};

export function parseHTML(content, filePath) {
  // Extract style/script content separately before stripping for text
  const rootFull = parse(content);
  const inlineStyles = rootFull
    .querySelectorAll('style')
    .map((n) => n.rawText)
    .join('\n');

  // Collect all CSS classes from full tree
  const cssClasses = new Set();
  for (const node of rootFull.querySelectorAll('[class]')) {
    const cls = node.getAttribute('class') || '';
    cls.split(/\s+/).filter(Boolean).forEach((c) => cssClasses.add(c));
  }

  // Strip script/style for clean text extraction
  const stripped = content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  const rootText = parse(stripped);

  const headings = rootText
    .querySelectorAll('h1, h2, h3, h4')
    .map((n) => n.text.trim())
    .filter(Boolean);

  const ctaTexts = rootText
    .querySelectorAll('button, a, [role="button"]')
    .map((n) => n.text.trim())
    .filter((t) => t.length >= 2 && t.length <= 80);

  const bodyText = rootText.text.replace(/\s+/g, ' ').trim();

  const sectionTypes = detectSections(rootFull, headings);
  const testimonialCount = countTestimonials(rootFull);
  const featureCardCount = countFeatureCards(rootFull);
  const statPatterns = extractStats(bodyText);
  const lang = detectLang(bodyText);

  return {
    path: filePath,
    type: 'html',
    lang,
    headings,
    ctaTexts,
    bodyText,
    cssClasses,
    inlineStyles,
    sectionTypes,
    testimonialCount,
    featureCardCount,
    statPatterns,
  };
}

function detectSections(root, headings) {
  const sections = new Set();

  for (const el of root.querySelectorAll('[class], [id], section, header, footer, nav')) {
    const cls = el.getAttribute('class') || '';
    const id = el.getAttribute('id') || '';
    const combined = `${cls} ${id}`;
    for (const [type, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(combined)) sections.add(type);
    }
  }

  // Tag name inference
  if (root.querySelector('header')) sections.add('hero');
  if (root.querySelector('footer')) sections.add('footer');

  // Heading text hints
  for (const h of headings) {
    for (const [type, pattern] of Object.entries(HEADING_SECTION_HINTS)) {
      if (pattern.test(h)) sections.add(type);
    }
  }

  return sections;
}

function countTestimonials(root) {
  const selectors = [
    'blockquote',
    '[class*="testimonial"]',
    '[class*="review"]',
    '[class*="quote"]',
    '[class*="testimonio"]',
    '[class*="opinion"]',
  ];
  const found = new Set();
  for (const sel of selectors) {
    for (const el of root.querySelectorAll(sel)) {
      found.add(el);
    }
  }
  return found.size;
}

function countFeatureCards(root) {
  const selectors = [
    '[class*="card"]',
    '[class*="feature"]',
    '[class*="service-item"]',
    '[class*="benefit"]',
  ];
  let max = 0;
  for (const sel of selectors) {
    max = Math.max(max, root.querySelectorAll(sel).length);
  }
  return max;
}

function extractStats(text) {
  const patterns = [];
  // Percentages (likely "98% satisfaction rate" etc.)
  for (const m of text.matchAll(/\d+\s*%/g)) patterns.push(m[0].trim());
  // Large counts with social-proof context words (exclude specific industry terms)
  for (const m of text.matchAll(/[\d,]+\s*\+?\s*(?:clients?|users?|customers?|clientes?|usuarios?|businesses?|empresas?|teams?)/gi)) {
    patterns.push(m[0].trim());
  }
  // Revenue/savings claims (large round numbers: £2M, $1M+) — not individual product prices
  for (const m of text.matchAll(/[£$€]\s*[\d,.]+\s*[KkMm]\+?/g)) patterns.push(m[0].trim());
  return [...new Set(patterns)].slice(0, 10);
}
