const { test, expect } = require('@playwright/test');

async function iniciarCompraAvulsa(page) {
  await page.goto('/schedule/calendar');
  await page.getByText('Ortopedia', { exact: true }).first().click();
  const encaminhamento = page.getByRole('dialog');
  await encaminhamento.getByRole('button', { name: 'Adquirir consulta avulsa' }).click();
  await page.getByText('Ortopedia', { exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Escolher agora' })).toBeVisible();
}

async function pagarComVisa(page, booked = false) {
  await page.getByText('Visa •••• 4242', { exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(page.getByText(booked ? 'Pagamento confirmado!' : 'Recebemos seu pagamento!')).toBeVisible();
}

test('O aviso da Consulta Avulsa quebra apenas no mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await iniciarCompraAvulsa(page);
  await page.getByRole('button', { name: 'Escolher agora' }).click();
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Entendi' }).click();

  const aviso = page.getByTestId('aviso-linha').nth(1);
  const quebra = aviso.locator('br._avulsa-aviso-break-mobile');
  await expect(aviso).toHaveText('Selecione a data e o horário desejados. O pagamento será realizado na próxima etapa.');
  await expect(quebra).toHaveCSS('display', 'block');
  await expect.poll(() => aviso.evaluate(element => element.innerText)).toContain('\n');

  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(quebra).toHaveCSS('display', 'none');
});

test('Escolher agora exige as regras e confirma a consulta com data, horário e orientações online', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 480 });
  await iniciarCompraAvulsa(page);
  await expect(page.getByRole('heading', { name: 'Agendar Consulta' })).toBeVisible();
  await expect(page.locator('.breadcrumb')).toContainText('Consultas Avulsas');
  await expect(page.locator('.breadcrumb')).toContainText('Adquirir');
  await expect(page.locator('.breadcrumb svg')).toHaveAttribute('viewBox', '0 0 24 24');

  await page.getByRole('button', { name: 'Escolher agora' }).click();
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  const regras = page.getByTestId('booking-rules-alert-avulsa');
  await expect(regras).toBeVisible();
  await expect(regras).toContainText('Importante!');
  await expect(regras).toContainText('até 48 horas antes do horário agendado');
  await expect(regras).toContainText('a consulta será considerada utilizada');
  await expect(regras).toContainText('Recomendação');
  await expect(page.locator('.breadcrumb')).toContainText('Consulta Avulsa');
  await expect(page.locator('.breadcrumb')).toContainText('Agendar');
  await page.getByRole('button', { name: 'Entendi' }).click();

  await page.getByTestId('dia-disponivel').first().click();
  await expect(page.getByTestId('horarios')).toBeVisible({ timeout: 15000 });
  const dateAndTime = await page.getByTestId('horarios').locator('h6').innerText();
  const selectedDate = dateAndTime.replace('Horários disponíveis — ', '');
  const slot = page.getByTestId('horarios').locator('button').first();
  const selectedTime = await slot.innerText();
  await slot.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Ir para o pagamento' }).click();

  await expect(page.getByRole('heading', { name: 'Escolha a forma de pagamento' })).toBeVisible();
  await expect(page.locator('.breadcrumb')).toContainText('Consulta Avulsa');
  await expect(page.locator('.breadcrumb')).toContainText('Pagamento');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await pagarComVisa(page, true);
  await expect(page.getByText(`${selectedDate} às ${selectedTime}`, { exact: true })).toBeVisible();
  const orientacoes = page.getByTestId('orientacoes-consulta-online');
  await expect(orientacoes).toContainText('Orientações para sua consulta online');
  await expect(orientacoes.locator('li')).toHaveText([
    'Acesse a sala da consulta com 5 minutos de antecedência.',
    'Verifique se sua conexão com a internet, câmera e microfone estão funcionando corretamente.',
    'Escolha um ambiente silencioso, privado e bem iluminado.',
    'Tenha em mãos um documento de identificação, seus exames ou laudos médicos, se houver, e a relação dos medicamentos em uso.',
  ]);
  await expect(orientacoes).toContainText('Acesse a sala da consulta com 5 minutos de antecedência.');
  await expect(orientacoes).toContainText('Verifique se sua conexão com a internet, câmera e microfone estão funcionando corretamente.');
  await expect(orientacoes).toContainText('Escolha um ambiente silencioso, privado e bem iluminado.');
  await expect(orientacoes).toContainText('Tenha em mãos um documento de identificação, seus exames ou laudos médicos, se houver, e a relação dos medicamentos em uso.');
  const appointmentButton = page.getByRole('button', { name: 'Ver meu agendamento' });
  await expect(appointmentButton).toBeVisible();
  expect(await orientacoes.evaluate((element, button) => (
    element.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING
  ) !== 0, await appointmentButton.elementHandle())).toBe(true);
  await expect(page.locator('.breadcrumb')).toContainText('Confirmação');
});

test('Voltar do pagamento restaura o breadcrumb da etapa de agendamento', async ({ page }) => {
  await iniciarCompraAvulsa(page);
  await page.getByRole('button', { name: 'Escolher agora' }).click();
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Entendi' }).click();
  await page.getByTestId('dia-disponivel').first().click();
  await expect(page.getByTestId('horarios')).toBeVisible({ timeout: 15000 });
  await page.getByTestId('horarios').locator('button').first().click();
  await page.getByRole('button', { name: 'Ir para o pagamento' }).click();
  await expect(page.locator('.breadcrumb')).toContainText('Pagamento');

  await page.goBack();

  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.breadcrumb')).toContainText('Agendar');
  await expect(page.locator('.breadcrumb')).not.toContainText('Pagamento');
});

test('Os breadcrumbs da Avulsa retornam à etapa anterior sem deixar o fluxo inconsistente', async ({ page }) => {
  await iniciarCompraAvulsa(page);
  await page.getByRole('button', { name: 'Escolher agora' }).click();
  await page.getByRole('button', { name: 'Entendi' }).click();
  await page.getByTestId('dia-disponivel').first().click();
  await expect(page.getByTestId('horarios')).toBeVisible({ timeout: 15000 });
  await page.getByTestId('horarios').locator('button').first().click();
  await page.getByRole('button', { name: 'Ir para o pagamento' }).click();

  const consultaAvulsa = page.locator('.breadcrumb').getByRole('link', { name: 'Consulta Avulsa' });
  await expect(consultaAvulsa).toBeVisible();
  await consultaAvulsa.click();
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.breadcrumb')).toContainText('Agendar');
  await expect(page.locator('.breadcrumb')).not.toContainText('Pagamento');

  await page.getByRole('button', { name: 'Entendi' }).click();
  await page.locator('.breadcrumb').getByRole('link', { name: 'Consulta Avulsa' }).click();
  await page.getByText('Ortopedia', { exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Escolher agora' })).toBeVisible();
  await expect(page.locator('.breadcrumb')).toContainText('Adquirir');
});

test('Escolher depois confirma sem orientações e cria o card pendente com ações', async ({ page }) => {
  await iniciarCompraAvulsa(page);
  await page.getByRole('button', { name: 'Escolher depois, continuar para o pagamento' }).click();

  const regras = page.getByTestId('booking-rules-alert-avulsa');
  await expect(regras).toBeVisible();
  await expect(regras).toContainText('Importante!');
  await expect(page.locator('._payment-select-step')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Escolha uma forma de pagamento' })).toHaveCount(0);
  await expect(page.locator('.breadcrumb')).not.toContainText('Pagamento');

  await page.keyboard.press('Escape');
  await expect(regras).toBeVisible();
  await expect(page.locator('._payment-select-step')).toHaveCount(0);

  await regras.getByRole('button', { name: 'Entendi' }).click();
  await expect(page.getByRole('heading', { name: 'Escolha uma forma de pagamento' })).toBeVisible();
  await expect(page.locator('._payment-select-step')).toBeVisible();
  await expect(page.locator('.breadcrumb')).toContainText('Pagamento');
  await pagarComVisa(page);
  await expect(page.getByTestId('orientacoes-consulta-online')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Agendar Agora' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Agendar depois' })).toBeVisible();

  await page.getByRole('button', { name: 'Agendar depois' }).click();
  await expect(page).toHaveURL(/\/agendamentos$/);
  await expect(page.getByText('Consulta avulsa — R$ 95,00')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Agendar agora' })).toBeVisible();
});

test('A confirmação real do agendamento pago mostra o breadcrumb de confirmação', async ({ page }) => {
  await iniciarCompraAvulsa(page);
  await page.getByRole('button', { name: 'Escolher depois, continuar para o pagamento' }).click();
  await page.getByRole('button', { name: 'Entendi' }).click();
  await pagarComVisa(page);

  await page.getByRole('button', { name: 'Agendar Agora' }).click();
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Entendi' }).click();
  await page.getByTestId('dia-disponivel').first().click();
  await expect(page.getByTestId('horarios')).toBeVisible({ timeout: 15000 });
  await page.getByTestId('horarios').locator('button').first().click();
  await page.getByRole('button', { name: 'AGENDAR', exact: true }).click();

  await expect(page.getByText('Agendado com sucesso!')).toBeVisible();
  await expect(page.locator('.breadcrumb')).toContainText('Confirmação');
  await expect(page.locator('.breadcrumb')).not.toContainText('Agendar');

  await page.locator('.breadcrumb').getByRole('link', { name: 'Consulta Avulsa' }).click();
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.breadcrumb')).toContainText('Agendar');
});

test('A confirmação do pagamento retorna ao pagamento pelo breadcrumb Consulta Avulsa', async ({ page }) => {
  await iniciarCompraAvulsa(page);
  await page.getByRole('button', { name: 'Escolher depois, continuar para o pagamento' }).click();
  await page.getByRole('button', { name: 'Entendi' }).click();
  await pagarComVisa(page);
  await expect(page.locator('.breadcrumb')).toContainText('Confirmação');

  await page.locator('.breadcrumb').getByRole('link', { name: 'Consulta Avulsa' }).click();
  await expect(page.getByRole('heading', { name: 'Escolha uma forma de pagamento' })).toBeVisible();
  await expect(page.locator('.breadcrumb')).toContainText('Pagamento');
});

test('Agendar Agora após pagar retorna ao calendário e abre as regras novamente', async ({ page }) => {
  await iniciarCompraAvulsa(page);
  await page.getByRole('button', { name: 'Escolher depois, continuar para o pagamento' }).click();
  await page.getByRole('button', { name: 'Entendi' }).click();
  await pagarComVisa(page);

  await page.getByRole('button', { name: 'Agendar Agora' }).click();
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  const regras = page.getByTestId('booking-rules-alert-avulsa');
  await expect(regras).toBeVisible();
  await expect(regras).toContainText('Importante!');
  await expect(page.locator('.breadcrumb')).toContainText('Agendar');
});

test('No mobile, Agendar Depois mantém as ações do card de consulta pendente', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await iniciarCompraAvulsa(page);
  await page.getByRole('button', { name: 'Escolher depois, continuar para o pagamento' }).click();
  await page.getByRole('button', { name: 'Entendi' }).click();
  await pagarComVisa(page);
  await page.getByRole('button', { name: 'Agendar depois' }).click();

  await expect(page).toHaveURL(/\/agendamentos$/);
  await expect(page.getByText('Consulta avulsa — R$ 95,00')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Agendar agora' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dispensar' })).toBeVisible();
});

test('A origem Encaminhamento mantém o ícone de mala no breadcrumb', async ({ page }) => {
  await page.goto('/schedule/calendar?referral=ref-003');
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.breadcrumb')).toContainText('Encaminhamentos');
  await expect(page.locator('.breadcrumb')).toContainText('Agendar');
  await expect(page.locator('.breadcrumb svg')).toHaveAttribute('viewBox', '0 0 21 21');
});

test('A confirmação do Encaminhamento mostra Confirmação em vez de Agendar', async ({ page }) => {
  await page.goto('/schedule/calendar?referral=ref-003');
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Entendi' }).click();
  await page.getByTestId('dia-disponivel').first().click();
  await expect(page.getByTestId('horarios')).toBeVisible({ timeout: 15000 });
  await page.getByTestId('horarios').locator('button').first().click();
  await page.getByRole('button', { name: 'AGENDAR', exact: true }).click();

  await expect(page.getByText('Agendado com sucesso!')).toBeVisible();
  await expect(page.locator('.breadcrumb')).toContainText('Confirmação');
  await expect(page.locator('.breadcrumb')).not.toContainText('Agendar');
  const encaminhamentos = page.locator('.breadcrumb').getByRole('link', { name: 'Encaminhamentos' });
  await expect(encaminhamentos).toHaveAttribute('href', '/encaminhamentos');
  await expect(page.locator('.breadcrumb svg')).toHaveAttribute('viewBox', '0 0 21 21');
});
