// Echo Lab local server. No npm dependencies: `node server.mjs`.
//
// The server exists for two reasons:
//   1. serve the static app;
//   2. fetch YouTube captions server-side (the browser cannot do it reliably
//      because of YouTube's BotGuard / timedtext restrictions).

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import { createDiskCache } from './src/server/cache.mjs';
import {
  TranscriptError,
  extractVideoId,
  loadTranscript,
} from './src/server/youtube.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const SHARED_DIR = path.join(ROOT, 'src', 'shared');
const CACHE_DIR = path.join(ROOT, '.cache');
const cache = createDiskCache(CACHE_DIR);

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.ico', 'image/x-icon'],
  ['.woff2', 'font/woff2'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

function parseArgs(argv) {
  const args = { port: Number(process.env.PORT) || 4317, open: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--open') args.open = true;
    else if (value === '--no-open') args.open = false;
    else if (value === '--port' && argv[index + 1]) {
      args.port = Number(argv[index + 1]);
      index += 1;
    }
  }
  if (!Number.isInteger(args.port) || args.port < 1 || args.port > 65535) {
    args.port = 4317;
  }
  return args;
}

function isInside(parent, target) {
  const relative = path.relative(parent, target);
  return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
}

async function sendFile(res, filePath, method) {
  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;
  const extension = path.extname(filePath).toLowerCase();
  const type = MIME.get(extension) || 'application/octet-stream';
  res.writeHead(200, {
    'content-type': type,
    'content-length': stat.size,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  if (method === 'HEAD') {
    res.end();
    return true;
  }
  const data = await fs.readFile(filePath);
  res.end(data);
  return true;
}

async function serveStatic(req, res, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Pedido inválido.');
    return;
  }
  if (decoded.includes('\0')) {
    res.writeHead(400);
    res.end('Pedido inválido.');
    return;
  }

  let baseDir;
  let relative;
  if (decoded === '/') {
    baseDir = PUBLIC_DIR;
    relative = 'index.html';
  } else if (decoded.startsWith('/shared/')) {
    baseDir = SHARED_DIR;
    relative = decoded.slice('/shared/'.length);
  } else {
    baseDir = PUBLIC_DIR;
    relative = decoded.replace(/^\/+/, '');
  }
  const target = path.resolve(baseDir, relative);
  if (!isInside(baseDir, target) && target !== path.join(PUBLIC_DIR, 'index.html')) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Acesso negado.');
    return;
  }
  const served = await sendFile(res, target, req.method);
  if (!served) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Não encontrado.');
  }
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
}

const inFlight = new Map();

async function handleTranscript(url, res) {
  const rawInput = url.searchParams.get('videoId') || url.searchParams.get('url') || '';
  const trackKey = url.searchParams.get('track') || null;
  const refresh = url.searchParams.get('refresh') === '1';
  const videoId = extractVideoId(rawInput);
  if (!videoId) {
    sendJson(res, 400, {
      error: {
        code: 'INVALID_URL',
        message: 'Informe um link ou ID de vídeo do YouTube válido.',
      },
    });
    return;
  }
  const key = `${videoId}:${trackKey || ''}:${refresh ? '1' : '0'}`;
  let promise = inFlight.get(key);
  if (!promise) {
    promise = loadTranscript(videoId, { trackKey, refresh, cache });
    inFlight.set(key, promise);
    const cleanup = () => inFlight.delete(key);
    promise.then(cleanup, cleanup);
  }
  try {
    const data = await promise;
    sendJson(res, 200, data);
  } catch (error) {
    const status = error instanceof TranscriptError ? error.status : 500;
    const code = error instanceof TranscriptError ? error.code : 'INTERNAL';
    if (!(error instanceof TranscriptError)) {
      console.error('[transcript]', error);
    } else {
      console.warn(`[transcript] ${code}: ${error.message}`);
    }
    sendJson(res, status, {
      error: {
        code,
        message:
          error instanceof TranscriptError
            ? error.message
            : 'Erro inesperado ao montar a transcrição.',
        details: error instanceof TranscriptError ? error.details : null,
      },
    });
  }
}

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - started}ms`);
  });
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJson(res, 405, {
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Método não permitido.' },
      });
      return;
    }
    const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
    if (url.pathname === '/api/health') {
      sendJson(res, 200, {
        ok: true,
        node: process.version,
        uptime: Math.round(process.uptime()),
      });
      return;
    }
    if (url.pathname === '/api/transcript') {
      await handleTranscript(url, res);
      return;
    }
    if (url.pathname.startsWith('/api/')) {
      sendJson(res, 404, {
        error: { code: 'NOT_FOUND', message: 'Rota de API desconhecida.' },
      });
      return;
    }
    await serveStatic(req, res, url.pathname);
  } catch (error) {
    console.error('[server]', error);
    if (!res.headersSent) {
      sendJson(res, 500, {
        error: { code: 'INTERNAL', message: 'Erro inesperado no servidor.' },
      });
    } else {
      res.end();
    }
  }
});

function openBrowser(url) {
  const command =
    process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '', url]]
      : process.platform === 'darwin'
        ? ['open', [url]]
        : ['xdg-open', [url]];
  try {
    const child = spawn(command[0], command[1], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
  } catch {
    // Opening a browser is a convenience, never a requirement.
  }
}

const args = parseArgs(process.argv.slice(2));
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `A porta ${args.port} já está em uso. Rode com --port 4318 ou feche o outro processo.`,
    );
  } else {
    console.error('Falha ao iniciar o servidor:', error);
  }
  process.exitCode = 1;
});
server.listen(args.port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${args.port}`;
  console.log('');
  console.log('  Echo Lab  ·  ditado e shadowing com YouTube');
  console.log(`  ${url}`);
  console.log('  Ctrl+C para encerrar');
  console.log('');
  if (args.open) openBrowser(url);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 1500).unref();
  });
}
