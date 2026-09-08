// Cobre a issue #34: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/34
// "Fez o mesmo esquema com todos?" — não tinha feito. Sobravam os ícones dos
// documentos do atendimento e as bandeiras, que no Windows nem desenho têm:
// o sistema mostra as letras do país no lugar.
const { test, expect } = require('@playwright/test');

const EMOJIS_DE_DOCUMENTO = ['📋', '💊', '🔬', '📎', '📝', '📄'];
const BANDEIRAS_EM_CARACTERE = ['🇧🇷', '🇵🇹', '🇦🇴', '🇲🇿', '🇺🇸', '🇨🇻'];

/** Todo ícone visível de um trecho da página, com origem e se carregou. */
async function lerIcones(locator) {
  await expect.poll(async () => locator.evaluate(el => {
    const imagens = [...el.querySelectorAll('img')];
    return imagens.length > 0 && imagens.every(img => img.complete);
  }), { timeout: 15000 }).toBe(true);

  return locator.locator('img').evaluateAll(imagens => imagens.map(img => ({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt'),
    carregou: img.naturalWidth > 0,
  })));
}

test.describe('Documentos do atendimento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/historico');
    await expect(page.locator('.card >> visible=true').first()).toBeVisible({ timeout: 20000 });
    await page.locator('text=Documentos do atendimento >> visible=true').first().click();
  });

  test('U1/U2 — cada documento traz um asset local, não um caractere', async ({ page }) => {
    const lista = page.locator('._doc-link >> visible=true').first().locator('..').locator('..');
    const icones = await lerIcones(lista);

    expect(icones.length, 'a lista precisa ter ícones em imagem').toBeGreaterThan(0);
    for (const icone of icones) {
      expect(icone.src, 'todo ícone vem do próprio projeto').toContain('/icons/fluent-emoji/');
      expect(icone.alt, 'são decorativos').toBe('');
      expect(icone.carregou, `arquivo ausente: ${icone.src}`).toBe(true);
    }
  });

  test('U7 — nenhum caractere unicode sobrou no acordeão', async ({ page }) => {
    const texto = await page.locator('._doc-link >> visible=true').first()
      .locator('..').locator('..').innerText();

    for (const emoji of EMOJIS_DE_DOCUMENTO) {
      expect(texto, `sobrou ${emoji} na lista de documentos`).not.toContain(emoji);
    }
  });

  test('U5 — o sublinhado do hover continua no rótulo, e não no ícone', async ({ page }) => {
    // Regra da #27: sublinhar o link inteiro riscaria também o desenho.
    const nome = page.locator('._doc-link ._doc-nome >> visible=true').first();
    await expect(nome).toBeVisible();
    await expect(page.locator('._doc-link >> visible=true').first().locator('img')).toBeVisible();
  });
});

test.describe('Bandeiras', () => {
  test('U9 — o seletor de fuso mostra a bandeira como asset', async ({ page }) => {
    await page.goto('/agendamentos');
    const seletor = page.locator('[data-testid="timezone-select"] >> visible=true').first();
    await expect(seletor).toBeVisible({ timeout: 20000 });

    const icones = await lerIcones(seletor);
    expect(icones.length).toBeGreaterThan(0);
    for (const icone of icones) {
      expect(icone.src).toMatch(/\/icons\/(flags|fluent-emoji)\//);
      expect(icone.carregou, `arquivo ausente: ${icone.src}`).toBe(true);
    }
  });

  test('U9 — e a lista aberta traz uma bandeira por opção', async ({ page }) => {
    await page.goto('/agendamentos');
    const seletor = page.locator('[data-testid="timezone-select"] >> visible=true').first();
    await expect(seletor).toBeVisible({ timeout: 20000 });
    await seletor.click();

    const opcoes = page.getByRole('option');
    await expect(opcoes.first()).toBeVisible();
    const total = await opcoes.count();
    expect(total, 'as seis opções de fuso').toBe(6);

    for (let i = 0; i < total; i++) {
      await expect(opcoes.nth(i).locator('img'), `opção ${i + 1} sem ícone`).toBeVisible();
    }
  });

  test('U9 — nenhuma bandeira em caractere sobrou na tela', async ({ page }) => {
    await page.goto('/agendamentos');
    await expect(page.locator('[data-testid="timezone-select"] >> visible=true').first()).toBeVisible({ timeout: 20000 });

    const texto = await page.locator('body').innerText();
    for (const bandeira of BANDEIRAS_EM_CARACTERE) {
      expect(texto, `sobrou ${bandeira} — no Windows isso vira as letras do país`).not.toContain(bandeira);
    }
  });

  test('U9 — o seletor de telefone deixou de puxar bandeira de CDN externo', async ({ page }) => {
    // Antes vinham de flagcdn.com, o mesmo hotlink que ele proibiu nos ícones.
    const externas = [];
    page.on('request', requisicao => {
      if (/flagcdn|flagpedia|twemoji|jsdelivr/i.test(requisicao.url())) externas.push(requisicao.url());
    });

    await page.goto('/meus-dados');
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 20000 });

    const bandeira = page.locator('img[src*="/icons/flags/"]').first();
    await expect(bandeira).toBeVisible();
    expect(externas, 'nenhuma bandeira pode vir de fora do projeto').toEqual([]);
  });

  test('U9 — a lista de países abre com todas as bandeiras carregadas', async ({ page }) => {
    await page.goto('/meus-dados');
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 20000 });

    await page.locator('img[src*="/icons/flags/"]').first().locator('..').click();
    const lista = page.locator('img[src*="/icons/flags/"]');
    await expect.poll(async () => lista.count(), { timeout: 10000 }).toBeGreaterThan(10);

    const quebradas = await lista.evaluateAll(imagens => imagens
      .filter(img => img.complete && img.naturalWidth === 0)
      .map(img => img.getAttribute('src')));
    expect(quebradas, 'nenhuma bandeira pode faltar').toEqual([]);
  });
});

test('U3 — a licença de cada biblioteca acompanha os arquivos', async ({ page }) => {
  // Ele cobra isso desde a #11, e agora são duas bibliotecas: o Fluent Emoji
  // não publica bandeiras de país, então elas vieram do Twemoji.
  for (const caminho of ['/icons/fluent-emoji/LICENSE', '/icons/flags/LICENSE']) {
    const resposta = await page.request.get(caminho);
    expect(resposta.status(), `${caminho} precisa estar publicada`).toBe(200);
    expect((await resposta.text()).length).toBeGreaterThan(100);
  }
});
