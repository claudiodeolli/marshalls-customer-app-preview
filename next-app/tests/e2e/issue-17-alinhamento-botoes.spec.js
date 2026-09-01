// Cobre a issue #17: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/17
// Alinhamento, alturas, borda e hover dos botões do card agendado, pedidos
// por print anotado em 27/08 e reforçados por mensagem em 29/08.
const { test, expect } = require('@playwright/test');

const CINZA = 'rgb(110, 107, 123)';
const VERMELHO = 'rgb(234, 84, 85)';
const BLOQUEADO = 'Renata Alves';  // 12 dias — tem os três botões

// O layout arredonda no sub-pixel; um desvio real seria de vários pixels.
const FOLGA_PX = 1;

/** Geometria dos três botões e do contador, num único retrato do layout. */
async function medirFaixa(page, medico) {
  // O card visível engloba o bloco mobile escondido, então o contador precisa
  // ser filtrado por visibilidade — senão a espera mira o do bloco errado.
  const cartao = page.locator(`.card:has-text('${medico}') >> visible=true`).first();
  await expect(cartao.locator('[data-testid="countdown"] >> visible=true').first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  // Uma leitura só: medir em chamadas separadas deixaria o layout mexer entre elas.
  return cartao.evaluate(card => {
    const caixa = el => { const r = el.getBoundingClientRect(); return { x: r.x, largura: r.width, direita: r.right }; };
    const visivel = sel => [...card.querySelectorAll(sel)].find(el => el.getClientRects().length > 0);
    const porTexto = texto => [...card.querySelectorAll('button')]
      .find(b => b.textContent.trim() === texto && b.getClientRects().length > 0);
    const contador = visivel('[data-testid="countdown"]');
    const entrar = porTexto('Entrar no atendimento');
    const reagendar = porTexto('Reagendar');
    const cancelar = porTexto('Cancelar');
    const estilo = el => { const s = getComputedStyle(el); return { borda: s.borderTopColor, texto: s.color }; };
    return {
      contador: caixa(contador),
      entrar: caixa(entrar),
      reagendar: reagendar ? { ...caixa(reagendar), ...estilo(reagendar) } : null,
      cancelar: cancelar ? { ...caixa(cancelar), ...estilo(cancelar) } : null,
    };
  });
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
        .toBeVisible({ timeout: 15000 });
    });

    test('A1 — Reagendar e Cancelar começam na borda esquerda do Entrar', async ({ page }) => {
      const f = await medirFaixa(page, BLOQUEADO);

      for (const [rotulo, botao] of [['Reagendar', f.reagendar], ['Cancelar', f.cancelar]]) {
        expect(botao, `${rotulo} precisa estar no card`).toBeTruthy();
        expect(Math.abs(botao.x - f.entrar.x), `${rotulo}: x=${botao.x} contra Entrar x=${f.entrar.x}`)
          .toBeLessThanOrEqual(FOLGA_PX);
      }
    });

    test('A1 — e continuam mais estreitos que o Entrar, não esticados até ele', async ({ page }) => {
      // Alinhar à esquerda não pode virar "ocupar a mesma largura": as larguras
      // da #13 (272,72 e 200) ele não mexeu.
      const f = await medirFaixa(page, BLOQUEADO);
      expect(f.reagendar.largura).toBeLessThan(f.entrar.largura);
      expect(f.reagendar.direita).toBeLessThan(f.entrar.direita);
    });

    test('A4 — o contador fica centralizado em relação ao Entrar', async ({ page }) => {
      const f = await medirFaixa(page, BLOQUEADO);
      const centroContador = f.contador.x + f.contador.largura / 2;
      const centroEntrar = f.entrar.x + f.entrar.largura / 2;

      expect(Math.abs(centroContador - centroEntrar), `contador em ${centroContador}, Entrar em ${centroEntrar}`)
        .toBeLessThanOrEqual(FOLGA_PX);
    });

    test('A5 — a borda do Reagendar tem a mesma cor do texto', async ({ page }) => {
      const { reagendar } = await medirFaixa(page, BLOQUEADO);
      expect(reagendar.borda).toBe(reagendar.texto);
      expect(reagendar.borda).toBe(CINZA);
    });

    test('A5 — e o Cancelar segue com borda e texto no vermelho', async ({ page }) => {
      const { cancelar } = await medirFaixa(page, BLOQUEADO);
      expect(cancelar.borda).toBe(cancelar.texto);
      expect(cancelar.borda).toBe(VERMELHO);
    });
  });
}

// O hover só existe onde há ponteiro; o CSS está sob `@media (hover: hover)`
// justamente para o botão não ficar tingido depois de um toque.
test.describe('hover', () => {
  test.use({ viewport: { width: 1440, height: 1000 }, hasTouch: false });

  test.beforeEach(async ({ page }) => {
    await page.goto('/agendamentos');
    await expect(page.locator('[data-testid="countdown"] >> visible=true').first())
      .toBeVisible({ timeout: 15000 });
  });

  for (const [rotulo, classe, canal] of [
    ['Reagendar', '_card-btn-reagendar', '110, 107, 123'],
    ['Cancelar', '_card-btn-cancelar', '234, 84, 85'],
  ]) {
    test(`A6/A7 — o ${rotulo} recebe a própria cor ao fundo no hover`, async ({ page }) => {
      const botao = page.locator(`.card:has-text('${BLOQUEADO}') .${classe} >> visible=true`).first();
      const antes = await botao.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(antes, 'em repouso o fundo é branco').toBe('rgb(255, 255, 255)');

      await botao.hover();
      const depois = await botao.evaluate(el => getComputedStyle(el).backgroundColor);

      expect(depois, 'o fundo precisa mudar no hover').not.toBe(antes);
      expect(depois, `o tom precisa ser o do próprio ${rotulo}`).toContain(canal);
    });
  }
});
