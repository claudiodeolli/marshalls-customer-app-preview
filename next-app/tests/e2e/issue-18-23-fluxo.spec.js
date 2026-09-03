// Cobre as issues #18 e #23:
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/18
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/23
// #18 — a tela de Encaminhamentos abria já filtrada e sem agrupar por status
// #23 — o "Voltar" saía do fluxo inteiro em vez de recuar uma etapa
const { test, expect } = require('@playwright/test');

// A parte de Encaminhamentos desta issue foi substituída pela #30: ele voltou
// a pedir o filtro "Pendentes" pré-selecionado e passou a querer 1 card por
// tag, o oposto do que a #18 pediu. O que continua valendo — a ordem do
// Pendente antes do Agendado — está coberto lá, em
// issue-29-30-31-32.spec.js. Aqui fica só o "Voltar", da #23.

test.describe('Voltar passo a passo', () => {
  // Entrar pelo primeiro passo é essencial: chegando por link direto ao
  // calendário não existe etapa anterior dentro do fluxo, e sair da tela é o
  // comportamento certo.
  async function avancarUmaEtapa(page) {
    await page.goto('/schedule/calendar');
    await expect(page.getByPlaceholder('Buscar especialidade')).toBeVisible({ timeout: 20000 });

    await page.getByText('Psicologia', { exact: true }).first().click();
    await page.getByRole('button', { name: 'Adquirir consulta avulsa' }).click();
    // O que distingue a etapa de preços é a lista passar a exibir valores; o
    // título "Nossas especialidades" continua nas duas.
    await expect(page.getByText('R$ 95,00').first()).toBeVisible();
  }

  test('V2 — voltar recua uma etapa, sem sair da tela', async ({ page }) => {
    await avancarUmaEtapa(page);

    await page.getByRole('button', { name: '← Voltar' }).first().click();

    await expect(page).toHaveURL(/\/schedule\/calendar/);
    await expect(page.getByText('R$ 95,00')).toHaveCount(0);
    await expect(page.getByPlaceholder('Buscar especialidade')).toBeVisible();
  });

  test('V4 — o gesto de voltar do aparelho faz o mesmo que o botão', async ({ page }) => {
    await avancarUmaEtapa(page);

    await page.goBack();

    await expect(page).toHaveURL(/\/schedule\/calendar/);
    await expect(page.getByText('R$ 95,00')).toHaveCount(0);
    await expect(page.getByPlaceholder('Buscar especialidade')).toBeVisible();
  });

  test('V2 — na primeira etapa, voltar sai da tela', async ({ page }) => {
    await page.goto('/agendamentos');
    await expect(page.locator('.card >> visible=true').first()).toBeVisible({ timeout: 20000 });
    await page.goto('/schedule/calendar');
    await expect(page.getByPlaceholder('Buscar especialidade')).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: '← Voltar' }).first().click();

    await expect(page).toHaveURL(/\/agendamentos/);
  });

  test('V2 — e a etapa recuada pode ser refeita', async ({ page }) => {
    // Empilhar a etapa não pode custar um clique a mais para sair dela
    // depois: o retrato guardado é do estado anterior, e só.
    await avancarUmaEtapa(page);
    await page.getByRole('button', { name: '← Voltar' }).first().click();
    await expect(page.getByText('R$ 95,00')).toHaveCount(0);

    await page.getByText('Psicologia', { exact: true }).first().click();
    await page.getByRole('button', { name: 'Adquirir consulta avulsa' }).click();
    await expect(page.getByText('R$ 95,00').first()).toBeVisible();
  });
});
