// A tabela que o cliente mandou em 27/08 lista as sete possibilidades do
// filtro "Agendadas" com o texto literal de cada uma, repetidas para as duas
// origens. Ele confere a tela contra essa tabela.
//
// Os cards da vitrine têm a contagem congelada (stageDetail, em mockData.js)
// justamente para bater com ela: com prazos relativos, um card de 59 minutos
// já mostrava 52 quando ele abria a página.
const { test, expect } = require('@playwright/test');

const TABELA = [
  { rotulo: 'faltando dias',        texto: 'Sua consulta será em 12 dias!',      icone: 'calendar',     reagendar: true },
  { rotulo: 'faltando 48 horas',    texto: 'Sua consulta será em 2 dias!',       icone: 'calendar',     reagendar: true },
  { rotulo: 'faltando 47:59 horas', texto: 'Sua consulta será em 2 dias!',       icone: 'calendar',     reagendar: false },
  { rotulo: 'faltando 24 horas',    texto: 'Sua consulta é amanhã!',             icone: 'calendar',     reagendar: false },
  { rotulo: 'faltando 23 horas',    texto: 'Sua consulta será daqui a 23 horas!', icone: 'three_oclock', reagendar: false },
  { rotulo: 'faltando 59 minutos',  texto: 'Sua consulta começa em 59 minutos!', icone: 'three_oclock', reagendar: false },
  { rotulo: 'faltando 15 minutos',  texto: 'Sua consulta começa em 15 minutos!', icone: 'three_oclock', reagendar: false, liberado: true },
];

/** Lê os cards agendados visíveis, na ordem em que aparecem na tela. */
async function lerVitrine(page) {
  return page.locator('.card >> visible=true').evaluateAll(cards => cards.map(card => {
    const texto = card.innerText;
    if (!/Consulta agendada/.test(texto)) return null;
    const contador = card.querySelector('[data-testid="countdown"]');
    return {
      origem: /Origem:\s*Encaminhamento/.test(texto) ? 'Encaminhamento' : 'Consulta avulsa',
      texto: (contador?.innerText ?? '').split('\n').map(l => l.trim()).filter(Boolean).pop() ?? '',
      icone: [...(contador?.querySelectorAll('img') ?? [])]
        .map(img => (img.getAttribute('src') ?? '').split('/').pop().replace('_3d.png', ''))[0] ?? '',
      reagendar: /Reagendar/.test(texto),
      liberado: /Você já pode entrar!/.test(texto),
    };
  }).filter(Boolean));
}

for (const [nome, viewport] of [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  test.describe(nome, () => {
    test.use({ viewport });

    test.beforeEach(async ({ page }) => {
      await page.goto('/agendamentos');
      await expect(page.locator('[data-testid="countdown"] >> visible=true').first())
        .toBeVisible({ timeout: 15000 });
    });

    test('As 7 possibilidades de Encaminhamento vêm primeiro, exatamente como na tabela', async ({ page }) => {
      const serie = (await lerVitrine(page)).filter(c => c.origem === 'Encaminhamento');

      expect(serie.length, 'a tabela pede 7 possibilidades').toBe(7);
      serie.forEach((card, i) => {
        expect(card.texto, TABELA[i].rotulo).toBe(TABELA[i].texto);
        expect(card.icone, `${TABELA[i].rotulo}: ícone`).toBe(TABELA[i].icone);
      });
    });

    test('E logo abaixo as mesmas 7 de Consulta avulsa, com os mesmos textos', async ({ page }) => {
      const cards = await lerVitrine(page);
      const serie = cards.filter(c => c.origem === 'Consulta avulsa');

      expect(serie.length).toBe(7);
      serie.forEach((card, i) => {
        expect(card.texto, TABELA[i].rotulo).toBe(TABELA[i].texto);
        expect(card.icone, `${TABELA[i].rotulo}: ícone`).toBe(TABELA[i].icone);
      });

      // "primeiro ... e depois, abaixo": nenhuma Avulsa pode aparecer antes
      // da última Encaminhamento.
      const origens = cards.map(c => c.origem);
      expect(origens.lastIndexOf('Encaminhamento')).toBeLessThan(origens.indexOf('Consulta avulsa'));
    });

    test('Só o estágio de 48 horas ainda oferece Reagendar', async ({ page }) => {
      for (const serie of ['Encaminhamento', 'Consulta avulsa']) {
        const cards = (await lerVitrine(page)).filter(c => c.origem === serie);
        expect(cards.map(c => c.reagendar), serie).toEqual(TABELA.map(t => t.reagendar));
      }
    });

    test('Só o último estágio traz o círculo verde de liberação', async ({ page }) => {
      for (const serie of ['Encaminhamento', 'Consulta avulsa']) {
        const cards = (await lerVitrine(page)).filter(c => c.origem === serie);
        expect(cards.map(c => c.liberado), serie).toEqual(TABELA.map(t => t.liberado === true));
      }
    });
  });
}

test('A contagem da vitrine não escorrega com o tempo', async ({ page }) => {
  // O motivo de existir o demoMinutes: antes, deixar a página aberta fazia
  // "59 minutos" virar "52 minutos" e a tela deixava de bater com a tabela.
  await page.goto('/agendamentos');
  await expect(page.locator('[data-testid="countdown"] >> visible=true').first()).toBeVisible({ timeout: 15000 });

  const antes = (await lerVitrine(page)).map(c => c.texto);
  await page.reload();
  await expect(page.locator('[data-testid="countdown"] >> visible=true').first()).toBeVisible({ timeout: 15000 });

  expect((await lerVitrine(page)).map(c => c.texto)).toEqual(antes);
});
