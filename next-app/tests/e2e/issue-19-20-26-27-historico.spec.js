// Cobre as issues #19, #20, #26 e #27, todas na tela de Histórico:
//   #19 — o preview acumulava no navegador os agendamentos feitos por quem
//         acessa, e cada aparelho mostrava uma coisa
//   #20 — os ícones da modal "Detalhes da compra" viram assets locais
//   #26 — "Consulta não realizada" escondia o Início, e a modal do
//         encaminhamento abria vazia
//   #27 — nome de documento sem sublinhado no hover
const { test, expect } = require('@playwright/test');

const CHAVE_VERSAO = 'PREVIEW_STATE_VERSION';

/** Cards visíveis do Histórico, com o que cada um mostra. */
async function lerCards(page) {
  return page.locator('.card >> visible=true').evaluateAll(cards => cards.map(card => {
    const texto = card.innerText;
    if (!/Tipo:/.test(texto)) return null;
    return {
      texto,
      naoRealizada: /Consulta não realizada/.test(texto),
      encaminhamento: /Origem\s*\n?\s*Encaminhamento/.test(texto),
      temInicio: /Início:/.test(texto),
      verEncaminhamento: /Ver encaminhamento/.test(texto),
    };
  }).filter(Boolean));
}

test.beforeEach(async ({ page }) => {
  await page.goto('/historico');
  await expect(page.locator('.card >> visible=true').first()).toBeVisible({ timeout: 20000 });
});

test('I1 — "Consulta não realizada" volta a mostrar o Início', async ({ page }) => {
  const naoRealizadas = (await lerCards(page)).filter(c => c.naoRealizada);

  expect(naoRealizadas.length, 'o mock precisa ter cards de não realizada').toBeGreaterThan(0);
  for (const card of naoRealizadas) {
    expect(card.temInicio, 'card de não realizada sem o horário que seria a consulta').toBe(true);
  }
});

test('I5 — o card de encaminhamento sempre traz o "Ver encaminhamento"', async ({ page }) => {
  // O da avulsa nunca dependeu do status para mostrar o "Detalhes da compra";
  // o do encaminhamento dependia, e sumia justamente na não realizada.
  const encaminhamentos = (await lerCards(page)).filter(c => c.encaminhamento);

  expect(encaminhamentos.length).toBeGreaterThan(0);
  for (const card of encaminhamentos) {
    expect(card.verEncaminhamento, 'card de encaminhamento sem o link').toBe(true);
  }
});

test('I4 — a modal do encaminhamento nunca abre vazia', async ({ page }) => {
  const links = page.locator('button:text-is("Ver encaminhamento") >> visible=true');
  const total = await links.count();
  expect(total).toBeGreaterThan(0);

  for (let i = 0; i < total; i++) {
    await links.nth(i).click();
    const modal = page.getByTestId('modal-encaminhamento');
    await expect(modal).toBeVisible();

    // Ou traz conteúdo, ou diz que não há — o que não pode é a moldura vazia.
    const corpo = (await modal.innerText()).replace(/Encaminhamento|Fechar|×/g, '').trim();
    expect(corpo.length, `modal ${i + 1} abriu sem nada`).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'Fechar' }).click();
    await expect(page.getByRole('heading', { name: 'Encaminhamento' })).toHaveCount(0);
  }
});

test('P1/P2/P3 — os ícones da modal de compra são assets locais', async ({ page }) => {
  await page.locator('button:text-is("Detalhes da compra") >> visible=true').first().click();
  const modal = page.getByTestId('modal-compra');
  await expect(modal).toBeVisible();

  // `complete` antes de ler naturalWidth: o <img> entra no layout com a caixa
  // reservada bem antes de o arquivo chegar. Como `complete` também vira true
  // quando o download falha, um arquivo faltando continua reprovando.
  await expect.poll(async () => modal.evaluate(el => {
    const imgs = [...el.querySelectorAll('img')];
    return imgs.length > 0 && imgs.every(img => img.complete);
  }), { timeout: 15000 }).toBe(true);

  const icones = await modal.locator('img').evaluateAll(imgs => imgs.map(img => ({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt'),
    carregou: img.naturalWidth > 0,
  })));

  expect(icones.length, 'a modal precisa dos ícones em imagem').toBeGreaterThan(0);
  for (const icone of icones) {
    expect(icone.src, 'todo ícone vem do próprio projeto').toContain('/icons/fluent-emoji/');
    expect(icone.alt, 'são decorativos').toBe('');
    expect(icone.carregou, `arquivo ausente: ${icone.src}`).toBe(true);
  }
});

test('P11 — o "Parcelamento" usa a folha que ele pediu, não a prancheta', async ({ page }) => {
  // Ele mandou `FileText` na lista de 12/08; o código tinha 📋, que é outro
  // desenho. Mesma divergência de glifo da #11.
  //
  // Só a compra no cartão mostra parcelamento, então o teste procura essa
  // compra em vez de desistir no primeiro card que encontrar.
  const links = page.locator('button:text-is("Detalhes da compra") >> visible=true');
  const total = await links.count();
  expect(total).toBeGreaterThan(0);

  let encontrou = false;
  for (let i = 0; i < total && !encontrou; i++) {
    await links.nth(i).click();
    const modal = page.getByTestId('modal-compra');
    await expect(modal).toBeVisible();

    // text-transform deixa o rótulo em caixa alta, e innerText devolve o
    // texto já transformado.
    if (/parcelamento/i.test(await modal.innerText())) {
      await expect(modal.locator('img[src*="page_facing_up"]')).toBeVisible();
      encontrou = true;
    }
    // A modal de compra fecha pelo botão; Esc não é tratado nela.
    await page.getByRole('button', { name: 'Fechar' }).click();
    await expect(page.getByRole('heading', { name: 'Detalhes da compra' })).toHaveCount(0);
  }

  expect(encontrou, 'o mock precisa de ao menos uma compra parcelada').toBe(true);
});

test('P2 — não sobrou caractere unicode no lugar dos ícones', async ({ page }) => {
  await page.locator('button:text-is("Detalhes da compra") >> visible=true').first().click();
  const modal = page.getByTestId('modal-compra');
  await expect(modal).toBeVisible();

  const texto = await modal.innerText();
  for (const emoji of ['🛒', '🩺', '👤', '📅', '💰', '💳', '📋', '⚡', '✅']) {
    expect(texto, `sobrou ${emoji}`).not.toContain(emoji);
  }
});

// O sublinhado do hover vive sob `@media (hover: hover)`, para o link não
// ficar riscado depois de um toque. O viewport padrão da suíte é o do iPhone
// 13, onde essa media query não casa — daí o contexto com ponteiro.
test.describe('com ponteiro', () => {
  test.use({ viewport: { width: 1440, height: 1000 }, hasTouch: false, isMobile: false });

  test.beforeEach(async ({ page }) => {
    await page.goto('/historico');
    await expect(page.locator('.card >> visible=true').first()).toBeVisible({ timeout: 20000 });
  });

  test('D1/D3/D4 — o nome do documento sublinha no hover, sem mudar de tamanho', async ({ page }) => {
    const accordion = page.locator('text=Documentos do atendimento >> visible=true').first();
    await accordion.click();

    const nome = page.locator('._doc-link ._doc-nome >> visible=true').first();
    await expect(nome).toBeVisible();

      const medir = () => nome.evaluate(el => {
      const estilo = getComputedStyle(el);
      return { sublinhado: estilo.textDecorationLine, tamanho: estilo.fontSize };
    });

    const antes = await medir();
    expect(antes.sublinhado).toBe('none');

    await nome.hover();
    const depois = await medir();

    expect(depois.sublinhado, 'faltava justamente o sublinhado no hover').toBe('underline');
    expect(depois.tamanho, 'ele pediu para manter o tamanho da fonte').toBe(antes.tamanho);
  });

  test('D5 — vale para todos os documentos da lista, não só o primeiro', async ({ page }) => {
    const accordion = page.locator('text=Documentos do atendimento >> visible=true').first();
    await accordion.click();

    const nomes = page.locator('._doc-link ._doc-nome >> visible=true');
    const total = await nomes.count();
    expect(total).toBeGreaterThan(0);

    for (let i = 0; i < total; i++) {
      await nomes.nth(i).hover();
      const sublinhado = await nomes.nth(i).evaluate(el => getComputedStyle(el).textDecorationLine);
      expect(sublinhado, `documento ${i + 1} sem sublinhado`).toBe('underline');
    }
  });
});

test('#19 — o estado guardado no navegador é zerado uma vez e a versão fica marcada', async ({ page }) => {
  const versao = await page.evaluate(chave => localStorage.getItem(chave), CHAVE_VERSAO);
  expect(versao, 'a limpeza precisa deixar sua marca, senão repetiria a cada visita').toBeTruthy();

  const sobrou = await page.evaluate(() => localStorage.getItem('MOCK_HISTORY'));
  expect(sobrou, 'o acúmulo antigo não pode sobreviver à limpeza').toBeNull();
});

test('#19 — mas o que o visitante criar depois disso continua guardado', async ({ page }) => {
  // A limpeza é uma vez por versão; ela não pode virar um "esquece tudo" a
  // cada carregamento, senão o fluxo de agendamento perderia o desfecho.
  await page.evaluate(() => localStorage.setItem('MOCK_HISTORY', JSON.stringify([{
    uuid: 'ls-teste', type: 'scheduled', status: 'SCHEDULED',
    appointmentBegin: '01/01/2027 10:00', appointmentEnd: null,
    professional: { name: 'Teste', specialties: [{ name: 'Teste' }] },
    beneficiaryMedicalReferral: null, documents: [],
    createdAt: '01/01/2027 10:00:00', updatedAt: '01/01/2027 10:00:00',
  }])));
  await page.reload();
  await expect(page.locator('.card >> visible=true').first()).toBeVisible({ timeout: 20000 });

  const guardado = await page.evaluate(() => localStorage.getItem('MOCK_HISTORY'));
  expect(guardado, 'a persistência precisa continuar valendo').toContain('teste');
});
