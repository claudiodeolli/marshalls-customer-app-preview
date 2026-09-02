// Cobre as issues #18 e #23:
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/18
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/23
// #18 — a tela de Encaminhamentos abria já filtrada e sem agrupar por status
// #23 — o "Voltar" saía do fluxo inteiro em vez de recuar uma etapa
const { test, expect } = require('@playwright/test');

/** Status de cada card visível da tela de Encaminhamentos, na ordem da tela. */
async function lerStatus(page) {
  return page.locator('.card >> visible=true').evaluateAll(cards => cards
    .map(card => {
      const texto = card.innerText;
      if (/Pendente/.test(texto)) return 'PENDING';
      if (/Agendado/.test(texto)) return 'SCHEDULED';
      return null;
    })
    .filter(Boolean));
}

test.describe('Encaminhamentos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/encaminhamentos');
    await expect(page.locator('.card >> visible=true').first()).toBeVisible({ timeout: 20000 });
  });

  test('B1 — a tela abre no filtro "Todos"', async ({ page }) => {
    // Ele marcou com ❌ o fato de ela abrir já em "Pendentes".
    await expect(page.getByRole('button', { name: 'Todos' })).toBeVisible();

    const status = await lerStatus(page);
    expect(new Set(status).size, 'abrindo em Todos, os dois status aparecem').toBeGreaterThan(1);
  });

  test('B4/B6 — no "Todos", o bloco de Pendentes vem inteiro antes do de Agendados', async ({ page }) => {
    const status = await lerStatus(page);

    expect(status.length).toBeGreaterThan(1);
    expect(status.lastIndexOf('PENDING')).toBeLessThan(status.indexOf('SCHEDULED'));
    // Ordenado é o mesmo conjunto, só reagrupado: nada some no caminho.
    expect([...status].sort()).toEqual(status.filter(s => s === 'PENDING').concat(status.filter(s => s === 'SCHEDULED')).sort());
  });

  test('B2/B3 — cada filtro mostra só o seu status', async ({ page }) => {
    for (const [rotulo, esperado] of [['Pendentes', 'PENDING'], ['Agendados', 'SCHEDULED']]) {
      await page.getByRole('button', { name: 'Todos' }).click();
      await page.getByText(rotulo, { exact: true }).last().click();
      await expect(page.locator('.card >> visible=true').first()).toBeVisible();

      const status = await lerStatus(page);
      expect(status.length, `o filtro ${rotulo} precisa mostrar algo`).toBeGreaterThan(0);
      expect(new Set(status), `o filtro ${rotulo} trouxe status alheio`).toEqual(new Set([esperado]));

      await page.reload();
      await expect(page.locator('.card >> visible=true').first()).toBeVisible({ timeout: 20000 });
    }
  });
});

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
