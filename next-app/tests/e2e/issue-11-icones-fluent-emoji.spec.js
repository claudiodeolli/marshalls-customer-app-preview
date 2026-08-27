// Cobre a issue #11: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/11
// Os ícones do card deixam de ser caracteres unicode — desenhados pela fonte
// do sistema, e por isso diferentes em cada aparelho — e passam a ser assets
// do Microsoft Fluent Emoji 3D servidos pelo próprio projeto.
const { test, expect } = require('@playwright/test');

const CALENDARIO = '/icons/fluent-emoji/calendar_3d.png';   // U+1F4C5
const RELOGIO = '/icons/fluent-emoji/three_oclock_3d.png';  // U+1F552
const CIRCULO_VERDE = '/icons/fluent-emoji/green_circle_3d.png';

/** Lê os ícones visíveis do card do médico indicado. */
async function lerIcones(page, medico) {
  return page.locator(`.card:has-text('${medico}')`).first().evaluate(card =>
    [...card.querySelectorAll('img')]
      .filter(img => img.getClientRects().length > 0)
      .map(img => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        largura: img.clientWidth,
        altura: img.clientHeight,
        carregou: img.naturalWidth > 0,
      }))
  );
}

for (const [nome, viewport] of [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  test.describe(nome, () => {
    test.use({ viewport });

    test.beforeEach(async ({ page }) => {
      await page.goto('/agendamentos');
      await expect(page.locator(".card:has-text('Renata Alves')").first()).toBeVisible({ timeout: 15000 });
    });

    test('F1/F4 — contagem em dias usa o asset do Calendar (U+1F4C5)', async ({ page }) => {
      const [icone] = await lerIcones(page, 'Renata Alves');
      expect(icone.src).toBe(CALENDARIO);
      expect(icone.carregou, 'o arquivo precisa existir em /public').toBe(true);
    });

    test('F1/F4 — contagem em horas usa o asset do Three o\'clock (U+1F552)', async ({ page }) => {
      const [icone] = await lerIcones(page, 'Clara Bento');
      expect(icone.src).toBe(RELOGIO);
      expect(icone.carregou).toBe(true);
    });

    test('F5 — o aviso de liberação usa o asset do círculo verde', async ({ page }) => {
      const icones = await lerIcones(page, 'Lucia Ramos');
      const verde = icones.find(i => i.src === CIRCULO_VERDE);
      expect(verde, 'o círculo verde precisa estar no card liberado').toBeTruthy();
      expect(verde.carregou).toBe(true);
    });

    test('F3 — os ícones são renderizados a 24×24', async ({ page }) => {
      for (const icone of await lerIcones(page, 'Renata Alves')) {
        expect(icone.largura, icone.src).toBe(24);
        expect(icone.altura, icone.src).toBe(24);
      }
    });

    test('F9 — os ícones são decorativos (alt vazio)', async ({ page }) => {
      for (const icone of await lerIcones(page, 'Lucia Ramos')) {
        expect(icone.alt, icone.src).toBe('');
      }
    });

    test('F1 — não sobrou caractere unicode no lugar dos ícones', async ({ page }) => {
      const texto = await page.locator(".card:has-text('Renata Alves')").first().innerText();
      for (const emoji of ['🗓️', '📅', '⏱️', '🕒', '🟢']) {
        expect(texto, `sobrou ${emoji} no card`).not.toContain(emoji);
      }
    });
  });
}

test('F7 — nenhuma biblioteca de ícones é carregada em tempo de execução', async ({ page }) => {
  const requisicoes = [];
  page.on('request', r => requisicoes.push(r.url()));

  await page.goto('/agendamentos');
  await expect(page.locator(".card:has-text('Renata Alves')").first()).toBeVisible({ timeout: 15000 });

  // O cliente citou Lucide e Feather nominalmente; nenhum host externo de
  // ícone deve aparecer, e os assets vêm do próprio domínio.
  for (const url of requisicoes) {
    expect(url, url).not.toMatch(/lucide|feather|fontawesome|emoji-?cdn/i);
  }

  const externos = requisicoes.filter(u => u.includes('/icons/fluent-emoji/') && !u.includes('localhost'));
  expect(externos, 'os ícones não podem vir de fora do projeto').toHaveLength(0);
});
