// Cobre as issues #21 e #24:
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/21
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/24
// #58 substitui diretamente os textos avulsos de #21; os textos de
// encaminhamento seguem a #57. #24 mantém o aviso em modal.
const { test, expect } = require('@playwright/test');

const ROTA_ENCAMINHAMENTO = '/schedule/calendar?referral=ref-003';
const ROTA_AVULSA = '/schedule/calendar?avulsaSpec=spec-003';

// Os parágrafos exatos das imagens dele. Comparados inteiros, e não por
// trecho: a diferença entre a versão antiga e a nova está em uma vírgula, uma
// inicial maiúscula e um tempo verbal — procurar só por "48 horas" passaria
// com o texto errado.
const TEXTOS = {
  referral: {
    testid: 'booking-rules-alert-referral',
    rota: ROTA_ENCAMINHAMENTO,
    titulo: 'Importante!',
    paragrafos: [
      'Nesta modalidade, as consultas podem ser reagendadas ou canceladas até 48 horas antes do horário agendado, sem perder o Encaminhamento.',
      'Se optar por um horário dentro das próximas 48 horas, a consulta já estará fora do prazo de reagendamento e, por isso, não será possível reagendar. Para escolher outra data ou horário sem custo, será necessário passar pelo Plantão 24h e obter um novo Encaminhamento, caso ainda haja indicação médica.',
      'Se cancelar fora do prazo ou não comparecer ao atendimento, a consulta será considerada utilizada.',
    ],
    negritos: [
      'consultas',
      'reagendadas ou canceladas até 48 horas antes do horário agendado, sem perder o Encaminhamento.',
      '48 horas, a consulta já estará fora do prazo de reagendamento e, por isso, não será possível reagendar.',
      'obter um novo Encaminhamento, caso ainda haja indicação médica.',
      'fora do prazo', 'a consulta será considerada utilizada.',
    ],
  },
  avulsa: {
    testid: 'booking-rules-alert-avulsa',
    rota: ROTA_AVULSA,
    titulo: 'Importante!',
    paragrafos: [
      'As Consultas Avulsas podem ser reagendadas ou canceladas até 48 horas antes do horário agendado, sem perder a consulta adquirida.',
      'Se optar por um horário dentro das próximas 48 horas, a consulta já estará fora do prazo de reagendamento e, por isso, não será possível reagendar.',
      'Se cancelar fora do prazo ou não comparecer ao atendimento, a consulta será considerada utilizada.',
    ],
    negritos: [
      'Consultas Avulsas',
      'reagendadas ou canceladas até 48 horas antes do horário agendado, sem perder a consulta adquirida.',
      '48 horas, a consulta já estará fora do prazo de reagendamento e, por isso, não será possível reagendar.',
      'fora do prazo', 'a consulta será considerada utilizada.',
    ],
  },
};

const RECOMENDACAO =
  'Recomendação: Escolha uma data e horário em que realmente tenha disponibilidade para realizar a consulta, especialmente se o atendimento ocorrer nas próximas 48 horas.';

const limpo = texto => texto.replace(/\s+/g, ' ').trim();

for (const [origem, dados] of Object.entries(TEXTOS)) {
  test.describe(origem, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(dados.rota);
      await expect(page.getByTestId(dados.testid)).toBeVisible({ timeout: 15000 });
    });

    test('T1/T4 — os parágrafos batem palavra por palavra com o texto dele', async ({ page }) => {
      const paragrafos = await page.getByTestId(dados.testid).locator('p').allInnerTexts();

      expect(paragrafos.length, 'parágrafos e recomendação conforme a origem').toBe(dados.paragrafos.length + 1);
      for (const [index, esperado] of dados.paragrafos.entries()) {
        expect(limpo(paragrafos[index])).toBe(esperado);
      }
    });

    test('T7 — a recomendação termina com "48 horas" em negrito', async ({ page }) => {
      const alerta = page.getByTestId(dados.testid);
      const paragrafos = await alerta.locator('p').allInnerTexts();

      expect(limpo(paragrafos.at(-1))).toBe(RECOMENDACAO);
      await expect(alerta.locator('p').last().locator('strong', { hasText: '48 horas' })).toBeVisible();
    });

    test('T2/T6/T11 — cada negrito começa e termina onde ele marcou', async ({ page }) => {
      const emNegrito = await page.getByTestId(dados.testid).locator('strong').allInnerTexts();
      const normalizado = emNegrito.map(limpo);

      for (const trecho of dados.negritos) {
        expect(normalizado, 'negrito ausente ou partido: ' + trecho).toContain(trecho);
      }
    });

    test('T2 — os negritos de Encaminhamento seguem os trechos exatos do PDF', async ({ page }) => {
      test.skip(origem !== 'referral');
      const paragrafos = await page.getByTestId(dados.testid).locator('p').evaluateAll(
        elementos => elementos.map(paragrafo => [...paragrafo.querySelectorAll('strong')].map(trecho => trecho.textContent)),
      );

      expect(paragrafos).toEqual([
        ['consultas', 'reagendadas ou canceladas até 48 horas antes do horário agendado, sem perder o Encaminhamento.'],
        ['48 horas, a consulta já estará fora do prazo de reagendamento e, por isso, não será possível reagendar.', 'obter um novo Encaminhamento, caso ainda haja indicação médica.'],
        ['fora do prazo', 'a consulta será considerada utilizada.'],
        ['Recomendação:', 'realmente tenha disponibilidade', '48 horas'],
      ]);
    });

    test('M2/M4 — o aviso abre como modal, com o botão "Entendi"', async ({ page }) => {
      const alerta = page.getByTestId(dados.testid);
      await expect(alerta).toContainText(dados.titulo);
      await expect(alerta.locator('p').first()).toHaveCSS('text-align', 'justify');

      // Overlay fixo por cima da página, não um bloco no meio do conteúdo.
      const posicao = await alerta.evaluate(el => {
        const pai = el.closest('div[role="dialog"]');
        return pai ? getComputedStyle(pai).position : null;
      });
      expect(posicao).toBe('fixed');

      await expect(page.getByRole('button', { name: 'Entendi' })).toBeVisible();
    });

    test('M4 — o "Entendi" fecha e não deixa o aviso no corpo da página', async ({ page }) => {
      await page.getByRole('button', { name: 'Entendi' }).click();
      await expect(page.getByTestId(dados.testid)).toHaveCount(0);
    });

    test('M8 — Esc também fecha', async ({ page }) => {
      await page.keyboard.press('Escape');
      await expect(page.getByTestId(dados.testid)).toHaveCount(0);
    });

    test('M6 — o fundo fica desfocado, como nas outras modais', async ({ page }) => {
      const desfoque = await page.getByTestId(dados.testid).evaluate(el => {
        const overlay = el.closest('div[role="dialog"]');
        const estilo = getComputedStyle(overlay);
        return estilo.backdropFilter || estilo.webkitBackdropFilter;
      });
      expect(desfoque).toMatch(/blur\(/);
    });

    test('T12 — o aviso usa o ícone colorido, não o caractere do sistema', async ({ page }) => {
      const alerta = page.getByTestId(dados.testid);
      const icone = alerta.locator('img[src*="warning_3d.png"]');

      await expect(icone).toBeVisible();
      expect(await alerta.innerText(), 'não pode sobrar o warning unicode').not.toContain('⚠');
    });
  });
}

test('M2 — o aviso fica centralizado com recuo e scroll interno em alturas reduzidas', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 390, height: 320 }]) {
    await page.setViewportSize(viewport);
    await page.goto(ROTA_ENCAMINHAMENTO);
    const alerta = page.getByTestId('booking-rules-alert-referral');
    await expect(alerta).toBeVisible({ timeout: 15000 });

    const medidas = await alerta.evaluate(element => {
      const modal = element.closest('div[role="dialog"]');
      const viewport = modal.getBoundingClientRect();
      const card = element.parentElement;
      const caixa = card.getBoundingClientRect();
      return {
        topo: caixa.top - viewport.top,
        fundo: viewport.bottom - caixa.bottom,
        centro: (caixa.top + caixa.bottom) / 2,
        centroViewport: (viewport.top + viewport.bottom) / 2,
        temScrollInterno: card.scrollHeight > card.clientHeight,
      };
    });

    expect(medidas.topo).toBeGreaterThanOrEqual(32);
    expect(medidas.fundo).toBeGreaterThanOrEqual(32);
    expect(Math.abs(medidas.centro - medidas.centroViewport), JSON.stringify({ viewport, medidas })).toBeLessThanOrEqual(1);
    expect(medidas.temScrollInterno, JSON.stringify({ viewport, medidas })).toBe(viewport.height < 900);

    if (medidas.temScrollInterno) {
      const botao = page.getByRole('button', { name: 'Entendi' });
      await alerta.evaluate(element => { element.parentElement.scrollTop = element.parentElement.scrollHeight; });
      const botaoDentroDoCard = await botao.evaluate(element => {
        const card = element.closest('.card');
        const botao = element.getBoundingClientRect();
        const caixa = card.getBoundingClientRect();
        return botao.top >= caixa.top && botao.bottom <= caixa.bottom;
      });
      expect(botaoDentroDoCard).toBe(true);
    }
  }
});

test('M10 — a modal reaparece a cada visita à tela', async ({ page }) => {
  // Ele pediu "quando abrir essa tela, a gente mostra antes esse aviso" — sem
  // ressalva de uma vez por sessão.
  await page.goto(ROTA_AVULSA);
  await expect(page.getByTestId('booking-rules-alert-avulsa')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Entendi' }).click();
  await expect(page.getByTestId('booking-rules-alert-avulsa')).toHaveCount(0);

  await page.goto(ROTA_AVULSA);
  await expect(page.getByTestId('booking-rules-alert-avulsa')).toBeVisible({ timeout: 15000 });
});
