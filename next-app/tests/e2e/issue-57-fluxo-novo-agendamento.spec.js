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

  await page.mouse.click(1, 1);
  await expect(modal).toBeVisible();
  await modal.getByText('Neurologia', { exact: true }).click();
  const selectedReferral = modal.getByRole('button', { name: /Neurologia/ });
  await expect(selectedReferral).toHaveClass(/snakeCard/);
  await expect(selectedReferral.locator('[class*="snake_"]')).toHaveCount(4);
  await expect(selectedReferral.locator('[class*="top_"]')).toHaveCSS('height', '2.5px');
  await expect(selectedReferral.locator('[class*="right_"]')).toHaveCSS('width', '3px');
  await expect(selectedReferral.locator('[class*="bottom_"]')).toHaveCSS('height', '2.5px');
  await expect(selectedReferral.locator('[class*="left_"]')).toHaveCSS('width', '3px');
  const referralList = modal.locator('div[style*="max-height: 300px"]');
  await expect(referralList).toHaveCSS('padding-top', '18px');
  await expect(referralList).toHaveCSS('padding-bottom', '18px');
  expect(await selectedReferral.evaluate(element => ({
    overflow: getComputedStyle(element).overflow,
    duration: getComputedStyle(element.querySelector('[class*="snake_"]')).animationDuration,
    pointerEvents: getComputedStyle(element.querySelector('[class*="snake_"]')).pointerEvents,
  }))).toEqual({ overflow: 'hidden', duration: '5s', pointerEvents: 'none' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(selectedReferral.locator('[class*="snake_"]').first()).toHaveCSS('display', 'none');
  await expect(selectedReferral.locator('[class*="snake_"]').first()).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
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
  const textOrder = await modal.evaluate(dialog => {
    const paragraphs = [...dialog.querySelectorAll('p')];
    const message = paragraphs.find(element => element.textContent.trim() === 'Você não possui encaminhamentos disponíveis.');
    const guidance = paragraphs.find(element => element.textContent.trim() === 'Solicite um encaminhamento médico para agendar esta especialidade, ou:');
    return Boolean(
      paragraphs[0].textContent.includes('A especialidade do encaminhamento será encontrada automaticamente:') &&
      (paragraphs[0].compareDocumentPosition(message) & Node.DOCUMENT_POSITION_FOLLOWING) &&
      (message.compareDocumentPosition(guidance) & Node.DOCUMENT_POSITION_FOLLOWING)
    );
  });
  expect(textOrder).toBe(true);
  await page.mouse.click(1, 1);
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: 'Adquirir consulta avulsa' }).click();

  await expect(page.getByText('Nossas especialidades', { exact: true })).toBeVisible();
  await expect(page.getByText('R$ 95,00', { exact: true }).first()).toBeVisible();
});
