// Cobre a issue #7: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/7
// "Nessas modais que tem ícone e titulo, deixa o texto sem recuo, como nas
// outras modais normais."
//
// "Sem recuo" é verificável: cada linha do corpo tem que começar na borda
// interna do box (x do container + padding-left), e não alinhada ao título
// como acontecia quando o ícone ocupava uma coluna própria do flex.
const { test, expect } = require('@playwright/test');

// Só arredondamento sub-pixel. O recuo que estamos caçando é a coluna do
// ícone, ~28px, então 1px de folga não deixa passar regressão.
const TOLERANCIA_PX = 1;

/**
 * Mede, num único snapshot de layout, a borda interna do box e o início de
 * cada elemento do corpo. Precisa ser uma só chamada: a página rola com
 * `behavior: 'smooth'` ao abrir o calendário, e duas medições separadas
 * podem cair em posições de scroll diferentes.
 *
 * Borda interna = x + border-left + padding-left. `getBoundingClientRect().x`
 * fica na borda externa, então esquecer a borda dá um erro sistemático.
 */
async function medirRecuos(alerta, seletorDoCorpo) {
  return alerta.evaluate((el, seletor) => {
    const estilo = getComputedStyle(el);
    const bordaInterna = el.getBoundingClientRect().x
      + parseFloat(estilo.borderLeftWidth)
      + parseFloat(estilo.paddingLeft);

    return [...el.querySelectorAll(seletor)].map(filho => ({
      trecho: filho.textContent.trim().slice(0, 40),
      recuo: filho.getBoundingClientRect().x - bordaInterna,
    }));
  }, seletorDoCorpo);
}

/** Confere que o texto começa na borda interna do box, sem recuo. */
async function conferirSemRecuo(alerta, seletorDoCorpo) {
  const medidas = await medirRecuos(alerta, seletorDoCorpo);
  expect(medidas.length, 'o aviso precisa ter corpo de texto').toBeGreaterThan(0);

  for (const { trecho, recuo } of medidas) {
    expect(Math.abs(recuo), `recuo de "${trecho}"`).toBeLessThanOrEqual(TOLERANCIA_PX);
  }
}

test('R1/R2 — banner de regras: corpo sem recuo, ícone junto do título', async ({ page }) => {
  await page.goto('/schedule/calendar?referral=ref-003');
  const alerta = page.getByTestId('booking-rules-alert-referral');
  await expect(alerta).toBeVisible({ timeout: 15000 });

  await conferirSemRecuo(alerta, 'p');

  // R2: o ícone continua na primeira linha, dentro do título.
  const titulo = alerta.locator('strong').first();
  await expect(titulo).toContainText('Importante!');
  // O aviso deixou de ser caractere unicode e virou asset (issue #21), mas
  // segue na mesma linha do título.
  await expect(titulo.locator('img')).toBeVisible();
});

test('R1 — banner da avulsa também sem recuo', async ({ page }) => {
  await page.goto('/schedule/calendar?avulsaSpec=spec-003');
  const alerta = page.getByTestId('booking-rules-alert-avulsa');
  await expect(alerta).toBeVisible({ timeout: 15000 });

  await conferirSemRecuo(alerta, 'p');
});

test('R3 — aviso de criptografia em Enviar arquivos sem recuo', async ({ page }) => {
  await page.goto('/meus-arquivos');
  const alerta = page.locator('div', { hasText: /^Seus arquivos são protegidos por criptografia/ }).last();
  await expect(alerta).toBeVisible({ timeout: 15000 });

  // O corpo aqui é nó de texto solto; o título é o elemento com caixa
  // própria, e parte da mesma borda interna.
  const [{ recuo }] = await medirRecuos(alerta, 'strong');
  expect(Math.abs(recuo)).toBeLessThanOrEqual(TOLERANCIA_PX);

  // R2: o cadeado ficou dentro do título.
  await expect(alerta.locator('strong').first().locator('svg')).toBeVisible();
});

test('R4 — o recuo dos avisos com ícone bate com o de um aviso sem ícone', async ({ page }) => {
  await page.goto('/schedule/calendar?referral=ref-003');
  const alerta = page.getByTestId('booking-rules-alert-referral');
  await expect(alerta).toBeVisible({ timeout: 15000 });

  // Título e corpo partem exatamente da mesma borda — que é o que o cliente
  // chama de "como nas outras modais normais".
  const [titulo] = await medirRecuos(alerta, 'strong');
  const corpo = await medirRecuos(alerta, 'p');
  for (const { trecho, recuo } of corpo) {
    expect(Math.abs(recuo - titulo.recuo), `"${trecho}" vs. título`).toBeLessThanOrEqual(TOLERANCIA_PX);
  }
});
