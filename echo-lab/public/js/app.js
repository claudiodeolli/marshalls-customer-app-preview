import { EchoPlayer, PlayerState } from './player.js';
import { ApiError, fetchTranscript } from './api.js';
import { createVoiceRecorder, isRecordingSupported } from './recorder.js';
import { playCue, unlockAudio } from './audio.js';
import * as store from './storage.js';
import {
  formatClock,
  formatDuration,
  formatPrecise,
  renderHistory,
  renderPanel as renderPanelHtml,
  renderReadyCard,
  renderReadySkeleton,
  renderRecent,
  renderResumeCard,
} from './ui.js';
import { findCutTargetMs, referenceForSegment, resolveStartMs } from '/shared/segments.mjs';
import { scoreAttempt } from '/shared/scoring.mjs';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const DEFAULT_SETTINGS = {
  intervalSec: 12,
  mode: 'dictation',
  snap: true,
  sound: true,
};

const storedSettings = { ...DEFAULT_SETTINGS, ...(store.loadSettings() || {}) };

const state = {
  view: 'setup',
  transcript: null,
  sourceInput: '',
  trackKey: null,
  settings: { ...storedSettings },
  startInfo: null,
  phase: 'idle',
  pausedReason: 'manual',
  history: [],
  streak: 0,
  segment: {
    index: 0,
    startMs: 0,
    cutTargetMs: 0,
    cutMs: 0,
    reference: null,
  },
  answer: '',
  result: null,
  attempts: 0,
  endedVideo: false,
  autoSkip: 0,
  busy: false,
  player: null,  playerReady: false,
  playerError: null,
  tick: null,
  lastUiUpdate: 0,
  lastTime: -1,
  lastProgressAt: 0,
  stallNotified: false,
  cutting: false,
  selfPause: false,
  seekGuardUntil: 0,
  seekAt: 0,
  seekTargetMs: 0,
  replayReturnPhase: null,
  recording: false,
  recorder: null,
  shadow: {
    repeats: 3,
    rate: 1,
    blurred: false,
    loopActive: false,
    loopRemaining: 0,
    audioUrl: '',
    supported: isRecordingSupported(),
  },
  shadowTimer: null,
  toastTimer: null,
  sessionCreatedAt: null,
  lastLoad: null,
};

// ---------------------------------------------------------------- utilities

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function modeLabel(mode = state.settings.mode) {
  return mode === 'shadowing' ? 'Shadowing' : 'Ditado';
}

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function showView(name) {
  state.view = name;
  $('#setup-view').hidden = name !== 'setup';
  $('#session-view').hidden = name !== 'session';
}

function toast(message, tone = '') {
  const element = $('#toast');
  if (!element) return;
  element.textContent = message;
  element.className = `toast ${tone}`.trim();
  element.hidden = false;
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    element.hidden = true;
  }, 3400);
}

function showUrlError(message) {
  const element = $('#url-error');
  if (!element) {
    toast(message, 'warn');
    return;
  }
  element.textContent = message;
  element.hidden = false;
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearUrlError() {
  const element = $('#url-error');
  if (element) {
    element.hidden = true;
    element.textContent = '';
  }
}

function parseClockInput(text) {
  const value = String(text || '').trim();
  if (!value) return null;
  const normalize = (part) => Number(String(part).replace(',', '.'));
  if (/^\d+(?:[.,]\d+)?$/.test(value)) {
    return Math.max(0, Math.round(normalize(value) * 1000));
  }
  const parts = value.split(':');
  if (parts.length < 2 || parts.length > 3) return null;
  const numbers = parts.map(normalize);
  if (numbers.some((number) => !Number.isFinite(number) || number < 0)) return null;
  let seconds;
  if (parts.length === 2) {
    const [minutes, secs] = numbers;
    if (secs >= 60) return null;
    seconds = minutes * 60 + secs;
  } else {
    const [hours, minutes, secs] = numbers;
    if (minutes >= 60 || secs >= 60) return null;
    seconds = hours * 3600 + minutes * 60 + secs;
  }
  return Math.round(seconds * 1000);
}

function averageAccuracy() {
  if (!state.history.length) return null;
  return (
    state.history.reduce((sum, item) => sum + (Number(item.result?.accuracy) || 0), 0) /
    state.history.length
  );
}

function currentTrackLabel() {
  const track = state.transcript?.selectedTrack;
  if (!track) return 'legenda';
  return `${track.name || track.languageCode}${track.kind === 'asr' ? ' (auto)' : ''}`;
}

// ------------------------------------------------------------- form / setup

function syncIntervalUi(value = state.settings.intervalSec) {
  const interval = clamp(Number(value) || DEFAULT_SETTINGS.intervalSec, 4, 60);
  state.settings.intervalSec = interval;
  const range = $('#interval');
  if (range) {
    range.value = String(interval);
    const percent = ((interval - 4) / (60 - 4)) * 100;
    range.style.setProperty('--fill', `${percent}%`);
  }
  setText('#interval-output', `${interval} s`);
  setText('#interval-inline', String(interval));
  const settingsRange = $('#settings-interval');
  if (settingsRange) settingsRange.value = String(interval);
  setText('#settings-interval-out', `${interval} s`);
}

function applySettingsToForm() {
  syncIntervalUi(state.settings.intervalSec);
  const modeInput = $(`input[name="mode"][value="${state.settings.mode}"]`);
  if (modeInput) modeInput.checked = true;
  const snap = $('#opt-snap');
  if (snap) snap.checked = state.settings.snap;
  const sound = $('#opt-sound');
  if (sound) sound.checked = state.settings.sound;
}

function readFormSettings() {
  const mode = $('input[name="mode"]:checked')?.value === 'shadowing' ? 'shadowing' : 'dictation';
  return {
    intervalSec: clamp(Number($('#interval')?.value) || DEFAULT_SETTINGS.intervalSec, 4, 60),
    mode,
    snap: Boolean($('#opt-snap')?.checked),
    sound: Boolean($('#opt-sound')?.checked),
  };
}

function persistSettings() {
  store.saveSettings({
    intervalSec: state.settings.intervalSec,
    mode: state.settings.mode,
    snap: state.settings.snap,
    sound: state.settings.sound,
  });
}

function setLoading(loading) {
  const form = $('#setup-form');
  const button = $('#load-btn');
  if (form) form.classList.toggle('is-loading', loading);
  if (button) button.disabled = loading;
}

function renderRecentBlock() {
  const recent = store.loadRecent();
  const block = $('#recent-block');
  const list = $('#recent-list');
  if (!block || !list) return;
  block.hidden = recent.length === 0;
  list.innerHTML = renderRecent(recent);
}

function renderResumeBlock() {
  const host = $('#resume-card');
  if (!host) return;
  const session = store.loadStoredSession();
  if (!session) {
    host.hidden = true;
    host.innerHTML = '';
    return;
  }
  host.hidden = false;
  host.innerHTML = renderResumeCard(session);
}

function showReadySkeleton() {
  const card = $('#ready-card');
  const form = $('#setup-form');
  if (!card) return;
  card.hidden = false;
  card.innerHTML = renderReadySkeleton();
  if (form && !state.transcript) form.hidden = true;
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderReady(data, startInfo) {
  const card = $('#ready-card');
  const form = $('#setup-form');
  if (!card) return;
  card.innerHTML = renderReadyCard({
    transcript: data,
    settings: state.settings,
    startInfo,
  });
  card.hidden = false;
  if (form) form.hidden = true;
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function backToSetup() {
  if (state.view === 'session') {
    exitSession({ confirm: false });
    return;
  }
  const card = $('#ready-card');
  const form = $('#setup-form');
  if (card) {
    card.hidden = true;
    card.innerHTML = '';
  }
  if (form) form.hidden = false;
  state.transcript = null;
  state.startInfo = null;
  clearUrlError();
  $('#video-url')?.focus();
}

async function fetchAndPrepare({ input, track = null, startMs = null, skeleton = true }) {
  const token = (state.loadToken || 0) + 1;
  state.loadToken = token;
  state.busy = true;
  setLoading(true);
  clearUrlError();
  if (skeleton) showReadySkeleton();
  try {
    const data = await fetchTranscript(input, { track });
    if (token !== state.loadToken) return null;
    const startInfo = resolveStartMs(data.words, startMs);
    state.transcript = data;
    state.sourceInput = input;
    state.trackKey = data.selectedTrack?.key || null;
    state.startInfo = startInfo;
    state.settings.startMs = startMs;
    state.playerError = null;
    state.lastLoad = { input, track: track || null, startMs };
    return { data, startInfo, startMs };
  } catch (error) {
    if (token !== state.loadToken) return null;
    const message =
      error instanceof ApiError
        ? error.message
        : 'Não foi possível carregar este vídeo.';
    showUrlError(message);
    const card = $('#ready-card');
    if (card) {
      card.hidden = true;
      card.innerHTML = '';
    }
    const form = $('#setup-form');
    if (form) form.hidden = false;
    return null;
  } finally {
    if (token === state.loadToken) {
      state.busy = false;
      setLoading(false);
    }
  }
}

async function handleLoadSubmit(event) {
  event.preventDefault();
  if (state.busy) return;
  const input = $('#video-url')?.value.trim() || '';
  if (!input) {
    showUrlError('Cole o link de um vídeo do YouTube.');
    $('#video-url')?.focus();
    return;
  }
  let startMs = null;
  try {
    startMs = parseClockInput($('#start-time')?.value);
  } catch {
    showUrlError('Tempo inválido. Use mm:ss, por exemplo 1:20.');
    return;
  }
  if ($('#start-time')?.value.trim() && startMs === null) {
    showUrlError('Tempo inválido. Use mm:ss, por exemplo 1:20.');
    return;
  }
  state.settings = readFormSettings();
  persistSettings();
  const result = await fetchAndPrepare({ input, startMs });
  if (!result) return;
  renderReady(result.data, result.startInfo);
  store.addRecent({
    videoId: result.data.videoId,
    title: result.data.title,
    author: result.data.author,
    mode: state.settings.mode,
    accuracy: null,
  });
  renderRecentBlock();
}

async function handleTrackChange(trackKey) {
  if (!state.transcript) return;
  const previous = {
    data: state.transcript,
    startInfo: state.startInfo,
  };
  const card = $('#ready-card');
  if (card) {
    card.hidden = false;
    card.innerHTML = renderReadySkeleton();
  }
  const startMs =
    state.lastLoad && state.lastLoad.input === (state.sourceInput || state.transcript.videoId)
      ? state.lastLoad.startMs
      : parseClockInput($('#start-time')?.value);
  const result = await fetchAndPrepare({
    input: state.sourceInput || state.transcript.videoId,
    track: trackKey,
    startMs: startMs ?? null,
    skeleton: false,
  });
  if (!result) {
    if (card && previous.data) {
      state.transcript = previous.data;
      state.startInfo = previous.startInfo;
      renderReady(previous.data, previous.startInfo);
      toast('Não consegui trocar a faixa. A anterior continua selecionada.', 'warn');
    }
    return;
  }
  renderReady(result.data, result.startInfo);
}

// ------------------------------------------------------------- session entry

function setHeader() {
  const data = state.transcript;
  if (!data) return;
  setText('#video-title', data.title || data.videoId);
  setText(
    '#video-subtitle',
    `${data.author || 'YouTube'} · ${formatClock((data.durationMs || 0) / 1000)} · ${currentTrackLabel()} · ${data.wordCount || data.words.length} palavras`,
  );
  setText('#mode-label', modeLabel());
}

function mountPlayer() {
  return new Promise(async (resolve, reject) => {
    if (!state.transcript) {
      reject(new Error('Nada para tocar.'));
      return;
    }
    const overlay = $('#player-status');
    if (overlay) {
      overlay.hidden = false;
      overlay.innerHTML =
        '<div><strong>Carregando o player…</strong>Preparando o vídeo e os controles de precisão.</div>';
    }
    state.player = new EchoPlayer();
    try {
      await state.player.mount($('#player-mount'), state.transcript.videoId, {
        onStateChange: handlePlayerState,
        onError: handlePlayerError,
      });
      state.playerReady = true;
      if (overlay) overlay.hidden = true;
      resolve();
    } catch (error) {
      state.playerReady = false;
      try {
        state.player?.destroy();
      } catch {
        // Ignore.
      }
      state.player = null;
      if (overlay) {
        overlay.hidden = false;
        overlay.innerHTML = `<div><strong>Não foi possível carregar o player</strong>${escapeMessage(error?.message || 'Tente novamente.')}</div>`;
      }
      reject(error);
    }
  });
}

function escapeMessage(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function showPlayerError(title, message, { retry = false, url = '' } = {}) {
  state.playerError = { title, message, retry, url };
  state.phase = 'error';
  stopTick();
  renderPanel();
  updateTransport();
}

function handlePlayerError(message, code) {
  state.playerReady = false;
  try {
    state.player?.destroy();
  } catch {
    // The iframe may be gone.
  }
  state.player = null;
  const url = state.transcript
    ? `https://www.youtube.com/watch?v=${state.transcript.videoId}`
    : '';
  showPlayerError(
    code === 101 || code === 150 ? 'Este vídeo não permite incorporação' : 'O player parou',
    message,
    {
      retry: code !== 101 && code !== 150,
      url,
    },
  );
}

function handlePlayerState(code) {
  state.playerState = code;
  updatePlayIcon();
  if (code === PlayerState.ENDED) {
    if (state.phase === 'playing') {
      cutNow({ ended: true });
    } else if (state.phase === 'replaying') {
      finishReplay();
    } else if (state.phase === 'shadow-playing') {
      finishShadowRep();
    }
    return;
  }
  if (code === PlayerState.PAUSED && state.phase === 'playing' && !state.selfPause && !state.cutting) {
    // Ignore the short paused/seek transition that the iframe emits while a
    // new segment is being cued.
    const settled = performance.now() - (state.startedAt || 0);
    if (settled < 900) return;
    // The learner clicked the frame or something paused the video. Do not
    // silently lose the segment: show a resume action.
    state.phase = 'paused';
    state.pausedReason = 'manual';
    stopTick();
    renderPanel();
    updateTransport();
    setText('#now-label', 'Pausado');
  }
}

async function enterSession({ autoStart = false, restore = null } = {}) {
  if (!state.transcript || !state.startInfo) return;
  if (!restore) state.sessionCreatedAt = null;
  showView('session');
  setHeader();
  state.history = Array.isArray(restore?.history) ? restore.history : [];
  state.streak = 0;
  state.result = null;
  state.answer = '';
  state.attempts = 0;
  state.endedVideo = false;
  state.autoSkip = 0;
  state.segment.index = state.history.length
    ? Math.max(...state.history.map((item) => Number(item.index) || 0)) + 1
    : 0;
  state.segment.startMs = restore?.positionMs ?? state.startInfo.startMs;
  state.segment.cutMs = state.segment.startMs;
  state.segment.cutTargetMs = Math.min(
    state.segment.startMs + state.settings.intervalSec * 1000,
    state.transcript.durationMs || Number.POSITIVE_INFINITY,
  );
  state.segment.reference = null;
  state.phase = 'idle';
  renderPanel();
  renderHistorySection();
  updateMetrics();
  updateTransport();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!state.playerReady) {
    try {
      await mountPlayer();
    } catch {
      showPlayerError(
        'Não foi possível carregar o player',
        'Verifique a conexão e tente novamente. O YouTube precisa estar acessível.',
        { retry: true },
      );
      return;
    }
  }

  if (restore) {
    const duration = state.transcript.durationMs || 0;
    if (state.segment.startMs >= duration - 500 && duration > 0) {
      state.phase = 'done';
      state.endedVideo = true;
      renderPanel();
      updateTransport();
      updateMetrics();
      return;
    }
    state.player.seek(state.segment.startMs / 1000);
    state.phase = 'paused';
    state.pausedReason = 'restore';
    state.segment.cutTargetMs = Math.min(
      state.segment.startMs + state.settings.intervalSec * 1000,
      duration || Number.POSITIVE_INFINITY,
    );
    renderPanel();
    updateTransport();
    updateMetrics();
    setText('#now-label', 'Sessão salva · retome o trecho');
    return;
  }

  if (autoStart) {
    beginSegment(state.startInfo.startMs);
    window.setTimeout(() => {
      if (!state.playerReady) return;
      if (
        state.phase === 'playing' &&
        state.player &&
        ![PlayerState.PLAYING, PlayerState.BUFFERING].includes(state.player.state())
      ) {
        state.phase = 'paused';
        state.pausedReason = 'autoplay';
        stopTick();
        renderPanel();
        updateTransport();
        setText('#now-label', 'Toque em retomar para começar');
      }
    }, 1600);
  } else {
    state.player.seek(state.segment.startMs / 1000);
    state.phase = 'paused';
    renderPanel();
    updateTransport();
  }
}

// ------------------------------------------------------------------ segments

function segmentDurationMs() {
  return state.settings.intervalSec * 1000;
}

function markSeek(startMs) {
  const now = performance.now();
  state.seekAt = now;
  state.seekTargetMs = startMs;
  state.seekGuardUntil = now + 400;
}

function seekIsSettling(time, now) {
  return (
    now - state.seekAt < 1500 &&
    Math.abs(time * 1000 - state.seekTargetMs) > 1500
  );
}

function beginSegment(startMs) {
  if (!state.transcript || !state.playerReady) return;
  stopShadowLoop({ silent: true });
  stopRecording({ silent: true, discard: true });
  if (state.shadow.audioUrl) {
    URL.revokeObjectURL(state.shadow.audioUrl);
    state.shadow.audioUrl = '';
  }
  stopTick();

  const duration = state.transcript.durationMs || 0;
  const safeStart = clamp(startMs, 0, Math.max(0, duration - 100));
  if (duration > 0 && safeStart >= duration - 250) {
    finishSession();
    return;
  }
  const intervalMs = segmentDurationMs();
  const cut = state.settings.snap
    ? findCutTargetMs(state.transcript.words, safeStart, intervalMs)
    : { targetMs: safeStart + intervalMs, snapped: false };
  const target = duration > 0
    ? Math.min(cut.targetMs, duration)
    : cut.targetMs;

  state.segment.startMs = safeStart;
  state.segment.cutTargetMs = Math.max(safeStart + 120, target);
  state.segment.cutMs = 0;
  state.segment.reference = null;
  state.answer = '';
  state.result = null;
  state.attempts = 0;
  state.endedVideo = duration > 0 && state.segment.cutTargetMs >= duration - 250;
  state.phase = 'playing';
  state.playerError = null;
  state.lastTime = -1;
  state.lastProgressAt = performance.now();
  state.startedAt = performance.now();
  state.stallNotified = false;
  markSeek(safeStart);

  renderPanel();
  updateTransport();
  updateMetrics();
  updatePlayIcon();
  setText('#now-label', 'Ouvindo…');
  const overlay = $('#player-status');
  if (overlay) overlay.hidden = true;

  state.player.setRate(1);
  state.player.seekAndPlay(safeStart / 1000);
  startTick();
  renderShadowChrome();
  saveStored();
}

function startTick() {
  stopTick();
  state.lastUiUpdate = 0;
  state.tick = window.setInterval(tick, 30);
}

function stopTick() {
  if (state.tick) {
    window.clearInterval(state.tick);
    state.tick = null;
  }
}

function tick() {
  if (!state.player || !state.playerReady) return;
  const phase = state.phase;
  if (!['playing', 'replaying', 'shadow-playing'].includes(phase)) return;
  const time = state.player.time();
  const now = performance.now();

  if (phase === 'playing') {
    if (
      now >= state.seekGuardUntil &&
      !seekIsSettling(time, now) &&
      time >= state.segment.cutTargetMs / 1000 - 0.002
    ) {
      cutNow();
      return;
    }
    if (now - state.lastUiUpdate > 100) {
      state.lastUiUpdate = now;
      updateTransport(time);
      updateCountdown(time);
    }
    const playerState = state.player.state();
    if (playerState === PlayerState.PLAYING) {
      if (time > state.lastTime + 0.002) {
        state.lastProgressAt = now;
        if (state.stallNotified) {
          state.stallNotified = false;
          setText('#now-label', 'Ouvindo…');
        }
      } else if (now - state.lastProgressAt > 1800 && !state.stallNotified) {
        state.stallNotified = true;
        setText('#now-label', 'Anúncio ou carregando… o corte espera o vídeo');
      }
    }
    state.lastTime = time;
  } else if (phase === 'replaying') {
    updateKaraoke(time);
    if (
      now >= state.seekGuardUntil &&
      !seekIsSettling(time, now) &&
      time >= state.segment.cutMs / 1000 - 0.002
    ) {
      finishReplay();
    }
  } else if (phase === 'shadow-playing') {
    updateKaraoke(time);
    if (
      now >= state.seekGuardUntil &&
      !seekIsSettling(time, now) &&
      time >= state.segment.cutMs / 1000 - 0.002
    ) {
      finishShadowRep();
    }
  }
}

function updateCountdown(time) {
  const element = $('#countdown');
  if (!element) return;
  const remaining = Math.max(0, state.segment.cutTargetMs / 1000 - time);
  element.textContent = formatDuration(remaining);
}

function cutNow({ manual = false, ended = false } = {}) {
  if (state.cutting) return;
  if (!state.playerReady) return;
  state.cutting = true;
  stopTick();
  state.selfPause = true;
  state.player.pause();
  window.setTimeout(() => {
    state.selfPause = false;
  }, 350);
  const cutMs = Math.max(
    state.segment.startMs,
    Math.round(state.player.time() * 1000),
  );
  state.lastTime = -1;

  if (cutMs <= state.segment.startMs + 200 && !ended) {
    state.phase = 'paused';
    state.pausedReason = 'manual';
    state.cutting = false;
    renderPanel();
    updateTransport();
    return;
  }

  const reference = referenceForSegment(
    state.transcript.words,
    state.segment.startMs,
    cutMs,
  );
  state.segment.cutMs = cutMs;
  state.segment.reference = reference;

  if (!reference.words.length && !manual && !ended && state.autoSkip < 2) {
    state.autoSkip += 1;
    toast('Sem fala neste trecho — seguindo para o próximo.', 'warn');
    state.segment.index += 1;
    state.cutting = false;
    beginSegment(cutMs + 120);
    return;
  }

  if (!reference.words.length && ended) {
    state.cutting = false;
    finishSession();
    return;
  }

  if (!reference.words.length && !manual) {
    state.cutting = false;
    state.phase = 'paused';
    state.pausedReason = 'manual';
    renderPanel();
    updateTransport();
    toast('Não encontrei fala nos próximos trechos. Use “Pular trecho”.', 'warn');
    return;
  }

  if (!reference.words.length && manual) {
    state.cutting = false;
    state.phase = 'paused';
    state.pausedReason = 'manual';
    renderPanel();
    updateTransport();
    toast('Sem fala neste ponto do vídeo. Retome ou pule o trecho.', 'warn');
    return;
  }

  state.autoSkip = 0;
  if (ended) state.endedVideo = true;
  state.answer = '';
  state.result = null;
  state.attempts = 0;
  state.phase = state.settings.mode === 'shadowing' ? 'shadowing' : 'answering';
  state.cutting = false;

  renderPanel();
  renderHistorySection();
  updateMetrics();
  updateTransport();
  updatePlayIcon();
  focusAnswer();
  if (window.matchMedia('(max-width: 980px)').matches) {
    window.setTimeout(() => {
      $('#practice-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }
  if (state.settings.sound) playCue('pause');
  saveStored();
  if (state.phase === 'answering') {
    setText('#now-label', 'Pausado · escreva o que ouviu');
  } else {
    setText('#now-label', 'Shadowing · ouça e repita');
    setText('#segment-range', `${formatClock(state.segment.startMs / 1000)}–${formatClock(cutMs / 1000)}`);
  }
}

function finishReplay() {
  if (!state.playerReady) return;
  state.player.pause();
  state.selfPause = true;
  window.setTimeout(() => {
    state.selfPause = false;
  }, 300);
  const returnPhase = state.replayReturnPhase || 'answering';
  state.replayReturnPhase = null;
  state.phase = returnPhase;
  stopTick();
  renderPanel();
  updateTransport();
  updatePlayIcon();
  focusAnswer();
}

function submitAnswer() {
  if (state.phase !== 'answering' || !state.segment.reference) return;
  const textarea = $('#answer-input');
  const answer = textarea?.value?.trim() || '';
  if (!answer) {
    toast('Escreva algo antes de corrigir — ou pule o trecho.', 'warn');
    textarea?.focus();
    return;
  }
  state.answer = textarea.value;
  state.result = scoreAttempt(state.segment.reference.words, state.answer);
  state.attempts += 1;
  state.phase = 'reviewing';
  upsertHistory();
  state.streak = state.result.accuracy >= 85 ? state.streak + 1 : 0;
  renderPanel();
  renderHistorySection();
  updateMetrics();
  updateTransport();
  saveStored();
  if (state.result.perfect && state.settings.sound) playCue('good');
  setText('#now-label', 'Corrigido · veja o diff');
  updateCountdown(state.player.time());
}

function upsertHistory() {
  if (!state.segment.reference || !state.result) return;
  const record = {
    index: state.segment.index,
    startMs: state.segment.startMs,
    endMs: state.segment.cutMs,
    refText: state.segment.reference.text,
    answer: state.answer,
    result: state.result,
    attempts: state.attempts,
    accuracy: state.result.accuracy,
    updatedAt: new Date().toISOString(),
  };
  const existing = state.history.findIndex((item) => item.index === record.index);
  if (existing >= 0) state.history[existing] = record;
  else state.history.push(record);
  state.history.sort((a, b) => a.index - b.index);
  if (state.history.length > 120) state.history = state.history.slice(-120);
}

function retrySegment() {
  if (!state.segment.reference) return;
  state.phase = 'answering';
  state.answer = '';
  state.result = null;
  renderPanel();
  updateTransport();
  focusAnswer();
}

function nextSegment() {
  if (!state.transcript) return;
  stopShadowLoop({ silent: true });
  stopRecording({ silent: true, discard: true });
  state.autoSkip = 0;
  if (state.endedVideo) {
    finishSession();
    return;
  }
  const duration = state.transcript.durationMs || 0;
  const nextStart = state.segment.cutMs || state.segment.startMs;
  if (duration > 0 && nextStart >= duration - 250) {
    finishSession();
    return;
  }
  state.segment.index += 1;
  state.endedVideo = false;
  beginSegment(nextStart);
}

function skipSegment() {
  if (!state.transcript) return;
  if (state.phase === 'idle') {
    beginSegment(state.startInfo.startMs);
    return;
  }
  if (!state.playerReady) return;
  stopShadowLoop({ silent: true });
  stopRecording({ silent: true, discard: true });
  state.autoSkip = 0;
  const duration = state.transcript.durationMs || 0;
  let nextStart = state.segment.cutMs || state.segment.startMs;
  if (state.phase === 'playing') {
    nextStart = state.segment.cutTargetMs;
    state.player.pause();
    stopTick();
  }
  state.segment.index += 1;
  state.endedVideo = false;
  toast('Trecho pulado.');
  if (duration > 0 && nextStart >= duration - 250) {
    finishSession();
    return;
  }
  beginSegment(Math.max(state.segment.startMs + 500, nextStart));
}

function finishSession() {
  stopTick();
  stopShadowLoop({ silent: true });
  stopRecording({ silent: true, discard: true });
  state.player?.pause();
  state.phase = 'done';
  state.endedVideo = true;
  renderPanel();
  updateTransport();
  updateMetrics();
  renderHistorySection();
  setText('#now-label', 'Sessão concluída');
  saveStored();
}

function replaySegment() {
  if (!state.transcript || !state.playerReady) return;
  if (state.phase === 'idle') {
    beginSegment(state.startInfo.startMs);
    return;
  }
  if (state.phase === 'shadowing' || state.phase === 'shadow-playing') {
    startShadowLoop();
    return;
  }
  if (state.phase === 'paused') {
    state.autoSkip = 0;
    state.player.seekAndPlay(state.segment.startMs / 1000);
    state.phase = 'playing';
    state.lastTime = -1;
    state.lastProgressAt = performance.now();
    state.startedAt = performance.now();
    markSeek(state.segment.startMs);
    startTick();
    renderPanel();
    updateTransport();
    return;
  }
  if (state.phase === 'playing') {
    state.player.seekAndPlay(state.segment.startMs / 1000);
    state.lastTime = -1;
    state.startedAt = performance.now();
    markSeek(state.segment.startMs);
    return;
  }
  if (!state.segment.cutMs) return;
  state.replayReturnPhase = state.phase === 'replaying' ? 'answering' : state.phase;
  state.phase = 'replaying';
  state.player.seekAndPlay(state.segment.startMs / 1000);
  state.lastTime = -1;
  state.startedAt = performance.now();
  markSeek(state.segment.startMs);
  renderPanel();
  updateTransport();
  updatePlayIcon();
  startTick();
}

function resumeSegment() {
  if (!state.transcript || !state.playerReady) return;
  if (state.phase === 'paused') {
    state.autoSkip = 0;
    beginSegment(state.segment.startMs);
    return;
  }
  if (state.phase === 'answering' || state.phase === 'reviewing') {
    replaySegment();
    return;
  }
  if (state.phase === 'idle') {
    beginSegment(state.startInfo.startMs);
  }
}

function togglePlay() {
  if (!state.transcript) return;
  if (state.phase === 'playing' || state.phase === 'replaying' || state.phase === 'shadow-playing') {
    pausePlayback();
    return;
  }
  if (state.phase === 'paused' || state.phase === 'idle') {
    resumeSegment();
    return;
  }
  if (state.phase === 'shadowing') {
    startShadowLoop();
    return;
  }
  if (state.phase === 'answering' || state.phase === 'reviewing') {
    replaySegment();
  }
}

function pausePlayback() {
  if (!state.playerReady) return;
  stopTick();
  state.player.pause();
  state.selfPause = true;
  window.setTimeout(() => {
    state.selfPause = false;
  }, 300);
  if (state.phase === 'playing' || state.phase === 'paused') {
    state.phase = 'paused';
    state.pausedReason = 'manual';
    renderPanel();
    updateTransport();
    setText('#now-label', 'Pausado');
    return;
  }
  if (state.phase === 'replaying') {
    const returnPhase = state.replayReturnPhase || 'answering';
    state.replayReturnPhase = null;
    state.phase = returnPhase;
    renderPanel();
    updateTransport();
    focusAnswer();
    return;
  }
  if (state.phase === 'shadow-playing') {
    stopShadowLoop({ silent: true });
    state.phase = 'shadowing';
    renderPanel();
    updateTransport();
  }
}

function updatePlayIcon() {
  const button = $('#play-toggle');
  if (!button) return;
  const playing = ['playing', 'replaying', 'shadow-playing'].includes(state.phase);
  const playIcon = $('.icon-play', button);
  const pauseIcon = $('.icon-pause', button);
  if (playIcon) playIcon.hidden = playing;
  if (pauseIcon) pauseIcon.hidden = !playing;
  button.setAttribute('aria-label', playing ? 'Pausar' : 'Reproduzir');
}

function updateTransport(time = null) {
  if (!state.transcript) return;
  const current = time === null ? (state.player?.time() || 0) : time;
  const duration = state.player?.duration() || state.transcript.durationMs / 1000 || 0;
  const start = state.segment.startMs;
  const end = state.segment.cutMs || state.segment.cutTargetMs || start;
  setText('#time-current', formatClock(current));
  setText('#time-total', formatClock(duration));
  const progress = duration ? clamp((current / duration) * 100, 0, 100) : 0;
  const fill = $('#progress-fill');
  if (fill) fill.style.width = `${progress}%`;
  const segment = $('#progress-segment');
  if (segment && duration) {
    const left = clamp((start / 1000 / duration) * 100, 0, 100);
    const width = clamp((Math.max(0, end - start) / 1000 / duration) * 100, 0.15, 100 - left);
    segment.style.left = `${left}%`;
    segment.style.width = `${width}%`;
  }
  setText(
    '#segment-range',
    `${formatClock(start / 1000)}–${formatClock(Math.max(start, end) / 1000)}`,
  );
  const live = ['playing', 'replaying', 'shadow-playing'].includes(state.phase);
  const now = $('#now-label')?.parentElement;
  if (now) now.classList.toggle('is-live', live);
  updatePlayIcon();
}

function updateMetrics() {
  const average = averageAccuracy();
  setText('#metric-average', average === null ? '—' : `${Math.round(average)}%`);
  setText('#metric-count', String(state.history.length));
  setText('#metric-streak', String(state.streak));
  setText('#mode-label', modeLabel());
}

function renderPanel() {
  const host = $('#panel-content');
  if (!host) return;
  host.innerHTML = renderPanelHtml({
    phase: state.phase,
    pausedReason: state.pausedReason,
    mode: state.settings.mode,
    segmentIndex: state.segment.index,
    startMs: state.segment.startMs,
    cutMs: state.segment.cutMs || state.segment.cutTargetMs,
    reference: state.segment.reference,
    answer: state.answer,
    result: state.result,
    intervalSec: state.settings.intervalSec,
    attempts: state.attempts,
    ended: state.endedVideo,
    error: state.playerError,
    shadow: {
      ...state.shadow,
      loopActive: state.phase === 'shadow-playing',
      recording: state.recording,
      audioUrl: state.shadow.audioUrl,
    },
  });
  updateAnswerCount();
  updatePlayIcon();
}

function renderHistorySection() {
  const section = $('#history-section');
  const list = $('#history-list');
  if (!section || !list) return;
  section.hidden = state.history.length === 0;
  list.innerHTML = renderHistory(state.history);
}

function focusAnswer() {
  if (state.phase !== 'answering') return;
  window.requestAnimationFrame(() => {
    const textarea = $('#answer-input');
    if (!textarea) return;
    textarea.focus();
    const length = textarea.value.length;
    try {
      textarea.setSelectionRange(length, length);
    } catch {
      // Ignore.
    }
  });
}

function updateAnswerCount() {
  const textarea = $('#answer-input');
  const counter = $('#answer-count');
  if (!textarea || !counter) return;
  const words = textarea.value.trim() ? textarea.value.trim().split(/\s+/).length : 0;
  counter.textContent = `${words} palavra${words === 1 ? '' : 's'}`;
}

// -------------------------------------------------------------- shadow mode

function renderShadowChrome() {
  if (state.phase !== 'shadowing' && state.phase !== 'shadow-playing') return;
  updateKaraoke(state.player?.time() || 0);
}

function updateKaraoke(timeSec) {
  const host = $('#shadow-text');
  if (!host) return;
  const spans = host.querySelectorAll('.kw');
  if (!spans.length) return;
  const ms = timeSec * 1000;
  let active = null;
  for (const span of spans) {
    const start = Number(span.dataset.start);
    const end = Number(span.dataset.end);
    if (ms >= start - 20 && ms < end + 60) {
      active = span;
      break;
    }
  }
  if (state.activeWord && state.activeWord !== active) {
    state.activeWord.classList.remove('active');
  }
  if (active && active !== state.activeWord) {
    active.classList.add('active');
  }
  state.activeWord = active;
}

function clearKaraoke() {
  if (state.activeWord) {
    state.activeWord.classList.remove('active');
    state.activeWord = null;
  }
}

function startShadowLoop() {
  if (!state.segment.reference || !state.playerReady) return;
  if (!state.segment.cutMs) return;
  clearKaraoke();
  state.shadow.loopRemaining = clamp(Number(state.shadow.repeats) || 3, 1, 5);
  state.shadow.loopActive = true;
  state.phase = 'shadow-playing';
  state.startedAt = performance.now();
  markSeek(state.segment.startMs);
  state.player.setRate(Number(state.shadow.rate) || 1);
  renderPanel();
  updateTransport();
  updatePlayIcon();
  state.player.seekAndPlay(state.segment.startMs / 1000);
  state.lastTime = -1;
  startTick();
}

function finishShadowRep() {
  if (state.phase !== 'shadow-playing') return;
  state.player.pause();
  state.selfPause = true;
  window.setTimeout(() => {
    state.selfPause = false;
  }, 300);
  stopTick();
  clearKaraoke();
  state.shadow.loopRemaining -= 1;
  if (state.shadow.loopRemaining > 0) {
    updateShadowStatus();
    state.shadowTimer = window.setTimeout(() => {
      if (state.phase !== 'shadow-playing') return;
      state.player.seekAndPlay(state.segment.startMs / 1000);
      markSeek(state.segment.startMs);
      state.lastTime = -1;
      startTick();
    }, 700);
  } else {
    state.shadow.loopActive = false;
    state.phase = 'shadowing';
    state.shadow.loopRemaining = 0;
    renderPanel();
    updateTransport();
    updatePlayIcon();
    updateShadowStatus();
  }
}

function updateShadowStatus() {
  const status = $('#shadow-status');
  if (!status) return;
  if (state.phase === 'shadow-playing' && state.shadow.loopRemaining > 0) {
    status.innerHTML = `<strong>${state.shadow.loopRemaining} de ${state.shadow.repeats}</strong> repetições restantes.`;
  } else {
    status.innerHTML = '<strong>Dica:</strong> use fones para o microfone não captar o vídeo.';
  }
}

function stopShadowLoop({ silent = false } = {}) {
  if (state.shadowTimer) {
    window.clearTimeout(state.shadowTimer);
    state.shadowTimer = null;
  }
  state.shadow.loopActive = false;
  state.shadow.loopRemaining = 0;
  clearKaraoke();
  if (!silent && (state.phase === 'shadow-playing' || state.phase === 'shadowing')) {
    state.player?.pause();
    state.phase = 'shadowing';
    renderPanel();
    updateTransport();
    updatePlayIcon();
  }
}

async function toggleRecording() {
  if (state.recording) {
    await stopRecording();
    return;
  }
  if (!state.shadow.supported) {
    toast('Seu navegador não permite gravar áudio.', 'warn');
    return;
  }
  try {
    state.recorder = createVoiceRecorder();
    await state.recorder.start();
    state.recording = true;
    if (state.shadow.audioUrl) {
      URL.revokeObjectURL(state.shadow.audioUrl);
      state.shadow.audioUrl = '';
    }
    renderPanel();
  } catch (error) {
    toast(error?.message || 'Não foi possível gravar.', 'warn');
  }
}

async function stopRecording({ silent = false, discard = false } = {}) {
  if (!state.recording || !state.recorder) return;
  try {
    const result = await state.recorder.stop();
    state.recording = false;
    if (!discard && result?.url) {
      if (state.shadow.audioUrl) URL.revokeObjectURL(state.shadow.audioUrl);
      state.shadow.audioUrl = result.url;
    }
  } catch {
    state.recording = false;
    if (!silent) toast('A gravação falhou.', 'warn');
  } finally {
    state.recorder = null;
    if (!silent) renderPanel();
  }
}

// ------------------------------------------------------------- persistence

function saveStored() {
  if (!state.transcript) return;
  if (!state.sessionCreatedAt) state.sessionCreatedAt = new Date().toISOString();
  const positionMs = state.phase === 'done'
    ? (state.transcript.durationMs || state.segment.cutMs || state.segment.startMs)
    : ['reviewing', 'shadowing'].includes(state.phase)
      ? state.segment.cutMs || state.segment.startMs
      : state.segment.startMs;
  store.saveStoredSession({
    videoId: state.transcript.videoId,
    title: state.transcript.title,
    author: state.transcript.author,
    trackKey: state.trackKey,
    settings: {
      intervalSec: state.settings.intervalSec,
      mode: state.settings.mode,
      snap: state.settings.snap,
      sound: state.settings.sound,
    },
    positionMs,
    history: state.history,
    ended: state.phase === 'done' || state.endedVideo,
    createdAt: state.sessionCreatedAt,
  });
  store.addRecent({
    videoId: state.transcript.videoId,
    title: state.transcript.title,
    author: state.transcript.author,
    mode: state.settings.mode,
    accuracy: averageAccuracy(),
  });
  renderRecentBlock();
}

async function resumeStoredSession() {
  const session = store.loadStoredSession();
  if (!session) return;
  state.settings = { ...DEFAULT_SETTINGS, ...(session.settings || {}) };
  applySettingsToForm();
  const input = session.videoId;
  $('#video-url').value = input;
  if (session.settings?.startMs != null) {
    $('#start-time').value = '';
  }
  const card = $('#ready-card');
  if (card) {
    card.hidden = false;
    card.innerHTML = renderReadySkeleton();
  }
  const result = await fetchAndPrepare({
    input,
    track: session.trackKey || null,
    startMs: null,
    skeleton: false,
  });
  if (!result) {
    renderResumeBlock();
    return;
  }
  state.history = Array.isArray(session.history) ? session.history : [];
  state.sessionCreatedAt = session.createdAt || null;
  renderResumeBlock();
  await enterSession({ autoStart: false, restore: session });
}

function discardStoredSession() {
  store.clearStoredSession();
  renderResumeBlock();
  toast('Sessão salva descartada.');
}

function exportSession() {
  if (!state.history.length) {
    toast('Ainda não há trechos corrigidos para exportar.', 'warn');
    return;
  }
  const payload = {
    app: 'echo-lab',
    version: 1,
    exportedAt: new Date().toISOString(),
    video: {
      id: state.transcript?.videoId,
      title: state.transcript?.title,
      author: state.transcript?.author,
      durationMs: state.transcript?.durationMs,
      track: state.transcript?.selectedTrack,
      timing: state.transcript?.timing,
      alignment: state.transcript?.alignment,
    },
    settings: state.settings,
    history: state.history,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const slug = (state.transcript?.title || 'echo-sessao')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  anchor.href = url;
  anchor.download = `echo-${slug || 'sessao'}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast('Sessão exportada.');
}

async function copyReference() {
  const text = state.segment.reference?.text || '';
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast('Referência copiada.');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      toast('Referência copiada.');
    } catch {
      toast('Não foi possível copiar.', 'warn');
    }
    textarea.remove();
  }
}

function exitSession({ confirm = true } = {}) {
  if (state.view !== 'session') return;
  if (
    confirm &&
    state.history.length > 0 &&
    state.phase !== 'done' &&
    !window.confirm('Encerrar a sessão? O histórico fica salvo neste navegador.')
  ) {
    return;
  }
  $('#settings-dialog')?.close();
  $('#help-dialog')?.close();
  stopTick();
  stopShadowLoop({ silent: true });
  stopRecording({ silent: true, discard: true });
  state.player?.pause();
  state.player?.destroy();
  state.player = null;
  state.playerReady = false;
  if (state.shadow.audioUrl) {
    URL.revokeObjectURL(state.shadow.audioUrl);
    state.shadow.audioUrl = '';
  }
  state.phase = 'idle';
  state.transcript = null;
  state.startInfo = null;
  state.history = [];
  state.result = null;
  state.answer = '';
  state.segment.reference = null;
  state.sessionCreatedAt = null;
  showView('setup');
  applySettingsToForm();
  const form = $('#setup-form');
  const card = $('#ready-card');
  if (form) form.hidden = false;
  if (card) {
    card.hidden = true;
    card.innerHTML = '';
  }
  renderResumeBlock();
  renderRecentBlock();
  clearUrlError();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -------------------------------------------------------------- settings UI

function openSettings() {
  const dialog = $('#settings-dialog');
  if (!dialog || dialog.open) return;
  syncIntervalUi(state.settings.intervalSec);
  const settingsMode = $(`input[name="settings-mode"][value="${state.settings.mode}"]`);
  if (settingsMode) settingsMode.checked = true;
  const snap = $('#settings-snap');
  if (snap) snap.checked = state.settings.snap;
  const sound = $('#settings-sound');
  if (sound) sound.checked = state.settings.sound;
  dialog.showModal();
}

function handleVisibilityChange() {
  if (document.hidden) {
    if (['playing', 'replaying', 'shadow-playing'].includes(state.phase)) {
      pausePlayback();
      if (state.phase === 'paused') {
        state.pausedReason = 'hidden';
        renderPanel();
      }
      toast('Sessão pausada para não cortar enquanto você está fora.', 'warn');
    }
  }
}

// -------------------------------------------------------------------- events

function bindEvents() {
  $('#setup-form')?.addEventListener('submit', handleLoadSubmit);
  $('#interval')?.addEventListener('input', (event) => {
    syncIntervalUi(event.target.value);
  });
  $('#video-url')?.addEventListener('input', clearUrlError);
  $('#start-time')?.addEventListener('input', clearUrlError);
  $('#mute-btn')?.addEventListener('click', () => {
    if (!state.player) return;
    if (state.player.isMuted()) state.player.unmute();
    else state.player.mute();
    $('#mute-btn')?.classList.toggle('is-muted', state.player.isMuted());
  });
  $('#practice-panel')?.addEventListener('input', (event) => {
    if (event.target?.id === 'answer-input') {
      state.answer = event.target.value;
      updateAnswerCount();
    }
  });
  $('#practice-panel')?.addEventListener('keydown', (event) => {
    if (event.target?.id !== 'answer-input') return;
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submitAnswer();
    }
  });
  document.addEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('click', handleDelegatedClick);
  document.addEventListener('change', handleDelegatedChange);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  $('#settings-dialog')?.addEventListener('close', syncSettingsDialog);
  window.addEventListener('beforeunload', () => {
    if (state.view === 'session') saveStored();
  });
}

function syncSettingsDialog() {
  const interval = clamp(
    Number($('#settings-interval')?.value) || state.settings.intervalSec,
    4,
    60,
  );
  const mode =
    $('input[name="settings-mode"]:checked')?.value === 'shadowing'
      ? 'shadowing'
      : 'dictation';
  const snap = Boolean($('#settings-snap')?.checked);
  const sound = Boolean($('#settings-sound')?.checked);
  state.settings.intervalSec = interval;
  state.settings.mode = mode;
  state.settings.snap = snap;
  state.settings.sound = sound;
  persistSettings();
  applySettingsToForm();
  setText('#mode-label', modeLabel());
}

function handleGlobalKeydown(event) {
  const tag = event.target?.tagName;
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
  if (typing) return;
  if (document.querySelector('dialog[open]')) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key === ' ') {
    const focused = document.activeElement;
    if (focused && ['BUTTON', 'A'].includes(focused.tagName)) return;
    event.preventDefault();
    togglePlay();
    return;
  }
  if (event.key.toLowerCase() === 'r' && state.view === 'session') {
    event.preventDefault();
    replaySegment();
    return;
  }
  if (event.key.toLowerCase() === 'n' && state.view === 'session') {
    if (['answering', 'reviewing', 'shadowing'].includes(state.phase)) {
      event.preventDefault();
      nextSegment();
    }
    return;
  }
  if (event.key === '?') {
    event.preventDefault();
    openHelp();
  }
  if (event.key === 'Escape') {
    const dialog = $('#settings-dialog');
    if (dialog?.open) dialog.close();
  }
}

function handleDelegatedClick(event) {
  const trigger = event.target.closest('[data-action]');
  if (!trigger) return;
  const action = trigger.dataset.action;
  if (action === 'help') {
    openHelp();
    return;
  }
  if (action === 'open-recent') {
    event.preventDefault();
    const videoId = trigger.dataset.videoId;
    if (!videoId) return;
    $('#video-url').value = videoId;
    state.settings = readFormSettings();
    fetchAndPrepare({ input: videoId, startMs: null }).then((result) => {
      if (result) renderReady(result.data, result.startInfo);
    });
    return;
  }
  if (action === 'start-session') {
    event.preventDefault();
    state.settings = readFormSettings();
    persistSettings();
    renderResumeBlock();
    unlockAudio();
    enterSession({ autoStart: true });
    return;
  }
  if (action === 'back-setup') {
    event.preventDefault();
    backToSetup();
    return;
  }
  if (action === 'start') {
    event.preventDefault();
    unlockAudio();
    beginSegment(state.startInfo?.startMs ?? 0);
    return;
  }
  if (action === 'resume-session') {
    event.preventDefault();
    resumeStoredSession();
    return;
  }
  if (action === 'discard-session') {
    event.preventDefault();
    discardStoredSession();
    return;
  }
  if (action === 'pause-now') {
    event.preventDefault();
    cutNow({ manual: true });
    return;
  }
  if (action === 'check') {
    event.preventDefault();
    submitAnswer();
    return;
  }
  if (action === 'replay') {
    event.preventDefault();
    replaySegment();
    return;
  }
  if (action === 'retry') {
    event.preventDefault();
    retrySegment();
    return;
  }
  if (action === 'resume-segment') {
    event.preventDefault();
    resumeSegment();
    return;
  }
  if (action === 'next') {
    event.preventDefault();
    nextSegment();
    return;
  }
  if (action === 'finish') {
    event.preventDefault();
    finishSession();
    return;
  }
  if (action === 'skip') {
    event.preventDefault();
    skipSegment();
    return;
  }
  if (action === 'toggle-play') {
    event.preventDefault();
    togglePlay();
    return;
  }
  if (action === 'mute') {
    return;
  }
  if (action === 'settings') {
    event.preventDefault();
    openSettings();
    return;
  }
  if (action === 'exit') {
    event.preventDefault();
    exitSession();
    return;
  }
  if (action === 'export') {
    event.preventDefault();
    exportSession();
    return;
  }
  if (action === 'copy-reference') {
    event.preventDefault();
    copyReference();
    return;
  }
  if (action === 'retry-load') {
    event.preventDefault();
    if (state.lastLoad) {
      enterSession({ autoStart: true });
    } else {
      backToSetup();
    }
    return;
  }
  if (action === 'shadow-play') {
    event.preventDefault();
    startShadowLoop();
    return;
  }
  if (action === 'shadow-stop') {
    event.preventDefault();
    stopShadowLoop();
    return;
  }
  if (action === 'shadow-blur') {
    event.preventDefault();
    state.shadow.blurred = !state.shadow.blurred;
    renderPanel();
    return;
  }
  if (action === 'record-start') {
    event.preventDefault();
    toggleRecording();
    return;
  }
  if (action === 'record-stop') {
    event.preventDefault();
    stopRecording();
    return;
  }
}

function handleDelegatedChange(event) {
  const target = event.target;
  if (target?.id === 'ready-track') {
    handleTrackChange(target.value);
    return;
  }
  if (target?.id === 'shadow-reps') {
    state.shadow.repeats = clamp(Number(target.value) || 3, 1, 5);
    return;
  }
  if (target?.id === 'shadow-rate') {
    state.shadow.rate = Number(target.value) || 1;
    if (state.phase === 'shadow-playing') state.player?.setRate(state.shadow.rate);
    return;
  }
  if (target?.id === 'settings-interval') {
    syncIntervalUi(target.value);
    persistSettings();
    applySettingsToForm();
    return;
  }
  if (target?.name === 'settings-mode') {
    state.settings.mode = target.value === 'shadowing' ? 'shadowing' : 'dictation';
    setText('#mode-label', modeLabel());
    persistSettings();
    applySettingsToForm();
    if (state.phase === 'answering' || state.phase === 'reviewing') {
      toast('O modo novo vale a partir do próximo trecho.');
    }
    return;
  }
  if (target?.id === 'settings-snap') {
    state.settings.snap = target.checked;
    persistSettings();
    applySettingsToForm();
    return;
  }
  if (target?.id === 'settings-sound') {
    state.settings.sound = target.checked;
    persistSettings();
    applySettingsToForm();
  }
}

function openHelp() {
  const dialog = $('#help-dialog');
  if (dialog && !dialog.open) dialog.showModal();
}
// ---------------------------------------------------------------------- init

function init() {
  applySettingsToForm();
  renderRecentBlock();
  renderResumeBlock();
  bindEvents();
  const params = new URLSearchParams(window.location.search);
  const videoParam = params.get('v') || params.get('url');
  if (videoParam) {
    $('#video-url').value = videoParam;
  }
  updatePlayIcon();
  window.__echo = {
    getState: () => ({
      view: state.view,
      phase: state.phase,
      mode: state.settings.mode,
      intervalSec: state.settings.intervalSec,
      videoId: state.transcript?.videoId || null,
      title: state.transcript?.title || null,
      segmentIndex: state.segment.index,
      startMs: state.segment.startMs,
      cutTargetMs: state.segment.cutTargetMs,
      cutMs: state.segment.cutMs,
      referenceText: state.segment.reference?.text || '',
      referenceWords: state.segment.reference?.words?.length || 0,
      answer: state.answer,
      result: state.result
        ? {
            accuracy: state.result.accuracy,
            correct: state.result.correct,
            total: state.result.total,
            missing: state.result.missing,
            substitutions: state.result.substitutions,
            extras: state.result.extras,
          }
        : null,
      historyLength: state.history.length,
      playerTime: state.player?.time?.() || 0,
      playerState: state.player?.state?.() ?? null,
      duration: state.player?.duration?.() || (state.transcript?.durationMs || 0) / 1000,
      startInfo: state.startInfo,
      track: state.transcript?.selectedTrack || null,
      timing: state.transcript?.timing || null,
      alignment: state.transcript?.alignment || null,
    }),
    getTranscript: () => state.transcript,
    getReference: () => state.segment.reference,
    player: () => state.player,
  };
}

init();
