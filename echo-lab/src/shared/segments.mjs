// Segment math: choosing natural cut points, resolving a start time and
// extracting the words that belong to the exact interval that was heard.

import { joinTokens } from './text.mjs';

/** Words whose midpoint falls inside [startMs, endMs]. */
export function sliceWords(words, startMs, endMs) {
  if (!Array.isArray(words) || !words.length) return [];
  const from = Math.max(0, Math.min(startMs, endMs));
  const to = Math.max(startMs, endMs);
  return words.filter((word) => {
    const midpoint = (word.startMs + word.endMs) / 2;
    return midpoint >= from - 0.5 && midpoint <= to + 0.5;
  });
}

/**
 * Reference for a cut. The interval is exactly what the player reported, and
 * words are selected by midpoint so a word heard only at its very beginning
 * does not count as "said" in the segment.
 */
export function referenceForSegment(words, startMs, endMs) {
  const slice = sliceWords(words, startMs, endMs);
  return {
    words: slice,
    text: joinTokens(slice),
    count: slice.length,
    startMs,
    endMs,
    durationMs: Math.max(0, endMs - startMs),
  };
}

/**
 * Pick a cut slightly before the next word starts near the requested target.
 * This keeps cuts out of the middle of words while staying within `windowMs`
 * of the requested interval. The caller still records the real player time.
 */
export function findCutTargetMs(words, segmentStartMs, intervalMs, options = {}) {
  const windowMs = options.windowMs ?? 650;
  const minSegmentMs = options.minSegmentMs ?? 500;
  const preferStable = options.preferStable !== false;
  const raw = segmentStartMs + intervalMs;
  if (!Array.isArray(words) || !words.length) {
    return { targetMs: raw, snapped: false, boundaryMs: null };
  }
  const minimum = segmentStartMs + Math.min(minSegmentMs, intervalMs * 0.25);
  const pick = (onlyStable) => {
    let best = null;
    for (const word of words) {
      if (onlyStable && word.stable === false) continue;
      const boundary = word.startMs - 28;
      if (boundary <= minimum) continue;
      if (boundary <= raw && boundary >= raw - windowMs) {
        if (best === null || boundary > best) best = boundary;
      }
    }
    return best;
  };
  let best = preferStable ? pick(true) : null;
  if (best === null) best = pick(false);
  if (best === null) return { targetMs: raw, snapped: false, boundaryMs: null };
  return { targetMs: best, snapped: true, boundaryMs: best + 28 };
}

/**
 * Resolve where playback should start. When no explicit start is requested we
 * start a little before the first spoken word (skipping intros). If the
 * requested time lands inside a word, move to the next boundary.
 */
export function resolveStartMs(words, requestedMs = null) {
  if (!Array.isArray(words) || !words.length) {
    return { startMs: Math.max(0, requestedMs ?? 0), adjusted: false, reason: 'empty' };
  }
  if (requestedMs === null || requestedMs === undefined) {
    const first = words[0];
    return {
      startMs: Math.max(0, first.startMs - 120),
      adjusted: true,
      reason: 'first-word',
    };
  }
  const requested = Math.max(0, requestedMs);
  const inside = words.find(
    (word) => requested > word.startMs + 80 && requested < word.endMs - 80,
  );
  if (inside) {
    const next = words.find((word) => word.startMs > requested);
    if (next) {
      return { startMs: Math.max(0, next.startMs - 70), adjusted: true, reason: 'mid-word' };
    }
  }
  const upcoming =
    words.find((word) => word.stable !== false && word.startMs >= requested - 120) ||
    words.find((word) => word.startMs >= requested - 120);
  if (upcoming && upcoming.startMs - requested < 400) {
    return { startMs: Math.max(0, upcoming.startMs - 70), adjusted: true, reason: 'boundary' };
  }
  return { startMs: requested, adjusted: false, reason: 'exact' };
}

export function estimateSegmentCount(durationMs, intervalMs) {
  if (!Number.isFinite(durationMs) || durationMs <= 0 || intervalMs <= 0) return 0;
  return Math.max(1, Math.ceil(durationMs / intervalMs));
}
