// Cobre a issue #3: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/3
// Cada teste referencia o requisito (An) do checklist da issue, que veio do
// PDF "MOSTRAGEM DOS CARDS na tela AGENDAMENTOS". As assertions foram
// escritas a partir do texto do requisito, não da implementação.
const { test, expect } = require('@playwright/test');

const ENCAMINHAMENTO = 'Encaminhamento';
const AVULSA = 'Consulta avulsa';

/** Troca o filtro e dispara a busca — a lista só recarrega no botão "Buscar". */
async function aplicarFiltro(page, rotulo) {
  await page.locator('._agend-filters button >> visible=true').first().click();
  await page.locator(`text="${rotulo}" >> visible=true`).last().click();
  await page.locator('button:has-text("Buscar") >> visible=true').first().click();
  await page.waitForTimeout(800);
}

/** Lê a lista renderizada como pares [status, origem], na ordem do DOM. */
async function lerCards(page) {
  return page.locator('.card').evaluateAll(cards => cards.map(card => {
    const texto = card.innerText;
    const status = (texto.match(/Consulta (agendada|pendente|cancelada|finalizada|não realizada)/) || [])[0];
    if (!status) return null;
    const origem = (texto.match(/Origem:\s*(.+)/) || [])[1]?.trim() ?? '?';
    return [status, origem];
  }).filter(Boolean));
}

test.beforeEach(async ({ page }) => {
  await page.goto('/agendamentos');
  await expect(page.locator('.card').first()).toBeVisible();
});

test('A1 — a tela abre com o filtro "Agendadas" pré-selecionado', async ({ page }) => {
  const cards = await lerCards(page);
  expect(cards.length).toBeGreaterThan(0);
  expect(cards.every(([status]) => status === 'Consulta agendada')).toBe(true);
});

test('A2 — no filtro Agendadas, todos os Encaminhamento vêm antes dos Avulsa', async ({ page }) => {
  const origens = (await lerCards(page)).map(([, origem]) => origem);
  const ultimoEncaminhamento = origens.lastIndexOf(ENCAMINHAMENTO);
  const primeiroAvulsa = origens.indexOf(AVULSA);
  expect(ultimoEncaminhamento).toBeLessThan(primeiroAvulsa);
});

test('A3 — filtro Pendentes traz um card de cada origem, Encaminhamento primeiro', async ({ page }) => {
  await aplicarFiltro(page, 'Pendentes');
  const cards = await lerCards(page);
  expect(cards).toEqual([
    ['Consulta pendente', ENCAMINHAMENTO],
    ['Consulta pendente', AVULSA],
  ]);
});

test('A4 — filtro Canceladas traz um card de cada origem, Encaminhamento primeiro', async ({ page }) => {
  await aplicarFiltro(page, 'Canceladas');
  const cards = await lerCards(page);
  expect(cards).toEqual([
    ['Consulta cancelada', ENCAMINHAMENTO],
    ['Consulta cancelada', AVULSA],
  ]);
});

test('A5 — filtro Não realizadas traz um card de cada origem, Encaminhamento primeiro', async ({ page }) => {
  await aplicarFiltro(page, 'Não realizadas');
  const cards = await lerCards(page);
  expect(cards).toEqual([
    ['Consulta não realizada', ENCAMINHAMENTO],
    ['Consulta não realizada', AVULSA],
  ]);
});

test('A6 — filtro Todos agrupa na ordem agendadas → pendentes → canceladas → não realizadas', async ({ page }) => {
  await aplicarFiltro(page, 'Todos');
  const statusNaOrdem = (await lerCards(page)).map(([status]) => status);
  const primeiraOcorrencia = status => statusNaOrdem.indexOf(status);

  expect(primeiraOcorrencia('Consulta agendada')).toBeGreaterThanOrEqual(0);
  expect(primeiraOcorrencia('Consulta agendada')).toBeLessThan(primeiraOcorrencia('Consulta pendente'));
  expect(primeiraOcorrencia('Consulta pendente')).toBeLessThan(primeiraOcorrencia('Consulta cancelada'));
  expect(primeiraOcorrencia('Consulta cancelada')).toBeLessThan(primeiraOcorrencia('Consulta não realizada'));

  // Cada status aparece num bloco contíguo, sem intercalar.
  const blocos = statusNaOrdem.filter((status, i) => status !== statusNaOrdem[i - 1]);
  expect(new Set(blocos).size).toBe(blocos.length);
});

test('A7 — dentro de cada grupo do filtro Todos, Encaminhamento vem antes de Avulsa', async ({ page }) => {
  await aplicarFiltro(page, 'Todos');
  const cards = await lerCards(page);

  for (const status of ['Consulta agendada', 'Consulta pendente', 'Consulta cancelada', 'Consulta não realizada']) {
    const origens = cards.filter(([s]) => s === status).map(([, origem]) => origem);
    expect(origens.lastIndexOf(ENCAMINHAMENTO), `origens de "${status}"`).toBeLessThan(origens.indexOf(AVULSA));
  }
});

test('A6 — o filtro Todos não traz consultas finalizadas (pertencem ao Histórico)', async ({ page }) => {
  await aplicarFiltro(page, 'Todos');
  const statusPresentes = new Set((await lerCards(page)).map(([status]) => status));
  expect(statusPresentes.has('Consulta finalizada')).toBe(false);
});

test('Card pendente oferece "Agendar" e não exibe data ainda', async ({ page }) => {
  await aplicarFiltro(page, 'Pendentes');
  const card = page.locator('.card', { hasText: 'Paulo Salave' }).first();
  await expect(card.getByRole('button', { name: 'Agendar' }).first()).toBeVisible();
  await expect(card.getByText('Data e horário ainda não escolhidos')).toBeVisible();
});
