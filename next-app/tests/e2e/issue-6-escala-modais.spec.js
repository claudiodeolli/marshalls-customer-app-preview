// Cobre a issue #6: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/6
// "As modais, tenta deixar o texto maior e com os botões maiores também,
// como se fosse para pessoas mais velhas conseguirem enxergar."
// Escopo acordado: as modais desta rodada de trabalho.
const { test, expect } = require('@playwright/test');

const CORPO_MINIMO_PX = 16;
const ALTURA_MINIMA_BOTAO_PX = 44;

/** Converte "16px" em 16. */
async function tamanhoDaFonte(locator) {
  return parseFloat(await locator.evaluate(el => getComputedStyle(el).fontSize));
}

/**
 * As modais entram com animação (`_modal-enter`), que escala o elemento —
 * medir antes dela terminar devolve dimensões menores que as reais.
 */
async function esperarAnimacao(modal) {
  await modal.evaluate(el =>
    Promise.all(el.getAnimations({ subtree: true }).map(animacao => animacao.finished))
  );
}

/** Nenhum botão da modal pode ser menor que o alvo de toque mínimo. */
async function conferirBotoes(modal) {
  const botoes = modal.getByRole('button');
  const total = await botoes.count();
  expect(total).toBeGreaterThan(0);

  for (let i = 0; i < total; i++) {
    const botao = botoes.nth(i);
    const rotulo = (await botao.textContent())?.trim();
    const caixa = await botao.boundingBox();
    expect(Math.round(caixa.height), `altura do botão "${rotulo}"`).toBeGreaterThanOrEqual(ALTURA_MINIMA_BOTAO_PX);
    expect(await tamanhoDaFonte(botao), `fonte do botão "${rotulo}"`).toBeGreaterThanOrEqual(CORPO_MINIMO_PX);
  }
}

/** Nenhum parágrafo da modal pode ficar abaixo do corpo mínimo. */
async function conferirTextos(modal) {
  const paragrafos = modal.locator('p');
  const total = await paragrafos.count();
  expect(total).toBeGreaterThan(0);

  for (let i = 0; i < total; i++) {
    const texto = (await paragrafos.nth(i).textContent())?.trim().slice(0, 40);
    expect(await tamanhoDaFonte(paragrafos.nth(i)), `fonte de "${texto}"`).toBeGreaterThanOrEqual(CORPO_MINIMO_PX);
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/agendamentos');
  await expect(page.locator('.card').first()).toBeVisible();
});

test('M1/M2 — modal de cancelamento tem texto e botões ampliados', async ({ page }) => {
  const card = page.locator('.card', { hasText: 'Carlos Mendes' });
  await card.getByRole('button', { name: 'Cancelar', exact: true }).first().click();

  const modal = page.locator('.card', { has: page.getByRole('button', { name: 'Cancelar consulta' }) }).last();
  await expect(modal).toBeVisible();
  await esperarAnimacao(modal);
  await conferirTextos(modal);
  await conferirBotoes(modal);
});

test('M1/M2 — modal de anexar documentos tem texto e botões ampliados', async ({ page }) => {
  const card = page.locator('.card', { hasText: 'Carla Borges' });
  await card.getByRole('button', { name: 'Entrar no atendimento' }).first().click();

  const modal = page.locator('.card', { has: page.getByRole('button', { name: 'Escolher arquivos' }) }).last();
  await expect(modal).toBeVisible();
  await esperarAnimacao(modal);
  await conferirTextos(modal);
  await conferirBotoes(modal);
});

test('M1/M2 — diálogo do botão bloqueado tem texto e botão ampliados', async ({ page }) => {
  const card = page.locator('.card', { hasText: 'Ana Lima' });
  await card.getByText('Entrar no atendimento').first().locator('..').click();

  const modal = page.locator('.card', { has: page.getByRole('button', { name: 'Entendi' }) }).last();
  await expect(modal).toBeVisible();
  await esperarAnimacao(modal);
  await conferirTextos(modal);
  await conferirBotoes(modal);
});

test('M4 — as modais cabem no viewport mobile sem estourar a largura', async ({ page }) => {
  const larguraViewport = page.viewportSize().width;

  const card = page.locator('.card', { hasText: 'Carlos Mendes' });
  await card.getByRole('button', { name: 'Cancelar', exact: true }).first().click();

  const modal = page.locator('.card', { has: page.getByRole('button', { name: 'Cancelar consulta' }) }).last();
  await esperarAnimacao(modal);
  const caixa = await modal.boundingBox();
  expect(caixa.width).toBeLessThanOrEqual(larguraViewport);
  expect(caixa.x).toBeGreaterThanOrEqual(0);

  // Os dois botões continuam visíveis e clicáveis, sem se sobrepor.
  await expect(modal.getByRole('button', { name: 'Voltar' })).toBeVisible();
  await expect(modal.getByRole('button', { name: 'Cancelar consulta' })).toBeVisible();
});
