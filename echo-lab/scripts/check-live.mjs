// Live provider check (requires internet). It does not use the browser; it
// validates that YouTube still hands out English captions and that the timed
// word list is sane.
//
//   node scripts/check-live.mjs [videoId ...]

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createDiskCache } from '../src/server/cache.mjs';
import { loadTranscript } from '../src/server/youtube.mjs';
import { referenceForSegment } from '../src/shared/segments.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = createDiskCache(path.join(ROOT, '.cache'));
const ids = process.argv.slice(2);
const videos = ids.length ? ids : ['jNQXAC9IVRw', 'iG9CE55wbtY'];

let failures = 0;

for (const videoId of videos) {
  console.log(`\n=== ${videoId} ===`);
  try {
    const data = await loadTranscript(videoId, { cache });
    const words = data.words;
    const problems = [];
    if (!words.length) problems.push('no words');
    if (data.durationMs && words[words.length - 1].startMs > data.durationMs) {
      problems.push('last word starts after duration');
    }
    for (let index = 0; index < words.length; index += 1) {
      const word = words[index];
      if (!(word.endMs > word.startMs)) problems.push(`word ${index} has no duration`);
      if (index > 0 && word.startMs < words[index - 1].startMs) {
        problems.push(`word ${index} is out of order`);
      }
    }
    const stable = words.filter((word) => word.stable).length;
    console.log(
      `${data.title || '(sem título)'} · ${Math.round(data.durationMs / 1000)}s · ` +
        `${words.length} palavras · ${data.selectedTrack.key} · ${data.timing}`,
    );
    console.log(
      `alinhamento: ${data.alignment.anchored}/${data.alignment.total} ` +
        `(${Math.round(data.alignment.coverage * 100)}%) · ` +
        `estáveis: ${stable}/${words.length}`,
    );
    for (const warning of data.warnings) console.log(`aviso: ${warning}`);
    const start = Math.max(0, words[0].startMs - 100);
    const segment = referenceForSegment(words, start, start + 5000);
    console.log(
      `exemplo 5s: ${segment.text}  [${segment.count} palavras, ` +
        `${segment.startMs}–${segment.endMs} ms]`,
    );
    if (problems.length) {
      failures += 1;
      console.log('FALHAS:', problems.slice(0, 10).join('; '));
    } else {
      console.log('OK');
    }
  } catch (error) {
    failures += 1;
    console.error(`ERRO: ${error.code || error.name}: ${error.message}`);
  }
}

if (failures) {
  console.error(`\n${failures} vídeo(s) com falha.`);
  process.exitCode = 1;
} else {
  console.log('\nTudo certo.');
}
