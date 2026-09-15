// Cobre as issues #38, #39 e #40, pedidas entre 14/09 e 15/09:
//   #38 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/38
//   #39 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/39
//   #40 https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/40
// As três caem na mesma tela de marcação, por isso vivem no mesmo arquivo.
const { test, expect } = require('@playwright/test');

const ROTA_ENCAMINHAMENTO = '/schedule/calendar?referral=ref-003';
const ROTA_AVULSA_JA_PAGA = '/schedule/calendar?avulsaSpec=spec-003';

const LINHAS_ESPERADAS = {
  encaminhamento: [
    'Esta consulta é gratuita e está coberta pelo seu encaminhamento médico.',
    'Selecione a data e o horário de sua preferência para confirmar o agendamento.',
  ],
  avulsa: [
    'Você optou por uma consulta avulsa.',
    'Selecione a data e o horário desejados. O pagamento será realizado na próxima etapa.',
  ],
};

const ESPACO_PEDIDO = 16;

async function dispensarAvisoDeRegras(page) {
  const entendi = page.getByRole('button', { name: 'Entendi' });
  if (await entendi.count()) await entendi.first().click();
  await expect(entendi).toHaveCount(0);
}

async function abrirPorRota(page, rota) {
  await page.goto(rota);
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await dispensarAvisoDeRegras(page);
}

// A tela com "Realizar Pagamento" e o preço só existe neste caminho: a
// especialidade exige encaminhamento, o usuário não tem nenhum pendente e
// opta pela avulsa, escolhendo o horário antes de pagar. É a tela do print
// da issue #38. Ortopedia porque seu único encaminhamento está SCHEDULED.
async function abrirAvulsaAPagar(page) {
  await page.goto('/schedule/calendar');
  await page.getByText('Ortopedia', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Adquirir consulta avulsa' }).click();
  await page.getByText('Ortopedia', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Escolher agora' }).click();
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await dispensarAvisoDeRegras(page);
}

// Quem rola nesta aplicação é o BODY, não o documentElement: o
// `overflow-x: hidden` em `html, body` (globals.css) transforma o body em
// contêiner de rolagem. Medir `window.scrollY` aqui devolve 0 sempre, e um
// teste que olhasse para ele passaria mesmo com a tela aberta no meio.
function medirScroll(page) {
  return page.evaluate(() => ({
    scrollTop: document.body.scrollTop,
    rolavel: document.body.scrollHeight > document.body.clientHeight + 1,
  }));
}

function medirEspacosDoAviso(page) {
  return page.evaluate(() => {
    const aviso = document.querySelector('[data-testid="aviso-origem"]');
    const calendario = document.querySelector('[data-testid="calendario"]');
    const cardDaEspecialidade = aviso.previousElementSibling;
    const arredondar = n => Math.round(n * 100) / 100;
    return {
      cardEhOEsperado: cardDaEspecialidade.classList.contains('card'),
      acima: arredondar(aviso.getBoundingClientRect().top - cardDaEspecialidade.getBoundingClientRect().bottom),
      abaixo: arredondar(calendario.getBoundingClientRect().top - aviso.getBoundingClientRect().bottom),
    };
  });
}

function medirBotaoDeAcao(page) {
  return page.evaluate(() => {
    const calendario = document.querySelector('[data-testid="calendario"]');
    const botao = [...document.querySelectorAll('button')]
      .find(b => /^(Realizar Pagamento|AGENDAR)$/.test(b.textContent.trim()));
    const arredondar = n => Math.round(n * 100) / 100;
    return {
      rotulo: botao.textContent.trim(),
      altura: arredondar(botao.getBoundingClientRect().height),
      vaoAteOCalendario: arredondar(
        botao.getBoundingClientRect().top - calendario.getBoundingClientRect().bottom
      ),
    };
  });
}

for (const [nome, viewport] of [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  test.describe(nome, () => {
    test.use({ viewport });

    // ── #39 — a tela abre no começo ──────────────────────────────────────
    // Altura reduzida de propósito: em 1440x1000 a tela de marcação cabe
    // inteira e não há o que rolar, então o teste passaria sem provar nada.
    // O defeito que ele relatou só existe quando sobra conteúdo abaixo.
    test('#39 — a tela por encaminhamento abre no topo, não no calendário', async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: 640 });
      await abrirPorRota(page, ROTA_ENCAMINHAMENTO);
      // A rolagem antiga disparava 100ms depois de carregar a disponibilidade.
      await page.waitForTimeout(1200);

      const scroll = await medirScroll(page);
      expect(scroll.rolavel, 'só faz sentido cobrar o topo se houver o que rolar').toBe(true);
      expect(scroll.scrollTop).toBe(0);
      await expect(page.getByTestId('aviso-origem')).toBeInViewport();
    });

    test('#39 — a tela de avulsa já paga também abre no topo', async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: 640 });
      await abrirPorRota(page, ROTA_AVULSA_JA_PAGA);
      await page.waitForTimeout(1200);

      const scroll = await medirScroll(page);
      expect(scroll.rolavel, 'só faz sentido cobrar o topo se houver o que rolar').toBe(true);
      expect(scroll.scrollTop).toBe(0);
      await expect(page.getByTestId('aviso-origem')).toBeInViewport();
    });

    // Viewport curta de propósito: com a lista colapsando num card só, a tela
    // inteira cabe em 844px e não sobra nada para rolar — a primeira versão
    // deste teste cobrava um efeito que o tamanho da tela tornava impossível.
    test('#39/T2 — escolher a especialidade na lista continua rolando até o calendário', async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: 480 });
      await page.goto('/schedule/calendar');
      await page.getByText('Nutrição', { exact: true }).first().click();
      await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
      await dispensarAvisoDeRegras(page);
      await page.waitForTimeout(1200);

      const scroll = await medirScroll(page);

      expect(scroll.rolavel, 'a viewport curta precisa deixar a página rolável').toBe(true);
      expect(
        scroll.scrollTop,
        'a rolagem que responde a um clique dele não foi pedida para sair'
      ).toBeGreaterThan(0);
    });

    // ── #40 — espaçamento, duas linhas e ícone ───────────────────────────
    for (const [origem, rota] of [
      ['encaminhamento', ROTA_ENCAMINHAMENTO],
      ['avulsa', ROTA_AVULSA_JA_PAGA],
    ]) {
      test(`#40 — ${origem}: o espaço acima do aviso é igual ao de baixo`, async ({ page }) => {
        await abrirPorRota(page, rota);
        const espacos = await medirEspacosDoAviso(page);

        expect(espacos.cardEhOEsperado, 'o elemento acima do aviso é o card da especialidade').toBe(true);
        expect(espacos.acima).toBeCloseTo(ESPACO_PEDIDO, 1);
        expect(espacos.abaixo).toBeCloseTo(ESPACO_PEDIDO, 1);
        expect(espacos.acima).toBeCloseTo(espacos.abaixo, 1);
      });

      test(`#40 — ${origem}: o aviso vem em duas linhas, com os textos dele`, async ({ page }) => {
        await abrirPorRota(page, rota);
        const linhas = page.getByTestId('aviso-linha');

        await expect(linhas).toHaveCount(2);
        await expect(linhas).toHaveText(LINHAS_ESPERADAS[origem]);
      });

      test(`#40 — ${origem}: o ícone é o de informação, com o ponto em cima`, async ({ page }) => {
        await abrirPorRota(page, rota);

        const glifo = await page.getByTestId('aviso-origem').locator('svg').evaluate(svg => {
          const linhas = [...svg.querySelectorAll('line')].map(l => ({
            y1: l.getAttribute('y1'),
            y2: l.getAttribute('y2'),
          }));
          return {
            ponto: linhas.find(l => l.y1 === l.y2)?.y1 ?? null,
            haste: linhas.find(l => l.y1 !== l.y2) ?? null,
          };
        });

        expect(glifo.ponto, 'o ponto do ícone fica em cima (y=8)').toBe('8');
        expect(
          Number(glifo.haste.y1) > Number(glifo.ponto),
          'a haste desce abaixo do ponto — era o contrário, que é o ícone de alerta'
        ).toBe(true);
      });
    }

    // ── #38 — o botão da avulsa igual ao do encaminhamento ───────────────
    test('#38 — o botão da avulsa tem a mesma altura e o mesmo vão do calendário', async ({ page }) => {
      await abrirPorRota(page, ROTA_ENCAMINHAMENTO);
      const encaminhamento = await medirBotaoDeAcao(page);

      await abrirAvulsaAPagar(page);
      const avulsa = await medirBotaoDeAcao(page);

      console.log(`[${nome}] encaminhamento: ${JSON.stringify(encaminhamento)}`);
      console.log(`[${nome}] avulsa:         ${JSON.stringify(avulsa)}`);

      expect(encaminhamento.rotulo).toBe('AGENDAR');
      expect(avulsa.rotulo, 'o rótulo não foi pedido para mudar').toBe('Realizar Pagamento');
      expect(avulsa.altura).toBeCloseTo(encaminhamento.altura, 1);
      expect(avulsa.vaoAteOCalendario).toBeCloseTo(encaminhamento.vaoAteOCalendario, 1);
    });
  });
}
