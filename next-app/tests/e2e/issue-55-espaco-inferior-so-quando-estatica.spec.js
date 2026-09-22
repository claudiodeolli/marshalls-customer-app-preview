// Cobre a issue #55:
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/55
//
// No celular, o espaço reduzido da #54 só vale quando deixa a tela estática
// sem esconder nenhum elemento. Se a tela rola de qualquer jeito, volta o
// espaço anterior à #54: 71px no .content-wrapper, 71px no .content-body e a
// margem do último card. Quem decide é o hook useEspacoInferiorMobile, que
// liga html.tela-rolavel.
const { test, expect } = require('@playwright/test');

const CLASSE_ROLAVEL = 'tela-rolavel';

// O .content-body entra com uma animação de escala. Medir durante ela lê tudo
// menor — foi o que fez a primeira versão do hook decidir errado.
async function abrirEsperandoAnimacao(page, rota, largura, altura) {
  await page.setViewportSize({ width: largura, height: altura });
  await page.goto(rota);
  await expect(page.locator('.content-body .card').first()).toBeVisible({ timeout: 15000 });
  await page.waitForFunction(() =>
    document.querySelector('.content-body').getAnimations().every(a => a.playState === 'finished'));
  await page.waitForTimeout(300);
}

const retrato = page => page.evaluate(() => {
  const estilo = seletor => getComputedStyle(document.querySelector(seletor));
  return {
    rolavel: document.documentElement.classList.contains('tela-rolavel'),
    sobra: Math.round(document.documentElement.scrollHeight - window.innerHeight),
    reservaWrapper: estilo('.content-wrapper').paddingBottom,
    reservaCorpo: estilo('.content-body').paddingBottom,
  };
});

async function fimDoBotaoRoladoAteOFim(page, rotulo) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);
  return page.evaluate(r => {
    const botao = [...document.querySelectorAll('.content-body button, .content-body a')]
      .filter(e => e.textContent.trim() === r && e.getClientRects().length > 0).at(-1);
    const barra = document.querySelector('._mob-nav').getBoundingClientRect().top;
    return { atrasDaBarra: botao.getBoundingClientRect().bottom - barra };
  }, rotulo);
}

test.describe('#55 — espaço reduzido só quando deixa a tela estática', () => {
  // Q2: o que fica atrás da barra é só a borda do card (1,69px); o botão
  // "Enviar e-mail" termina acima dela. Nenhum elemento omitido → estática.
  test('#55 — Canais de contato a 390x667 fica estática', async ({ page }) => {
    await abrirEsperandoAnimacao(page, '/canais-de-contato', 390, 667);
    const r = await retrato(page);

    expect(r.rolavel, 'nenhum elemento fica atrás da barra').toBe(false);
    expect(r.sobra, 'estática: nada para rolar').toBeLessThanOrEqual(0);
  });

  // Q4: "Alterar senha" termina 1,56px atrás da barra, dentro da tolerância
  // de 2px. O Cláudio quis estática.
  test('#55 — Mudar senha a 390x667 fica estática', async ({ page }) => {
    await abrirEsperandoAnimacao(page, '/mudar-senha', 390, 667);
    const r = await retrato(page);

    expect(r.rolavel).toBe(false);
    expect(r.sobra, 'estática: nada para rolar').toBeLessThanOrEqual(0);
  });

  for (const [rota, rotulo] of [['/mudar-senha', 'Alterar senha'], ['/canais-de-contato', 'Enviar e-mail']]) {
    test(`#55 — ${rota} a 360x640 rola com o espaço anterior à #54`, async ({ page }) => {
      await abrirEsperandoAnimacao(page, rota, 360, 640);
      const r = await retrato(page);

      expect(r.rolavel, 'aqui um elemento fica atrás da barra').toBe(true);
      expect([r.reservaWrapper, r.reservaCorpo], 'volta a reserva dupla de antes da #54').toEqual(['71px', '71px']);
      expect(r.sobra).toBeGreaterThan(0);

      const b = await fimDoBotaoRoladoAteOFim(page, rotulo);
      expect(b.atrasDaBarra, `rolado até o fim, "${rotulo}" fica acima da barra`).toBeLessThanOrEqual(0);
    });
  }

  test('#55 — a tela longa usa o espaço anterior à #54', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/agendamentos');
    await expect(page.getByRole('heading', { name: 'Agendamentos' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('html')).toHaveClass(new RegExp(CLASSE_ROLAVEL), { timeout: 5000 });
    const r = await retrato(page);

    expect([r.reservaWrapper, r.reservaCorpo]).toEqual(['71px', '71px']);
  });

  // A decisão acompanha a janela: a mesma tela, estática num celular alto,
  // passa a rolar com o espaço anterior quando a janela encolhe.
  test('#55 — a decisão é refeita quando a janela muda', async ({ page }) => {
    await abrirEsperandoAnimacao(page, '/mudar-senha', 390, 700);
    expect((await retrato(page)).rolavel, 'a 390x700 ela cabe').toBe(false);

    await page.setViewportSize({ width: 360, height: 640 });
    await expect(page.locator('html')).toHaveClass(new RegExp(CLASSE_ROLAVEL), { timeout: 5000 });
  });

  test('#55 — o Plantão não é tocado', async ({ page }) => {
    await abrirEsperandoAnimacao(page, '/plantao', 360, 640);
    const r = await retrato(page);

    expect(r.rolavel).toBe(false);
    expect([r.reservaWrapper, r.reservaCorpo], 'a regra própria do Plantão continua valendo').toEqual(['0px', '0px']);
    expect(r.sobra).toBeLessThanOrEqual(0);
  });

  test('#55 — fora do celular o hook não opina', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 900 });
    await page.goto('/agendamentos');
    await expect(page.getByRole('heading', { name: 'Agendamentos' }).first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(800);

    await expect(page.locator('html')).not.toHaveClass(new RegExp(CLASSE_ROLAVEL));
  });
});
