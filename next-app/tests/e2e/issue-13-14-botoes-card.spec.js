// Cobre as issues #13 e #14:
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/13
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/14
// Tamanhos, cores, espaçamento e alinhamento da faixa de botões do card
// agendado, mais o tooltip do "Entrar no atendimento" bloqueado.
const { test, expect } = require('@playwright/test');

const CINZA_BORDA = 'rgb(216, 214, 222)';
const CINZA_TEXTO = 'rgb(110, 107, 123)';
const VERMELHO = 'rgb(234, 84, 85)';

// O layout arredonda no sub-pixel: uma altura de 32px sai como 31.9, e a
// largura de 272.72 chega a 272.1 porque o maxWidth do botão é limitado
// pela largura já arredondada da coluna. Um desvio real da especificação
// seria de vários pixels, não de frações.
const FOLGA_PX = 1;

function esperarMedida(recebido, esperado, rotulo) {
  expect(Math.abs(recebido - esperado), `${rotulo}: esperado ~${esperado}px, veio ${recebido}px`)
    .toBeLessThanOrEqual(FOLGA_PX);
}

const BLOQUEADO = 'Renata Alves';  // 12 dias — botão travado
const LIBERADO = 'Lucia Ramos';    // 10 minutos — botão liberado

/**
 * Mede um botão visível do card, em **pixels CSS**.
 *
 * `boundingBox()` do Playwright devolve pixels de dispositivo — no iPhone 13
 * o DPR é 3, e os valores chegam arredondados para menos (200 vira 199).
 * A especificação do cliente está em pixels CSS, que é o que
 * `getBoundingClientRect()` dentro da página informa.
 */
/**
 * Espera as fontes e o próximo quadro antes de medir.
 *
 * O botão tem largura fixa com `maxWidth: 100%`, então ele acompanha a
 * coluna. Enquanto as fontes carregam, a coluna muda de largura — e uma
 * medição tirada nesse meio tempo lê alguns pixels a menos do que a
 * especificação, sem que nada esteja errado no código.
 *
 * Não dá para esperar as imagens: o next/image carrega sob demanda, e as
 * que ficam fora da tela nunca completam.
 */
async function aguardarLayoutEstavel(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(requestAnimationFrame);
  });
}

async function medirBotao(page, medico, rotulo) {
  const botao = page.locator(`.card:has-text('${medico}') button:text-is('${rotulo}') >> visible=true`).first();
  await expect(botao).toBeVisible();
  await aguardarLayoutEstavel(page);
  return botao.evaluate(el => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      largura: +r.width.toFixed(2),
      altura: +r.height.toFixed(2),
      fundo: s.backgroundColor,
      borda: s.borderTopColor,
      texto: s.color,
    };
  });
}

for (const [nome, viewport] of [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  test.describe(`${nome}`, () => {
    test.use({ viewport });

    test.beforeEach(async ({ page }) => {
      await page.goto('/agendamentos');
      await expect(page.locator(`.card:has-text('${BLOQUEADO}')`).first()).toBeVisible({ timeout: 15000 });
    });

    // toPass: a coluna ainda pode estar se ajustando quando a primeira
    // medição sai. Reconsultar é o certo aqui; afrouxar a FOLGA_PX
    // esconderia um desvio real da especificação.
    test('P1 — "Entrar no atendimento" mede 32 × 272.72', async ({ page }) => {
      await expect(async () => {
        const b = await medirBotao(page, BLOQUEADO, 'Entrar no atendimento');
        esperarMedida(b.altura, 32, 'altura do Entrar');
        esperarMedida(b.largura, 272.72, 'largura do Entrar');
      }).toPass({ timeout: 10_000 });
    });

    test('P2 — "Reagendar" e "Cancelar" medem 32 × 200', async ({ page }) => {
      await expect(async () => {
        for (const rotulo of ['Reagendar', 'Cancelar']) {
          const b = await medirBotao(page, BLOQUEADO, rotulo);
          esperarMedida(b.altura, 32, `altura do ${rotulo}`);
          esperarMedida(b.largura, 200, `largura do ${rotulo}`);
        }
      }).toPass({ timeout: 10_000 });
    });

    test('P3 — Reagendar tem fundo claro, borda e texto em cinza', async ({ page }) => {
      const b = await medirBotao(page, BLOQUEADO, 'Reagendar');
      expect(b.fundo).toBe('rgb(255, 255, 255)');
      expect(b.borda).toBe(CINZA_BORDA);
      expect(b.texto).toBe(CINZA_TEXTO);
    });

    test('P4 — Cancelar tem fundo claro, borda e texto em vermelho', async ({ page }) => {
      const b = await medirBotao(page, BLOQUEADO, 'Cancelar');
      expect(b.fundo).toBe('rgb(255, 255, 255)');
      expect(b.borda).toBe(VERMELHO);
      expect(b.texto).toBe(VERMELHO);
    });

    test('P5 — "Entrar no atendimento" continua preenchido de verde', async ({ page }) => {
      const b = await medirBotao(page, LIBERADO, 'Entrar no atendimento');
      // Verde sólido, não branco como os secundários.
      expect(b.fundo).not.toBe('rgb(255, 255, 255)');
      expect(b.fundo).toMatch(/^rgb\(\d+, 1\d\d, \d+\)$/);
    });

    test('P7/P8 — há respiro entre o Entrar e os botões abaixo', async ({ page }) => {
      const vao = await page.locator(`.card:has-text('${BLOQUEADO}')`).first().evaluate(card => {
        const visivel = el => el.getClientRects().length > 0;
        const entrar = [...card.querySelectorAll('button')].find(b => visivel(b) && b.innerText.includes('Entrar'));
        const reagendar = [...card.querySelectorAll('button')].find(b => visivel(b) && b.innerText.includes('Reagendar'));
        return reagendar.getBoundingClientRect().top - entrar.getBoundingClientRect().bottom;
      });
      expect(vao).toBeGreaterThanOrEqual(16);
    });

    test('P9 — o texto do contador está em 14px', async ({ page }) => {
      const tamanho = await page.locator(`.card:has-text('${BLOQUEADO}')`).first().evaluate(card => {
        const span = [...card.querySelectorAll('span')]
          .find(s => s.getClientRects().length > 0 && /dias|amanhã|horas?|min/.test(s.innerText));
        return getComputedStyle(span).fontSize;
      });
      expect(tamanho).toBe('14px');
    });

    test('H1/H3 — o tooltip do botão bloqueado aparece no hover', async ({ page }) => {
      const card = page.locator(`.card:has-text('${BLOQUEADO}')`).first();
      const dica = card.locator('._blocked-tip >> visible=true').first();

      await expect(dica).toBeHidden();
      await card.locator('._blocked-enter >> visible=true').first().hover();
      await expect(dica).toBeVisible();
      await expect(dica).toContainText('Este botão será liberado faltando 15 minutos');
    });

    test('H5 — botão liberado não tem tooltip', async ({ page }) => {
      const card = page.locator(`.card:has-text('${LIBERADO}')`).first();
      await expect(card.locator('._blocked-tip')).toHaveCount(0);
    });

    test('H3 — o title nativo do sistema saiu de cena', async ({ page }) => {
      const card = page.locator(`.card:has-text('${BLOQUEADO}')`).first();
      await expect(card.locator('._blocked-enter[title]')).toHaveCount(0);
    });

    test('H4 — o clique continua abrindo o diálogo, para quem usa toque', async ({ page }) => {
      const card = page.locator(`.card:has-text('${BLOQUEADO}')`).first();
      await card.locator('._blocked-enter >> visible=true').first().click();
      await expect(page.getByRole('button', { name: 'Entendi' })).toBeVisible();
    });
  });
}

test('P6 — no desktop, Reagendar e Cancelar descem até a linha da tag', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/agendamentos');
  await expect(page.locator(`.card:has-text('${BLOQUEADO}')`).first()).toBeVisible({ timeout: 15000 });

  // A tag de status é a referência que o cliente indicou: os dois botões
  // ficam na faixa vertical dela, não colados no Entrar lá em cima.
  const alinhado = await page.locator(`.card:has-text('${BLOQUEADO}')`).first().evaluate(card => {
    const visivel = el => el.getClientRects().length > 0;
    const caixa = el => el.getBoundingClientRect();
    const tag = [...card.querySelectorAll('span')].find(s => visivel(s) && s.innerText.trim() === 'Consulta agendada');
    const reagendar = [...card.querySelectorAll('button')].find(b => visivel(b) && b.innerText.includes('Reagendar'));
    const cancelar = [...card.querySelectorAll('button')].find(b => visivel(b) && b.innerText.includes('Cancelar'));
    const entrar = [...card.querySelectorAll('button')].find(b => visivel(b) && b.innerText.includes('Entrar'));

    return {
      abaixoDoEntrar: caixa(reagendar).top > caixa(entrar).bottom,
      // "Desce ate a linha da TAG": o par de botoes alcanca a faixa
      // vertical da tag, em vez de flutuar junto ao Entrar.
      alcancaAFaixaDaTag: caixa(cancelar).bottom > caixa(tag).top && caixa(reagendar).top < caixa(tag).bottom,
    };
  });

  expect(alinhado.abaixoDoEntrar).toBe(true);
  expect(alinhado.alcancaAFaixaDaTag, 'Reagendar/Cancelar devem alcançar a faixa da tag').toBe(true);
});
