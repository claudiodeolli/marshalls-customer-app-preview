// Cobre a issue #33: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/33
// "insere a palavra 'agora' ali depois de 'cancelamento'" — 05/09.
//
// Os textos são comparados **inteiros**. Procurar pela palavra solta passaria
// com ela no lugar errado, e o pedido é justamente sobre onde ela fica.
const { test, expect } = require('@playwright/test');

const CENARIOS = [
  {
    nome: 'Avulsa dentro das 48 horas',
    medico: 'Camila Ferraz',
    paragrafos: [
      'Esta consulta está a menos de 48 horas do horário agendado. Conforme informado antes da compra, se optar pelo cancelamento agora, a consulta será considerada utilizada e o valor pago não será reembolsado. Também não será possível escolher uma nova data e horário sem custo adicional.',
    ],
  },
  {
    nome: 'Avulsa com mais de 48 horas',
    medico: 'Gustavo Pinto',
    paragrafos: [
      'Ao cancelar esta consulta com mais de 48 horas de antecedência, você poderá escolher depois uma nova data e horário para essa especialidade, sem custo adicional.',
    ],
  },
  {
    nome: 'Encaminhamento',
    medico: 'Renata Alves',
    paragrafos: [
      'Ao cancelar esta consulta, o encaminhamento utilizado será encerrado e não poderá ser reutilizado.',
      'Para agendar novamente uma consulta com esta especialidade, será necessário passar pelo Plantão 24h e obter um novo encaminhamento, caso ainda haja indicação médica.',
    ],
  },
];

const limpo = texto => texto.replace(/\s+/g, ' ').trim();

async function abrirModalDeCancelamento(page, medico) {
  await page.locator(`.card:has-text('${medico}') button:text-is('Cancelar') >> visible=true`).first().click();
  const modal = page.locator('.card', { has: page.getByRole('button', { name: 'Cancelar consulta' }) }).last();
  await expect(modal).toBeVisible();
  await modal.evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));
  return modal;
}

/** Parágrafos de aviso: todos menos a abertura e a pergunta final. */
function paragrafosDeAviso(modal) {
  return modal.locator('p')
    .filter({ hasNotText: 'Deseja continuar com o cancelamento?' })
    .filter({ hasNotText: 'Você está prestes a cancelar' });
}

for (const [nomeDoViewport, viewport] of [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  test.describe(nomeDoViewport, () => {
    test.use({ viewport });

    test.beforeEach(async ({ page }) => {
      await page.goto('/agendamentos');
      await expect(page.locator('[data-testid="countdown"] >> visible=true').first())
        .toBeVisible({ timeout: 20000 });
    });

    for (const cenario of CENARIOS) {
      test(`P1/P3 — ${cenario.nome}: o aviso bate palavra por palavra`, async ({ page }) => {
        const modal = await abrirModalDeCancelamento(page, cenario.medico);
        const textos = (await paragrafosDeAviso(modal).allInnerTexts()).map(limpo);

        expect(textos).toEqual(cenario.paragrafos);
      });
    }

    test('P2 — "agora" fica fora do negrito', async ({ page }) => {
      // O negrito começa em "a consulta será considerada utilizada", como no
      // print dele; a palavra nova é do trecho em texto normal.
      const modal = await abrirModalDeCancelamento(page, 'Camila Ferraz');
      const emNegrito = (await modal.locator('strong').allInnerTexts()).map(limpo);

      expect(emNegrito, 'os destaques do print continuam os mesmos').toEqual(
        expect.arrayContaining([
          '48 horas do horário agendado',
          'a consulta será considerada utilizada e o valor pago não será reembolsado',
        ]),
      );
      for (const trecho of emNegrito) {
        expect(trecho, `"agora" não pode estar em negrito: "${trecho}"`).not.toContain('agora');
      }
    });
  });
}
