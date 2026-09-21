// Cobre as issues #42 e #47:
//   #42 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/42
//   #47 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/47
//   #49 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/49
//
// A #47 replicou o modelo de rolagem do projeto de referência do cliente e, com
// isso, aposentou o caminho das #41, #43, #44, #45 e #46. O que aquelas issues
// pediam continua exigido aqui, na forma que o modelo novo permite: barra
// imóvel, conteúdo passando por trás, nenhuma emenda nas bordas.
const { test, expect } = require('@playwright/test');

// O aviso pode montar um instante depois da tela, e um clique que chega antes
// do handler não o fecha. Por isso: dá um tempo curto para ele aparecer e
// repete o clique até ele sumir, em vez de clicar uma vez só (issue #52).
async function dispensarAvisoDeRegras(page) {
  const entendi = page.getByRole('button', { name: 'Entendi' });
  await entendi.first().waitFor({ state: 'visible', timeout: 1500 }).catch(() => {});
  await expect(async () => {
    if (await entendi.count()) await entendi.first().click({ timeout: 1000 });
    await expect(entendi).toHaveCount(0, { timeout: 1000 });
  }).toPass({ timeout: 10000 });
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

// As três faixas de largura ficam no mesmo lugar de propósito: é o que impede
// um pedido novo de desfazer um antigo sem ninguém perceber. Foi assim que a
// #46, pedida para uma janela estreita de desktop, desconfigurou o celular.
test.describe('largura da barra em cada faixa', () => {
  test('#47 — em 1440 a barra acompanha a área de conteúdo', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 700 });
    await abrirAgendamentos(page);
    const m = await medir(page);

    expect(Math.abs(m.navbar.left - m.areaDeConteudo.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(m.navbar.right - m.areaDeConteudo.right)).toBeLessThanOrEqual(1);
  });

  test('#46 — em 1100 a barra continua acompanhando o conteúdo', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 700 });
    await abrirAgendamentos(page);
    const m = await medir(page);

    expect(
      Math.abs(m.navbar.left - m.areaDeConteudo.left),
      'a janela estreita de desktop foi o que originou a #46'
    ).toBeLessThanOrEqual(1);
    expect(Math.abs(m.navbar.right - m.areaDeConteudo.right)).toBeLessThanOrEqual(1);
  });

  test('#49 — no celular a barra encosta nas bordas', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await abrirAgendamentos(page);
    const m = await medir(page);

    expect(m.navbar.top, 'sem respiro acima').toBeCloseTo(0, 1);
    expect(m.navbar.left, 'encosta na borda esquerda').toBeCloseTo(0, 1);
    expect(m.navbar.right, 'encosta na borda direita').toBeCloseTo(m.larguraJanela, 1);
    expect(
      m.navbar.bottom - m.navbar.top,
      'só as margens mudaram: a altura vem do Navbar.js e continua a mesma'
    ).toBeCloseTo(70.38, 1);
  });
});

// Mesma ideia da suíte acima, agora para o recuo lateral do conteúdo. As
// quatro faixas ficam juntas porque a #50 nasceu de uma delas atropelar a
// outra: abaixo de 576px o tema soma o padding do .app-content ao do
// .content-wrapper, e o recuo dobrou quando a #47 removeu o zeramento.
//
// Quem é medido é o .content-body, e não um .card: qual elemento é o primeiro
// .card muda conforme a largura e conforme o aviso de regras ter sido
// dispensado ou não, e isso já produziu número errado aqui.
test.describe('recuo lateral do conteúdo em cada faixa', () => {
  const RECUO_DO_DEFEITO = 44.09;

  const medirRecuo = page => page.evaluate(() => {
    const arredondar = n => Math.round(n * 100) / 100;
    const corpo = document.querySelector('.content-body').getBoundingClientRect();
    return {
      esquerda: arredondar(corpo.left),
      direita: arredondar(window.innerWidth - corpo.right),
      largura: arredondar(corpo.width),
      altura: arredondar(corpo.height),
      janela: window.innerWidth,
    };
  });

  // Sem isto o teste passaria medindo um contêiner vazio ou colapsado.
  const conferirQueHaConteudo = r => {
    expect(r.altura, 'o .content-body precisa ter conteúdo para a medida valer').toBeGreaterThan(100);
    expect(r.largura).toBeCloseTo(r.janela - r.esquerda - r.direita, 1);
  };

  // O emulador mobile do Playwright (isMobile) arredonda o layout de um jeito
  // próprio: o mesmo recuo mede 27,64 numa execução e 27,81 na seguinte. A
  // folga de 1px absorve isso sem perder poder de detecção — o defeito da #50
  // era 44,09px, quase 17px acima do alvo.
  const esperarRecuo = (r, alvo, folga = 1) => {
    for (const [lado, valor] of [['esquerdo', r.esquerda], ['direito', r.direita]]) {
      expect(valor, `recuo ${lado}`).toBeGreaterThan(alvo - folga);
      expect(valor, `recuo ${lado}`).toBeLessThan(alvo + folga);
      expect(valor, `recuo ${lado} de volta ao defeito da #50`).toBeLessThan(RECUO_DO_DEFEITO - 5);
    }
  };

  test('#50 — no celular o conteúdo volta a 27,3px, sem os paddings somados', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await abrirAgendamentos(page);
    const r = await medirRecuo(page);

    conferirQueHaConteudo(r);
    esperarRecuo(r, 27.3);
  });

  test('#50 — em 360 o recuo é o mesmo que em 390', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await abrirAgendamentos(page);
    const r = await medirRecuo(page);

    conferirQueHaConteudo(r);
    esperarRecuo(r, 27.3);
  });

  // 576px é a borda de cima do recorte da #50. Acima dela o .content-wrapper
  // já tem padding zero e quem recua é só o .app-content — se a regra da #50
  // vazar para cá, este número muda.
  test('#50 — em 600 o recuo continua o do tema, fora do alcance da regra', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 780 });
    await abrirAgendamentos(page);
    const r = await medirRecuo(page);

    conferirQueHaConteudo(r);
    // Mesma folga de 2px da faixa de 1100: aqui a página já tem barra de
    // rolagem clássica e o emulador desloca a medida em ~1,5px.
    esperarRecuo(r, 24, 2);
  });

  // Não há aqui um teste de 1100 ou 1440 medindo o .content-body: naquelas
  // larguras o emulador devolve de 28 a 30,12 para o mesmo layout, e nenhuma
  // tolerância útil sobrevive a isso. O que aquelas faixas precisam provar —
  // barra e conteúdo alinhados — já é provado pelos testes "#47 — em 1440" e
  // "#46 — em 1100" da suíte acima, que comparam as duas caixas pelo mesmo
  // critério e por isso não sofrem o desvio.
});
