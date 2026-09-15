// Cobre as issues #42 e #45:
//   #42 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/42
//   #45 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/45
//   #46 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/46
//
// As issues #41, #43 e #44 mediam a película e a sombra da barra. A #45 aposentou
// as duas: o conteúdo deixou de passar por trás da barra, então não há mais o que
// cobrir nem emenda para sombrear. O que aquelas issues pediam continua valendo, e
// está aqui em outra forma — nada aparece perto da barra, e não sobra faixa entre
// ela e o conteúdo.
const { test, expect } = require('@playwright/test');

// Folga para a sombra dos cards (blur de 24px) ser pintada em vez de recortada
// na borda do scrollport.
const ESPACO_MINIMO_PARA_SOMBRA = 24;

async function dispensarAvisoDeRegras(page) {
  const entendi = page.getByRole('button', { name: 'Entendi' });
  if (await entendi.count()) await entendi.first().click();
  await expect(entendi).toHaveCount(0);
}

async function abrirAvulsaAPagar(page) {
  await page.goto('/schedule/calendar');
  await page.getByText('Ortopedia', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Adquirir consulta avulsa' }).click();
  await page.getByText('Ortopedia', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Escolher agora' }).click();
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await dispensarAvisoDeRegras(page);
}

function retratoDoVoltar(page) {
  return page.getByRole('button', { name: '← Voltar' }).evaluate(el => {
    const cs = getComputedStyle(el);
    return {
      classe: el.className,
      texto: el.textContent.trim(),
      fontSize: cs.fontSize,
      padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
      altura: Math.round(el.getBoundingClientRect().height),
    };
  });
}

function retratoDaRolagem(page) {
  return page.evaluate(() => {
    const conteudo = document.querySelector('.content-wrapper');
    const barra = document.querySelector('.header-navbar');
    const cs = getComputedStyle(conteudo);
    const caixa = conteudo.getBoundingClientRect();
    const barraCaixa = barra.getBoundingClientRect();
    return {
      topoDoConteudo: +caixa.top.toFixed(2),
      fimDaBarra: +barraCaixa.bottom.toFixed(2),
      rolavel: conteudo.scrollHeight > conteudo.clientHeight + 1,
      excessoHorizontal: conteudo.scrollWidth - conteudo.clientWidth,
      mascara: cs.maskImage === 'none' ? cs.webkitMaskImage : cs.maskImage,
      folgaEsquerda: parseFloat(cs.paddingLeft),
      folgaDireita: parseFloat(cs.paddingRight),
      bodyRola: document.body.scrollHeight > document.body.clientHeight + 1,
      sombraDaBarra: getComputedStyle(barra).boxShadow,
    };
  });
}

for (const [nome, viewport] of [
  ['desktop', { width: 1440, height: 620 }],
  ['mobile', { width: 390, height: 620 }],
]) {
  test.describe(nome, () => {
    test.use({ viewport });

    test('#45 — o conteúdo rola no próprio contêiner, que começa no fim da barra', async ({ page }) => {
      await page.goto('/agendamentos');
      await expect(page.getByRole('heading', { name: 'Agendamentos' }).first()).toBeVisible({ timeout: 15000 });
      await dispensarAvisoDeRegras(page);
      const r = await retratoDaRolagem(page);

      expect(r.rolavel, 'o contêiner do conteúdo precisa ser o que rola').toBe(true);
      expect(r.bodyRola, 'o body não rola mais desde a #45').toBe(false);
      expect(
        Math.abs(r.topoDoConteudo - r.fimDaBarra),
        'o conteúdo começa onde a barra termina: sem faixa entre os dois (era a #43)'
      ).toBeLessThanOrEqual(1);
    });

    test('#45 — o conteúdo desvanece ao chegar no topo, em vez de ser coberto', async ({ page }) => {
      await page.goto('/agendamentos');
      await expect(page.getByRole('heading', { name: 'Agendamentos' }).first()).toBeVisible({ timeout: 15000 });
      await dispensarAvisoDeRegras(page);
      const r = await retratoDaRolagem(page);

      expect(r.mascara, 'é a máscara que apaga o conteúdo; cobrir deixava borda em dois tons').toContain('linear-gradient');
    });

    test('#45 — nada de rolagem horizontal, e sombra dos cards com espaço para existir', async ({ page }) => {
      await page.goto('/agendamentos');
      await expect(page.getByRole('heading', { name: 'Agendamentos' }).first()).toBeVisible({ timeout: 15000 });
      await dispensarAvisoDeRegras(page);
      const r = await retratoDaRolagem(page);

      expect(
        r.excessoHorizontal,
        'limitar o overflow vertical também limita o horizontal, e o .row do Bootstrap transbordava 14px'
      ).toBeLessThanOrEqual(1);
      expect(r.folgaEsquerda).toBeGreaterThanOrEqual(ESPACO_MINIMO_PARA_SOMBRA);
      expect(r.folgaDireita).toBeGreaterThanOrEqual(ESPACO_MINIMO_PARA_SOMBRA);
    });

    test('#45 — a barra não carrega mais sombra', async ({ page }) => {
      await page.goto('/agendamentos');
      await expect(page.getByRole('heading', { name: 'Agendamentos' }).first()).toBeVisible({ timeout: 15000 });
      await dispensarAvisoDeRegras(page);
      const r = await retratoDaRolagem(page);

      expect(r.sombraDaBarra, 'o cliente pediu a remoção: ela criava quebra visual').toBe('none');
    });

    test('#46 — a barra tem a mesma largura do conteúdo', async ({ page }) => {
      await page.goto('/agendamentos');
      await expect(page.getByRole('heading', { name: 'Agendamentos' }).first()).toBeVisible({ timeout: 15000 });
      await dispensarAvisoDeRegras(page);

      const bordas = await page.evaluate(() => {
        const barra = document.querySelector('.header-navbar').getBoundingClientRect();
        // A borda interna do contêiner, e não um card: qual card é "o primeiro"
        // muda com o estado da página, e medir por ele deixava o teste instável.
        // clientWidth já desconta a barra de rolagem, que é justamente o que
        // pode roubar largura do conteúdo sem mexer na barra.
        const w = document.querySelector('.content-wrapper');
        const cs = getComputedStyle(w);
        const cx = w.getBoundingClientRect();
        const c = {
          left: cx.left + parseFloat(cs.paddingLeft),
          right: cx.left + w.clientWidth - parseFloat(cs.paddingRight),
        };
        return {
          esquerda: +(barra.left - c.left).toFixed(2),
          direita: +(barra.right - c.right).toFixed(2),
        };
      });

      expect(Math.abs(bordas.esquerda), `borda esquerda fora por ${bordas.esquerda}px`).toBeLessThanOrEqual(1);
      expect(Math.abs(bordas.direita), `borda direita fora por ${bordas.direita}px`).toBeLessThanOrEqual(1);
    });

    test('#42 — o Voltar da Avulsa é igual ao do Encaminhamento', async ({ page }) => {
      await page.goto('/schedule/calendar?referral=ref-003');
      await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
      await dispensarAvisoDeRegras(page);
      const noEncaminhamento = await retratoDoVoltar(page);

      await abrirAvulsaAPagar(page);
      const naAvulsa = await retratoDoVoltar(page);

      expect(naAvulsa).toEqual(noEncaminhamento);
      expect(naAvulsa.texto).toBe('← Voltar');
      expect(naAvulsa.classe).toContain('btn-flat-secondary');
    });
  });
}
