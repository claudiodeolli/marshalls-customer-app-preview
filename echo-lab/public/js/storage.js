// Local persistence. Sessions hold only answers, timings and scores; the
// caption text lives on the server cache and is re-fetched when needed.

const SESSION_KEY = 'echo.session.v1';
const RECENT_KEY = 'echo.recent.v1';
const SETTINGS_KEY = 'echo.settings.v1';
const MAX_RECENT = 8;

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadStoredSession() {
  const value = read(SESSION_KEY, null);
  if (!value || typeof value !== 'object' || !value.videoId) return null;
  return value;
}

export function saveStoredSession(session) {
  return write(SESSION_KEY, {
    ...session,
    updatedAt: new Date().toISOString(),
  });
}

export function clearStoredSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore.
  }
}

export function loadRecent() {
  const value = read(RECENT_KEY, []);
  return Array.isArray(value) ? value.slice(0, MAX_RECENT) : [];
}

export function addRecent(entry) {
  if (!entry?.videoId) return;
  const list = loadRecent().filter((item) => item.videoId !== entry.videoId);
  list.unshift({
    ...entry,
    updatedAt: new Date().toISOString(),
  });
  write(RECENT_KEY, list.slice(0, MAX_RECENT));
}

export function removeRecent(videoId) {
  write(
    RECENT_KEY,
    loadRecent().filter((item) => item.videoId !== videoId),
  );
}

export function loadSettings() {
  const value = read(SETTINGS_KEY, null);
  return value && typeof value === 'object' ? value : null;
}

export function saveSettings(settings) {
  return write(SETTINGS_KEY, settings);
}
