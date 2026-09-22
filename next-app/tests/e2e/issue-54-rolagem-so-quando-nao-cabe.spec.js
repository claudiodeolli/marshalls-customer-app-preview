// Cobre a issue #54:
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/54
//
// O espaço da barra inferior era reservado duas vezes (71px no .content-wrapper
// e 71px no .content-body) e ainda sobrava a margem do último card. O resultado
// era rolagem mesmo com todo o conteúdo visível. O critério que o cliente deu:
// rola só "se tiver mais de um Card ali ou se o único Card que tiver ultrapassar
// a tela da pessoa ali pra baixo".
//
// Diferente da #53, este defeito aparece no Chromium do Playwright: depende de
// padding, não da barra de endereço do celular.
const { test, expect } = require('@playwright/test');

const ESTATICAS = ['/mudar-senha', '/canais-de-contato', '/encaminhamentos'];
const TOLERANCIA_PX = 2; // arredondamento do emulador mobile

const medir = page => page.evaluate(async () => {
  const arredondar = n => Math.round(n * 100) / 100;
  const cards = [...document.querySelectorAll('.content-body .card')].filter(c => c.getClientRects().length > 0);
  const barraInferior = () => document.querySelector('._mob-nav').getBoundingClientRect().top;
  const fimDoConteudo = () => Math.max(...cards.map(c => c.getBoundingClientRect().bottom));

  const sobra = Math.round(document.documentElement.scrollHeight - window.innerHeight);
  window.scrollTo(0, document.documentElement.scrollHeight);
  await new Promise(r => setTimeout(r, 400));

  return {
    cards: cards.length,
    sobra,
    escondidoNoFim: arredondar(Math.max(0, fimDoConteudo() - barraInferior())),
    alturaBarraInferior: arredondar(window.innerHeight - barraInferior()),
  };
});

const abrir = async (page, rota, largura, altura) => {
  await page.setViewportSize({ width: largura, height: altura });
  await page.goto(rota);
  await expect(page.locator('.content-body .card').first()).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(500);
};

test.describe('#54 — no celular a rolagem só existe quando algo não cabe', () => {
  // 700px de altura é onde o defeito aparecia: 71px em Mudar senha, 60px em
  // Canais e 82px em Encaminhamentos, com o conteúdo inteiro já visível.
  for (const rota of ESTATICAS) {
    test(`#54 — ${rota} não rola quando o conteúdo cabe (390x700)`, async ({ page }) => {
      await abrir(page, rota, 390, 700);
      const m = await medir(page);

      expect(m.cards, 'a tela precisa ter conteúdo para a medida valer').toBeGreaterThan(0);
      expect(m.alturaBarraInferior, 'a barra inferior precisa estar visível').toBeGreaterThan(70);
      expect(m.sobra, 'nada para rolar: é só espaço vazio que sobrava').toBeLessThanOrEqual(0);
    });
  }

  // Aqui o card realmente não cabe. A rolagem tem de existir e ser suficiente
  // para o fim do conteúdo passar acima da barra — nada pode ficar escondido.
  for (const [rota, rotulo] of [['/mudar-senha', 'Alterar senha'], ['/canais-de-contato', 'Enviar e-mail']]) {
    test(`#54 — ${rota} numa tela baixa rola o bastante para "${rotulo}" aparecer`, async ({ page }) => {
      await abrir(page, rota, 360, 640);
      const m = await medir(page);

      expect(m.sobra, 'nesta altura o conteúdo não cabe, então precisa rolar').toBeGreaterThan(0);
      expect(m.escondidoNoFim, 'rolado até o fim, nada pode ficar atrás da barra').toBeLessThanOrEqual(TOLERANCIA_PX);

      const botao = page.getByRole('button', { name: rotulo }).or(page.getByRole('link', { name: rotulo })).last();
      const caixa = await botao.boundingBox();
      const topoBarra = await page.evaluate(() => document.querySelector('._mob-nav').getBoundingClientRect().top);
      expect(caixa.y + caixa.height, `"${rotulo}" não pode ficar atrás da barra inferior`).toBeLessThanOrEqual(topoBarra + TOLERANCIA_PX);
    });
  }

  test('#54 — a tela longa continua rolando e termina acima da barra', async ({ page }) => {
    await abrir(page, '/agendamentos', 390, 844);
    const m = await medir(page);

    expect(m.cards, '/agendamentos tem vários cards').toBeGreaterThan(1);
    expect(m.sobra, 'tela longa tem de rolar').toBeGreaterThan(0);
    expect(m.escondidoNoFim, 'o último card não pode terminar atrás da barra').toBeLessThanOrEqual(TOLERANCIA_PX);
  });

  // Regressão real, cometida ao escrever esta correção: sem a margem final o
  // card do Plantão, que é dimensionado pela altura da página, cresceu 28px e
  // passou a terminar atrás da barra inferior. A tela não foi pedida.
  for (const [largura, altura] of [[390, 844], [360, 640]]) {
    test(`#54 — o Plantão segue inteiro e sem rolagem (${largura}x${altura})`, async ({ page }) => {
      await abrir(page, '/plantao', largura, altura);
      const m = await medir(page);

      expect(m.sobra, 'o Plantão nunca rolou').toBeLessThanOrEqual(0);
      expect(m.escondidoNoFim, 'o card do Plantão não pode terminar atrás da barra').toBeLessThanOrEqual(TOLERANCIA_PX);
    });
  }

  // A regra da #54 para em 767,98px: o cliente grifou "no *mobile*".
  test('#54 — acima de 768px a reserva do tema continua intacta', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 900 });
    await page.goto('/mudar-senha');
    await expect(page.locator('.content-body .card').first()).toBeVisible({ timeout: 15000 });
    const pb = await page.evaluate(() => [
      getComputedStyle(document.querySelector('.content-wrapper')).paddingBottom,
      getComputedStyle(document.querySelector('.content-body')).paddingBottom,
    ]);

    expect(pb, 'a regra do celular não pode vazar para o tablet').toEqual(['71px', '71px']);
  });
});
