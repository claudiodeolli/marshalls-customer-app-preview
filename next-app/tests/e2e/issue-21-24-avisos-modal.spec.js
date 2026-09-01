// Cobre as issues #21 e #24:
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/21
//   https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/24
// #21 são os textos que ele reescreveu em 27/08 às 23:12; #24 é o formato,
// pedido em 29/08 — o aviso deixa o corpo da página e vira modal.
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
      'Esta modalidade de consulta pode ser reagendada até 48 horas antes do horário agendado, sem perder o Encaminhamento. Após esse prazo, não é possível reagendar.',
      'Se optar pelo cancelamento, o Encaminhamento será encerrado. Para agendar novamente uma consulta com essa especialidade sem custo, será necessário passar pelo Plantão 24h e obter um novo Encaminhamento, caso ainda haja indicação médica.',
    ],
    negritos: [
      'reagendada até 48 horas antes do horário agendado, sem perder o Encaminhamento. Após esse prazo, não é possível reagendar.',
      'cancelamento', 'sem custo', 'Plantão 24h',
    ],
  },
  avulsa: {
    testid: 'booking-rules-alert-avulsa',
    rota: ROTA_AVULSA,
    titulo: 'Lembre-se!',
    paragrafos: [
      'As Consultas Avulsas podem ser reagendadas ou canceladas até 48 horas antes do horário agendado, sem perder a consulta adquirida.',
      'Se optar por um horário dentro das próximas 48 horas, não será possível reagendar sem perder a consulta. Se cancelar ou não comparecer ao atendimento, a consulta será considerada utilizada.',
    ],
    negritos: [
      'Consultas Avulsas',
      'reagendadas ou canceladas até 48 horas antes do horário agendado, sem perder a consulta adquirida',
      '48 horas', 'não será possível reagendar sem perder a consulta', 'a consulta será considerada utilizada',
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

      expect(paragrafos.length, 'dois parágrafos mais a recomendação').toBe(3);
      expect(limpo(paragrafos[0])).toBe(dados.paragrafos[0]);
      expect(limpo(paragrafos[1])).toBe(dados.paragrafos[1]);
    });

    test('T7 — a recomendação termina com "48 horas" em negrito', async ({ page }) => {
      const alerta = page.getByTestId(dados.testid);
      const paragrafos = await alerta.locator('p').allInnerTexts();

      expect(limpo(paragrafos[2])).toBe(RECOMENDACAO);
      await expect(alerta.locator('p').last().locator('strong', { hasText: '48 horas' })).toBeVisible();
    });

    test('T2/T6/T11 — cada negrito começa e termina onde ele marcou', async ({ page }) => {
      const emNegrito = await page.getByTestId(dados.testid).locator('strong').allInnerTexts();
      const normalizado = emNegrito.map(limpo);

      for (const trecho of dados.negritos) {
        expect(normalizado, 'negrito ausente ou partido: ' + trecho).toContain(trecho);
      }
    });

    test('M2/M4 — o aviso abre como modal, com o botão "Entendi"', async ({ page }) => {
      const alerta = page.getByTestId(dados.testid);
      await expect(alerta).toContainText(dados.titulo);

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
      const icone = alerta.locator('img').first();

      await expect(icone).toBeVisible();
      expect(await icone.getAttribute('src')).toContain('warning_3d.png');
      expect(await alerta.innerText(), 'não pode sobrar o warning unicode').not.toContain('⚠');
    });
  });
}

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
