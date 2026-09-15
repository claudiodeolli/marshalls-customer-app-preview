// Cobre as issues #41 e #42, pedidas em 15/09:
//   #41 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/41
//   #42 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/42
//   #43 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/43
const { test, expect } = require('@playwright/test');


async function dispensarAvisoDeRegras(page) {
  const entendi = page.getByRole('button', { name: 'Entendi' });
  if (await entendi.count()) await entendi.first().click();
  await expect(entendi).toHaveCount(0);
}

// A tela do print dele: avulsa a pagar, com o aviso de borda roxa.
async function abrirAvulsaAPagar(page) {
  await page.goto('/schedule/calendar');
  await page.getByText('Ortopedia', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Adquirir consulta avulsa' }).click();
  await page.getByText('Ortopedia', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Escolher agora' }).click();
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await dispensarAvisoDeRegras(page);
}

async function aguardarScrollEstavel(page) {
  await page.waitForFunction(() => {
    const agora = document.body.scrollTop;
    if (window.__ultimoScroll === agora) return true;
    window.__ultimoScroll = agora;
    return false;
  }, null, { polling: 200, timeout: 10000 });
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

for (const [nome, viewport] of [
  ['desktop', { width: 1440, height: 620 }],
  ['mobile', { width: 390, height: 620 }],
]) {
  test.describe(nome, () => {
    test.use({ viewport, deviceScaleFactor: 2, isMobile: false, hasTouch: false });

    test('#41 — nada que passa atrás da barra marca as laterais', async ({ page, context }) => {
      await abrirAvulsaAPagar(page);

      // Rola até o aviso de borda roxa atravessar o fim da faixa da barra: parte
      // dele fica sob a película, parte abaixo dela. É a situação do print dele.
      await aguardarScrollEstavel(page);
      await page.evaluate(() => {
        const aviso = document.querySelector('[data-testid="aviso-origem"]');
        const pelicula = document.querySelector('.header-navbar-shadow');
        const fim = pelicula.getBoundingClientRect().bottom;
        document.body.scrollTop += aviso.getBoundingClientRect().top - (fim - 30);
      });
      await page.waitForTimeout(400);

      const geo = await page.evaluate(() => {
        const r = s => {
          const b = document.querySelector(s).getBoundingClientRect();
          return { left: b.left, right: b.right, top: b.top, bottom: b.bottom };
        };
        return {
          rolou: document.body.scrollTop > 50,
          pelicula: r('.header-navbar-shadow'),
          navbar: r('.header-navbar'),
          aviso: r('[data-testid="aviso-origem"]'),
        };
      });

      expect(geo.rolou, 'a página precisa ter rolado para o teste valer').toBe(true);
      expect(
        geo.aviso.top < geo.pelicula.bottom && geo.aviso.bottom > geo.pelicula.bottom + 20,
        'o aviso precisa atravessar o fim da película: parte atrás dela, parte abaixo'
      ).toBe(true);

      const buffer = await page.screenshot({
        clip: { x: 0, y: 0, width: viewport.width, height: Math.ceil(geo.pelicula.bottom) + 60 },
      });

      const leitor = await context.newPage();
      await leitor.setContent('<canvas id="c"></canvas>');
      const achados = await leitor.evaluate(async ({ dados, geo }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${dados}`;
        await img.decode();
        const c = document.getElementById('c');
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const ler = (x, y) => [...ctx.getImageData(Math.round(x * 2), Math.round(y * 2), 1, 1).data].slice(0, 3);

        // A borda do aviso é roxa (208,200,248): o azul supera o vermelho em 40.
        // No fundo da página e na sombra da própria barra essa diferença fica em
        // torno de 8. Vinte separa os dois sem ambiguidade.
        const ehRoxo = ([r, , b]) => b - r >= 20;

        const colunas = [
          geo.aviso.left + 0.5, geo.aviso.left + 1.5,
          geo.aviso.right - 1.5, geo.aviso.right - 0.5,
        ];

        // Só as faixas cobertas exclusivamente pela película. O corpo da navbar
        // é opaco por conta própria e não interessa aqui.
        const faixas = [];
        for (let y = 1; y < geo.navbar.top - 1; y++) faixas.push(y);
        for (let y = geo.navbar.bottom + 2; y < geo.pelicula.bottom - 1; y++) faixas.push(y);

        const vazamentos = [];
        for (const x of colunas) {
          for (const y of faixas) {
            const cor = ler(x, y);
            if (ehRoxo(cor)) vazamentos.push({ x: Math.round(x), y, cor: cor.join(',') });
          }
        }

        // Controle: logo abaixo da película a borda roxa TEM de aparecer. Sem
        // isso o teste passaria mesmo medindo o lugar errado.
        const controle = [];
        for (let dx = -1; dx <= 3; dx++) {
          for (const base of [geo.aviso.left, geo.aviso.right - 1]) {
            for (let y = geo.pelicula.bottom + 2; y < geo.pelicula.bottom + 40; y++) {
              if (ehRoxo(ler(base + dx + 0.5, y))) controle.push({ x: Math.round(base + dx), y });
            }
          }
        }

        return {
          faixasMedidas: faixas.length,
          vazamentos: vazamentos.slice(0, 10),
          totalVazamentos: vazamentos.length,
          bordaVisivelAbaixo: controle.length,
        };
      }, { dados: buffer.toString('base64'), geo });

      // Desde a issue #43 a película termina no fim da barra. No mobile, onde a
      // barra encosta no topo, isso zera a faixa exposta: não existe região
      // coberta só pela película, e nada pode marcar ali. No desktop sobra a
      // tira acima da barra, e é nela que a medição acontece.
      if (achados.faixasMedidas === 0) {
        expect(geo.navbar.top, 'faixa zerada só se justifica com a barra no topo').toBeLessThanOrEqual(0.5);
        expect(
          geo.pelicula.bottom,
          'faixa zerada só se justifica com a película terminando no fim da barra'
        ).toBeLessThanOrEqual(geo.navbar.bottom + 0.5);
        return;
      }

      expect(
        achados.bordaVisivelAbaixo,
        'controle: abaixo da película a borda roxa precisa aparecer, senão o teste não está medindo nada'
      ).toBeGreaterThan(0);
      expect(
        achados.totalVazamentos,
        `borda roxa atravessando a faixa da barra: ${JSON.stringify(achados.vazamentos)}`
      ).toBe(0);
    });

    // A película opaca (#41) escondia também a faixa entre o fim da barra e o
    // fim dela própria, e o conteúdo passava a ser cortado longe da barra.
    test('#43 — a película termina onde a barra termina, sem faixa no meio', async ({ page }) => {
      await page.goto('/agendamentos');
      await expect(page.getByRole('heading', { name: 'Agendamentos' }).first()).toBeVisible({ timeout: 15000 });
      await dispensarAvisoDeRegras(page);
      await page.evaluate(() => { document.body.scrollTop = 300; });
      await page.waitForTimeout(400);

      const geo = await page.evaluate(() => {
        const medir = seletor => {
          const caixa = document.querySelector(seletor).getBoundingClientRect();
          return { top: caixa.top, bottom: caixa.bottom };
        };
        return {
          rolou: document.body.scrollTop > 100,
          pelicula: medir('.header-navbar-shadow'),
          navbar: medir('.header-navbar'),
        };
      });

      expect(geo.rolou, 'a barra precisa estar travada para a medição valer').toBe(true);
      const sobra = geo.pelicula.bottom - geo.navbar.bottom;
      expect(
        Math.abs(sobra),
        `sobra de película abaixo da barra: ${sobra.toFixed(2)}px — é a faixa que ele viu como quebra`
      ).toBeLessThanOrEqual(0.5);
      expect(
        geo.pelicula.bottom,
        'a película não pode terminar antes da barra, senão o conteúdo reaparece por cima dela'
      ).toBeGreaterThanOrEqual(geo.navbar.bottom - 0.5);
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
