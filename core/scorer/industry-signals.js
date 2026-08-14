const COMBINING_MARKS = /[̀-ͯ]/g;
const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g;

export function normalize(text) {
  return text.toLowerCase().normalize("NFD").replace(COMBINING_MARKS, "");
}

export function matchTerms(text, terms) {
  const haystack = normalize(text);
  return terms.filter((term) => containsTerm(haystack, normalize(term)));
}

// boundary is "not a letter or digit" rather than \b so accented and multi-word
// terms behave the same as plain ASCII ones
function containsTerm(haystack, needle) {
  const escaped = needle.replace(REGEX_SPECIALS, "\\$&");
  return new RegExp(
    `(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`,
    "u",
  ).test(haystack);
}
