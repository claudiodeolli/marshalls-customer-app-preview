// Cobre a issue #5: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/5
// O texto orientativo tinha sido posto no primeiro passo do "Novo
// Agendamento"; o cliente pediu que o fluxo voltasse ao que era e que o texto
// aparecesse só na marcação.
//
// Na #24 ele mudou o formato: o aviso deixou de ser um banner no corpo da
// página e virou modal. O que a #5 garante continua valendo — ele não aparece
// no primeiro passo, e cada origem mostra só o seu —, mas "acima do
// calendário" deixou de fazer sentido para um overlay. O que sobra na tela é
// o aviso roxo, e é ele que agora precisa ficar antes do calendário.
const { test, expect } = require('@playwright/test');

const ROTA_ENCAMINHAMENTO = '/schedule/calendar?referral=ref-003';
const ROTA_AVULSA = '/schedule/calendar?avulsaSpec=spec-003';

/** Espera o calendário da fase 2 aparecer. */
async function esperarCalendario(page) {
  await expect(page.getByTestId('calendario').first()).toBeVisible({ timeout: 15000 });
}

/** Fecha a modal de regras, para chegar à tela por baixo dela. */
async function fecharRegras(page) {
  const entendi = page.getByRole('button', { name: 'Entendi' });
  if (await entendi.count()) await entendi.first().click();
  await expect(entendi).toHaveCount(0);
}

test('N1 — o primeiro passo do "Novo Agendamento" não exibe texto orientativo', async ({ page }) => {
  await page.goto('/schedule/calendar');
  await expect(page.getByPlaceholder('Buscar especialidade')).toBeVisible();

  await expect(page.getByTestId('booking-rules-alert-avulsa')).toHaveCount(0);
  await expect(page.getByTestId('booking-rules-alert-referral')).toHaveCount(0);
});

test('N2 — o aviso do encaminhamento aparece na marcação', async ({ page }) => {
  await page.goto(ROTA_ENCAMINHAMENTO);
  await esperarCalendario(page);

  const alerta = page.getByTestId('booking-rules-alert-referral');
  await expect(alerta).toBeVisible();
  await expect(alerta).toContainText('Importante!');
});

test('N3 — o aviso da avulsa aparece na marcação', async ({ page }) => {
  await page.goto(ROTA_AVULSA);
  await esperarCalendario(page);

  const alerta = page.getByTestId('booking-rules-alert-avulsa');
  await expect(alerta).toBeVisible();
  await expect(alerta).toContainText('Lembre-se!');
});

test('N2/N3 — o aviso roxo que fica na tela vem antes do calendário', async ({ page }) => {
  // É o que sobra no corpo da página depois da #24, e ele pediu nessa ordem.
  await page.goto(ROTA_AVULSA);
  await esperarCalendario(page);
  await fecharRegras(page);

  const acima = await page.evaluate(() => {
    const roxo = document.querySelector('[data-testid="aviso-origem"]');
    const calendario = document.querySelector('[data-testid="calendario"]');
    if (!roxo || !calendario) return null;
    return roxo.getBoundingClientRect().bottom <= calendario.getBoundingClientRect().top + 1;
  });

  expect(acima, 'o aviso roxo precisa ficar acima do calendário').toBe(true);
});

test('N4 — cada fluxo mostra só o aviso da sua origem', async ({ page }) => {
  await page.goto(ROTA_ENCAMINHAMENTO);
  await esperarCalendario(page);
  await expect(page.getByTestId('booking-rules-alert-avulsa')).toHaveCount(0);

  await page.goto(ROTA_AVULSA);
  await esperarCalendario(page);
  await expect(page.getByTestId('booking-rules-alert-referral')).toHaveCount(0);
});

test('N4 — a avulsa não é anunciada como consulta gratuita', async ({ page }) => {
  await page.goto(ROTA_AVULSA);
  await esperarCalendario(page);
  await fecharRegras(page);
  // O texto informativo da tela é o de consulta paga, não o do encaminhamento
  // — os dois se contradiziam antes desta correção.
  await expect(page.getByText('Esta consulta é gratuita', { exact: false })).toHaveCount(0);
  await expect(page.getByText('Você optou por uma consulta avulsa', { exact: false })).toBeVisible();
});
