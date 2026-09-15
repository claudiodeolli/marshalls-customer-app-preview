// Cobre a issue #36: https://github.com/claudiodeolli/marshalls-customer-app-preview/issues/36
// Nutrição pulava a escolha entre Encaminhamento e Avulsa e caía direto no
// calendário, onde o botão final marcava sem cobrar. O cliente decidiu (N1)
// que ela deve oferecer a mesma escolha das outras especialidades.
const { test, expect } = require('@playwright/test');

const NUTRICAO = 'Nutrição';
// Psicologia é a referência de comparação: mesmo preço, e já se comportava
// como o cliente espera.
const REFERENCIA = 'Psicologia';
const PRECO_DE_AMBAS = 'R$ 70,00';

async function abrirLista(page) {
  await page.goto('/schedule/calendar');
  await expect(page.getByText(NUTRICAO, { exact: true }).first()).toBeVisible({ timeout: 15000 });
}

async function dispensarAvisoDeRegras(page) {
  const entendi = page.getByRole('button', { name: 'Entendi' });
  if (await entendi.count()) await entendi.first().click();
  await expect(entendi).toHaveCount(0);
}

function retratoDaEscolha(page) {
  return page.evaluate(() => {
    const titulo = [...document.querySelectorAll('h6')]
      .find(h => h.textContent.trim() === 'Selecionar Encaminhamento');
    const avulsa = [...document.querySelectorAll('button')]
      .find(b => b.textContent.trim() === 'Adquirir consulta avulsa');
    return { temModalDeEscolha: Boolean(titulo), ofereceuAvulsa: Boolean(avulsa) };
  });
}

for (const [nome, viewport] of [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  test.describe(nome, () => {
    test.use({ viewport });

    test('#36/N1 — clicar em Nutrição abre a escolha, e não o calendário', async ({ page }) => {
      await abrirLista(page);
      await page.getByText(NUTRICAO, { exact: true }).first().click();

      await expect(
        page.getByRole('heading', { name: 'Selecionar Encaminhamento' })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Adquirir consulta avulsa' })
      ).toBeVisible();
      await expect(
        page.getByTestId('calendario'),
        'ela não pode mais cair direto no calendário'
      ).toHaveCount(0);
    });

    test('#36/N1 — Nutrição oferece exatamente a mesma escolha de Psicologia', async ({ page }) => {
      await abrirLista(page);
      await page.getByText(NUTRICAO, { exact: true }).first().click();
      const comNutricao = await retratoDaEscolha(page);

      await abrirLista(page);
      await page.getByText(REFERENCIA, { exact: true }).first().click();
      const comReferencia = await retratoDaEscolha(page);

      expect(comNutricao).toEqual(comReferencia);
      expect(comNutricao.temModalDeEscolha).toBe(true);
      expect(comNutricao.ofereceuAvulsa).toBe(true);
    });

    test('#36/N2 — pela avulsa, Nutrição mostra preço e termina em Realizar Pagamento', async ({ page }) => {
      await abrirLista(page);
      await page.getByText(NUTRICAO, { exact: true }).first().click();
      await page.getByRole('button', { name: 'Adquirir consulta avulsa' }).click();

      await expect(
        page.getByText(PRECO_DE_AMBAS, { exact: true }).first(),
        'na lista de avulsas o preço dela aparece, como o das outras'
      ).toBeVisible();

      await page.getByText(NUTRICAO, { exact: true }).first().click();
      await page.getByRole('button', { name: 'Escolher agora' }).click();
      await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
      await dispensarAvisoDeRegras(page);

      // O que a issue chama de N2: título, aviso e botão final pelo mesmo
      // critério, para a tela não prometer pagamento e marcar de graça.
      await expect(page.getByRole('heading', { name: 'Consulta Avulsa', exact: true })).toBeVisible();
      await expect(page.getByTestId('aviso-linha').last()).toContainText('pagamento será realizado na próxima etapa');
      await expect(page.getByRole('button', { name: 'Realizar Pagamento' })).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'AGENDAR', exact: true }),
        'o caminho gratuito não pode continuar disponível depois de prometer cobrança'
      ).toHaveCount(0);
    });

    test('#36/N3 — pelo encaminhamento, Nutrição segue o mesmo caminho das outras', async ({ page }) => {
      await abrirLista(page);
      await page.getByText(NUTRICAO, { exact: true }).first().click();

      // Não há encaminhamento PENDENTE de Nutrição nos dados de demonstração,
      // então a modal oferece a avulsa — o mesmo que acontece em Ortopedia,
      // cujo encaminhamento está SCHEDULED.
      await expect(page.getByText('Você não possui encaminhamentos disponíveis.')).toBeVisible();
    });
  });
}
