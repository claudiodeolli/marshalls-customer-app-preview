import test from 'node:test';
import assert from 'node:assert/strict';

import { scoreAttempt } from '../src/shared/scoring.mjs';

const ref = 'The quick brown fox jumps over the lazy dog'.split(' ').map((display) => ({
  display,
}));

test('perfect answer ignores case and punctuation', () => {
  const result = scoreAttempt(ref, 'the QUICK, brown fox jumps over the lazy dog.');
  assert.equal(result.total, 9);
  assert.equal(result.correct, 9);
  assert.equal(result.accuracy, 100);
  assert.equal(result.perfect, true);
  assert.equal(result.missing, 0);
  assert.equal(result.extras, 0);
});

test('missing word is reported and lowers accuracy', () => {
  const result = scoreAttempt(ref, 'the quick brown fox jumps over the lazy');
  assert.equal(result.correct, 8);
  assert.equal(result.missing, 1);
  assert.equal(result.accuracy, 88.9);
  assert.equal(result.alignedRef.filter((word) => word.status === 'missing').length, 1);
});

test('wrong word is a substitution, not a missing plus extra', () => {
  const result = scoreAttempt(ref, 'the quick brown cat jumps over the lazy dog');
  assert.equal(result.correct, 8);
  assert.equal(result.substitutions, 1);
  assert.equal(result.missing, 0);
  assert.equal(result.extras, 0);
  assert.equal(result.accuracy, 88.9);
  assert.equal(result.alignedRef.find((word) => word.status === 'wrong').typed, 'cat');
});

test('extra words are reported separately', () => {
  const result = scoreAttempt(ref, 'the very quick brown fox jumps over the lazy dog');
  assert.equal(result.correct, 9);
  assert.equal(result.extras, 1);
  assert.equal(result.accuracy, 90);
  assert.equal(result.perfect, false);
  assert.ok(result.wer > 0);
});

test('empty answer reports every reference word missing', () => {
  const result = scoreAttempt(ref, '   ');
  assert.equal(result.correct, 0);
  assert.equal(result.missing, 9);
  assert.equal(result.accuracy, 0);
});

test('order changes are graded as substitutions', () => {
  const result = scoreAttempt(['one', 'two', 'three'], 'one three two');
  assert.ok(result.correct >= 1);
  assert.ok(result.substitutions + result.missing + result.extras >= 1);
  assert.ok(result.accuracy < 100);
});

test('apostrophes and hyphens are normalised', () => {
  const result = scoreAttempt(
    [{ display: "don't" }, { display: 'well' }, { display: 'known' }],
    'dont well known',
  );
  assert.equal(result.correct, 3);
});

test('reference punctuation is irrelevant', () => {
  const result = scoreAttempt(['Hello,', 'world!'], 'hello world');
  assert.equal(result.accuracy, 100);
});
