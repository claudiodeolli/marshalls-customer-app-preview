import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TranscriptError,
  buildPlayerSnapshot,
  buildTranscriptData,
  extractVideoId,
  loadTranscript,
  selectTrack,
} from '../src/server/youtube.mjs';

const manualJson = JSON.stringify({
  events: [
    { tStartMs: 1000, dDurationMs: 3000, segs: [{ utf8: 'Hello there, friend.' }] },
    { tStartMs: 4500, dDurationMs: 2500, segs: [{ utf8: 'How are you today?' }] },
  ],
});

const asrJson = JSON.stringify({
  events: [
    {
      tStartMs: 1000,
      dDurationMs: 3000,
      segs: [
        { utf8: 'hello' },
        { utf8: ' there', tOffsetMs: 380 },
        { utf8: ' friend', tOffsetMs: 900 },
      ],
    },
    {
      tStartMs: 4500,
      dDurationMs: 2500,
      segs: [
        { utf8: 'how' },
        { utf8: ' are', tOffsetMs: 300 },
        { utf8: ' you', tOffsetMs: 500 },
        { utf8: ' today', tOffsetMs: 700 },
      ],
    },
  ],
});

function playerRaw({ english = true } = {}) {
  const tracks = english
    ? [
        {
          languageCode: 'en',
          name: { simpleText: 'English' },
          baseUrl: 'https://www.youtube.com/api/timedtext?v=abc&lang=en',
        },
        {
          languageCode: 'en',
          kind: 'asr',
          name: { simpleText: 'English (auto-generated)' },
          baseUrl: 'https://www.youtube.com/api/timedtext?v=abc&lang=en&kind=asr',
        },
        {
          languageCode: 'es',
          name: { simpleText: 'Spanish' },
          baseUrl: 'https://www.youtube.com/api/timedtext?v=abc&lang=es',
        },
      ]
    : [
        {
          languageCode: 'es',
          name: { simpleText: 'Spanish' },
          baseUrl: 'https://www.youtube.com/api/timedtext?v=abc&lang=es',
        },
      ];
  return {
    videoDetails: {
      videoId: 'abcdefghijk',
      title: 'Test video',
      author: 'Tester',
      lengthSeconds: '120',
    },
    playabilityStatus: { status: 'OK' },
    captions: { playerCaptionsTracklistRenderer: { captionTracks: tracks } },
  };
}

function fakeFetch({ manualStatus = 200, asrStatus = 200 } = {}) {
  const calls = [];
  const impl = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('/youtubei/v1/player')) {
      return new Response(JSON.stringify(playerRaw()), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (String(url).includes('timedtext')) {
      const isAsr = /kind=asr/.test(String(url));
      const status = isAsr ? asrStatus : manualStatus;
      const body = status === 200 ? (isAsr ? asrJson : manualJson) : '';
      return new Response(body, {
        status,
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response('not found', { status: 404 });
  };
  impl.calls = calls;
  return impl;
}

test('extractVideoId accepts common YouTube URL shapes', () => {
  assert.equal(extractVideoId('https://www.youtube.com/watch?v=iG9CE55wbtY'), 'iG9CE55wbtY');
  assert.equal(extractVideoId('https://youtu.be/iG9CE55wbtY?t=10'), 'iG9CE55wbtY');
  assert.equal(extractVideoId('youtube.com/shorts/iG9CE55wbtY'), 'iG9CE55wbtY');
  assert.equal(extractVideoId('https://www.youtube.com/embed/iG9CE55wbtY'), 'iG9CE55wbtY');
  assert.equal(extractVideoId('https://www.youtube.com/live/iG9CE55wbtY'), 'iG9CE55wbtY');
  assert.equal(extractVideoId('iG9CE55wbtY'), 'iG9CE55wbtY');
  assert.equal(extractVideoId('https://example.com/watch?v=iG9CE55wbtY'), null);
  assert.equal(extractVideoId('abc'), null);
  assert.equal(extractVideoId(''), null);
});

test('buildPlayerSnapshot keeps English tracks and rejects non-YouTube URLs', () => {
  const raw = playerRaw();
  raw.captions.playerCaptionsTracklistRenderer.captionTracks.push({
    languageCode: 'en',
    name: { simpleText: 'Evil' },
    baseUrl: 'https://evil.example.com/api/timedtext?x=1',
  });
  const snapshot = buildPlayerSnapshot(raw, 'abcdefghijk');
  assert.equal(snapshot.videoId, 'abcdefghijk');
  assert.equal(snapshot.durationMs, 120000);
  assert.deepEqual(
    snapshot.captionTracks.map((track) => track.key),
    ['en:manual', 'en:asr'],
  );
  assert.ok(snapshot.captionTracks.every((track) => track.baseUrl.includes('youtube.com')));
  assert.equal(snapshot.availableLanguages.includes('es'), true);
});

test('selectTrack prefers manual captions and validates a requested key', () => {
  const snapshot = buildPlayerSnapshot(playerRaw(), 'abcdefghijk');
  assert.equal(selectTrack(snapshot.captionTracks).key, 'en:manual');
  assert.equal(selectTrack(snapshot.captionTracks, 'en:asr').key, 'en:asr');
  assert.throws(
    () => selectTrack(snapshot.captionTracks, 'pt:manual'),
    (error) => error instanceof TranscriptError && error.code === 'INVALID_TRACK',
  );
});

test('buildTranscriptData aligns human text to ASR word timings', () => {
  const snapshot = buildPlayerSnapshot(playerRaw(), 'abcdefghijk');
  const selected = selectTrack(snapshot.captionTracks);
  const data = buildTranscriptData({
    player: snapshot,
    selectedTrack: selected,
    manualRaw: manualJson,
    asrRaw: asrJson,
  });
  assert.equal(data.source, 'manual');
  assert.equal(data.timing, 'asr-aligned');
  assert.equal(data.alignment.anchored, 7);
  assert.deepEqual(
    data.words.map((word) => word.display),
    ['Hello', 'there,', 'friend.', 'How', 'are', 'you', 'today?'],
  );
  assert.deepEqual(
    data.words.map((word) => word.startMs),
    [1000, 1380, 1900, 4500, 4800, 5000, 5200],
  );
  assert.equal(data.warnings.length, 0);
});

test('buildTranscriptData falls back to interpolated manual timing', () => {
  const snapshot = buildPlayerSnapshot(playerRaw(), 'abcdefghijk');
  const selected = selectTrack(snapshot.captionTracks);
  const data = buildTranscriptData({
    player: snapshot,
    selectedTrack: selected,
    manualRaw: manualJson,
    asrRaw: null,
  });
  assert.equal(data.timing, 'interpolated');
  assert.ok(data.warnings.length >= 1);
  assert.equal(data.words.length, 7);
});

test('loadTranscript returns manual captions with timing metadata', async () => {
  const data = await loadTranscript('abcdefghijk', { fetchImpl: fakeFetch() });
  assert.equal(data.title, 'Test video');
  assert.equal(data.source, 'manual');
  assert.equal(data.timing, 'asr-aligned');
  assert.equal(data.selectedTrack.key, 'en:manual');
  assert.equal(data.tracks.length, 2);
  assert.equal(data.wordCount, 7);
});

test('loadTranscript honours an explicit ASR track', async () => {
  const data = await loadTranscript('abcdefghijk', {
    trackKey: 'en:asr',
    fetchImpl: fakeFetch(),
  });
  assert.equal(data.source, 'asr');
  assert.equal(data.timing, 'asr');
  assert.equal(data.selectedTrack.key, 'en:asr');
});

test('loadTranscript reports a video without English captions', async () => {
  const impl = async (url) => {
    if (String(url).includes('/youtubei/v1/player')) {
      return new Response(JSON.stringify(playerRaw({ english: false })), { status: 200 });
    }
    return new Response('', { status: 404 });
  };
  await assert.rejects(
    loadTranscript('abcdefghijk', { fetchImpl: impl }),
    (error) =>
      error instanceof TranscriptError && error.code === 'NO_ENGLISH_CAPTIONS',
  );
});

test('loadTranscript falls back to ASR when the manual track is unavailable', async () => {
  const data = await loadTranscript('abcdefghijk', {
    fetchImpl: fakeFetch({ manualStatus: 403 }),
  });
  assert.equal(data.source, 'asr');
  assert.equal(data.timing, 'asr');
  assert.equal(data.selectedTrack.key, 'en:asr');
  assert.match(data.warnings[0], /transcrição automática/i);
});

test('loadTranscript surfaces an unavailable video', async () => {
  const impl = async () =>
    new Response(
      JSON.stringify({
        playabilityStatus: { status: 'LOGIN_REQUIRED', reason: 'Sign in' },
        videoDetails: { videoId: 'abcdefghijk', title: 'x' },
      }),
      { status: 200 },
    );
  await assert.rejects(
    loadTranscript('abcdefghijk', { fetchImpl: impl }),
    (error) => error instanceof TranscriptError && error.code === 'VIDEO_UNAVAILABLE',
  );
});
