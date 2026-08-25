// Cobre a issue #2: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/2
// Reagendar só até 48h antes da consulta; modal de cancelamento com texto
// específico por origem (Encaminhamento vs Avulsa).
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/agendamentos?status=');
  await expect(page.getByText('Agendamentos', { exact: false }).first()).toBeVisible();
});

test('Reagendar aparece para consulta a mais de 48h (3 dias)', async ({ page }) => {
  const card = page.locator('.card', { hasText: 'Roberto Silva' }).filter({ hasText: '3 dias' });
  await expect(card.getByRole('button', { name: 'Reagendar' })).toBeVisible();
});

test('Reagendar some para consulta a menos de 48h (~26h) e mostra "2 dias", não "amanhã"', async ({ page }) => {
  const card = page.locator('.card', { hasText: 'Ana Lima' });
  await expect(card.getByText('2 dias', { exact: false }).first()).toBeVisible();
  await expect(card.getByText('amanhã', { exact: false })).toHaveCount(0);
  await expect(card.getByRole('button', { name: 'Reagendar' })).toHaveCount(0);
});

test('Cancelar consulta de Encaminhamento avisa que o encaminhamento é encerrado', async ({ page }) => {
  const card = page.locator('.card', { hasText: 'Roberto Silva' }).filter({ hasText: 'Ortopedia' }).filter({ hasText: 'Encaminhamento' });
  await card.getByRole('button', { name: 'Cancelar' }).first().click();
  await expect(page.getByText('o encaminhamento utilizado será encerrado', { exact: false })).toBeVisible();
  await expect(page.getByText('valor pago', { exact: false })).toHaveCount(0);
});

test('Cancelar consulta Avulsa dentro de 48h avisa que o valor pago não será reembolsado', async ({ page }) => {
  // apt-dyn-30min é Avulsa e tem cancel:true — bem dentro da janela de 48h.
  const card = page.locator('.card', { hasText: 'Carlos Mendes' });
  await card.getByRole('button', { name: 'Cancelar' }).first().click();
  await expect(page.getByText('será considerada utilizada', { exact: false })).toBeVisible();
  await expect(page.getByText('não será reembolsado', { exact: false })).toBeVisible();
});
