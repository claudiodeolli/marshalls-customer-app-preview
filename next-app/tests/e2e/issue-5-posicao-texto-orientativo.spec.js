// Cobre a issue #5: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/5
// O texto orientativo tinha sido posto no primeiro passo do "Novo
// Agendamento"; o cliente pediu que o fluxo voltasse ao que era e que o
// texto aparecesse só na marcação, acima da data e horário.
const { test, expect } = require('@playwright/test');

const ROTA_ENCAMINHAMENTO = '/schedule/calendar?referral=ref-003';
const ROTA_AVULSA = '/schedule/calendar?avulsaSpec=spec-003';

/**
 * Compara banner e calendário num único snapshot de layout. Duas chamadas
 * separadas a boundingBox() podem cair em posições de scroll diferentes: ao
 * carregar a disponibilidade a página faz scrollIntoView com behavior smooth.
 */
async function esperarBannerAcimaDoCalendario(page, alerta) {
  const acima = await alerta.evaluate(el => {
    const cards = [...document.querySelectorAll('.card')];
    const calendario = cards.find(c => c.innerText.includes('Agosto'));
    if (!calendario) return null;
    const a = el.getBoundingClientRect();
    return a.bottom <= calendario.getBoundingClientRect().top + 1;
  });
  expect(acima, 'o banner precisa ficar acima do calendário').toBe(true);
}

/** Espera o calendário da fase 2 aparecer. */
async function esperarCalendario(page) {
  await expect(page.locator('.card').filter({ hasText: 'Agosto' }).first()).toBeVisible({ timeout: 15000 });
}

test('N1 — o primeiro passo do "Novo Agendamento" não exibe texto orientativo', async ({ page }) => {
  await page.goto('/schedule/calendar');
  await expect(page.getByPlaceholder('Buscar especialidade')).toBeVisible();

  await expect(page.getByTestId('booking-rules-alert-avulsa')).toHaveCount(0);
  await expect(page.getByTestId('booking-rules-alert-referral')).toHaveCount(0);
});

test('N2 — banner "Importante!" aparece acima da data e horário no encaminhamento', async ({ page }) => {
  await page.goto(ROTA_ENCAMINHAMENTO);
  await esperarCalendario(page);

  const alerta = page.getByTestId('booking-rules-alert-referral');
  await expect(alerta).toBeVisible();
  await expect(alerta).toContainText('Importante!');

  await esperarBannerAcimaDoCalendario(page, alerta);
});

test('N3 — banner "Lembre-se!" aparece acima da data e horário na avulsa', async ({ page }) => {
  await page.goto(ROTA_AVULSA);
  await esperarCalendario(page);

  const alerta = page.getByTestId('booking-rules-alert-avulsa');
  await expect(alerta).toBeVisible();
  await expect(alerta).toContainText('Lembre-se!');

  await esperarBannerAcimaDoCalendario(page, alerta);
});

test('N4 — cada fluxo mostra só o banner da sua origem', async ({ page }) => {
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
  // O texto informativo acima do banner é o de consulta paga, não o do
  // encaminhamento — os dois se contradiziam antes desta correção.
  await expect(page.getByText('Esta consulta é gratuita', { exact: false })).toHaveCount(0);
  await expect(page.getByText('Você optou por uma consulta avulsa', { exact: false })).toBeVisible();
});

test('N5 — os negritos do texto original são preservados', async ({ page }) => {
  await page.goto(ROTA_ENCAMINHAMENTO);
  await esperarCalendario(page);

  const alerta = page.getByTestId('booking-rules-alert-referral');
  for (const trecho of [
    'reagendar',
    '48 horas antes do horário agendado sem perder o encaminhamento',
    'Após esse prazo, não será possível reagendar.',
    'cancelamento',
    'sem custo',
    'Plantão 24h',
    'Recomendação:',
    'realmente tenha disponibilidade',
  ]) {
    await expect(alerta.locator('strong', { hasText: trecho }).first()).toBeVisible();
  }
});

test('N5 — negritos preservados também no banner da avulsa', async ({ page }) => {
  await page.goto(ROTA_AVULSA);
  await esperarCalendario(page);

  const alerta = page.getByTestId('booking-rules-alert-avulsa');
  for (const trecho of [
    'reagendar',
    'cancelar',
    '48 horas antes do horário agendado',
    'Recomendação:',
    'realmente tenha disponibilidade',
  ]) {
    await expect(alerta.locator('strong', { hasText: trecho }).first()).toBeVisible();
  }
});
