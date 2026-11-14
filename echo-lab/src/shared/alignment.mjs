// Monotonic token alignment used to transfer word-level ASR timings onto
// human-authored captions (which only carry cue-level timing).

import { alignKey } from './text.mjs';

const MATCH = 30;
const FUZZY = 15;
const MISMATCH = -12;
const GAP = -14;

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = new Array(b.length + 1);
  let current = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) previous[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
    }
    const swap = previous;
    previous = current;
    current = swap;
  }
  return previous[b.length];
}

/**
 * Similarity in [0,1]. Short words must match exactly; longer words get a
 * small tolerance for ASR spelling differences ("Montreal" / "montreal").
 */
export function similarity(a, b) {
  if (a === b) return 1;
  const max = Math.max(a.length, b.length);
  if (max < 4) return 0;
  if (a[0] !== b[0]) return 0;
  const ratio = 1 - levenshtein(a, b) / max;
  return ratio >= 0.78 ? ratio : 0;
}

function pairScore(a, b) {
  if (a === b) return MATCH;
  if (similarity(a, b) > 0) return FUZZY;
  return MISMATCH;
}

/**
 * Align two token sequences. Returns the matched index pairs in order.
 * Only exact/fuzzy matches are reported; gaps are not.
 *
 * @param {string[]} a
 * @param {string[]} b
 * @returns {{matches: Array<{a:number,b:number}>, score:number}}
 */
export function alignTokens(a, b) {
  const n = a.length;
  const m = b.length;
  if (!n || !m) return { matches: [], score: 0 };

  // Guard against pathological input; cue-level alignment is small.
  if (n * m > 400_000) {
    return greedyAlign(a, b);
  }

  const rows = n + 1;
  const cols = m + 1;
  const dp = Array.from({ length: rows }, () => new Int32Array(cols));
  const dir = Array.from({ length: rows }, () => new Uint8Array(cols));

  for (let i = 1; i < rows; i += 1) {
    dp[i][0] = i * GAP;
    dir[i][0] = 1;
  }
  for (let j = 1; j < cols; j += 1) {
    dp[0][j] = j * GAP;
    dir[0][j] = 2;
  }

  const scoreCache = new Map();
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const key = `${a[i - 1]}\u0000${b[j - 1]}`;
      let pair = scoreCache.get(key);
      if (pair === undefined) {
        pair = pairScore(a[i - 1], b[j - 1]);
        scoreCache.set(key, pair);
      }
      const diagonal = dp[i - 1][j - 1] + pair;
      const up = dp[i - 1][j] + GAP;
      const left = dp[i][j - 1] + GAP;
      let best = diagonal;
      let direction = 0;
      if (up > best) {
        best = up;
        direction = 1;
      }
      if (left > best) {
        best = left;
        direction = 2;
      }
      dp[i][j] = best;
      dir[i][j] = direction;
    }
  }

  const matches = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const direction = i > 0 && j > 0 ? dir[i][j] : i > 0 ? 1 : 2;
    if (direction === 0) {
      const pair = pairScore(a[i - 1], b[j - 1]);
      if (pair > 0) matches.push({ a: i - 1, b: j - 1 });
      i -= 1;
      j -= 1;
    } else if (direction === 1) {
      i -= 1;
    } else {
      j -= 1;
    }
  }
  matches.reverse();
  return { matches, score: dp[n][m] };
}

function greedyAlign(a, b) {
  const matches = [];
  let j = 0;
  for (let i = 0; i < a.length; i += 1) {
    for (let k = j; k < Math.min(b.length, j + 12); k += 1) {
      if (pairScore(a[i], b[k]) > 0) {
        matches.push({ a: i, b: k });
        j = k + 1;
        break;
      }
    }
  }
  return { matches, score: matches.length * MATCH };
}
