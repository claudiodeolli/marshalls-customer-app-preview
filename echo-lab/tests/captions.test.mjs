import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTimedWords, parseCaptionJson } from '../src/shared/captions.mjs';

const asrRaw = {
  events: [
    {
      tStartMs: 26560,
      dDurationMs: 6400,
      segs: [{ utf8: 'good' }, { utf8: ' morning', tOffsetMs: 160 }],
    },
    {
      tStartMs: 33000,
      dDurationMs: 2000,
      segs: [
        { utf8: " it's" },
        { utf8: ' a', tOffsetMs: 200 },
        { utf8: ' test', tOffsetMs: 350 },
      ],
    },
    { tStartMs: 35000, dDurationMs: 1000, segs: [{ utf8: '[Music]' }] },
    { tStartMs: 36000, dDurationMs: 500, segs: [{ utf8: '\n' }] },
  ],
};

const manualRaw = {
  events: [
    {
      tStartMs: 26560,
      dDurationMs: 6400,
      segs: [{ utf8: 'Good morning. How are you?' }],
    },
    {
      tStartMs: 33000,
      dDurationMs: 3000,
      segs: [{ utf8: "It's a test --\nreally." }],
    },
    { tStartMs: 36000, dDurationMs: 1000, segs: [{ utf8: '(Audience) Good.' }] },
  ],
};

test('parseCaptionJson extracts ASR word starts and ends', () => {
  const parsed = parseCaptionJson(asrRaw, 'asr');
  assert.equal(parsed.cues.length, 0);
  assert.deepEqual(
    parsed.asrWords.map((word) => word.display),
    ['good', 'morning', "it's", 'a', 'test'],
  );
  assert.deepEqual(
    parsed.asrWords.map((word) => word.startMs),
    [26560, 26720, 33000, 33200, 33350],
  );
  for (const word of parsed.asrWords) {
    assert.ok(word.endMs > word.startMs);
  }
});

test('parseCaptionJson extracts human cues and strips annotations', () => {
  const parsed = parseCaptionJson(manualRaw, 'manual');
  assert.equal(parsed.asrWords.length, 0);
  assert.equal(parsed.cues.length, 3);
  assert.equal(parsed.cues[0].text, 'Good morning. How are you?');
  assert.equal(parsed.cues[2].text, 'Good.');
});

test('ASR fillers and music are dropped', () => {
  const parsed = parseCaptionJson(
    {
      events: [
        {
          tStartMs: 0,
          dDurationMs: 3000,
          segs: [
            { utf8: 'um' },
            { utf8: ' hello', tOffsetMs: 300 },
            { utf8: ' uh', tOffsetMs: 900 },
            { utf8: ' world', tOffsetMs: 1500 },
          ],
        },
      ],
    },
    'asr',
  );
  assert.deepEqual(parsed.asrWords.map((word) => word.display), ['hello', 'world']);
});

test('manual captions get ASR-aligned word timings', () => {
  const asr = parseCaptionJson(
    {
      events: [
        {
          tStartMs: 26560,
          dDurationMs: 3000,
          segs: [
            { utf8: 'good' },
            { utf8: ' morning', tOffsetMs: 160 },
            { utf8: ' how', tOffsetMs: 940 },
            { utf8: ' are', tOffsetMs: 1240 },
            { utf8: ' you', tOffsetMs: 1440 },
          ],
        },
      ],
    },
    'asr',
  ).asrWords;
  const manual = parseCaptionJson(manualRaw, 'manual');
  const built = buildTimedWords({
    kind: 'manual',
    cues: manual.cues.slice(0, 1),
    asrWords: asr,
  });
  assert.equal(built.timing, 'asr-aligned');
  assert.equal(built.anchored, 5);
  assert.equal(built.coverage, 1);
  assert.deepEqual(
    built.words.map((word) => word.startMs),
    [26560, 26720, 27500, 27800, 28000],
  );
  assert.deepEqual(
    built.words.map((word) => word.display),
    ['Good', 'morning.', 'How', 'are', 'you?'],
  );
});

test('manual captions without ASR are interpolated inside the cue', () => {
  const built = buildTimedWords({
    kind: 'manual',
    cues: [{ startMs: 1000, endMs: 4000, text: 'Hello world again' }],
    asrWords: [],
  });
  assert.equal(built.timing, 'interpolated');
  assert.equal(built.words.length, 3);
  assert.ok(built.words[0].startMs >= 900);
  assert.ok(built.words[2].startMs < 4000);
  assert.ok(built.words[0].startMs < built.words[1].startMs);
  assert.ok(built.words[1].startMs < built.words[2].startMs);
  for (const word of built.words) {
    assert.ok(word.endMs > word.startMs);
  }
});

test('manual word timing stays monotonic when timing anchors are noisy', () => {
  const built = buildTimedWords({
    kind: 'manual',
    cues: [
      { startMs: 1000, endMs: 2500, text: 'one two three' },
      { startMs: 2200, endMs: 4000, text: 'three four' },
    ],
    asrWords: [
      { display: 'one', norm: 'one', startMs: 1000, endMs: 1200 },
      { display: 'two', norm: 'two', startMs: 1200, endMs: 1400 },
      { display: 'three', norm: 'three', startMs: 1400, endMs: 1700 },
      { display: 'four', norm: 'four', startMs: 2400, endMs: 2700 },
    ],
  });
  const starts = built.words.map((word) => word.startMs);
  for (let index = 1; index < starts.length; index += 1) {
    assert.ok(starts[index] > starts[index - 1], `start ${index} is monotonic`);
  }
});

test('ASR word list remains monotonic when tracks contain duplicate starts', () => {
  const built = buildTimedWords({
    kind: 'asr',
    cues: [],
    asrWords: [
      { display: 'hello', norm: 'hello', startMs: 1000, endMs: 1200 },
      { display: 'hello', norm: 'hello', startMs: 1000, endMs: 1200 },
      { display: 'world', norm: 'world', startMs: 1000, endMs: 1500 },
    ],
  });
  assert.equal(built.words.length, 2);
  assert.ok(built.words[1].startMs > built.words[0].startMs);
});
