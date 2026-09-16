// Cobre as issues #42 e #47:
//   #42 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/42
//   #47 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/47
//
// A #47 replicou o modelo de rolagem do projeto de referência do cliente e, com
// isso, aposentou o caminho das #41, #43, #44, #45 e #46. O que aquelas issues
// pediam continua exigido aqui, na forma que o modelo novo permite: barra
// imóvel, conteúdo passando por trás, nenhuma emenda nas bordas.
const { test, expect } = require('@playwright/test');

async function dispensarAvisoDeRegras(page) {
  const entendi = page.getByRole('button', { name: 'Entendi' });
  if (await entendi.count()) await entendi.first().click();
  await expect(entendi).toHaveCount(0);
}

async function abrirAgendamentos(page) {
  await page.goto('/agendamentos');
  await expect(page.getByRole('heading', { name: 'Agendamentos' }).first()).toBeVisible({ timeout: 15000 });
  await dispensarAvisoDeRegras(page);
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

function medir(page) {
  return page.evaluate(() => {
    const caixa = seletor => {
      const b = document.querySelector(seletor).getBoundingClientRect();
      return {
        top: Number(b.top.toFixed(2)),
        bottom: Number(b.bottom.toFixed(2)),
        left: Number(b.left.toFixed(2)),
        right: Number(b.right.toFixed(2)),
      };
    };
    const app = document.querySelector('.app-content');
    const estiloApp = getComputedStyle(app);
    const caixaApp = app.getBoundingClientRect();
    const pelicula = document.querySelector('.header-navbar-shadow');
    const estiloPelicula = getComputedStyle(pelicula);
    return {
      scrollY: window.scrollY,
      bodyScrollTop: document.body.scrollTop,
      overflowHtml: getComputedStyle(document.documentElement).overflow,
      documentoRolavel: document.documentElement.scrollHeight > window.innerHeight + 1,
      larguraJanela: window.innerWidth,
      navbar: caixa('.header-navbar'),
      navbarPosicao: getComputedStyle(document.querySelector('.header-navbar')).position,
      pelicula: caixa('.header-navbar-shadow'),
      peliculaVisivel: estiloPelicula.display !== 'none',
      peliculaPosicao: estiloPelicula.position,
      peliculaGradiente: estiloPelicula.backgroundImage.includes('gradient'),
      conteudo: caixa('.content-wrapper'),
      // A área útil do conteúdo é o content box do .app-content.
      areaDeConteudo: {
        left: Number((caixaApp.left + parseFloat(estiloApp.paddingLeft)).toFixed(2)),
        right: Number((caixaApp.right - parseFloat(estiloApp.paddingRight)).toFixed(2)),
      },
    };
  });
}

for (const [nome, viewport] of [
  ['desktop', { width: 1440, height: 700 }],
  ['mobile', { width: 390, height: 700 }],
]) {
  test.describe(nome, () => {
    test.use({ viewport });

    test('#47 — quem rola é a viewport, como no projeto de referência', async ({ page }) => {
      await abrirAgendamentos(page);
      await page.evaluate(() => window.scrollTo(0, 320));
      await page.waitForTimeout(400);
      const m = await medir(page);

      expect(m.documentoRolavel, 'o documento precisa poder rolar').toBe(true);
      expect(m.overflowHtml, 'com o html não-visible o body vira o scroller').toContain('visible');
      expect(m.scrollY, 'é a viewport que anda').toBeGreaterThan(0);
      expect(m.bodyScrollTop, 'o body não é mais contêiner de rolagem').toBe(0);
    });

    test('#47 — a barra fica imóvel e o conteúdo passa por trás dela', async ({ page }) => {
      await abrirAgendamentos(page);
      const parada = await medir(page);
      await page.evaluate(() => window.scrollTo(0, 320));
      await page.waitForTimeout(400);
      const rolada = await medir(page);

      expect(rolada.navbarPosicao).toBe('fixed');
      expect(rolada.navbar.top, 'a barra não se move ao rolar').toBeCloseTo(parada.navbar.top, 1);
      expect(
        rolada.conteudo.top,
        'o conteúdo sobe por trás da barra em vez de ser cortado nela'
      ).toBeLessThan(rolada.navbar.top);
    });

    test('#47 — a película cobre a janela inteira, sem emenda nas bordas', async ({ page }) => {
      await abrirAgendamentos(page);
      const m = await medir(page);

      expect(m.peliculaVisivel, 'a película é o efeito que ele pediu em 12/09').toBe(true);
      expect(m.peliculaPosicao).toBe('fixed');
      expect(m.peliculaGradiente).toBe(true);
      // A emenda das issues #37 e #41 nascia de a película parar na borda do
      // conteúdo. Cobrindo a janela toda, não há onde a emenda se formar.
      expect(m.pelicula.left, 'começa na borda da janela').toBeCloseTo(0, 1);
      expect(m.pelicula.right, 'termina na borda da janela').toBeCloseTo(m.larguraJanela, 1);
    });

    test('#47 — a barra tem a mesma largura da área de conteúdo', async ({ page }) => {
      await abrirAgendamentos(page);
      const m = await medir(page);

      expect(Math.abs(m.navbar.left - m.areaDeConteudo.left)).toBeLessThanOrEqual(1);
      expect(Math.abs(m.navbar.right - m.areaDeConteudo.right)).toBeLessThanOrEqual(1);
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
