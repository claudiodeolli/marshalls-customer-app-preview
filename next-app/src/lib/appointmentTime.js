// Quanto falta para a consulta começar, em minutos.
//
// Vivia duplicado na tela de agendamentos e no modal de cancelamento. Um
// minuto de divergência entre os dois faz o card ainda oferecer Reagendar
// enquanto o modal já trata a consulta como dentro das 48 horas, então o
// cálculo é um só.
function parseStart(dateStr, timeStr) {
  const [day, month, year] = (dateStr ?? '').split('/');
  const [hour, minute] = (timeStr ?? '').split(':');
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00-03:00`);
}

export function getMinutesUntilStart(appointment) {
  // Os cards da vitrine trazem a contagem congelada (ver stageDetail em
  // mockData.js): o cliente confere a tela contra a tabela dele, e um card
  // que escorrega de 59 para 52 minutos enquanto a página fica aberta deixa
  // de bater com o que ele especificou.
  const congelado = appointment?.detail?.demoMinutes;
  if (congelado !== undefined) return congelado;

  const inicio = parseStart(appointment?.detail?.date, appointment?.detail?.from);
  if (isNaN(inicio.getTime())) return -1;

  // Para cima, não para baixo: é assim que uma pessoa lê o relógio. Com
  // 54min30s restantes ela diz "faltam 55 minutos", e a tabela do cliente
  // iguala o "faltando X" ao texto exibido.
  return Math.ceil((inicio - Date.now()) / 60000);
}
