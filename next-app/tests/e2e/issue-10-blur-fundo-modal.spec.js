// Cobre a issue #10: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/10
// "sempre que abrir uma modal, consegue deixar o restante da tela (o fundo)
// com um blurry bem levinho?"
const { test, expect } = require('@playwright/test');

/** Lê o backdrop-filter e o fundo do overlay que envolve a modal aberta. */
async function lerOverlay(modal) {
  return modal.evaluate(el => {
    const overlay = el.closest('div[style*="position: fixed"]') ?? el.parentElement;
    const estilo = getComputedStyle(overlay);
    return {
      desfoque: estilo.backdropFilter || estilo.webkitBackdropFilter,
      fundo: estilo.backgroundColor,
    };
  });
}

async function abrirModalDeCancelamento(page) {
  await page.goto('/agendamentos');
  await expect(page.locator('.card').first()).toBeVisible();
  await page.locator(".card:has-text('Renata Alves') button:text-is('Cancelar') >> visible=true").first().click();
  const modal = page.locator('.card', { has: page.getByRole('button', { name: 'Cancelar consulta' }) }).last();
  await expect(modal).toBeVisible();
  await modal.evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));
  return modal;
}

test('B1 — o fundo fica desfocado quando a modal abre', async ({ page }) => {
  const modal = await abrirModalDeCancelamento(page);
  const { desfoque } = await lerOverlay(modal);

  expect(desfoque).toMatch(/blur\(/);
});

test('B2 — o escurecimento continua, somado ao desfoque', async ({ page }) => {
  const modal = await abrirModalDeCancelamento(page);
  const { desfoque, fundo } = await lerOverlay(modal);

  expect(desfoque).toMatch(/blur\(/);
  // rgba com alfa entre 0 e 1: o overlay continua escurecendo o fundo.
  const alfa = parseFloat((fundo.match(/rgba?\([^)]*,\s*([\d.]+)\)/) || [])[1] ?? '1');
  expect(alfa).toBeGreaterThan(0);
  expect(alfa).toBeLessThan(1);
});

test('B4 — o desfoque é leve, não opaco', async ({ page }) => {
  const modal = await abrirModalDeCancelamento(page);
  const { desfoque } = await lerOverlay(modal);

  const px = parseFloat((desfoque.match(/blur\(([\d.]+)px\)/) || [])[1]);
  expect(px).toBeGreaterThan(0);
  expect(px, 'desfoque "bem levinho" — acima de 8px o fundo some').toBeLessThanOrEqual(8);
});

test('B3 — o desfoque vale para outras modais além da de cancelamento', async ({ page }) => {
  // Modal de anexar documentos, disparada por um card já liberado.
  await page.goto('/agendamentos');
  await expect(page.locator('.card').first()).toBeVisible();
  await page.locator(".card:has-text('Lucia Ramos') button:text-is('Entrar no atendimento') >> visible=true").first().click();

  const modal = page.locator('.card', { has: page.getByRole('button', { name: 'Escolher arquivos' }) }).last();
  await expect(modal).toBeVisible();
  await modal.evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));

  const { desfoque } = await lerOverlay(modal);
  expect(desfoque).toMatch(/blur\(/);
});

test('B3 — o diálogo do botão bloqueado também desfoca o fundo', async ({ page }) => {
  await page.goto('/agendamentos');
  await expect(page.locator('.card').first()).toBeVisible();
  await page.locator('.card:has-text("Sofia Marques") span[title^="Este bot"] >> visible=true').first().click();

  const modal = page.locator('.card', { has: page.getByRole('button', { name: 'Entendi' }) }).last();
  await expect(modal).toBeVisible();
  await modal.evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));

  const { desfoque } = await lerOverlay(modal);
  expect(desfoque).toMatch(/blur\(/);
});

test('B4 — todas as modais compartilham a mesma intensidade', async ({ page }) => {
  const cancelamento = await lerOverlay(await abrirModalDeCancelamento(page));

  await page.goto('/agendamentos');
  await expect(page.locator('.card').first()).toBeVisible();
  await page.locator(".card:has-text('Lucia Ramos') button:text-is('Entrar no atendimento') >> visible=true").first().click();
  const anexos = page.locator('.card', { has: page.getByRole('button', { name: 'Escolher arquivos' }) }).last();
  await expect(anexos).toBeVisible();

  expect((await lerOverlay(anexos)).desfoque).toBe(cancelamento.desfoque);
});
