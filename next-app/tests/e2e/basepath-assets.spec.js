// Guarda contra a regressão que o cliente encontrou em 27/08: os ícones do
// card apareciam quebrados no GitHub Pages e certos na Vercel.
//
// A causa é que `images.unoptimized` faz o <Image> devolver o src intacto,
// sem aplicar o basePath. Na Vercel o basePath é vazio e o erro some; no
// GitHub Pages o app vive sob /marshalls-customer-app-preview e o arquivo
// passa a ser procurado na raiz do domínio.
//
// Este spec roda contra um servidor com GITHUB_PAGES=1 (projeto
// "github-pages" no playwright.config.js), que é o único jeito de o
// basePath existir durante o teste.
const { test, expect } = require('@playwright/test');

const BASE_PATH = '/marshalls-customer-app-preview';

test('Os ícones do card carregam sob o basePath do GitHub Pages', async ({ page }) => {
  const naoEncontrados = [];
  page.on('response', r => { if (r.status() === 404) naoEncontrados.push(r.url()); });

  await page.goto(`${BASE_PATH}/agendamentos`);
  await expect(page.locator('.card').first()).toBeVisible({ timeout: 20000 });

  const icones = await page.locator('img[src*="fluent-emoji"]').evaluateAll(imgs =>
    imgs.map(img => ({ src: img.getAttribute('src'), carregou: img.naturalWidth > 0 }))
  );

  expect(icones.length, 'os ícones precisam estar na página').toBeGreaterThan(0);
  for (const icone of icones) {
    expect(icone.src.startsWith(BASE_PATH), `src sem basePath: ${icone.src}`).toBe(true);
    expect(icone.carregou, `arquivo não encontrado: ${icone.src}`).toBe(true);
  }

  expect(naoEncontrados.filter(u => /icons|\.png$/.test(u)), 'nenhum asset pode dar 404').toEqual([]);
});

test('Nenhuma imagem da tela fica quebrada sob o basePath', async ({ page }) => {
  // Mais amplo que o teste acima de propósito: qualquer asset novo que
  // esqueça o prefixo cai aqui, não só os ícones do Fluent Emoji.
  await page.goto(`${BASE_PATH}/agendamentos`);
  await expect(page.locator('.card').first()).toBeVisible({ timeout: 20000 });

  const quebradas = await page.locator('img').evaluateAll(imgs =>
    imgs.filter(img => img.getClientRects().length > 0 && img.naturalWidth === 0)
      .map(img => img.getAttribute('src'))
  );

  expect(quebradas).toEqual([]);
});
