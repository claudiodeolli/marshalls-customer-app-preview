// Renderiza páginas de um PDF como PNG, para citar o pedido original do
// cliente lado a lado com o resultado nos relatórios do /resolve-issue.
// Usa pdf.js dentro do Chromium (via Playwright) porque o visualizador
// nativo do Chromium headless baixa o arquivo em vez de renderizar, e o
// pdf.js em Node exigiria canvas nativo.
//
// Uso: node renderPdfPages.mjs <arquivo.pdf> <pastaDeSaida> <pagina[,pagina...]>
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));

const [pdfPath, outDir, pagesArg] = process.argv.slice(2);
if (!pdfPath || !outDir || !pagesArg) {
  console.error('Uso: node renderPdfPages.mjs <arquivo.pdf> <pastaDeSaida> <pagina[,pagina...]>');
  process.exit(1);
}
const pages = pagesArg.split(',').map(n => parseInt(n.trim(), 10));

const MIME = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.pdf': 'application/pdf', '.html': 'text/html' };

const VIEWER_HTML = `<!doctype html><html><body style="margin:0">
<canvas id="c"></canvas>
<script type="module">
import * as pdfjs from '/pdfjs/pdf.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';
window.renderPage = async (pageNumber, scale) => {
  const doc = await pdfjs.getDocument({ url: '/target.pdf' }).promise;
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.getElementById('c');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  return { width: viewport.width, height: viewport.height };
};
window.ready = true;
</script></body></html>`;

const server = createServer(async (req, res) => {
  try {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(VIEWER_HTML);
    }
    if (req.url === '/target.pdf') {
      res.writeHead(200, { 'Content-Type': 'application/pdf' });
      return res.end(await readFile(pdfPath));
    }
    if (req.url.startsWith('/pdfjs/')) {
      const file = join(__dirname, 'node_modules/pdfjs-dist/build', basename(req.url));
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
      return res.end(await readFile(file));
    }
    res.writeHead(404).end();
  } catch (err) {
    res.writeHead(500).end(String(err));
  }
});

await new Promise(resolve => server.listen(0, resolve));
const port = server.address().port;

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
await page.goto(`http://localhost:${port}/`);
await page.waitForFunction(() => window.ready === true);

for (const pageNumber of pages) {
  const size = await page.evaluate(([n, s]) => window.renderPage(n, s), [pageNumber, 1.6]);
  await page.setViewportSize({ width: Math.ceil(size.width), height: Math.ceil(size.height) });
  const out = join(outDir, `pdf-p${pageNumber}.png`);
  await page.locator('#c').screenshot({ path: out });
  console.log('gerado', out);
}

await browser.close();
server.close();
