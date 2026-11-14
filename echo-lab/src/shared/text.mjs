// Echo Lab — text normalisation utilities shared by the server, the browser
// UI and the unit tests. This module must stay free of Node/browser APIs.

const NAMED_ENTITIES = {
  amp: '&',
  apos: "'",
  quot: '"',
  lt: '<',
  gt: '>',
  nbsp: ' ',
  ndash: '\u2013',
  mdash: '\u2014',
  hellip: '\u2026',
  rsquo: '\u2019',
  lsquo: '\u2018',
  rdquo: '\u201d',
  ldquo: '\u201c',
};

/** Decode the small set of HTML entities found in YouTube caption data. */
export function decodeEntities(input) {
  if (typeof input !== 'string' || !input.includes('&')) return input ?? '';
  let out = input;
  for (let pass = 0; pass < 2; pass += 1) {
    const next = out.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]+);/gi, (match, code) => {
      if (code[0] === '#') {
        const isHex = code[1] === 'x' || code[1] === 'X';
        const value = isHex ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        if (!Number.isFinite(value)) return match;
        try {
          return String.fromCodePoint(value);
        } catch {
          return match;
        }
      }
      const key = code.toLowerCase();
      return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, key)
        ? NAMED_ENTITIES[key]
        : match;
    });
    if (next === out) break;
    out = next;
  }
  return out;
}

const SOUND_LABELS =
  /^(music|laughter|laughs|laughing|applause|cheering|cheers|audience|inaudible|crosstalk|silence|noise|sighs?|clears? throat|foreign language|speaking [a-z]+|laughs? and applause|music playing|background noise|static|beep|ringing)$/i;

/**
 * Remove caption annotations such as "[Music]" and "(Audience)". Bracket
 * annotations are always removed (YouTube uses them for non-speech), while
 * parentheses are only removed when they contain a known sound/label.
 */
export function stripAnnotations(input) {
  let text = decodeEntities(input);
  text = text.replace(/\[[^\]]{0,80}\]/g, ' ');
  text = text.replace(/\(([^)]{0,80})\)/g, (match, inner) =>
    SOUND_LABELS.test(inner.trim()) ? ' ' : match,
  );
  return text.replace(/\s+/g, ' ').trim();
}

/** Normalise a single display word into its comparison form. */
export function normalizeToken(word) {
  let value = String(word ?? '')
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u02bc\u0060\u00b4]/g, "'")
    .toLowerCase();
  value = value.replace(/[^\p{L}\p{N}']/gu, '');
  return value;
}

/** Comparison key used for fuzzy alignment (apostrophes ignored). */
export function alignKey(word) {
  return normalizeToken(word).replace(/'/g, '');
}

const FILLERS = new Set([
  'uh',
  'uhh',
  'uhhh',
  'uhm',
  'um',
  'umm',
  'ummm',
  'erm',
  'er',
  'hmm',
  'hmmm',
  'mm',
  'mmm',
  'mhm',
  'mhmm',
]);

export function isFiller(norm) {
  return FILLERS.has(norm);
}

const PUNCTUATION_ONLY = /^[^\p{L}\p{N}]+$/u;

/**
 * Split text into display tokens with a comparison form. Hyphenated words and
 * dashes are split; punctuation is kept for display but stripped for scoring.
 * Tokens without letters/digits are dropped.
 */
export function tokenize(text) {
  if (typeof text !== 'string' || !text) return [];
  let value = stripAnnotations(text);
  value = value
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, ' ')
    .replace(/(?<=[\p{L}\p{N}])[-](?=[\p{L}\p{N}])/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!value) return [];
  const tokens = [];
  for (const part of value.split(' ')) {
    if (!part || PUNCTUATION_ONLY.test(part)) continue;
    const norm = normalizeToken(part);
    if (!norm) continue;
    tokens.push({ display: part, norm });
  }
  return tokens;
}

/** Display-only join that keeps closing punctuation attached. */
export function joinTokens(tokens) {
  const values = (tokens || []).map((token) =>
    typeof token === 'string' ? token : token.display,
  );
  let out = '';
  for (const raw of values) {
    const value = String(raw ?? '').trim();
    if (!value) continue;
    if (!out) {
      out = value;
      continue;
    }
    const previous = out[out.length - 1];
    const noSpaceBefore = /^[,.;:!?%)\]}»”’]+$/.test(value);
    const noSpaceAfter = /[(\[{«“‘]$/.test(previous);
    out += noSpaceBefore || noSpaceAfter ? value : ` ${value}`;
  }
  return out.trim();
}

/** Rough spoken duration of a word, used only when the source has no end. */
export function estimateWordDurationMs(word) {
  const letters = (String(word ?? '').match(/[\p{L}\p{N}]/gu) || []).length;
  return Math.max(180, Math.min(950, 85 + letters * 52));
}

/** True when the value has at least one letter or digit. */
export function hasSpeech(value) {
  return /[\p{L}\p{N}]/u.test(String(value ?? ''));
}
