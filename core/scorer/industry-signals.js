const COMBINING_MARKS = /[̀-ͯ]/g;
const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g;

export function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(COMBINING_MARKS, '');
}

export function matchTerms(text, terms) {
  const haystack = normalize(text);
  return terms.filter((term) => containsTerm(haystack, normalize(term)));
}

// boundary is "not a letter or digit" rather than \b so accented and multi-word
// terms behave the same as plain ASCII ones
function containsTerm(haystack, needle) {
  const escaped = needle.replace(REGEX_SPECIALS, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'u').test(haystack);
}

const MAX_MATCHED_TERMS = 12;
const BREADTH_PER_CATEGORY = 5;
const MAX_BREADTH_BONUS = 10;

// ordered high to low so the first satisfied threshold wins
const BASE_ADJUSTMENTS = [
  { minTerms: 6, adjustment: 20 },
  { minTerms: 3, adjustment: 10 },
  { minTerms: 1, adjustment: -10 },
  { minTerms: 0, adjustment: -30 },
];

export function computeIndustrySignals(model, profile) {
  const text = model.files.map((f) => f.bodyText).join('\n');
  const langs = languagesFor(model.lang);
  const categories = Object.keys(profile.terms.en);

  const matched = [];
  const matchedCategories = [];
  const missingCategories = [];

  for (const category of categories) {
    const terms = langs.flatMap((lang) => profile.terms[lang]?.[category] ?? []);
    const found = matchTerms(text, terms);
    if (found.length > 0) {
      matchedCategories.push(category);
      matched.push(...found);
    } else {
      missingCategories.push(category);
    }
  }

  const distinct = [...new Set(matched)];
  const base = BASE_ADJUSTMENTS.find((b) => distinct.length >= b.minTerms).adjustment;
  const breadth = Math.min(
    MAX_BREADTH_BONUS,
    Math.max(0, matchedCategories.length - 1) * BREADTH_PER_CATEGORY,
  );

  return {
    matchedTerms: distinct.slice(0, MAX_MATCHED_TERMS),
    matchedCategories,
    missingCategories,
    adjustment: base + breadth,
  };
}

function languagesFor(lang) {
  return lang === 'en' || lang === 'es' ? [lang] : ['en', 'es'];
}
