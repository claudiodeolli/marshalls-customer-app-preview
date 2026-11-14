// Parsing of YouTube timedtext JSON3 tracks and construction of a timed word
// list. Manual captions carry cue-level timing only; when an ASR track exists
// we align the human text to the ASR word timings so that cutting an arbitrary
// interval still yields the right words.

import {
  decodeEntities,
  estimateWordDurationMs,
  isFiller,
  normalizeToken,
  stripAnnotations,
  tokenize,
} from './text.mjs';
import { alignTokens } from './alignment.mjs';

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeCaptionText(value) {
  return stripAnnotations(value).replace(/\s+/g, ' ').trim();
}

function collectEventTokens(segs, startMs, endMs) {
  // An ASR segment normally contains one word. Some tracks put a short phrase
  // in a single segment; split it and distribute the interval by length.
  const tokens = [];
  for (let segIndex = 0; segIndex < segs.length; segIndex += 1) {
    const seg = segs[segIndex];
    const text = normalizeCaptionText(decodeEntities(seg?.utf8 ?? ''));
    if (!text) continue;
    const words = tokenize(text);
    if (!words.length) continue;
    const segStart = startMs + (typeof seg.tOffsetMs === 'number' ? seg.tOffsetMs : 0);
    const nextSeg = segs[segIndex + 1];
    const segEnd =
      nextSeg && typeof nextSeg.tOffsetMs === 'number'
        ? startMs + nextSeg.tOffsetMs
        : Math.max(segStart + 80, endMs);
    const weights = words.map((word) => Math.max(1, word.norm.length));
    const total = weights.reduce((sum, value) => sum + value, 0);
    let cursor = 0;
    words.forEach((word, index) => {
      if (isFiller(word.norm)) return;
      const before = cursor;
      cursor += weights[index];
      const tokenStart = segStart + ((segEnd - segStart) * before) / total;
      const tokenEnd = segStart + ((segEnd - segStart) * cursor) / total;
      tokens.push({
        display: word.display,
        norm: word.norm,
        startMs: Math.round(tokenStart),
        rawEndMs: Math.round(tokenEnd),
      });
    });
  }
  return tokens;
}

function finalizeAsrWords(tokens) {
  const sorted = tokens
    .filter((token) => Number.isFinite(token.startMs) && token.norm)
    .sort((a, b) => a.startMs - b.startMs || a.rawEndMs - b.rawEndMs);
  const words = [];
  for (const token of sorted) {
    const previous = words[words.length - 1];
    if (
      previous &&
      previous.norm === token.norm &&
      Math.abs(previous.startMs - token.startMs) < 60
    ) {
      continue;
    }
    let start = token.startMs;
    if (previous && start <= previous.startMs) start = previous.startMs + 4;
    words.push({
      display: token.display,
      norm: token.norm,
      startMs: start,
      rawEndMs: Math.max(start + 60, token.rawEndMs ?? start + 300),
    });
  }
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    const next = words[index + 1];
    const cap = word.startMs + Math.max(220, Math.min(1200, estimateWordDurationMs(word.display) * 1.8));
    const end = Math.min(
      next ? next.startMs : Number.POSITIVE_INFINITY,
      word.rawEndMs,
      cap,
    );
    word.endMs = Math.max(word.startMs + 60, Math.round(end));
    delete word.rawEndMs;
  }
  return words;
}

/**
 * Parse a JSON3 caption track.
 *
 * @param {string|object} raw
 * @param {'asr'|'manual'} kind
 * @returns {{cues: Array<{startMs:number,endMs:number,text:string}>, asrWords: Array}}
 */
export function parseCaptionJson(raw, kind) {
  let data;
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return { cues: [], asrWords: [] };
  }
  const events = Array.isArray(data?.events) ? data.events : [];
  const cues = [];
  const tokens = [];

  for (const event of events) {
    if (!Array.isArray(event?.segs) || !event.segs.length) continue;
    const startMs = Math.max(0, Math.round(toNumber(event.tStartMs)));
    const duration = Math.max(0, Math.round(toNumber(event.dDurationMs)));
    const endMs = startMs + duration;

    if (kind === 'asr') {
      tokens.push(...collectEventTokens(event.segs, startMs, endMs));
      continue;
    }

    const text = normalizeCaptionText(
      decodeEntities(event.segs.map((seg) => seg?.utf8 ?? '').join('')),
    );
    if (!text) continue;
    const estimated = Math.max(500, text.length * 55);
    cues.push({
      startMs,
      endMs: Math.max(startMs + 100, endMs || startMs + estimated),
      text,
    });
  }

  if (kind === 'asr') {
    return { cues: [], asrWords: finalizeAsrWords(tokens) };
  }

  cues.sort((a, b) => a.startMs - b.startMs);
  return { cues, asrWords: [] };
}

function findCandidates(asrWords, cue, state) {
  if (!asrWords.length) return [];
  const windowStart = cue.startMs - 2000;
  const windowEnd = cue.endMs + 2000;
  while (state.cursor < asrWords.length && asrWords[state.cursor].endMs < windowStart) {
    state.cursor += 1;
  }
  const candidates = [];
  for (let index = state.cursor; index < asrWords.length; index += 1) {
    const word = asrWords[index];
    if (word.startMs > windowEnd || candidates.length >= 500) break;
    if (word.endMs >= windowStart) candidates.push(word);
  }
  return candidates;
}

function interpolateGap(starts, weights, fromIndex, toIndex, fromTime, toTime) {
  if (toIndex <= fromIndex + 1) return;
  let total = 0;
  for (let index = fromIndex + 1; index < toIndex; index += 1) {
    total += weights[index] || 1;
  }
  if (total <= 0) return;
  let cursor = 0;
  const span = Math.max(0, toTime - fromTime);
  for (let index = fromIndex + 1; index < toIndex; index += 1) {
    const weight = weights[index] || 1;
    const midpoint = cursor + weight / 2;
    starts[index] = fromTime + (span * midpoint) / total;
    cursor += weight;
  }
}

function fillBeforeFirstAnchor(starts, weights, firstIndex, anchorTime) {
  let limit = anchorTime;
  for (let index = firstIndex - 1; index >= 0; index -= 1) {
    const wordDuration = 90 + Math.max(1, weights[index] || 1) * 55;
    const start = limit - Math.min(900, Math.max(190, wordDuration));
    starts[index] = start;
    limit = start - 30;
    if (limit < -2000) break;
  }
}

function fillAfterLastAnchor(starts, weights, lastIndex, anchorTime) {
  let limit = anchorTime;
  for (let index = lastIndex + 1; index < starts.length; index += 1) {
    const wordDuration = 90 + Math.max(1, weights[index] || 1) * 55;
    const start = limit + Math.max(120, Math.min(900, wordDuration));
    starts[index] = start;
    limit = start;
  }
}

function buildCueWords(cue, cueIndex, asrWords, state) {
  const tokens = tokenize(cue.text);
  if (!tokens.length) return [];
  const weights = tokens.map((token) => Math.max(1, token.norm.length));
  const candidates = findCandidates(asrWords, cue, state);
  const matches = candidates.length
    ? alignTokens(
        tokens.map((token) => token.norm),
        candidates.map((word) => word.norm),
      ).matches
    : [];

  const anchors = new Map();
  let lastAnchorTime = -Infinity;
  for (const match of matches) {
    const candidate = candidates[match.b];
    const time = candidate.startMs;
    if (time < cue.startMs - 1500 || time > cue.endMs + 1500) continue;
    if (time <= lastAnchorTime + 10) continue;
    anchors.set(match.a, time);
    lastAnchorTime = time;
  }

  const starts = new Array(tokens.length).fill(null);
  for (const [index, time] of anchors) starts[index] = time;
  const anchorIndexes = [...anchors.keys()].sort((a, b) => a - b);

  if (anchorIndexes.length) {
    for (let position = 0; position < anchorIndexes.length; position += 1) {
      const current = anchorIndexes[position];
      const next = anchorIndexes[position + 1];
      if (next !== undefined) {
        interpolateGap(
          starts,
          weights,
          current,
          next,
          anchors.get(current),
          anchors.get(next),
        );
      }
    }
    fillBeforeFirstAnchor(
      starts,
      weights,
      anchorIndexes[0],
      anchors.get(anchorIndexes[0]),
    );
    fillAfterLastAnchor(
      starts,
      weights,
      anchorIndexes[anchorIndexes.length - 1],
      anchors.get(anchorIndexes[anchorIndexes.length - 1]),
    );
  } else {
    // No ASR anchors: distribute the human caption text across its cue.
    const from = Math.max(0, cue.startMs - 80);
    const to = Math.max(from + 250, cue.endMs);
    interpolateGap(starts, weights, -1, tokens.length, from, to);
  }

  for (let index = 0; index < starts.length; index += 1) {
    if (!Number.isFinite(starts[index])) starts[index] = cue.startMs + index * 120;
    starts[index] = Math.max(0, starts[index]);
    if (index > 0 && starts[index] <= starts[index - 1]) {
      starts[index] = starts[index - 1] + 8;
    }
  }

  const words = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const start = Math.round(starts[index]);
    const nextStart = index + 1 < starts.length ? Math.round(starts[index + 1]) : null;
    const estimate = estimateWordDurationMs(token.display);
    let end = nextStart !== null && nextStart > start + 45
      ? nextStart
      : start + estimate;
    end = Math.min(start + 1200, Math.max(start + 70, end));
    words.push({
      display: token.display,
      norm: token.norm,
      startMs: start,
      endMs: Math.round(end),
      cueIndex,
      stable: anchors.has(index),
    });
  }
  return words;
}

/**
 * Build a sorted, monotonic word list.
 *
 * @param {{kind:'manual'|'asr', cues:Array, asrWords:Array}} input
 */
export function buildTimedWords({ kind, cues, asrWords }) {
  if (kind === 'asr') {
    const words = finalizeAsrWords(
      (asrWords || []).map((word) => ({
        display: word.display,
        norm: word.norm ?? normalizeToken(word.display),
        startMs: word.startMs,
        rawEndMs: word.endMs ?? word.startMs + estimateWordDurationMs(word.display),
      })),
    ).map((word) => ({ ...word, stable: true }));
    return {
      words,
      timing: 'asr',
      anchored: words.length,
      total: words.length,
      coverage: words.length ? 1 : 0,
    };
  }

  const manualCues = [...(cues || [])].sort((a, b) => a.startMs - b.startMs);
  const timings = [...(asrWords || [])].sort((a, b) => a.startMs - b.startMs);
  const state = { cursor: 0 };
  const collected = [];
  let anchored = 0;
  let total = 0;

  manualCues.forEach((cue, cueIndex) => {
    const words = buildCueWords(cue, cueIndex, timings, state);
    for (const word of words) {
      total += 1;
      if (word.stable) anchored += 1;
      collected.push(word);
    }
  });

  collected.sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);

  // Keep timing monotonic across caption cues. Overlapping cues are rare but
  // do happen on some manually authored tracks.
  const words = [];
  let previousStart = -1;
  for (const word of collected) {
    if (word.startMs <= previousStart) word.startMs = previousStart + 5;
    if (word.endMs <= word.startMs) word.endMs = word.startMs + 80;
    if (words.length) {
      const previous = words[words.length - 1];
      if (word.startMs < previous.endMs) {
        // Do not let words overlap absurdly; the midpoint slicing only needs
        // a plausible centre, so clamping is safe.
        previous.endMs = Math.max(previous.startMs + 60, word.startMs - 4);
      }
    }
    words.push(word);
    previousStart = word.startMs;
  }

  return {
    words,
    timing: anchored > 0 ? 'asr-aligned' : 'interpolated',
    anchored,
    total,
    coverage: total ? anchored / total : 0,
  };
}
