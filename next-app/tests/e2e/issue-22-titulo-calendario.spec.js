// Cobre a issue #22: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/22
// Título acima do calendário e "Avulsa" com inicial maiúscula, pedidos em
// 27/08. O texto do título é o da mensagem escrita dele, e não o da anotação
// no print, que dizia outra coisa.
const { test, expect } = require('@playwright/test');

const TITULO = 'Escolha uma data para sua consulta';

async function abrirMarcacao(page, rota) {
  await page.goto(rota);
  await expect(page.getByTestId('calendario').first()).toBeVisible({ timeout: 15000 });
  const entendi = page.getByRole('button', { name: 'Entendi' });
  if (await entendi.count()) await entendi.first().click();
}

for (const [nome, viewport] of [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  test.describe(nome, () => {
    test.use({ viewport });

    test('C1/C2 — o título aparece na marcação por encaminhamento', async ({ page }) => {
      await abrirMarcacao(page, '/schedule/calendar?referral=ref-003');
      await expect(page.getByTestId('titulo-calendario')).toHaveText(TITULO);
    });

    test('C1/C2 — e também na avulsa', async ({ page }) => {
      await abrirMarcacao(page, '/schedule/calendar?avulsaSpec=spec-003');
      await expect(page.getByTestId('titulo-calendario')).toHaveText(TITULO);
    });

    test('C1 — o título fica dentro da caixa do calendário, acima da grade', async ({ page }) => {
      await abrirMarcacao(page, '/schedule/calendar?avulsaSpec=spec-003');

      const posicao = await page.getByTestId('titulo-calendario').evaluate(titulo => {
        const caixa = document.querySelector('[data-testid="calendario"]');
        const grade = [...caixa.querySelectorAll('*')]
          .find(el => /Dom/.test(el.textContent) && el.children.length > 3);
        return {
          dentroDaCaixa: caixa.contains(titulo),
          acimaDaGrade: grade
            ? titulo.getBoundingClientRect().bottom <= grade.getBoundingClientRect().top + 1
            : null,
        };
      });

      expect(posicao.dentroDaCaixa, 'ele pediu dentro da caixa, como o "Horários disponíveis"').toBe(true);
      expect(posicao.acimaDaGrade).toBe(true);
    });

    test('C3 — "Consulta Avulsa" com inicial maiúscula', async ({ page }) => {
      await abrirMarcacao(page, '/schedule/calendar?avulsaSpec=spec-003');
      await expect(page.getByRole('heading', { name: 'Consulta Avulsa', exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Consulta avulsa', exact: true })).toHaveCount(0);
    });

    test('C4 — o texto informativo abaixo não foi mexido', async ({ page }) => {
      await abrirMarcacao(page, '/schedule/calendar?avulsaSpec=spec-003');
      await expect(page.getByText('Você optou por uma consulta avulsa', { exact: false })).toBeVisible();
    });
  });
}
