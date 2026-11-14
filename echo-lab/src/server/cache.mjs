// Tiny JSON disk cache. YouTube caption URLs and payloads change often, so
// every entry carries a fetch timestamp and is validated by the caller.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export function createDiskCache(directory) {
  const memory = new Map();

  const fileFor = (key) => {
    const digest = crypto.createHash('sha256').update(key).digest('hex').slice(0, 32);
    return path.join(directory, `${digest}.json`);
  };

  return {
    async get(key, maxAgeMs = null) {
      const cached = memory.get(key);
      if (cached) {
        if (maxAgeMs === null || Date.now() - cached.at <= maxAgeMs) return cached.value;
        return null;
      }
      try {
        const raw = await fs.readFile(fileFor(key), 'utf8');
        const entry = JSON.parse(raw);
        if (!entry || typeof entry.at !== 'number') return null;
        memory.set(key, entry);
        if (maxAgeMs !== null && Date.now() - entry.at > maxAgeMs) return null;
        return entry.value;
      } catch {
        return null;
      }
    },

    async set(key, value) {
      const entry = { at: Date.now(), value };
      memory.set(key, entry);
      try {
        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(fileFor(key), JSON.stringify(entry), 'utf8');
      } catch {
        // A cache failure must never break a lesson.
      }
    },

    async delete(key) {
      memory.delete(key);
      try {
        await fs.unlink(fileFor(key));
      } catch {
        // Already gone.
      }
    },
  };
}
