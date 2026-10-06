const { test, expect } = require('@playwright/test');

test('Novo Agendamento mostra especialidades e só abre encaminhamentos após a seleção', async ({ page }) => {
  await page.goto('/agendamentos');
  await page.getByRole('button', { name: 'Novo Agendamento' }).first().click();

  await expect(page.getByPlaceholder('Buscar especialidade')).toBeVisible();
  await expect(page.getByText('Nossas especialidades', { exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByText('Neurologia', { exact: true }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toContainText('Selecionar Encaminhamento');
  await expect(modal).toContainText('Neurologia');

  await modal.getByText('Neurologia', { exact: true }).click();
  await modal.getByRole('button', { name: 'Confirmar' }).click();

  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('aviso-linha').first()).toContainText('gratuita');
  await expect(page.getByRole('button', { name: 'AGENDAR', exact: true })).toBeVisible();
  await expect(page.getByTestId('booking-rules-alert-referral')).toBeVisible();
  await expect(page.getByTestId('booking-rules-alert-referral')).toContainText(
    'Se cancelar fora do prazo ou não comparecer ao atendimento, a consulta será considerada utilizada.'
  );
  await expect(page.getByPlaceholder('Buscar especialidade')).toHaveCount(0);
  await expect(page.getByText('Neurologia', { exact: true })).toBeVisible();
});

test('A entrada direta no calendário não abre a seleção de encaminhamento', async ({ page }) => {
  await page.goto('/schedule/calendar');

  await expect(page.getByPlaceholder('Buscar especialidade')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('Sem encaminhamento para a especialidade, a modal oferece consulta avulsa', async ({ page }) => {
  await page.goto('/schedule/calendar');
  await page.getByText('Ortopedia', { exact: true }).first().click();

  const modal = page.getByRole('dialog');
  await expect(modal).toContainText('Você não possui encaminhamentos disponíveis.');
  await modal.getByRole('button', { name: 'Adquirir consulta avulsa' }).click();

  await expect(page.getByText('Nossas especialidades', { exact: true })).toBeVisible();
  await expect(page.getByText('R$ 95,00', { exact: true }).first()).toBeVisible();
});
