// Cobre a issue #9: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/9
// "Nessas modais de cancelamento, deixa os parágrafos separadinhos igual
// coloquei ali, e com os negritos."
const { test, expect } = require('@playwright/test');

// Cada cenário: o médico que o dispara, quantos parágrafos de aviso o
// print do cliente mostra, e os trechos que ele destacou em negrito.
const CENARIOS = [
  {
    nome: 'Encaminhamento',
    medico: 'Renata Alves',
    paragrafos: 2,
    negritos: [
      'o encaminhamento utilizado será encerrado e não poderá ser reutilizado',
      'Plantão 24h',
    ],
  },
  {
    nome: 'Avulsa com mais de 48h',
    medico: 'Gustavo Pinto',
    paragrafos: 1,
    negritos: [
      '48 horas de antecedência',
      'escolher depois uma nova data e horário para essa especialidade, sem custo adicional',
    ],
  },
  {
    nome: 'Avulsa com menos de 48h',
    medico: 'Camila Ferraz',
    paragrafos: 1,
    negritos: [
      '48 horas do horário agendado',
      'a consulta será considerada utilizada e o valor pago não será reembolsado',
    ],
  },
];

async function abrirModalDeCancelamento(page, medico) {
  await page.locator(`.card:has-text('${medico}') button:text-is('Cancelar') >> visible=true`).first().click();
  const modal = page.locator('.card', { has: page.getByRole('button', { name: 'Cancelar consulta' }) }).last();
  await expect(modal).toBeVisible();
  // A modal entra com animação de escala; medir antes dela terminar
  // devolve dimensões menores que as reais.
  await modal.evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));
  return modal;
}

/** Parágrafos de aviso: todos menos o título e a pergunta final. */
function paragrafosDeAviso(modal) {
  return modal.locator('p').filter({ hasNotText: 'Deseja continuar com o cancelamento?' })
    .filter({ hasNotText: 'Você está prestes a cancelar' });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/agendamentos');
  await expect(page.locator('.card').first()).toBeVisible();
});

for (const cenario of CENARIOS) {
  test(`C1–C4 — ${cenario.nome}: aviso em ${cenario.paragrafos} parágrafo(s) separado(s)`, async ({ page }) => {
    const modal = await abrirModalDeCancelamento(page, cenario.medico);
    await expect(paragrafosDeAviso(modal)).toHaveCount(cenario.paragrafos);
  });

  test(`C1–C4 — ${cenario.nome}: negritos do print preservados`, async ({ page }) => {
    const modal = await abrirModalDeCancelamento(page, cenario.medico);
    for (const trecho of cenario.negritos) {
      await expect(modal.locator('strong', { hasText: trecho }).first(), trecho).toBeVisible();
    }
  });
}

test('C5 — "Deseja continuar com o cancelamento?" é um parágrafo próprio, em negrito', async ({ page }) => {
  const modal = await abrirModalDeCancelamento(page, 'Renata Alves');
  const pergunta = modal.locator('p', { hasText: 'Deseja continuar com o cancelamento?' });

  await expect(pergunta).toHaveCount(1);
  const peso = await pergunta.evaluate(el => parseInt(getComputedStyle(el).fontWeight, 10));
  expect(peso).toBeGreaterThanOrEqual(700);
});

test('C6 — há espaçamento visível entre os parágrafos', async ({ page }) => {
  const modal = await abrirModalDeCancelamento(page, 'Renata Alves');
  const avisos = paragrafosDeAviso(modal);
  await expect(avisos).toHaveCount(2);

  // O vão entre o fim de um parágrafo e o começo do seguinte, medido num
  // único snapshot de layout.
  const vao = await modal.evaluate(el => {
    const ps = [...el.querySelectorAll('p')]
      .filter(p => !/Deseja continuar|Você está prestes/.test(p.textContent));
    return ps[1].getBoundingClientRect().top - ps[0].getBoundingClientRect().bottom;
  });
  expect(vao).toBeGreaterThan(8);
});

test('C7 — os botões continuam "Voltar" e "Cancelar consulta"', async ({ page }) => {
  const modal = await abrirModalDeCancelamento(page, 'Renata Alves');
  await expect(modal.getByRole('button', { name: 'Voltar' })).toBeVisible();
  await expect(modal.getByRole('button', { name: 'Cancelar consulta' })).toBeVisible();
});
