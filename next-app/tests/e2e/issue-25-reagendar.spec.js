// Cobre a issue #25: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/25
// O fluxo do botão Reagendar, descrito no PDF "Regra e BOTÕES de REAGENDAR"
// que ele mandou em 29/08. O botão existia e respeitava a janela de 48 horas,
// mas não levava a lugar nenhum.
const { test, expect } = require('@playwright/test');

// Cards com Reagendar disponível: mais de 48h para a consulta.
const POR_ENCAMINHAMENTO = 'Renata Alves';   // 12 dias
const POR_AVULSA = 'Gustavo Pinto';          // 12 dias, consulta paga

async function abrirAgendamentos(page) {
  await page.goto('/agendamentos');
  await expect(page.locator('[data-testid="countdown"] >> visible=true').first())
    .toBeVisible({ timeout: 20000 });
}

async function clicarReagendar(page, medico) {
  await page.locator(`.card:has-text('${medico}') button:text-is('Reagendar') >> visible=true`).first().click();
}

test.beforeEach(async ({ page }) => {
  await abrirAgendamentos(page);
});

test('G1 — clicar em Reagendar abre a confirmação com o texto do PDF', async ({ page }) => {
  await clicarReagendar(page, POR_ENCAMINHAMENTO);

  const dialogo = page.getByTestId('reagendar-confirmacao');
  await expect(dialogo).toBeVisible();
  await expect(dialogo).toContainText('Reagendar consulta?');
  await expect(dialogo).toContainText('Você está prestes a reagendar a consulta de');
  await expect(dialogo).toContainText('48 horas antes do horário agendado, sem perder o Encaminhamento');
  await expect(dialogo).toContainText('escolher uma nova data e horário para esta consulta');
  await expect(dialogo).toContainText('Deseja continuar com o reagendamento?');
});

test('G1 — a confirmação nomeia a especialidade e o médico daquele card', async ({ page }) => {
  await clicarReagendar(page, POR_ENCAMINHAMENTO);

  const dialogo = page.getByTestId('reagendar-confirmacao');
  await expect(dialogo).toContainText('Ortopedia');
  await expect(dialogo).toContainText(POR_ENCAMINHAMENTO);
});

test('G7 — na Avulsa a regra fala da consulta adquirida, não do Encaminhamento', async ({ page }) => {
  // O PDF não trouxe o texto da Avulsa; este é provisório, montado sobre a
  // página 1 do mesmo documento, até ele mandar o definitivo.
  await clicarReagendar(page, POR_AVULSA);

  const dialogo = page.getByTestId('reagendar-confirmacao');
  await expect(dialogo).toContainText('sem perder a consulta adquirida');
  await expect(dialogo).not.toContainText('Encaminhamento');
});

test('G2 — a confirmação traz "Voltar" e "Reagendar consulta"', async ({ page }) => {
  await clicarReagendar(page, POR_ENCAMINHAMENTO);

  await expect(page.getByRole('button', { name: 'Voltar' })).toBeVisible();
  const confirmar = page.getByRole('button', { name: 'Reagendar consulta' });
  await expect(confirmar).toBeVisible();
  // Azul padrão, como ele apontou no print.
  await expect(confirmar).toHaveClass(/btn-primary/);
});

test('G2 — "Voltar" desiste sem mexer no agendamento', async ({ page }) => {
  await clicarReagendar(page, POR_ENCAMINHAMENTO);
  await page.getByRole('button', { name: 'Voltar' }).click();

  await expect(page.getByTestId('reagendar-confirmacao')).toHaveCount(0);
  await expect(page.locator(`.card:has-text('${POR_ENCAMINHAMENTO}')`).first()).toBeVisible();
});

test('G3 — confirmar abre a escolha de nova data, com os botões da modal de agendamentos', async ({ page }) => {
  await clicarReagendar(page, POR_ENCAMINHAMENTO);
  await page.getByRole('button', { name: 'Reagendar consulta' }).click();

  const escolha = page.getByTestId('reagendar-nova-data');
  await expect(escolha).toBeVisible();
  await expect(escolha).toContainText('Escolha uma nova data e horário');
  // Escopado na modal: "Cancelar" também é o rótulo do botão de cada card.
  await expect(escolha.getByRole('button', { name: 'Escolher agora' })).toBeVisible();
  await expect(escolha.getByRole('button', { name: 'Cancelar' })).toBeVisible();
});

test('G4 — "Escolher agora" entra na marcação com a especialidade já definida', async ({ page }) => {
  await clicarReagendar(page, POR_ENCAMINHAMENTO);
  await page.getByRole('button', { name: 'Reagendar consulta' }).click();
  await page.getByTestId('reagendar-nova-data').getByRole('button', { name: 'Escolher agora' }).click();

  await expect(page).toHaveURL(/\/schedule\/calendar/);
  await expect(page).toHaveURL(/reagendarDe=/);
  // O aviso de regras da origem abre antes, como em qualquer marcação.
  await expect(page.getByTestId('booking-rules-alert-referral')).toBeVisible({ timeout: 20000 });
});

test('G4 — e na Avulsa entra pelo caminho da consulta paga', async ({ page }) => {
  await clicarReagendar(page, POR_AVULSA);
  await page.getByRole('button', { name: 'Reagendar consulta' }).click();
  await page.getByTestId('reagendar-nova-data').getByRole('button', { name: 'Escolher agora' }).click();

  await expect(page).toHaveURL(/avulsaSpec=/);
  await expect(page.getByTestId('booking-rules-alert-avulsa')).toBeVisible({ timeout: 20000 });
});

test('G3 — "Cancelar" fecha a escolha e deixa tudo como estava', async ({ page }) => {
  await clicarReagendar(page, POR_ENCAMINHAMENTO);
  await page.getByRole('button', { name: 'Reagendar consulta' }).click();
  await page.getByTestId('reagendar-nova-data').getByRole('button', { name: 'Cancelar' }).click();

  await expect(page.getByTestId('reagendar-nova-data')).toHaveCount(0);
  await expect(page).toHaveURL(/\/agendamentos/);
});

test('G5/G6 — concluído, o card antigo dá lugar a um novo, com o prazo recontado', async ({ page }) => {
  // O PDF é literal: "destruir esse agendamento (e card) e criar um novo com
  // status de Consulta agendada — recomeça a contar o cronômetro".
  const contadorAntes = await page
    .locator(`.card:has-text('${POR_ENCAMINHAMENTO}') [data-testid="countdown"] >> visible=true`)
    .first().innerText();
  expect(contadorAntes).toContain('12 dias');

  // Simula a conclusão da marcação, que é o efeito que o PDF descreve.
  await page.evaluate(nome => {
    localStorage.setItem('MOCK_REAGENDAMENTOS', JSON.stringify([{
      uuidOriginal: 'apt-referral-12dias',
      novoAgendamento: {
        uuid: 'apt-reagendado-teste',
        status: 'SCHEDULED',
        professional: { name: nome, specialties: [{ name: 'Ortopedia' }] },
        specialty: { name: 'Ortopedia' },
        detail: { date: '01/01/2027', from: '10:00', demoMinutes: 1380 },
        beneficiaryMedicalReferral: { uuid: 'ref-003', createdAt: '20/05/2026' },
        cancel: true,
      },
    }]));
  }, POR_ENCAMINHAMENTO);

  await page.reload();
  await expect(page.locator('[data-testid="countdown"] >> visible=true').first()).toBeVisible({ timeout: 20000 });

  const cards = await page.locator('.card >> visible=true').evaluateAll(cs =>
    cs.map(c => c.innerText).filter(t => /Consulta agendada/.test(t)));

  const doMedico = cards.filter(t => new RegExp(POR_ENCAMINHAMENTO).test(t));
  expect(doMedico.length, 'o card antigo saiu e o novo entrou no lugar').toBe(1);
  expect(doMedico[0], 'o novo card continua agendado').toContain('Consulta agendada');
  expect(doMedico[0], 'o cronômetro recomeça pela nova data').toContain('23 horas');
  expect(doMedico[0]).not.toContain('12 dias');
});

test('G11 — quem marca dentro das 48h já nasce sem Reagendar', async ({ page }) => {
  // Não é regra nova: é o que a janela de 48 horas produz naturalmente, e ele
  // confirmou que é isso mesmo.
  const dentroDoPrazo = ['Sofia Marques', 'Otavio Lins', 'Clara Bento', 'Ivan Moreira', 'Lucia Ramos'];

  for (const medico of dentroDoPrazo) {
    const card = page.locator(`.card:has-text('${medico}')`).first();
    await expect(card.getByRole('button', { name: 'Reagendar' })).toHaveCount(0);
  }
});
