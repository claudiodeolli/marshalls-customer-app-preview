// Smoke da esteira: prova que o runner do portal, o dev server mock e o
// TestCafe estão de pé. Não cobre requisito de issue — os specs de issue vivem
// em issue-<n>-<slug>.js.
import { Selector } from 'testcafe';

const appUrl = process.env.APP_URL ?? 'http://localhost:3100';
// O primeiro `.card` da tela é o cabeçalho de fuso horário; os cards de consulta
// são os que trazem o status ("Consulta agendada", "Consulta cancelada"...).
const appointmentCard = Selector('.card').withText('Consulta');
const searchButton = Selector('button').withText('Buscar');

fixture('Smoke — Agendamentos').page(`${appUrl}/agendamentos`);

test('a tela de agendamentos renderiza cards de consulta', async t => {
  await t.expect(appointmentCard.exists).ok('nenhum card de consulta renderizado em /agendamentos');
  await t.expect(appointmentCard.count).gt(0);
});

test('o filtro de busca continua acessível', async t => {
  await t.expect(searchButton.filterVisible().exists).ok('o botão "Buscar" sumiu da tela');
});
