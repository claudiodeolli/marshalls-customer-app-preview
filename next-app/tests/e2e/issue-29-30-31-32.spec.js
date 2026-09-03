// Cobre as issues #29, #30, #31 e #32:
//   #29 — a vitrine do Histórico volta a acumular os agendamentos feitos no
//         próprio preview; ele quer 2 cards na tag "Consulta agendada"
//   #30 — Encaminhamentos com 1 card por tag e filtro "Pendentes" ao abrir
//   #31 — a modal do encaminhamento de um card trazia só a data
//   #32 — o autocomplete de e-mail só funcionava uma vez por foco
const { test, expect } = require('@playwright/test');

/** Cards visíveis de uma tela de listagem, com status e origem. */
async function lerCards(page) {
  return page.locator('.card >> visible=true').evaluateAll(cards => cards.map(card => {
    const texto = card.innerText;
    if (!/Tipo:|Especialidade/.test(texto)) return null;
    return {
      texto,
      agendada: /Consulta agendada|Agendado/.test(texto),
      pendente: /Pendente/.test(texto),
      encaminhamento: /Encaminhamento/.test(texto),
      avulsa: /avulsa/i.test(texto),
    };
  }).filter(Boolean));
}

test.describe('#29 — vitrine do Histórico travada', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/historico');
    await expect(page.locator('.card >> visible=true').first()).toBeVisible({ timeout: 20000 });
  });

  test('F1 — a tag "Consulta agendada" mostra 2 cards, um de cada origem', async ({ page }) => {
    const agendadas = (await lerCards(page)).filter(c => /Consulta agendada/.test(c.texto));

    expect(agendadas.length, 'ele pediu exatamente dois').toBe(2);
    expect(agendadas.filter(c => c.encaminhamento).length, 'um de Encaminhamento').toBe(1);
    expect(agendadas.filter(c => !c.encaminhamento).length, 'um de Avulsa').toBe(1);
  });

  test('F2/F6 — agendar pelo preview não acrescenta card à vitrine', async ({ page }) => {
    // É exatamente o caminho que produziu a reclamação: ele agendou, e os
    // cards apareceram a mais.
    const antes = (await lerCards(page)).filter(c => /Consulta agendada/.test(c.texto)).length;

    await page.evaluate(() => localStorage.setItem('MOCK_HISTORY', JSON.stringify([{
      uuid: 'ls-vitrine-teste', type: 'scheduled', status: 'SCHEDULED',
      appointmentBegin: '01/01/2027 10:00', appointmentEnd: null,
      professional: { name: 'Teste Vitrine', specialties: [{ name: 'Teste' }] },
      beneficiaryMedicalReferral: null, documents: [],
      createdAt: '01/01/2027 10:00:00', updatedAt: '01/01/2027 10:00:00',
    }])));
    await page.reload();
    await expect(page.locator('.card >> visible=true').first()).toBeVisible({ timeout: 20000 });

    const depois = (await lerCards(page)).filter(c => /Consulta agendada/.test(c.texto)).length;
    expect(depois, 'a vitrine não pode crescer com o que o visitante agenda').toBe(antes);
    await expect(page.getByText('Teste Vitrine')).toHaveCount(0);
  });

  test('F7 — mas o preview continua gravando: a trava é só de exibição', async ({ page }) => {
    // Se parasse de gravar, o fluxo de marcação perderia o desfecho. Ele
    // decidiu travar só o que aparece.
    await page.evaluate(() => localStorage.setItem('MOCK_HISTORY', JSON.stringify([{ uuid: 'ls-guardado' }])));
    await page.reload();
    await expect(page.locator('.card >> visible=true').first()).toBeVisible({ timeout: 20000 });

    const guardado = await page.evaluate(() => localStorage.getItem('MOCK_HISTORY'));
    expect(guardado, 'o registro segue guardado, só não é exibido').toContain('ls-guardado');
  });
});

test.describe('#30 — vitrine dos Encaminhamentos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/encaminhamentos');
    await expect(page.locator('.card >> visible=true').first()).toBeVisible({ timeout: 20000 });
  });

  test('E1/E8 — a tela abre no filtro "Pendentes"', async ({ page }) => {
    // Este item já mudou duas vezes: era Pendentes, virou Todos na #18, e ele
    // pediu Pendentes de volta na #30. O teste existe para a troca ser sempre
    // deliberada.
    await expect(page.getByRole('button', { name: 'Pendentes' })).toBeVisible();

    const cards = await lerCards(page);
    expect(cards.every(c => c.pendente), 'abrindo em Pendentes, só pendentes aparecem').toBe(true);
  });

  test('E2/E3 — um card por tag', async ({ page }) => {
    for (const [rotulo, marcador] of [['Pendentes', 'pendente'], ['Agendados', 'agendada']]) {
      await page.getByRole('button', { name: /Pendentes|Agendados|Todos/ }).first().click();
      await page.getByText(rotulo, { exact: true }).last().click();
      await expect(page.locator('.card >> visible=true').first()).toBeVisible();

      const cards = await lerCards(page);
      expect(cards.length, `o filtro ${rotulo} mostra um card`).toBe(1);
      expect(cards[0][marcador], `o card do filtro ${rotulo} é da tag certa`).toBe(true);
    }
  });

  test('E4 — no "Todos", o Pendente vem antes do Agendado', async ({ page }) => {
    await page.getByRole('button', { name: /Pendentes|Agendados|Todos/ }).first().click();
    await page.getByText('Todos', { exact: true }).last().click();
    await expect(page.locator('.card >> visible=true').first()).toBeVisible();

    const cards = await lerCards(page);
    expect(cards.length, 'dois cards, um de cada tag').toBe(2);
    expect(cards[0].pendente).toBe(true);
    expect(cards[1].agendada).toBe(true);
  });
});

test.describe('#31 — dados do encaminhamento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/historico');
    await expect(page.locator('.card >> visible=true').first()).toBeVisible({ timeout: 20000 });
  });

  test('N1/N2/N5 — todo card de encaminhamento abre a modal com os três blocos', async ({ page }) => {
    // O teste da #26 exigia apenas "algum conteúdo", e o card com o campo
    // torto passava mostrando só a data. Aqui os três blocos são exigidos.
    const links = page.locator('button:text-is("Ver encaminhamento") >> visible=true');
    const total = await links.count();
    expect(total, 'há cards de encaminhamento no histórico').toBeGreaterThan(0);

    for (let i = 0; i < total; i++) {
      await links.nth(i).click();
      const modal = page.getByTestId('modal-encaminhamento');
      await expect(modal).toBeVisible();

      const texto = await modal.innerText();
      for (const bloco of ['ENCAMINHADO POR', 'CRIADO EM', 'ATUALIZADO EM']) {
        expect(texto.toUpperCase(), `modal ${i + 1} sem o bloco "${bloco}"`).toContain(bloco);
      }
      expect(texto, `modal ${i + 1} sem o nome do médico`).toMatch(/Dr\(a\)\.\s*\S+/);

      await page.getByRole('button', { name: 'Fechar' }).click();
      await expect(page.getByTestId('modal-encaminhamento')).toHaveCount(0);
    }
  });
});

test.describe('#32 — autocomplete de e-mail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/meus-dados');
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 20000 });
  });

  const campo = page => page.locator('input[type="email"]').first();
  const lista = page => page.locator('._dropdown-enter');

  test('A1/A8 — depois de escolher, apagar e digitar de novo traz a lista de volta', async ({ page }) => {
    // O caminho exato que a equipe dele relatou, e sem tirar o foco do campo
    // em momento nenhum: era isso que fazia o autocomplete "funcionar uma vez".
    await campo(page).click();
    await campo(page).fill('joao@gm');
    await expect(lista(page)).toBeVisible();

    await lista(page).locator('div').first().click();
    await expect(lista(page)).toHaveCount(0);
    await expect(campo(page)).toBeFocused();

    await campo(page).fill('joao@gm');
    await expect(lista(page), 'a lista precisa voltar sem sair do campo').toBeVisible();
  });

  test('A2 — escolher um domínio continua fechando a lista na hora', async ({ page }) => {
    await campo(page).click();
    await campo(page).fill('maria@ou');
    await expect(lista(page)).toBeVisible();

    await lista(page).locator('div').first().click();
    await expect(lista(page)).toHaveCount(0);
    await expect(campo(page)).toHaveValue('maria@outlook.com');
  });

  test('A3 — Esc fecha, e digitar depois reabre', async ({ page }) => {
    await campo(page).click();
    await campo(page).fill('ana@ya');
    await expect(lista(page)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(lista(page)).toHaveCount(0);

    await campo(page).pressSequentially('h');
    await expect(lista(page)).toBeVisible();
  });

  test('A4 — sair do campo fecha a lista', async ({ page }) => {
    await campo(page).click();
    await campo(page).fill('pedro@ic');
    await expect(lista(page)).toBeVisible();

    await campo(page).blur();
    await expect(lista(page)).toHaveCount(0);
  });

  test('A5 — setas e Enter seguem escolhendo o item destacado', async ({ page }) => {
    await campo(page).click();
    await campo(page).fill('carla@y');
    await expect(lista(page)).toBeVisible();

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(campo(page)).toHaveValue(/^carla@yahoo\./);
    await expect(lista(page)).toHaveCount(0);
  });

  test('A6 — sem "@" não há lista; com ele, volta', async ({ page }) => {
    await campo(page).click();
    await campo(page).fill('lucas');
    await expect(lista(page)).toHaveCount(0);

    await campo(page).fill('lucas@g');
    await expect(lista(page)).toBeVisible();
  });
});
