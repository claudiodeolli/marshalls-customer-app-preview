// Cobre a issue #12: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/12
// O print do cliente traz o texto literal de cada estágio da contagem. A
// diferença em relação ao que estava no ar era a exclamação no fim.
const { test, expect } = require('@playwright/test');

// Cada estágio pelo médico que o representa na série de demonstração, e o
// texto exato que o print especifica.
const ESTAGIOS = [
  { medico: 'Renata Alves',   texto: /^Sua consulta será em \d+ dias!$/,          rotulo: 'dias' },
  { medico: 'Bruno Tavares',  texto: /^Sua consulta será em \d+ dias!$/,          rotulo: '48 horas' },
  { medico: 'Sofia Marques',  texto: /^Sua consulta será em \d+ dias!$/,          rotulo: '47:59 horas' },
  { medico: 'Otavio Lins',    texto: /^Sua consulta é amanhã!$/,                  rotulo: '24 horas' },
  { medico: 'Clara Bento',    texto: /^Sua consulta será daqui a \d+ horas?!$/,   rotulo: '23 horas' },
  { medico: 'Ivan Moreira',   texto: /^Sua consulta começa em \d+ minutos!$/,     rotulo: '59 minutos' },
  { medico: 'Lucia Ramos',    texto: /^Sua consulta começa em \d+ minutos!$/,     rotulo: '15 minutos' },
];

/**
 * Lê a frase do contador, sem o ícone — os dois moram no mesmo span, e o
 * innerText devolve o emoji e o texto separados por quebra de linha.
 */
async function lerContador(page, medico) {
  const bruto = await page.locator(`.card:has-text('${medico}') ._appt-card-actions span`).first().innerText();
  return bruto.split('\n').map(l => l.trim()).filter(Boolean).pop();
}

test.use({ viewport: { width: 1440, height: 1000 } });

test.beforeEach(async ({ page }) => {
  await page.goto('/agendamentos');
  // O primeiro .card no viewport desktop é um bloco escondido por CSS —
  // esperar por um card de consulta de verdade.
  await expect(page.locator("._appt-card-actions").first()).toBeVisible({ timeout: 15000 });
});

for (const { medico, texto, rotulo } of ESTAGIOS) {
  test(`T1–T4 — estágio "${rotulo}" usa o texto exato do print`, async ({ page }) => {
    expect(await lerContador(page, medico)).toMatch(texto);
  });
}

test('T5 — no estágio liberado o aviso verde acompanha o contador', async ({ page }) => {
  const card = page.locator(".card:has-text('Lucia Ramos')");
  await expect(card.locator('._appt-card-actions').getByTestId('ready-to-enter'))
    .toContainText('Você já pode entrar!');
});

test('Nenhum estágio ficou sem a exclamação', async ({ page }) => {
  const contadores = await page.locator('._appt-card-actions span').evaluateAll(spans =>
    spans.flatMap(s => s.innerText.split(/\r?\n/)).map(t => t.trim()).filter(t => t.startsWith('Sua consulta'))
  );

  expect(contadores.length).toBeGreaterThan(0);
  for (const texto of contadores) {
    expect(texto, texto).toMatch(/!$/);
  }
});
