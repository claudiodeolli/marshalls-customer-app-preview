// Word-level dictation scoring. Punctuation, capitalisation and hyphenation
// are ignored; every other word difference is reported.

import { joinTokens, normalizeToken, tokenize } from './text.mjs';

const EQUIVALENTS = new Map([
  ['okay', 'ok'],
  ['alright', 'allright'],
]);

function keyOf(token) {
  const norm = token.norm ?? normalizeToken(token.display ?? token);
  // Apostrophes and hyphens are punctuation for dictation purposes: "dont"
  // and "don't" count as the same word, as do "well known"/"well-known".
  const value = norm.replace(/['-]/g, '');
  return EQUIVALENTS.get(value) ?? value;
}

/**
 * @param {Array<{display:string,norm?:string}>|string[]} referenceWords
 * @param {string} answer
 */
export function scoreAttempt(referenceWords, answer) {
  const ref = (referenceWords || [])
    .map((word) => {
      const display = typeof word === 'string' ? word : word.display;
      const norm = typeof word === 'string' ? normalizeToken(word) : word.norm ?? normalizeToken(display);
      return { display: String(display ?? ''), norm, key: keyOf({ display, norm }) };
    })
    .filter((word) => word.key);
  const user = tokenize(answer || '')
    .map((word) => ({ ...word, key: keyOf(word) }))
    .filter((word) => word.key);

  const n = ref.length;
  const m = user.length;
  if (!n) {
    return {
      total: 0,
      correct: 0,
      substitutions: 0,
      missing: 0,
      extras: m,
      accuracy: 0,
      wer: 0,
      perfect: false,
      emptyReference: true,
      ops: [],
      alignedUser: user.map((word) => ({ status: 'extra', word: word.display })),
      alignedRef: [],
      refText: '',
      answerText: String(answer ?? '').trim(),
    };
  }

  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  const direction = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
  for (let i = 1; i <= n; i += 1) {
    dp[i][0] = -i;
    direction[i][0] = 1;
  }
  for (let j = 1; j <= m; j += 1) {
    dp[0][j] = -j;
    direction[0][j] = 2;
  }
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      const equal = ref[i - 1].key === user[j - 1].key;
      const diagonal = dp[i - 1][j - 1] + (equal ? 2 : -1);
      const up = dp[i - 1][j] - 1;
      const left = dp[i][j - 1] - 1;
      let best = diagonal;
      let move = 0;
      if (up > best) {
        best = up;
        move = 1;
      }
      if (left > best) {
        best = left;
        move = 2;
      }
      dp[i][j] = best;
      direction[i][j] = move;
    }
  }

  const reversed = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const move = i > 0 && j > 0 ? direction[i][j] : i > 0 ? 1 : 2;
    if (move === 0) {
      const reference = ref[i - 1];
      const answerWord = user[j - 1];
      const equal = reference.key === answerWord.key;
      reversed.push({
        type: equal ? 'match' : 'substitution',
        refIndex: i - 1,
        userIndex: j - 1,
        refWord: reference.display,
        userWord: answerWord.display,
      });
      i -= 1;
      j -= 1;
    } else if (move === 1) {
      reversed.push({
        type: 'missing',
        refIndex: i - 1,
        userIndex: null,
        refWord: ref[i - 1].display,
        userWord: null,
      });
      i -= 1;
    } else {
      reversed.push({
        type: 'extra',
        refIndex: null,
        userIndex: j - 1,
        refWord: null,
        userWord: user[j - 1].display,
      });
      j -= 1;
    }
  }
  reversed.reverse();

  let correct = 0;
  let substitutions = 0;
  let missing = 0;
  let extras = 0;
  for (const op of reversed) {
    if (op.type === 'match') correct += 1;
    else if (op.type === 'substitution') substitutions += 1;
    else if (op.type === 'missing') missing += 1;
    else extras += 1;
  }
  const accuracy = (correct / (n + extras)) * 100;
  const wer = ((substitutions + missing + extras) / n) * 100;

  const alignedUser = [];
  const alignedRef = [];
  for (const op of reversed) {
    if (op.type === 'match') {
      alignedUser.push({ status: 'correct', word: op.userWord });
      alignedRef.push({ status: 'correct', word: op.refWord });
    } else if (op.type === 'substitution') {
      alignedUser.push({
        status: 'wrong',
        word: op.userWord,
        expected: op.refWord,
      });
      alignedRef.push({
        status: 'wrong',
        word: op.refWord,
        typed: op.userWord,
      });
    } else if (op.type === 'missing') {
      alignedRef.push({ status: 'missing', word: op.refWord });
    } else {
      alignedUser.push({ status: 'extra', word: op.userWord });
    }
  }

  return {
    total: n,
    correct,
    substitutions,
    missing,
    extras,
    accuracy: Math.round(accuracy * 10) / 10,
    wer: Math.round(wer * 10) / 10,
    perfect: correct === n && extras === 0,
    emptyReference: false,
    ops: reversed,
    alignedUser,
    alignedRef,
    refText: joinTokens(ref),
    answerText: String(answer ?? '').trim(),
  };
}
