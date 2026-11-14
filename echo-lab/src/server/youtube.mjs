// YouTube transcript provider.
//
// Why the iOS innertube client: as of 2026 the public `timedtext` endpoint
// returns empty bodies to server-side requests and `get_transcript` is gated
// behind BotGuard. The player endpoint for the iOS client still returns
// caption tracks with usable URLs (verified), including per-word offsets on
// the ASR track. No video or audio is downloaded.

import { buildTimedWords, parseCaptionJson } from '../shared/captions.mjs';

const IOS_UA =
  'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X;)';
const DEFAULT_CLIENT_VERSION = process.env.YT_CLIENT_VERSION || '20.10.4';
const PLAYER_TTL_MS = 6 * 60 * 60 * 1000;
const CAPTIONS_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class TranscriptError extends Error {
  constructor(code, message, status = 500, details = null) {
    super(message);
    this.name = 'TranscriptError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function extractVideoId(input) {
  if (typeof input !== 'string') return null;
  const value = input.trim();
  if (!value) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;
  let url;
  try {
    url = new URL(value.startsWith('http') ? value : `https://${value}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  }
  if (!/(^|\.)youtube(-nocookie)?\.com$/.test(host)) return null;
  const fromQuery = url.searchParams.get('v');
  if (fromQuery && /^[A-Za-z0-9_-]{11}$/.test(fromQuery)) return fromQuery;
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length >= 2 && ['embed', 'shorts', 'live', 'v'].includes(parts[0])) {
    const id = parts[1];
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  }
  return null;
}

function trackKind(track) {
  return track?.kind === 'asr' ? 'asr' : 'manual';
}

function trackName(track) {
  return (
    track?.name?.simpleText ||
    track?.name?.runs?.map((run) => run.text).join('') ||
    track?.languageCode ||
    ''
  );
}

function safeCaptionUrl(baseUrl) {
  try {
    const url = new URL(baseUrl);
    if (!/(^|\.)youtube\.com$/i.test(url.hostname)) return null;
    if (!url.pathname.includes('/api/timedtext')) return null;
    return url;
  } catch {
    return null;
  }
}

/** Reduce an innertube player response to the fields this app needs. */
export function buildPlayerSnapshot(raw, expectedVideoId = null) {
  const videoDetails = raw?.videoDetails || {};
  const videoId = videoDetails.videoId || expectedVideoId;
  const status = raw?.playabilityStatus?.status || 'UNKNOWN';
  const tracks = raw?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  const english = [];
  const seen = new Set();
  for (const track of tracks) {
    if (!/^en(-|$)/i.test(track?.languageCode || '')) continue;
    const kind = trackKind(track);
    const key = `${track.languageCode}:${kind}`;
    if (seen.has(key)) continue;
    const url = safeCaptionUrl(track.baseUrl);
    if (!url) continue;
    seen.add(key);
    english.push({
      key,
      languageCode: track.languageCode,
      kind,
      name: trackName(track),
      baseUrl: url.toString(),
    });
  }
  english.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'manual' ? -1 : 1;
    if (a.languageCode === 'en' && b.languageCode !== 'en') return -1;
    if (b.languageCode === 'en' && a.languageCode !== 'en') return 1;
    return a.languageCode.localeCompare(b.languageCode);
  });
  const allLanguages = [
    ...new Set(tracks.map((track) => track?.languageCode).filter(Boolean)),
  ].sort();
  return {
    videoId,
    title: String(videoDetails.title || ''),
    author: String(videoDetails.author || ''),
    durationMs: Math.max(0, Number(videoDetails.lengthSeconds || 0) * 1000),
    playability: {
      status,
      reason: raw?.playabilityStatus?.reason || '',
    },
    captionTracks: english,
    availableLanguages: allLanguages,
    fetchedAt: Date.now(),
  };
}

export function publicTrack(track) {
  if (!track) return null;
  return {
    key: track.key,
    languageCode: track.languageCode,
    kind: track.kind,
    name: track.name,
  };
}

export function selectTrack(tracks, requestedKey = null) {
  if (!tracks.length) return null;
  if (requestedKey) {
    const found = tracks.find((track) => track.key === requestedKey);
    if (found) return found;
    throw new TranscriptError(
      'INVALID_TRACK',
      'A faixa de legenda escolhida não está disponível para este vídeo.',
      400,
      { requestedKey, available: tracks.map(publicTrack) },
    );
  }
  return tracks[0];
}

async function readJson(response) {
  const text = await response.text();
  try {
    return { data: JSON.parse(text), text };
  } catch {
    return { data: null, text };
  }
}

export async function fetchPlayerSnapshot(
  videoId,
  { fetchImpl = globalThis.fetch, clientVersion = DEFAULT_CLIENT_VERSION } = {},
) {
  const body = {
    videoId,
    context: {
      client: {
        clientName: 'IOS',
        clientVersion,
        hl: 'en',
        gl: 'US',
        userAgent: IOS_UA,
      },
    },
    contentCheckOk: true,
    racyCheckOk: true,
  };
  let response;
  try {
    response = await fetchImpl('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': IOS_UA,
        'accept-language': 'en-US,en;q=0.9',
        origin: 'https://www.youtube.com',
        referer: 'https://www.youtube.com/',
        'x-youtube-client-name': '5',
        'x-youtube-client-version': clientVersion,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new TranscriptError('TIMEOUT', 'O YouTube demorou demais para responder.', 504);
    }
    throw new TranscriptError(
      'UPSTREAM',
      'Não foi possível falar com o YouTube.',
      502,
      { cause: String(error?.message || error) },
    );
  }
  if (response.status === 429) {
    throw new TranscriptError(
      'UPSTREAM_BLOCKED',
      'O YouTube limitou temporariamente as requisições deste computador. Aguarde alguns minutos.',
      429,
    );
  }
  const { data, text } = await readJson(response);
  if (!response.ok || !data) {
    throw new TranscriptError(
      'UPSTREAM',
      'O YouTube recusou a consulta do vídeo.',
      502,
      { status: response.status, body: text.slice(0, 300) },
    );
  }
  const snapshot = buildPlayerSnapshot(data, videoId);
  if (snapshot.playability.status !== 'OK') {
    throw new TranscriptError(
      'VIDEO_UNAVAILABLE',
      'Este vídeo não está disponível para reprodução (pode ser privado, restrito por idade ou bloqueado).',
      422,
      { status: snapshot.playability.status, reason: snapshot.playability.reason },
    );
  }
  return snapshot;
}

export async function fetchCaptionText(
  track,
  { fetchImpl = globalThis.fetch } = {},
) {
  const url = new URL(track.baseUrl);
  url.searchParams.set('fmt', 'json3');
  let response;
  try {
    response = await fetchImpl(url.toString(), {
      headers: {
        'user-agent': IOS_UA,
        'accept-language': 'en-US,en;q=0.9',
        origin: 'https://www.youtube.com',
        referer: 'https://www.youtube.com/',
      },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new TranscriptError('TIMEOUT', 'A legenda demorou demais para chegar.', 504);
    }
    throw new TranscriptError(
      'CAPTIONS_UNAVAILABLE',
      'Não foi possível baixar a legenda deste vídeo.',
      502,
      { cause: String(error?.message || error) },
    );
  }
  if (response.status === 429) {
    throw new TranscriptError(
      'UPSTREAM_BLOCKED',
      'O YouTube limitou temporariamente as requisições deste computador. Aguarde alguns minutos.',
      429,
    );
  }
  const text = await response.text();
  if (!response.ok || !text.trim()) {
    const expired = [401, 403, 404, 410].includes(response.status) || !text.trim();
    throw new TranscriptError(
      'CAPTIONS_UNAVAILABLE',
      expired
        ? 'A legenda expirou. Tente novamente.'
        : 'O YouTube não entregou a legenda deste vídeo.',
      502,
      { status: response.status, expired, body: text.slice(0, 200) },
    );
  }
  return text;
}

/**
 * Combine a selected human/ASR track into a timed word list.
 *
 * @param {object} input
 * @param {object} input.player
 * @param {object} input.selectedTrack
 * @param {string|null} input.manualRaw
 * @param {string|null} input.asrRaw
 */
export function buildTranscriptData({ player, selectedTrack, manualRaw, asrRaw }) {
  const selectedKind = selectedTrack.kind;
  const manual = manualRaw ? parseCaptionJson(manualRaw, 'manual') : { cues: [], asrWords: [] };
  const asr = asrRaw ? parseCaptionJson(asrRaw, 'asr') : { cues: [], asrWords: [] };
  const warnings = [];

  if (selectedKind === 'manual') {
    if (!manual.cues.length) {
      throw new TranscriptError(
        'NO_SPEECH',
        'A faixa de legenda escolhida não contém texto utilizável.',
        422,
      );
    }
    const built = buildTimedWords({
      kind: 'manual',
      cues: manual.cues,
      asrWords: asr.asrWords,
    });
    if (!built.words.length) {
      throw new TranscriptError(
        'NO_SPEECH',
        'Não encontrei palavras nesta legenda.',
        422,
      );
    }
    if (!asr.asrWords.length) {
      warnings.push(
        'Sem faixa automática para alinhar os tempos: o corte usa a duração de cada frase e pode variar alguns décimos de segundo.',
      );
    } else if (built.coverage < 0.5) {
      warnings.push(
        'Poucas palavras puderam ser alinhadas à faixa automática; os tempos dentro de cada frase são estimados.',
      );
    }
    return {
      source: 'manual',
      timing: built.timing,
      words: built.words,
      alignment: {
        anchored: built.anchored,
        total: built.total,
        coverage: Math.round(built.coverage * 1000) / 1000,
      },
      warnings,
    };
  }

  const built = buildTimedWords({ kind: 'asr', cues: [], asrWords: asr.asrWords });
  if (!built.words.length) {
    throw new TranscriptError(
      'NO_SPEECH',
      'A legenda automática não contém palavras utilizáveis.',
      422,
    );
  }
  warnings.push(
    'Usando a transcrição automática do YouTube: o texto pode conter pequenos erros de reconhecimento.',
  );
  return {
    source: 'asr',
    timing: 'asr',
    words: built.words,
    alignment: {
      anchored: built.anchored,
      total: built.total,
      coverage: built.coverage,
    },
    warnings,
  };
}

/**
 * Full provider entrypoint with caching and an expiration retry.
 *
 * @param {string} videoId
 * @param {{
 *   trackKey?: string|null,
 *   refresh?: boolean,
 *   cache?: {get:Function,set:Function,delete:Function},
 *   fetchImpl?: typeof fetch,
 *   clientVersion?: string,
 * }} options
 */
export async function loadTranscript(videoId, options = {}) {
  const {
    trackKey = null,
    refresh = false,
    cache = null,
    fetchImpl = globalThis.fetch,
    clientVersion = DEFAULT_CLIENT_VERSION,
  } = options;

  const playerKey = `player:${videoId}:${clientVersion}`;
  const getCaptionKey = (track) => `captions:${videoId}:${track.languageCode}:${track.kind}`;

  async function getPlayer(force = false) {
    if (cache && !force && !refresh) {
      const cached = await cache.get(playerKey, PLAYER_TTL_MS);
      if (cached) return cached;
    }
    const snapshot = await fetchPlayerSnapshot(videoId, { fetchImpl, clientVersion });
    if (cache) await cache.set(playerKey, snapshot);
    return snapshot;
  }

  async function getCaption(track) {
    const key = getCaptionKey(track);
    if (cache && !refresh) {
      const cached = await cache.get(key, CAPTIONS_TTL_MS);
      if (cached) return cached;
    }
    const text = await fetchCaptionText(track, { fetchImpl });
    if (cache) await cache.set(key, text);
    return text;
  }

  const attempt = async (forcePlayer) => {
    const player = await getPlayer(forcePlayer);
    if (!player.captionTracks.length) {
      const available = player.availableLanguages || [];
      throw new TranscriptError(
        'NO_ENGLISH_CAPTIONS',
        available.length
          ? 'Este vídeo não tem legenda em inglês. Escolha um vídeo com legendas em inglês.'
          : 'Este vídeo não tem legendas disponíveis. Escolha outro vídeo.',
        404,
        { availableLanguages: available },
      );
    }
    const selected = selectTrack(player.captionTracks, trackKey);
    const asrTrack =
      player.captionTracks.find(
        (track) => track.kind === 'asr' && track.languageCode === selected.languageCode,
      ) || player.captionTracks.find((track) => track.kind === 'asr');

    let manualRaw = null;
    let asrRaw = null;
    let usedTrack = selected;
    let fallbackWarning = null;

    if (selected.kind === 'manual') {
      try {
        manualRaw = await getCaption(selected);
      } catch (error) {
        if (asrTrack && error?.code === 'CAPTIONS_UNAVAILABLE') {
          asrRaw = await getCaption(asrTrack);
          usedTrack = asrTrack;
          fallbackWarning =
            'A legenda oficial não pôde ser baixada; usei a transcrição automática.';
        } else {
          throw error;
        }
      }
      if (manualRaw && asrTrack) {
        try {
          asrRaw = await getCaption(asrTrack);
        } catch {
          asrRaw = null;
        }
      }
    } else {
      asrRaw = await getCaption(selected);
    }

    const data = buildTranscriptData({
      player,
      selectedTrack: usedTrack,
      manualRaw,
      asrRaw,
    });
    if (fallbackWarning) data.warnings.unshift(fallbackWarning);
    return {
      videoId,
      title: player.title,
      author: player.author,
      durationMs: player.durationMs,
      wordCount: data.words.length,
      ...data,
      selectedTrack: publicTrack(usedTrack),
      tracks: player.captionTracks.map(publicTrack),
    };
  };

  try {
    return await attempt(false);
  } catch (error) {
    const expired =
      error?.code === 'CAPTIONS_UNAVAILABLE' && error?.details?.expired === true;
    if (!expired) throw error;
    if (cache) await cache.delete(playerKey);
    return attempt(true);
  }
}
