// Cobre a issue #2: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/2
// Cada teste abaixo referencia o requisito (Rn) do checklist da issue, que por
// sua vez veio do PDF de regras do cliente. As assertions foram escritas a
// partir do texto do requisito — não a partir da implementação.
const { test, expect } = require('@playwright/test');

const BLOCKED_TOOLTIP =
  'Este botão será liberado faltando 15 minutos para o atendimento ' +
  'e você poderá anexar documentos para avaliação médica caso desejar.';

test.describe('Agendamentos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agendamentos?status=');
    await expect(page.getByText('Agendamentos', { exact: false }).first()).toBeVisible();
  });

  test('R1 — Reagendar visível para consulta a mais de 48h', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Renata Alves' });
    await expect(card.getByRole('button', { name: 'Reagendar' })).toBeVisible();
  });

  test('R1/R2 — Reagendar some dentro de 48h e o contador mostra "2 dias", não "amanhã"', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Sofia Marques' });
    await expect(card.getByText('2 dias', { exact: false }).first()).toBeVisible();
    await expect(card.getByText('amanhã', { exact: false })).toHaveCount(0);
    await expect(card.getByRole('button', { name: 'Reagendar' })).toHaveCount(0);
  });

  test('R3 — o espaço do Reagendar é preservado quando o botão some', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Sofia Marques' });
    await expect(card.getByRole('button', { name: 'Reagendar' })).toHaveCount(0);

    // Mobile e desktop renderizam os dois blocos (o CSS esconde um); o
    // primeiro é o mobile, visível neste viewport.
    const placeholder = card.getByTestId('reagendar-placeholder').first();
    await expect(placeholder).toBeVisible();
    // toPass: a medição pode cair no meio de um re-layout (fontes, hidratação).
    await expect(async () => {
      const box = await placeholder.boundingBox();
      expect(Math.round(box.height)).toBe(32);
    }).toPass({ timeout: 5000 });
  });

  test('R4/R5 — botão de entrar bloqueado fora dos 15min, com a explicação do PDF', async ({ page }) => {
    // Estagio de 23 horas: ainda bloqueado.
    const card = page.locator('.card', { hasText: 'Clara Bento' });
    const enterButton = card.getByRole('button', { name: 'Entrar no atendimento' }).first();
    await expect(enterButton).toBeDisabled();

    await card.locator('._blocked-enter >> visible=true').first().click();
    // O mesmo texto vive no tooltip do hover (oculto) e no diálogo do
    // clique — mirar no diálogo, que é o que este teste cobre.
    const dialogo = page.locator('.card', { has: page.getByRole('button', { name: 'Entendi' }) }).last();
    await expect(dialogo).toContainText(BLOCKED_TOOLTIP);
  });

  test('R4/R6 — dentro dos 15min o botão libera e mostra "Você já pode entrar!"', async ({ page }) => {
    // Estagio de 10 minutos: dentro da janela de 15.
    const card = page.locator('.card', { hasText: 'Lucia Ramos' });
    await expect(card.getByTestId('ready-to-enter').first()).toContainText('Você já pode entrar!');
    await expect(card.getByRole('button', { name: 'Entrar no atendimento' }).first()).toBeEnabled();
  });

  test('R7 — clicar no botão liberado abre o modal de anexar documentos', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Lucia Ramos' });
    await card.getByRole('button', { name: 'Entrar no atendimento' }).first().click();
    await expect(page.getByText('Deseja anexar algum arquivo para ser avaliado pelo médico', { exact: false })).toBeVisible();
  });

  test('R11/R14 — cancelamento de Encaminhamento avisa que o encaminhamento é encerrado', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Renata Alves' });
    await card.getByRole('button', { name: 'Cancelar', exact: true }).first().click();

    await expect(page.getByText('o encaminhamento utilizado será encerrado', { exact: false })).toBeVisible();
    await expect(page.getByText('valor pago', { exact: false })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Voltar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancelar consulta' })).toBeVisible();
  });

  test('R13 — cancelamento de Avulsa dentro de 48h avisa que o valor não será reembolsado', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Camila Ferraz' });
    await card.getByRole('button', { name: 'Cancelar', exact: true }).first().click();

    await expect(page.getByText('será considerada utilizada', { exact: false })).toBeVisible();
    await expect(page.getByText('não será reembolsado', { exact: false })).toBeVisible();
  });

  test('R16 — cancelar Encaminhamento remove o card da lista (vai para o Histórico)', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Renata Alves' });
    await card.getByRole('button', { name: 'Cancelar', exact: true }).first().click();
    await page.getByRole('button', { name: 'Cancelar consulta' }).click();

    await expect(page.getByText('disponível na tela Histórico', { exact: false })).toBeVisible();
  });

  test('R20 — consulta futura mostra Entrar (bloqueado), Reagendar e Cancelar juntos', async ({ page }) => {
    // PDF pág. 2 (card "faltando 12 dias") e pág. 4 ("faltando 47:59h"):
    // os botões coexistem, não são exclusivos do dia da consulta.
    const card = page.locator('.card', { hasText: 'Gustavo Pinto' });
    await expect(card.getByRole('button', { name: 'Entrar no atendimento' }).first()).toBeDisabled();
    await expect(card.getByRole('button', { name: 'Reagendar' }).first()).toBeVisible();
    await expect(card.getByRole('button', { name: 'Cancelar', exact: true }).first()).toBeVisible();
  });

  test('R12 — cancelar Avulsa com mais de 48h promete novo agendamento sem custo', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Gustavo Pinto' });
    await card.getByRole('button', { name: 'Cancelar', exact: true }).first().click();

    await expect(page.getByText('mais de 48 horas de antecedência', { exact: false })).toBeVisible();
    await expect(page.getByText('sem custo adicional', { exact: false })).toBeVisible();
    await expect(page.getByText('não será reembolsado', { exact: false })).toHaveCount(0);
  });

  test('R15 — cancelar Avulsa dentro do prazo devolve o card ao estado Pendente', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Gustavo Pinto' });
    await card.getByRole('button', { name: 'Cancelar', exact: true }).first().click();
    await page.getByRole('button', { name: 'Cancelar consulta' }).click();

    await expect(page.getByText('sem custo adicional', { exact: false }).first()).toBeVisible();
    // O card permanece na lista, agora como "Consulta pendente".
    await expect(page.locator('.card', { hasText: 'Gustavo Pinto' }).filter({ hasText: 'Consulta pendente' }).first()).toBeVisible();
  });

  test('R17 — botões seguem os tamanhos definidos no PDF', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Lucia Ramos' });
    const enterButton = card.getByRole('button', { name: 'Entrar no atendimento' }).first();
    await expect(async () => {
      const box = await enterButton.boundingBox();
      expect(Math.round(box.height)).toBe(32);
    }).toPass({ timeout: 5000 });
  });
});

// A posição destes banners mudou na #5: eles saíram do primeiro passo do
// "Novo Agendamento" e passaram para a tela de marcação, acima da data e
// horário. As rotas abaixo entram direto nesse passo; o posicionamento em si
// é coberto por issue-5-posicao-texto-orientativo.spec.js.
test.describe('Telas de agendamento — banners de regra (R8/R9/R10)', () => {
  test('R9 — banner "Lembre-se!" na tela de consulta avulsa', async ({ page }) => {
    await page.goto('/schedule/calendar?avulsaSpec=spec-003');
    const alert = page.getByTestId('booking-rules-alert-avulsa');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Lembre-se!');
    await expect(alert).toContainText('sem perder o valor pago');
    await expect(alert).toContainText('Recomendação:');
  });

  test('R8 — banner "Importante!" na tela de agendamento por encaminhamento', async ({ page }) => {
    await page.goto('/schedule/calendar?referral=ref-003');
    const alert = page.getByTestId('booking-rules-alert-referral');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Importante!');
    await expect(alert).toContainText('sem perder o encaminhamento');
    await expect(alert).toContainText('Plantão 24h');
  });
});
