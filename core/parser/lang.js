const EN_MARKERS = ['the', 'and', 'is', 'in', 'to', 'for', 'of', 'a', 'with', 'our', 'we', 'your', 'this', 'that', 'are', 'have', 'it', 'on', 'at', 'be'];
const ES_MARKERS = ['de', 'la', 'el', 'que', 'en', 'y', 'los', 'las', 'con', 'para', 'una', 'un', 'del', 'por', 'es', 'se', 'su', 'al', 'lo', 'más'];

export function detectLang(text) {
  if (!text || text.length < 20) return 'unknown';
  const words = text.toLowerCase().match(/\b[a-záéíóúüñ]+\b/g) || [];
  if (words.length < 5) return 'unknown';

  let en = 0;
  let es = 0;
  for (const w of words) {
    if (EN_MARKERS.includes(w)) en++;
    if (ES_MARKERS.includes(w)) es++;
  }

  if (en === 0 && es === 0) return 'unknown';
  if (es > en * 1.3) return 'es';
  if (en > es * 1.3) return 'en';
  return 'unknown';
}
