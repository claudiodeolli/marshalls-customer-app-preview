// Cobre a issue #56:
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/56
//
// No celular, o card do Plantão tinha a sombra cortada: .app-content,
// .content-wrapper e .content-body tinham overflow: hidden, e o card ocupa
// toda a largura do .content-body. O desfoque lateral terminava numa linha
// vertical rente ao card. A correção tira o recorte só no celular; a sombra
// fica.
const { test, expect } = require('@playwright/test');

async function abrirPlantao(page, largura, altura) {
  await page.setViewportSize({ width: largura, height: altura });
  await page.goto('/plantao');
  await expect(page.locator('._plantao-page .card').first()).toBeVisible({ timeout: 15000 });
  await page.waitForFunction(() =>
    document.querySelector('.content-body').getAnimations().every(a => a.playState !== 'running'));
  await page.waitForTimeout(300);
}

/**
 * Para cada ancestral do card que recorta o que transborda, quanto espaço ele
 * deixa à esquerda, à direita e abaixo do card. A sombra precisa de 24px nas
 * laterais (desfoque) e 28px embaixo (desfoque + 4px de deslocamento).
 */
const medirRecortes = page => page.evaluate(() => {
  const card = document.querySelector('._plantao-page .card');
  const c = card.getBoundingClientRect();
  const recortes = [];
  for (let el = card.parentElement; el && el !== document.body; el = el.parentElement) {
    const s = getComputedStyle(el);
    if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
    const r = el.getBoundingClientRect();
    recortes.push({
      elemento: `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`,
      esquerda: Math.round((c.left - r.left) * 10) / 10,
      direita: Math.round((r.right - c.right) * 10) / 10,
      abaixo: Math.round((r.bottom - c.bottom) * 10) / 10,
    });
  }
  return {
    sombra: getComputedStyle(card).boxShadow,
    recortes,
    card: { esquerda: Math.round(c.left * 10) / 10 },
    sobra: Math.round(document.documentElement.scrollHeight - window.innerHeight),
    sobraHorizontal: document.documentElement.scrollWidth - window.innerWidth,
  };
});

const ALCANCE_LATERAL = 24;
const ALCANCE_INFERIOR = 28;

test.describe('#56 — sombra do card do Plantão sem corte no celular', () => {
  for (const [largura, altura] of [[390, 844], [360, 640]]) {
    test(`#56 — nenhum ancestral corta a sombra (${largura}x${altura})`, async ({ page }) => {
      await abrirPlantao(page, largura, altura);
      const m = await medirRecortes(page);

      // Guarda: se o card não tivesse sombra, não haveria o que cortar.
      expect(m.sombra, 'o card precisa continuar com sombra').not.toBe('none');
      for (const r of m.recortes) {
        expect(r.esquerda, `${r.elemento} corta a sombra à esquerda`).toBeGreaterThanOrEqual(ALCANCE_LATERAL);
        expect(r.direita, `${r.elemento} corta a sombra à direita`).toBeGreaterThanOrEqual(ALCANCE_LATERAL);
        expect(r.abaixo, `${r.elemento} corta a sombra embaixo`).toBeGreaterThanOrEqual(ALCANCE_INFERIOR);
      }
    });

    test(`#56 — o Plantão continua sem rolar e no mesmo lugar (${largura}x${altura})`, async ({ page }) => {
      await abrirPlantao(page, largura, altura);
      const m = await medirRecortes(page);

      expect(m.sobra, 'o recorte existia para o Plantão não rolar').toBeLessThanOrEqual(0);
      expect(m.sobraHorizontal, 'nenhuma rolagem horizontal').toBeLessThanOrEqual(0);
      expect(m.card.esquerda, 'recuo da #50').toBeCloseTo(27.3, 0);
    });
  }

  // O pedido foi do celular: no tablet o recorte continua.
  test('#56 — no tablet o recorte do Plantão continua', async ({ page }) => {
    await abrirPlantao(page, 1100, 900);
    const overflow = await page.evaluate(() => getComputedStyle(document.querySelector('.content-body')).overflowY);

    expect(overflow).toBe('hidden');
  });
});
