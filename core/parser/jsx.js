import { detectLang } from './lang.js';

// Basic JSX/TSX text extraction — no full AST, good enough for v1 copy + visual rules.
export function parseJSX(content, filePath) {
  const texts = [];

  // Text between JSX tags
  for (const m of content.matchAll(/>([^<{}\n]{3,})</g)) {
    const t = m[1].trim();
    if (t) texts.push(t);
  }
  // String literals (likely copy)
  for (const m of content.matchAll(/"([^"]{4,80})"/g)) {
    texts.push(m[1]);
  }

  const bodyText = texts.join(' ');

  const headings = [];
  for (const m of content.matchAll(/<h([1-4])[^>]*>([^<]+)<\/h\1>/g)) {
    headings.push(m[2].trim());
  }

  const ctaTexts = [];
  for (const m of content.matchAll(/<(?:button|a)[^>]*>([^<]{2,60})<\/(?:button|a)>/g)) {
    ctaTexts.push(m[1].trim());
  }

  const cssClasses = new Set();
  for (const m of content.matchAll(/className=["']([^"']+)["']/g)) {
    m[1].split(/\s+/).filter(Boolean).forEach((c) => cssClasses.add(c));
  }
  for (const m of content.matchAll(/className=\{`([^`]+)`\}/g)) {
    m[1].split(/\s+/).filter(Boolean).forEach((c) => cssClasses.add(c));
  }

  return {
    path: filePath,
    type: 'jsx',
    lang: detectLang(bodyText),
    headings,
    ctaTexts,
    bodyText,
    cssClasses,
    inlineStyles: '',
    sectionTypes: new Set(),
    testimonialCount: 0,
    featureCardCount: 0,
    statPatterns: [],
  };
}
