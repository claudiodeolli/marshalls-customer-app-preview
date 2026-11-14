import test from 'node:test';
import assert from 'node:assert/strict';

import {
  findCutTargetMs,
  referenceForSegment,
  resolveStartMs,
  sliceWords,
} from '../src/shared/segments.mjs';

const words = [
  { display: 'Hello', startMs: 0, endMs: 500 },
  { display: 'world', startMs: 1000, endMs: 1500 },
  { display: 'again', startMs: 2000, endMs: 2500 },
];

test('sliceWords uses the midpoint of each word', () => {
  assert.deepEqual(
    sliceWords(words, 0, 1500).map((word) => word.display),
    ['Hello', 'world'],
  );
  assert.deepEqual(
    sliceWords(words, 1250, 1500).map((word) => word.display),
    ['world'],
  );
  assert.deepEqual(sliceWords(words, 1700, 1900), []);
});

test('sliceWords handles reversed intervals defensively', () => {
  assert.equal(sliceWords(words, 1500, 0).length, 2);
});

test('referenceForSegment reports the exact words and text', () => {
  const reference = referenceForSegment(words, 900, 1600);
  assert.equal(reference.count, 1);
  assert.equal(reference.text, 'world');
  assert.equal(reference.durationMs, 700);
});

test('findCutTargetMs snaps to the next word boundary inside the window', () => {
  const result = findCutTargetMs(words, 0, 2000, { windowMs: 650 });
  assert.equal(result.snapped, true);
  assert.equal(result.targetMs, 1972);
  assert.equal(result.boundaryMs, 2000);
});

test('findCutTargetMs falls back to the exact target when there is no boundary', () => {
  const result = findCutTargetMs(words, 0, 600, { windowMs: 200 });
  assert.equal(result.snapped, false);
  assert.equal(result.targetMs, 600);
});

test('findCutTargetMs prefers a boundary with reliable timing', () => {
  const mixed = [
    { display: 'a', startMs: 1800, endMs: 1900, stable: true },
    { display: 'b', startMs: 1980, endMs: 2100, stable: false },
  ];
  const result = findCutTargetMs(mixed, 0, 2000, { windowMs: 650 });
  assert.equal(result.targetMs, 1772);
  const fallback = findCutTargetMs(
    [{ display: 'b', startMs: 1980, endMs: 2100, stable: false }],
    0,
    2000,
    { windowMs: 650 },
  );
  assert.equal(fallback.targetMs, 1952);
});

test('findCutTargetMs never cuts before the minimum segment length', () => {
  const result = findCutTargetMs(
    [{ display: 'a', startMs: 300, endMs: 500 }],
    0,
    1000,
    { minSegmentMs: 500 },
  );
  assert.equal(result.snapped, false);
});

test('resolveStartMs defaults to just before the first spoken word', () => {
  const result = resolveStartMs(words, null);
  assert.equal(result.startMs, 0);
  assert.equal(result.reason, 'first-word');
  const later = resolveStartMs(
    [{ display: 'hello', startMs: 27000, endMs: 27500 }],
    null,
  );
  assert.equal(later.startMs, 26880);
});

test('resolveStartMs avoids starting inside a word', () => {
  const speech = [
    { display: 'first', startMs: 0, endMs: 800 },
    { display: 'second', startMs: 900, endMs: 1700 },
  ];
  const result = resolveStartMs(speech, 400);
  assert.equal(result.startMs, 830);
  assert.equal(result.reason, 'mid-word');
});

test('resolveStartMs nudges a requested time near a boundary', () => {
  const result = resolveStartMs(words, 950);
  assert.equal(result.startMs, 930);
  assert.equal(result.reason, 'boundary');
});
