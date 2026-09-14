const COMBINING_MARKS = /[̀-ͯ]/g;
const DASHES = /[-‐-―]/g;
const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g;

const MAX_MATCHED_TERMS = 12;
const BREADTH_PER_CATEGORY = 5;
const MAX_BREADTH_BONUS = 10;

// ordered high to low so the first satisfied threshold wins; missing vocabulary
// costs nothing because real-site validation showed it mostly means lexicon gaps
const BASE_ADJUSTMENTS = [
  { minTerms: 6, adjustment: 20 },
  { minTerms: 3, adjustment: 10 },
  { minTerms: 0, adjustment: 0 },
];

function fold(text) {
  return text
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(DASHES, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalize(text) {
  return fold(text).toLowerCase();
}

export function termKey(term) {
  const n = normalize(term);
  const lastWord = n.slice(n.lastIndexOf(' ') + 1);
  return lastWord.length >= 5 && n.endsWith('s') ? n.slice(0, -1) : n;
}

function isAcronym(term) {
  const letters = term.replace(/[^\p{L}]/gu, '');
  return (
    letters.length >= 2 && letters === letters.toUpperCase() && letters !== letters.toLowerCase()
  );
}

function isCrossLingual(term) {
  return /[\p{Lu}\p{N}]/u.test(term);
}

export function matchTerms(text, terms) {
  const folded = fold(text);
  const lower = folded.toLowerCase();
  return terms.filter((term) =>
    isAcronym(term) ? containsAcronym(folded, fold(term)) : containsTerm(lower, normalize(term)),
  );
}

// boundary is "not a letter or digit" rather than \b so accented and multi-word
// terms behave the same as plain ASCII ones
function containsTerm(haystack, needle) {
  const lastWord = needle.slice(needle.lastIndexOf(' ') + 1);
  const variants = [needle];
  if (lastWord.length >= 5 && needle.endsWith('s')) variants.push(needle.slice(0, -1));
  if (lastWord.length >= 6 && needle.endsWith('es')) variants.push(needle.slice(0, -2));
  const alternatives = variants.map((v) => v.replace(REGEX_SPECIALS, '\\$&')).join('|');
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives})(?:e?s)?(?![\\p{L}\\p{N}])`, 'u').test(
    haystack,
  );
}

function containsAcronym(haystack, needle) {
  const escaped = needle.replace(REGEX_SPECIALS, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}s?(?![\\p{L}\\p{N}])`, 'u').test(haystack);
}

export function computeIndustrySignals(model, profile) {
  const text = model.files.map((f) => f.bodyText).join('\n');
  const own = languagesFor(model.lang);
  const others = ['en', 'es'].filter((lang) => !own.includes(lang));

  const matched = [];
  const seenKeys = new Set();
  const matchedCategories = [];
  const missingCategories = [];

  for (const category of Object.keys(profile.terms.en)) {
    const terms = [
      ...own.flatMap((lang) => profile.terms[lang]?.[category] ?? []),
      ...others.flatMap((lang) => (profile.terms[lang]?.[category] ?? []).filter(isCrossLingual)),
    ];
    const found = matchTerms(text, terms).filter((term) => {
      const key = termKey(term);
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    });
    if (found.length > 0) {
      matchedCategories.push(category);
      matched.push(...found);
    } else {
      missingCategories.push(category);
    }
  }

  const base = BASE_ADJUSTMENTS.find((b) => matched.length >= b.minTerms).adjustment;
  const breadth =
    base > 0
      ? Math.min(MAX_BREADTH_BONUS, (matchedCategories.length - 1) * BREADTH_PER_CATEGORY)
      : 0;

  return {
    matchedTerms: matched.slice(0, MAX_MATCHED_TERMS),
    matchedCategories,
    missingCategories,
    adjustment: base + breadth,
  };
}

function languagesFor(lang) {
  return lang === 'en' || lang === 'es' ? [lang] : ['en', 'es'];
}
