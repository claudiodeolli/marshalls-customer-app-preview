// Cobre a issue #12: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/12
// O print do cliente traz o texto literal de cada estágio da contagem.
//
// A primeira versão deste spec rodava só em desktop, e por isso não viu que
// o card do mobile mostrava uma forma abreviada ("12 dias") em vez da frase.
// A tabela do cliente não separa desktop de mobile: são as mesmas 7
// possibilidades, ditas do mesmo jeito. Daí os dois viewports aqui.
const { test, expect } = require('@playwright/test');

// Cada estágio pelo médico que o representa na série de demonstração, e o
// texto exato que o print especifica.
const ESTAGIOS = [
  { medico: 'Renata Alves',   texto: /^Sua consulta será em \d+ dias!$/,          rotulo: 'dias' },
  { medico: 'Bruno Tavares',  texto: /^Sua consulta será em \d+ dias!$/,          rotulo: '48 horas' },
  { medico: 'Sofia Marques',  texto: /^Sua consulta será em \d+ dias!$/,          rotulo: '47:59 horas' },
  { medico: 'Otavio Lins',    texto: /^Sua consulta é amanhã!$/,                  rotulo: '24 horas' },
  { medico: 'Clara Bento',    texto: /^Sua consulta será daqui a \d+ horas?!$/,   rotulo: '23 horas' },
  { medico: 'Ivan Moreira',   texto: /^Sua consulta começa em \d+ minutos!$/,     rotulo: '59 minutos' },
  { medico: 'Lucia Ramos',    texto: /^Sua consulta começa em \d+ minutos!$/,     rotulo: '15 minutos' },
];

/**
 * Lê a frase do contador, sem o ícone — os dois moram no mesmo span, e o
 * innerText devolve a imagem e o texto separados por quebra de linha.
 */
async function lerContador(page, medico) {
  const bruto = await page
    .locator(`.card:has-text('${medico}') [data-testid="countdown"] >> visible=true`)
    .first().innerText();
  return bruto.split('\n').map(l => l.trim()).filter(Boolean).pop();
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

    for (const { medico, texto, rotulo } of ESTAGIOS) {
      test(`T1–T4 — estágio "${rotulo}" usa o texto exato do print`, async ({ page }) => {
        expect(await lerContador(page, medico)).toMatch(texto);
      });
    }

    test('T5 — o mesmo texto vale para a série de Consulta avulsa', async ({ page }) => {
      // A tabela do cliente repete as 7 possibilidades para a origem Avulsa
      // com as mesmas frases; nada muda além da origem.
      for (const { medico, texto } of [
        { medico: 'Gustavo Pinto',  texto: /^Sua consulta será em \d+ dias!$/ },
        { medico: 'Camila Ferraz',  texto: /^Sua consulta é amanhã!$/ },
        { medico: 'Diego Moraes',   texto: /^Sua consulta será daqui a \d+ horas?!$/ },
        { medico: 'Tiago Menezes',  texto: /^Sua consulta começa em \d+ minutos!$/ },
      ]) {
        expect(await lerContador(page, medico), medico).toMatch(texto);
      }
    });

    test('T6 — nenhuma forma abreviada sobrou no lugar da frase', async ({ page }) => {
      const contadores = await page.locator('[data-testid="countdown"] >> visible=true')
        .evaluateAll(spans => spans.map(s => s.innerText.trim().split('\n').pop().trim()));

      expect(contadores.length).toBeGreaterThan(0);
      for (const texto of contadores) {
        expect(texto, 'toda contagem é uma frase completa').toMatch(/^Sua consulta /);
        expect(texto, 'a exclamação faz parte do texto especificado').toMatch(/!$/);
      }
    });
  });
}
