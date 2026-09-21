// Cobre a issue #53:
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/53
//
// No celular, as telas estáticas rolavam pela altura da barra de endereço: o
// tema dá `min-height: 100vh` ao .vertical-layout (o body e o wrapper), e no
// celular 100vh é a altura com a barra RECOLHIDA.
//
// O Chromium do Playwright não tem barra de endereço — vh, svh e dvh valem o
// mesmo —, então medir a rolagem não enxerga o defeito: as cinco telas davam
// 0px de rolagem com ele presente. O teste que prende a #53 é o primeiro
// abaixo, que resolve a cascata e confere QUAL declaração de min-height vence.
const { test, expect } = require('@playwright/test');

const TELAS_ESTATICAS = ['/plantao', '/encaminhamentos', '/meu-clube', '/canais-de-contato', '/mudar-senha'];

/**
 * Para cada .vertical-layout, a declaração de min-height que vence a cascata:
 * !important primeiro, depois especificidade, depois ordem no documento. Só
 * entram regras cujo @media casa com a janela atual.
 */
function resolverMinHeight(page) {
  return page.evaluate(() => {
    const especificidade = seletor => {
      const ids = (seletor.match(/#[\w-]+/g) || []).length;
      const classes = (seletor.match(/\.[\w-]+|\[[^\]]*\]|:(?!:)[\w-]+/g) || []).length;
      const tags = (seletor
        .replace(/#[\w-]+|\.[\w-]+|\[[^\]]*\]|:+[\w-]+(\([^)]*\))?/g, ' ')
        .match(/[a-zA-Z][\w-]*/g) || []).length;
      return ids * 10000 + classes * 100 + tags;
    };

    const candidatasPara = el => {
      const candidatas = [];
      let ordem = 0;
      const varrer = regras => {
        for (const regra of regras) {
          ordem++;
          if (regra.media && regra.cssRules) {
            if (window.matchMedia(regra.media.mediaText).matches) varrer(regra.cssRules);
            continue;
          }
          if (!regra.selectorText || !regra.style) continue;
          const valor = regra.style.getPropertyValue('min-height');
          if (!valor) continue;
          const partes = regra.selectorText.split(',').map(s => s.trim()).filter(s => {
            try { return el.matches(s); } catch { return false; }
          });
          if (!partes.length) continue;
          candidatas.push({
            valor: valor.trim(),
            importante: regra.style.getPropertyPriority('min-height') === 'important',
            especificidade: Math.max(...partes.map(especificidade)),
            ordem,
            seletor: regra.selectorText,
          });
        }
      };
      for (const folha of document.styleSheets) {
        let regras;
        try { regras = folha.cssRules; } catch { continue; }
        varrer(regras);
      }
      return candidatas;
    };

    return [...document.querySelectorAll('.vertical-layout')].map(el => {
      const candidatas = candidatasPara(el);
      const vencedora = [...candidatas].sort((a, b) =>
        (b.importante - a.importante) || (b.especificidade - a.especificidade) || (b.ordem - a.ordem))[0];
      return {
        elemento: el.tagName.toLowerCase(),
        vencedora: vencedora?.valor ?? null,
        seletorVencedor: vencedora?.seletor ?? null,
        temaVisto: candidatas.some(c => c.valor === '100vh'),
      };
    });
  });
}

test.describe('#53 — telas estáticas não rolam no celular', () => {
  test('#53 — no celular o piso de altura é 100svh, e não o 100vh do tema', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/plantao');
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 15000 });
    const layouts = await resolverMinHeight(page);

    expect(layouts.length, 'o body e o wrapper têm .vertical-layout').toBeGreaterThanOrEqual(1);
    for (const l of layouts) {
      // Guarda: se o resolvedor não enxergasse a regra do tema, a asserção
      // abaixo passaria sem provar nada.
      expect(l.temaVisto, `${l.elemento}: a regra 100vh do tema precisa estar entre as candidatas`).toBe(true);
      expect(l.vencedora, `${l.elemento}: venceu "${l.seletorVencedor}"`).toBe('100svh');
    }
  });

  test('#53 — no desktop continua valendo o 100vh do tema', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/plantao');
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 15000 });
    const layouts = await resolverMinHeight(page);

    for (const l of layouts) {
      expect(l.vencedora, `${l.elemento}: a regra da #53 é só do celular`).toBe('100vh');
    }
  });

  // Estes não enxergam a barra de endereço (ver o topo do arquivo), mas
  // prendem o resto do pedido: nas cinco telas que ele listou, com o conteúdo
  // cabendo na janela, a página não rola nem abre deslocada.
  for (const rota of TELAS_ESTATICAS) {
    test(`#53 — ${rota} cabe na tela e abre no topo`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(rota);
      await expect(page.locator('.card').first()).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(600);
      const m = await page.evaluate(() => ({
        sobra: document.documentElement.scrollHeight - window.innerHeight,
        scrollY: window.scrollY,
      }));

      expect(m.sobra, 'nada para rolar').toBeLessThanOrEqual(0);
      expect(m.scrollY, 'abre sem deslocamento').toBe(0);
    });
  }

  test('#53 — tela longa continua rolando', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/agendamentos');
    await expect(page.getByRole('heading', { name: 'Agendamentos' }).first()).toBeVisible({ timeout: 15000 });
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(400);
    const m = await page.evaluate(() => ({
      rolavel: document.documentElement.scrollHeight > window.innerHeight + 1,
      scrollY: window.scrollY,
    }));

    expect(m.rolavel, '/agendamentos tem conteúdo além da dobra').toBe(true);
    expect(m.scrollY, 'a rolagem precisa continuar funcionando').toBeGreaterThan(0);
  });
});
