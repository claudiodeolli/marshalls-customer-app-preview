import test from 'node:test';
import assert from 'node:assert/strict';

import { alignTokens, similarity } from '../src/shared/alignment.mjs';

test('alignTokens finds exact matches in order', () => {
  const result = alignTokens(
    ['a', 'few', 'years', 'ago', 'i', 'broke'],
    ['a', 'few', 'years', 'ago', 'i', 'broke', 'into'],
  );
  assert.deepEqual(result.matches.map((match) => match.a), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(result.matches.map((match) => match.b), [0, 1, 2, 3, 4, 5]);
});

test('alignTokens tolerates ASR spelling differences and fillers', () => {
  const result = alignTokens(
    ['in', 'montreal', 'winter'],
    ['in', 'uh', 'montreal', 'winter'],
  );
  assert.deepEqual(result.matches.map((match) => match.a), [0, 1, 2]);
  assert.deepEqual(result.matches.map((match) => match.b), [0, 2, 3]);
});

test('alignTokens does not fuzzy-match short unrelated words', () => {
  assert.equal(similarity('cat', 'cut'), 0);
  assert.equal(similarity('the', 'tea'), 0);
  const result = alignTokens(['cat'], ['cut']);
  assert.equal(result.matches.length, 0);
});

test('alignTokens accepts a one-letter ASR typo on long words', () => {
  assert.ok(similarity('montreal', 'montreall') > 0.8);
  assert.ok(similarity('colour', 'color') > 0.7);
});

test('alignTokens keeps monotonic order when the answer repeats a word', () => {
  const result = alignTokens(['no', 'no', 'no'], ['no', 'yes', 'no', 'no']);
  assert.deepEqual(result.matches.map((match) => match.b), [0, 2, 3]);
});
