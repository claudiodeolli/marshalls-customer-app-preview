// Cobre a issue #28: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/28
// "texto do cronômetro e botão de Entrar centralizados, e os de Reagendar e
// Cancelar no canto do botão de Entrar (que está centralizado)" — 01/09.
//
// Os testes medem **todos** os cards agendados, e não um exemplo. O defeito
// que ele relatou atingia só 6 dos 14, justamente os de contador mais longo:
// um teste que olhasse o primeiro card passaria com a tela errada.
//
// E medem **relações** entre as bordas, não coordenadas fixas. As coordenadas
// mudam com a largura do card e com o texto; o que precisa valer é o Entrar
// centralizado e os secundários encostados nele.
const { test, expect } = require('@playwright/test');

// Arredondamento sub-pixel; um desalinhamento real seria de vários pixels —
// os que ele apontou iam de 2 a 11,5.
const FOLGA_PX = 1;

/** Geometria da faixa de cada card agendado, num único retrato do layout. */
async function medirFaixas(page) {
  await page.evaluate(() => document.fonts.ready);
  return page.locator('.card >> visible=true').evaluateAll(cards => cards.map(card => {
    const texto = card.innerText;
    if (!/Consulta agendada/.test(texto)) return null;

    const visivel = seletor => [...card.querySelectorAll(seletor)]
      .find(el => el.getClientRects().length > 0);
    const porTexto = rotulo => [...card.querySelectorAll('button')]
      .find(b => b.textContent.trim() === rotulo && b.getClientRects().length > 0);
    const caixa = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: +r.x.toFixed(2), largura: +r.width.toFixed(2), centro: +(r.x + r.width / 2).toFixed(2) };
    };

    const entrar = porTexto('Entrar no atendimento');
    return {
      medico: (texto.match(/Dr\(a\)\.? ?([^\n]+)/) || [])[1]?.trim() ?? '?',
      coluna: caixa(entrar?.closest('div[class*="d-"]')),
      entrar: caixa(entrar),
      contador: caixa(visivel('[data-testid="countdown"]')),
      verde: caixa(visivel('[data-testid="ready-to-enter"]')),
      reagendar: caixa(porTexto('Reagendar')),
      cancelar: caixa(porTexto('Cancelar')),
      placeholder: caixa(visivel('[data-testid="reagendar-placeholder"]')),
    };
  }).filter(Boolean));
}

for (const [nome, viewport] of [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  test.describe(nome, () => {
    test.use({ viewport });

    test.beforeEach(async ({ page }) => {
      await page.goto('/agendamentos');
      await expect(page.locator('[data-testid="countdown"] >> visible=true').first())
        .toBeVisible({ timeout: 20000 });
    });

    test('L1/L4 — o "Entrar" fica centralizado em todos os cards', async ({ page }) => {
      const faixas = await medirFaixas(page);
      expect(faixas.length, 'a vitrine tem 14 cards agendados').toBe(14);

      for (const faixa of faixas) {
        expect(
          Math.abs(faixa.entrar.centro - faixa.coluna.centro),
          `${faixa.medico}: Entrar em ${faixa.entrar.centro}, coluna em ${faixa.coluna.centro}`,
        ).toBeLessThanOrEqual(FOLGA_PX);
      }
    });

    test('L2 — o contador fica centralizado em relação ao Entrar', async ({ page }) => {
      for (const faixa of await medirFaixas(page)) {
        expect(
          Math.abs(faixa.contador.centro - faixa.entrar.centro),
          `${faixa.medico}: contador em ${faixa.contador.centro}, Entrar em ${faixa.entrar.centro}`,
        ).toBeLessThanOrEqual(FOLGA_PX);
      }
    });

    test('L3/L4 — Reagendar e Cancelar começam na borda esquerda do Entrar', async ({ page }) => {
      const faixas = await medirFaixas(page);
      let comSecundario = 0;

      for (const faixa of faixas) {
        for (const [rotulo, botao] of [['Reagendar', faixa.reagendar], ['Cancelar', faixa.cancelar]]) {
          if (!botao) continue;
          comSecundario++;
          expect(
            Math.abs(botao.x - faixa.entrar.x),
            `${faixa.medico} / ${rotulo}: x=${botao.x} contra Entrar x=${faixa.entrar.x}`,
          ).toBeLessThanOrEqual(FOLGA_PX);
        }
      }

      expect(comSecundario, 'a vitrine precisa ter botões secundários para medir').toBeGreaterThan(0);
    });

    test('L3 — e continuam mais estreitos que o Entrar', async ({ page }) => {
      // Encostar na borda não pode virar "esticar até a mesma largura": as
      // larguras da #13 e da #17 continuam valendo.
      for (const faixa of await medirFaixas(page)) {
        for (const botao of [faixa.reagendar, faixa.cancelar]) {
          if (!botao) continue;
          expect(botao.largura, faixa.medico).toBeLessThan(faixa.entrar.largura);
        }
      }
    });

    test('L5 — o aviso verde acompanha o contador', async ({ page }) => {
      const comAviso = (await medirFaixas(page)).filter(f => f.verde);

      expect(comAviso.length, 'há cards liberados na vitrine').toBeGreaterThan(0);
      for (const faixa of comAviso) {
        expect(
          Math.abs(faixa.verde.centro - faixa.entrar.centro),
          `${faixa.medico}: aviso verde fora do eixo do Entrar`,
        ).toBeLessThanOrEqual(FOLGA_PX);
      }
    });

    test('L8 — o espaço do Reagendar segue a mesma borda quando o botão some', async ({ page }) => {
      const comPlaceholder = (await medirFaixas(page)).filter(f => f.placeholder);

      expect(comPlaceholder.length, 'há cards dentro das 48h na vitrine').toBeGreaterThan(0);
      for (const faixa of comPlaceholder) {
        expect(
          Math.abs(faixa.placeholder.x - faixa.entrar.x),
          `${faixa.medico}: o espaço reservado saiu da borda`,
        ).toBeLessThanOrEqual(FOLGA_PX);
      }
    });

    test('L6/L7 — larguras e alturas das issues anteriores continuam valendo', async ({ page }) => {
      const medidas = await page.locator('.card >> visible=true').evaluateAll(cards => cards.flatMap(card => {
        if (!/Consulta agendada/.test(card.innerText)) return [];
        return [...card.querySelectorAll('button')]
          .filter(b => b.getClientRects().length > 0)
          .filter(b => ['Entrar no atendimento', 'Reagendar', 'Cancelar'].includes(b.textContent.trim()))
          .map(b => {
            const r = b.getBoundingClientRect();
            return { rotulo: b.textContent.trim(), largura: +r.width.toFixed(2), altura: +r.height.toFixed(2) };
          });
      }));

      for (const { rotulo, largura, altura } of medidas) {
        const esperado = rotulo === 'Entrar no atendimento'
          ? { largura: 272.72, altura: 37 }
          : { largura: 200, altura: 34 };
        expect(Math.abs(largura - esperado.largura), `largura do ${rotulo}: ${largura}`).toBeLessThanOrEqual(FOLGA_PX);
        expect(Math.abs(altura - esperado.altura), `altura do ${rotulo}: ${altura}`).toBeLessThanOrEqual(FOLGA_PX);
      }
    });

    test('L4 — o comprimento do contador não move mais os botões', async ({ page }) => {
      // Era esta a raiz do problema: o texto empurrava a coluna, e o Entrar,
      // sendo inline-block, centralizava-se na sobra enquanto os secundários
      // ficavam na borda. Cards de contador curto e longo agora concordam.
      const faixas = await medirFaixas(page);
      const curto = faixas.find(f => f.medico === 'Renata Alves');
      const longo = faixas.find(f => f.medico === 'Ivan Moreira');

      for (const faixa of [curto, longo]) {
        expect(faixa, 'os dois cards de referência precisam existir').toBeTruthy();
        const desvioDoCentro = Math.abs(faixa.entrar.centro - faixa.coluna.centro);
        expect(desvioDoCentro, `${faixa.medico}: Entrar fora do centro da coluna`).toBeLessThanOrEqual(FOLGA_PX);
      }
    });
  });
}
