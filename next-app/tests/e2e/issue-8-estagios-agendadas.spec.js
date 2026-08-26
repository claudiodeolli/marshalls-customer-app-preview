// Cobre a issue #8: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/8
// "na tela de Agendamentos, no filtro de agendadas, mostra primeiro todas as
// possibilidades por Encaminhamento até o dia e horário da consulta e depois
// mostra todas as possibilidades também por Avulsa."
const { test, expect } = require('@playwright/test');

const ENCAMINHAMENTO = 'Encaminhamento';
const AVULSA = 'Consulta avulsa';

/** Lê os cards agendados como estágio + origem + estado do Reagendar. */
async function lerEstagios(page) {
  return page.locator('.card').evaluateAll(cards => cards.map(card => {
    const texto = card.innerText;
    if (!/Consulta agendada/.test(texto)) return null;
    return {
      origem: /Origem:\s*Encaminhamento/.test(texto) ? 'Encaminhamento' : 'Consulta avulsa',
      contador: (texto.match(/(\d+ dias|É amanhã|\d+ h|\d+ min)/) || [])[0] ?? '?',
      temReagendar: /Reagendar/.test(texto),
      liberado: /Você já pode entrar!/.test(texto),
    };
  }).filter(Boolean));
}

test.beforeEach(async ({ page }) => {
  await page.goto('/agendamentos');
  await expect(page.locator('.card').first()).toBeVisible();
});

test('S1–S8 — cada origem traz a série completa de sete estágios', async ({ page }) => {
  const cards = await lerEstagios(page);

  for (const origem of [ENCAMINHAMENTO, AVULSA]) {
    const serie = cards.filter(c => c.origem === origem);
    expect(serie.length, `estágios de ${origem}`).toBe(7);
  }
});

test('S9 — toda a série de Encaminhamento vem antes da de Avulsa', async ({ page }) => {
  const origens = (await lerEstagios(page)).map(c => c.origem);
  const ultimoEncaminhamento = origens.lastIndexOf(ENCAMINHAMENTO);
  const primeiraAvulsa = origens.indexOf(AVULSA);

  expect(ultimoEncaminhamento).toBeLessThan(primeiraAvulsa);
});

test('S10 — dentro de cada série, do prazo mais distante ao mais próximo', async ({ page }) => {
  const cards = await lerEstagios(page);
  // Peso decrescente: dias > amanhã > horas > minutos.
  const peso = ({ contador }) => {
    if (/dias/.test(contador)) return 4000 + parseInt(contador, 10);
    if (/amanhã/.test(contador)) return 3000;
    if (/ h$/.test(contador)) return 2000 + parseInt(contador, 10);
    return 1000 + parseInt(contador, 10);
  };

  for (const origem of [ENCAMINHAMENTO, AVULSA]) {
    const pesos = cards.filter(c => c.origem === origem).map(peso);
    const ordenado = [...pesos].sort((a, b) => b - a);
    expect(pesos, `ordem de ${origem}`).toEqual(ordenado);
  }
});

test('S2/S3 — os dois cards de 2 dias diferem só pelo botão Reagendar', async ({ page }) => {
  const cards = await lerEstagios(page);

  for (const origem of [ENCAMINHAMENTO, AVULSA]) {
    const doisDias = cards.filter(c => c.origem === origem && c.contador === '2 dias');
    expect(doisDias.length, `cards de "2 dias" em ${origem}`).toBe(2);

    // O de 48h ainda oferece reagendar; o de 47:59 já não.
    expect(doisDias.map(c => c.temReagendar), `Reagendar em ${origem}`).toEqual([true, false]);
  }
});

test('S4/S5/S6 — os estágios de amanhã, horas e minutos aparecem sem Reagendar', async ({ page }) => {
  const cards = await lerEstagios(page);

  for (const origem of [ENCAMINHAMENTO, AVULSA]) {
    const serie = cards.filter(c => c.origem === origem);

    const amanha = serie.find(c => /amanhã/.test(c.contador));
    expect(amanha, `estágio "amanhã" em ${origem}`).toBeTruthy();
    expect(amanha.temReagendar).toBe(false);

    const horas = serie.find(c => / h$/.test(c.contador));
    expect(horas, `estágio de horas em ${origem}`).toBeTruthy();
    expect(horas.temReagendar).toBe(false);

    const minutos = serie.filter(c => / min$/.test(c.contador));
    expect(minutos.length, `estágios de minutos em ${origem}`).toBe(2);
    expect(minutos.every(c => !c.temReagendar)).toBe(true);
  }
});

test('S7 — o último estágio de cada série está liberado para entrar', async ({ page }) => {
  const cards = await lerEstagios(page);

  for (const origem of [ENCAMINHAMENTO, AVULSA]) {
    const serie = cards.filter(c => c.origem === origem);
    const ultimo = serie[serie.length - 1];
    expect(ultimo.liberado, `último estágio de ${origem}`).toBe(true);
    // Só o último: os demais continuam bloqueados.
    expect(serie.slice(0, -1).some(c => c.liberado)).toBe(false);
  }
});

test('Os ícones da contagem são unicode coloridos, não de biblioteca', async ({ page }) => {
  // O PDF diz "continuar usando esse mesmo ícone, nessa cor" apontando para
  // os emojis que a tela já usava. A menção a "Lucide TriangleAlert" no
  // documento foi um palpite do cliente sobre o nome — o que ele quer é o
  // ícone colorido, e um ícone de traço monocromático não atende.
  const icones = await page.locator('.card').evaluateAll(cards => cards.map(card => {
    const texto = card.innerText;
    if (!/Consulta agendada/.test(texto)) return null;
    const emDias = /\d+ dias|É amanhã/.test(texto);
    return { emDias, temCalendario: texto.includes('🗓️'), temRelogio: texto.includes('⏱️') };
  }).filter(Boolean));

  expect(icones.length).toBeGreaterThan(0);
  for (const { emDias, temCalendario, temRelogio } of icones) {
    if (emDias) expect(temCalendario, 'calendário na contagem em dias').toBe(true);
    else expect(temRelogio, 'relógio na contagem em horas/minutos').toBe(true);
  }

  // Nenhum ícone de biblioteca sobrou no lugar deles.
  const svgsNaContagem = await page.locator('.card ._appt-card-actions svg, .card .d-xl-none svg').count();
  expect(svgsNaContagem).toBe(0);
});

test('O aviso de liberação usa o círculo verde unicode', async ({ page }) => {
  const indicador = page.getByTestId('ready-to-enter').first();
  await expect(indicador).toContainText('🟢');
  await expect(indicador).toContainText('Você já pode entrar!');
});

test('S7 — no estágio liberado o contador segue marcando os minutos', async ({ page }) => {
  // O PDF mostra "Sua consulta começa em 15 minutos" com o aviso verde ao
  // lado; antes o contador repetia "Você já pode entrar".
  const cards = await lerEstagios(page);
  const liberado = cards.find(c => c.liberado);

  expect(liberado.contador).toMatch(/\d+ min/);
});
