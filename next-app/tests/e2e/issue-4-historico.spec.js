// Cobre a issue #4: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/4
// Cada teste referencia o requisito (Hn) do checklist da issue, que veio do
// PDF "MOSTRAGEM DOS CARDS na tela HISTÓRICO". As assertions foram escritas
// a partir do texto do requisito, não da implementação.
const { test, expect } = require('@playwright/test');

const PRONTO_ATENDIMENTO = 'Pronto Atendimento';
const ENCAMINHAMENTO = 'Encaminhamento';
const AVULSA = 'Consulta avulsa';

/** O painel de filtros começa recolhido — abre antes de mexer nele. */
async function abrirPainelDeFiltros(page) {
  if (await page.locator('._hist-filter-status').count() === 0) {
    await page.getByText('Procurar consultas').click();
    await page.waitForTimeout(400);
  }
}

/** Troca o filtro de status e dispara a busca. */
async function aplicarFiltro(page, rotulo) {
  await abrirPainelDeFiltros(page);
  // A classe ._status-select-btn é compartilhada com o seletor de tipo —
  // escopar pelo container do campo Status.
  await page.locator('._hist-filter-status ._status-select-btn').click();
  await page.locator(`text="${rotulo}" >> visible=true`).last().click();
  await page.locator('._hist-filter-btn >> visible=true').first().click();
  await page.waitForTimeout(1000);
}

/** Lê os cards renderizados como [status, origem], na ordem do DOM. */
async function lerCards(page) {
  return page.locator('.card').evaluateAll(cards => cards.map(card => {
    const texto = card.innerText;
    const status = (texto.match(/Consulta (finalizada|pendente|agendada|cancelada|não realizada)/) || [])[0];
    if (!status) return null;
    const origem = /Pronto Atendimento/.test(texto)
      ? 'Pronto Atendimento'
      : /Encaminhamento/.test(texto) ? 'Encaminhamento' : 'Consulta avulsa';
    return [status, origem];
  }).filter(Boolean));
}

test.beforeEach(async ({ page }) => {
  await page.goto('/historico');
  await expect(page.locator('.card').first()).toBeVisible();
});

test('H5 — o seletor oferece o filtro "Consultas não realizadas"', async ({ page }) => {
  await abrirPainelDeFiltros(page);
  // A classe ._status-select-btn é compartilhada com o seletor de tipo —
  // escopar pelo container do campo Status.
  await page.locator('._hist-filter-status ._status-select-btn').click();
  await expect(page.locator('text="Consultas não realizadas" >> visible=true').last()).toBeVisible();
});

test('H5 — "Consultas em andamento" existe e é um filtro separado de "não realizadas"', async ({ page }) => {
  await abrirPainelDeFiltros(page);
  // A classe ._status-select-btn é compartilhada com o seletor de tipo —
  // escopar pelo container do campo Status.
  await page.locator('._hist-filter-status ._status-select-btn').click();
  await expect(page.locator('text="Consultas em andamento" >> visible=true').last()).toBeVisible();
  await expect(page.locator('text="Consultas não realizadas" >> visible=true').last()).toBeVisible();
});

test('H1 — filtro Finalizadas: Pronto Atendimento, Encaminhamento, Consulta avulsa', async ({ page }) => {
  await aplicarFiltro(page, 'Consultas finalizadas');
  expect(await lerCards(page)).toEqual([
    ['Consulta finalizada', PRONTO_ATENDIMENTO],
    ['Consulta finalizada', ENCAMINHAMENTO],
    ['Consulta finalizada', AVULSA],
  ]);
});

test('H2 — filtro Em andamento: Encaminhamento e depois Consulta avulsa', async ({ page }) => {
  await aplicarFiltro(page, 'Consultas em andamento');
  expect(await lerCards(page)).toEqual([
    ['Consulta pendente', ENCAMINHAMENTO],
    ['Consulta pendente', AVULSA],
  ]);
});

test('H3 — filtro Agendadas: Encaminhamento e depois Consulta avulsa', async ({ page }) => {
  await aplicarFiltro(page, 'Consultas agendadas');
  expect(await lerCards(page)).toEqual([
    ['Consulta agendada', ENCAMINHAMENTO],
    ['Consulta agendada', AVULSA],
  ]);
});

test('H4 — filtro Canceladas: Encaminhamento e depois Consulta avulsa', async ({ page }) => {
  await aplicarFiltro(page, 'Consultas canceladas');
  expect(await lerCards(page)).toEqual([
    ['Consulta cancelada', ENCAMINHAMENTO],
    ['Consulta cancelada', AVULSA],
  ]);
});

test('H6 — filtro Não realizadas: Encaminhamento e depois Consulta avulsa', async ({ page }) => {
  await aplicarFiltro(page, 'Consultas não realizadas');
  expect(await lerCards(page)).toEqual([
    ['Consulta não realizada', ENCAMINHAMENTO],
    ['Consulta não realizada', AVULSA],
  ]);
});

test('H7 + H8 — tag "Consulta não realizada" e aviso de não comparecimento', async ({ page }) => {
  await aplicarFiltro(page, 'Consultas não realizadas');
  // O painel de filtros também é um .card — pegar o primeiro que tem badge.
  const card = page.locator('.card', { has: page.locator('.hist-status-badge') }).first();

  const tag = card.locator('.hist-status-badge');
  await expect(tag).toHaveText('Consulta não realizada');
  // Mesma cor cinza usada para esse status na tela Agendamentos.
  await expect(tag).toHaveCSS('color', 'rgb(130, 134, 139)');

  await expect(card.getByText('Usuário não compareceu à consulta')).toBeVisible();

  // "Semelhante ao de cancelamento": não oferece reagendamento.
  await expect(card.getByRole('button', { name: 'Agendar' })).toHaveCount(0);
});

test('H2 — card em andamento oferece "Agendar" (é ele que aguarda escolha de data)', async ({ page }) => {
  await aplicarFiltro(page, 'Consultas em andamento');
  const card = page.locator('.card', { has: page.locator('.hist-status-badge') }).first();
  await expect(card.locator('.hist-status-badge')).toHaveText('Consulta pendente');
  await expect(card.getByRole('button', { name: 'Agendar' })).toBeVisible();
});

test('H9 — filtro Todas segue a sequência completa dos 11 cards', async ({ page }) => {
  expect(await lerCards(page)).toEqual([
    ['Consulta finalizada', PRONTO_ATENDIMENTO],
    ['Consulta finalizada', ENCAMINHAMENTO],
    ['Consulta finalizada', AVULSA],
    ['Consulta pendente', ENCAMINHAMENTO],
    ['Consulta pendente', AVULSA],
    ['Consulta agendada', ENCAMINHAMENTO],
    ['Consulta agendada', AVULSA],
    ['Consulta cancelada', ENCAMINHAMENTO],
    ['Consulta cancelada', AVULSA],
    ['Consulta não realizada', ENCAMINHAMENTO],
    ['Consulta não realizada', AVULSA],
  ]);
});
