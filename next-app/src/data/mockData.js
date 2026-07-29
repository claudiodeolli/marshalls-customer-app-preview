/* Dados financeiros mockados - espelham o mock-api.js do projeto original */

function month(mm, yyyy, revenue, entries, expenses, taxes, rbt12, rbt12p, range, limit, rate) {
  const pad = mm < 10 ? '0' + mm : '' + mm;
  return { tax_period: pad + '-' + yyyy, revenue, entries, expenses, taxes, rbt12, rbt12p, range, limit, rate };
}

export const months2024 = [
  month( 1, 2024,  980000, 1180000,  220000,  58800, 10800000,  9200000, 1, 18000000, 6.0),
  month( 2, 2024, 1050000, 1260000,  230000,  63000, 11200000,  9600000, 1, 18000000, 6.0),
  month( 3, 2024, 1120000, 1340000,  245000,  67200, 11800000, 10100000, 1, 18000000, 6.0),
  month( 4, 2024, 1200000, 1440000,  250000,  72000, 12500000, 10800000, 1, 18000000, 6.0),
  month( 5, 2024, 1350000, 1620000,  260000,  81000, 13200000, 11500000, 1, 18000000, 6.0),
  month( 6, 2024, 1280000, 1540000,  255000,  76800, 13600000, 11900000, 1, 18000000, 6.0),
  month( 7, 2024, 1380000, 1660000,  270000,  82800, 14100000, 12400000, 1, 18000000, 6.0),
  month( 8, 2024, 1450000, 1740000,  280000,  87000, 14700000, 12900000, 1, 18000000, 6.0),
  month( 9, 2024, 1300000, 1560000,  265000,  78000, 15000000, 13200000, 1, 18000000, 6.0),
  month(10, 2024, 1600000, 1920000,  295000,  96000, 15800000, 13900000, 1, 18000000, 6.0),
  month(11, 2024, 1750000, 2100000,  310000, 105000, 16500000, 14500000, 1, 18000000, 6.0),
  month(12, 2024, 1900000, 2280000,  320000, 114000, 17200000, 15100000, 1, 18000000, 6.0),
];

export const months2025 = [
  month( 1, 2025, 1420000, 1704000,  285000,  85200, 15800000, 13900000, 1, 18000000, 6.0),
  month( 2, 2025, 1580000, 1896000,  300000,  94800, 16300000, 14300000, 1, 18000000, 6.0),
  month( 3, 2025, 1650000, 1980000,  315000,  99000, 16900000, 14800000, 1, 18000000, 6.0),
  month( 4, 2025, 1720000, 2064000,  325000, 103200, 17500000, 15400000, 1, 18000000, 6.0),
  month( 5, 2025, 1850000, 2220000,  340000, 111000, 18100000, 15900000, 2, 36000000, 11.2),
  month( 6, 2025, 1780000, 2136000,  330000, 106800, 18600000, 16400000, 2, 36000000, 11.2),
  month( 7, 2025, 1920000, 2304000,  355000, 115200, 19200000, 16900000, 2, 36000000, 11.2),
  month( 8, 2025, 2050000, 2460000,  370000, 123000, 19900000, 17500000, 2, 36000000, 11.2),
  month( 9, 2025, 1980000, 2376000,  360000, 118800, 20400000, 17900000, 2, 36000000, 11.2),
  month(10, 2025, 2200000, 2640000,  390000, 132000, 21100000, 18500000, 2, 36000000, 11.2),
  month(11, 2025, 2350000, 2820000,  410000, 141000, 21900000, 19200000, 2, 36000000, 11.2),
  month(12, 2025, 2480000, 2976000,  425000, 148800, 22600000, 19800000, 2, 36000000, 11.2),
];

const profitBaseAmounts = [410000,480000,500000,520000,550000,530000,560000,590000,570000,620000,660000,680000];

export const profitDistribution = {
  '2024': {
    total: 5670000,
    directors: [{ director_id: 1, name: 'MARSHALLS CORPORATE AND DIGITAL BUSINESS', total: 5670000 }],
    months: profitBaseAmounts.map((amt, idx) => ({
      period: (idx + 1 < 10 ? '0' + (idx + 1) : '' + (idx + 1)),
      directors: [{ director_id: 1, amount: amt }],
    })),
  },
  '2025': {
    total: 6670000,
    directors: [{ director_id: 1, name: 'MARSHALLS CORPORATE AND DIGITAL BUSINESS', total: 6670000 }],
    months: profitBaseAmounts.map((amt, idx) => ({
      period: (idx + 1 < 10 ? '0' + (idx + 1) : '' + (idx + 1)),
      directors: [{ director_id: 1, amount: Math.round(amt * 1.176) }],
    })),
  },
};

export const mockCompany = {
  id: 1,
  name: 'MARSHALLS CORPORATE AND DIGITAL BUSINESS',
  tax_regime: 'simples_nacional',
  cnpj: '00.000.000/0001-00',
  opened_at: '2020-01-01',
  tax_period_start: '01-2020',
  taxes: [
    { id: 1, status: 'paid',    tax_period: '03-2025', due_at: '2025-04-20', file_link: 'https://example.com/file1.pdf' },
    { id: 2, status: 'paid',    tax_period: '04-2025', due_at: '2025-05-20', file_link: 'https://example.com/file2.pdf' },
    { id: 3, status: 'pending', tax_period: '05-2025', due_at: '2025-06-20', file_link: null },
  ],
};

export const mockUser = {
  id: 1,
  name: 'João Demo',
  email: 'demo@marshalls.com',
  role: 1,
  companies: [{ id: 1, name: 'MARSHALLS CORPORATE AND DIGITAL BUSINESS', opened_at: '2020-01-01' }],
};

/* Converte centavos para string BRL: 1420000 → "R$ 14.200,00" */
export function formatBRL(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export const taxItems = [
  { id: 1, period: '01/2025', type: 'DAS', due: '20/02/2025', amount: 'R$ 852,00',   status: 'paid' },
  { id: 2, period: '02/2025', type: 'DAS', due: '20/03/2025', amount: 'R$ 948,00',   status: 'paid' },
  { id: 3, period: '03/2025', type: 'DAS', due: '20/04/2025', amount: 'R$ 990,00',   status: 'paid' },
  { id: 4, period: '04/2025', type: 'DAS', due: '20/05/2025', amount: 'R$ 1.032,00', status: 'paid' },
  { id: 5, period: '05/2025', type: 'DAS', due: '20/06/2025', amount: 'R$ 1.110,00', status: 'pending' },
];

export const taxDetail = {
  '1': { period: '01/2025', type: 'DAS', due: '20/02/2025', amount: 'R$ 852,00',   status: 'paid',    revenue: 'R$ 14.200,00', rate: '6,0%', faixa: '1ª Faixa' },
  '2': { period: '02/2025', type: 'DAS', due: '20/03/2025', amount: 'R$ 948,00',   status: 'paid',    revenue: 'R$ 15.800,00', rate: '6,0%', faixa: '1ª Faixa' },
  '3': { period: '03/2025', type: 'DAS', due: '20/04/2025', amount: 'R$ 990,00',   status: 'paid',    revenue: 'R$ 16.500,00', rate: '6,0%', faixa: '1ª Faixa' },
  '4': { period: '04/2025', type: 'DAS', due: '20/05/2025', amount: 'R$ 1.032,00', status: 'paid',    revenue: 'R$ 17.200,00', rate: '6,0%', faixa: '1ª Faixa' },
  '5': { period: '05/2025', type: 'DAS', due: '20/06/2025', amount: 'R$ 1.110,00', status: 'pending', revenue: 'R$ 18.500,00', rate: '6,0%', faixa: '1ª Faixa' },
};

export const declItems = [
  { id: 1, period: '01/2025', type: 'DASN-Simei', due: '31/01/2025', sent: '15/01/2025', status: 'sent' },
  { id: 2, period: '01/2025', type: 'DEFIS',      due: '31/03/2025', sent: '10/03/2025', status: 'sent' },
  { id: 3, period: '12/2024', type: 'DeSTDA',     due: '20/01/2025', sent: '18/01/2025', status: 'sent' },
  { id: 4, period: '01/2025', type: 'DeSTDA',     due: '20/02/2025', sent: '19/02/2025', status: 'sent' },
  { id: 5, period: '02/2025', type: 'DeSTDA',     due: '20/03/2025', sent: null,         status: 'pending' },
];

export const declDetail = {
  '1': { period: '01/2025', type: 'DASN-Simei', due: '31/01/2025', sent: '15/01/2025', status: 'sent',    protocol: 'DASN-2025-001234', obs: 'Declaração anual enviada com sucesso.' },
  '2': { period: '01/2025', type: 'DEFIS',      due: '31/03/2025', sent: '10/03/2025', status: 'sent',    protocol: 'DEFIS-2025-005678', obs: 'Declaração de informações socioeconômicas e fiscais.' },
  '3': { period: '12/2024', type: 'DeSTDA',     due: '20/01/2025', sent: '18/01/2025', status: 'sent',    protocol: 'DESTDA-2025-009012', obs: 'Declaração de substituição tributária.' },
  '4': { period: '01/2025', type: 'DeSTDA',     due: '20/02/2025', sent: '19/02/2025', status: 'sent',    protocol: 'DESTDA-2025-003456', obs: 'Declaração de substituição tributária.' },
  '5': { period: '02/2025', type: 'DeSTDA',     due: '20/03/2025', sent: null,         status: 'pending', protocol: null,                 obs: 'Aguardando envio pelo contador.' },
};

export const partners = [
  { name: 'Notasy',        desc: 'Emissão de notas fiscais integrada ao seu faturamento', icon: 'File',       variant: 'light-primary', url: 'https://notasy.com.br' },
  { name: 'Conta Simples', desc: 'Conta bancária PJ com múltiplos cartões de crédito',   icon: 'CreditCard', variant: 'light-success', url: 'https://lp.contasimples.com/contasy' },
  { name: 'Appmax',        desc: 'Gateway de pagamentos com 98% de taxa de aprovação',   icon: 'TrendingUp', variant: 'light-warning', url: 'https://appmax.com.br' },
  { name: 'Jusbrasil',     desc: 'Consulta jurídica e acompanhamento de processos',      icon: 'Book',       variant: 'light-info',    url: 'https://jusbrasil.com.br' },
];

export const mockReferrals = [
  // PENDING — aguardando agendamento pelo paciente
  {
    uuid: 'ref-001',
    status: 'PENDING',
    beneficiary: { name: 'João da Silva' },
    specialty: { uuid: 'spec-001', name: 'Cardiologia' },
    createdAt: '01/06/2026 10:00:00',
    updatedAt: '01/06/2026 10:00:00',
    urlPath: null,
    referredByDoctor: { name: 'André Faria' },
  },
  {
    uuid: 'ref-002',
    status: 'PENDING',
    beneficiary: { name: 'João da Silva' },
    specialty: { uuid: 'spec-004', name: 'Neurologia' },
    createdAt: '03/06/2026 14:30:00',
    updatedAt: '03/06/2026 14:30:00',
    urlPath: null,
    referredByDoctor: { name: 'Carlos Mendes' },
  },
  // SCHEDULED — agendamento realizado (→ apt-001 em agendamentos)
  {
    uuid: 'ref-003',
    status: 'SCHEDULED',
    beneficiary: { name: 'João da Silva' },
    specialty: { uuid: 'spec-003', name: 'Ortopedia' },
    createdAt: '20/05/2026 09:00:00',
    updatedAt: '25/05/2026 11:00:00',
    urlPath: 'https://example.com/docs/encaminhamento-003.pdf',
    referredByDoctor: { name: 'Paulo Salave' },
  },
  // FINISHED — consulta realizada (→ apt-003 em agendamentos + hist-002 em histórico)
  {
    uuid: 'ref-004',
    status: 'FINISHED',
    beneficiary: { name: 'João da Silva' },
    specialty: { uuid: 'spec-004', name: 'Neurologia' },
    createdAt: '05/05/2026 08:00:00',
    updatedAt: '20/05/2026 10:45:00',
    urlPath: 'https://example.com/docs/encaminhamento-004.pdf',
  },
  // UNFINISHED — consulta não concluída (→ apt-004 em agendamentos + hist-003 em histórico)
  {
    uuid: 'ref-005',
    status: 'UNFINISHED',
    beneficiary: { name: 'João da Silva' },
    specialty: { uuid: 'spec-005', name: 'Dermatologia' },
    createdAt: '10/05/2026 13:00:00',
    updatedAt: '15/05/2026 09:30:00',
    urlPath: null,
  },
];

export const mockHistory = [
  // Pronto atendimento mais recente — sem encaminhamento, com documentos
  {
    uuid: 'hist-001',
    type: 'emergency',
    status: 'FINISHED',
    appointmentBegin: '08/06/2026 19:15',
    appointmentEnd: '08/06/2026 19:42',
    professional: { name: 'Mariana Costa', specialties: [{ name: 'Clínica Geral' }] },
    beneficiaryMedicalReferral: null,
    documents: [
      { type: 'notes',    url: 'https://example.com/docs/atestado-hist001.pdf' },
      { type: 'medicines', url: 'https://example.com/docs/receita-hist001.pdf' },
    ],
  },
  // Agendamento com especialista — de ref-004 (Neurologia FINISHED) = apt-003
  {
    uuid: 'hist-002',
    type: 'scheduled',
    status: 'FINISHED',
    appointmentBegin: '20/05/2026 10:00',
    appointmentEnd: '20/05/2026 10:48',
    professional: { name: 'Paulo Salave', specialties: [{ name: 'Neurologia' }] },
    beneficiaryMedicalReferral: { urlPath: 'https://example.com/docs/encaminhamento-004.pdf' },
    documents: [
      { type: 'report', url: 'https://example.com/docs/laudo-hist002.pdf' },
      { type: 'exam',   url: 'https://example.com/docs/exame-hist002.pdf' },
    ],
    evaluation: null,
  },
  // Agendamento com especialista — consulta avulsa UNFINISHED
  {
    uuid: 'hist-003',
    type: 'scheduled',
    status: 'UNFINISHED',
    appointmentBegin: null,
    appointmentEnd: null,
    professional: { name: 'Fernanda Rocha', specialties: [{ name: 'Dermatologia' }] },
    beneficiaryMedicalReferral: null,
    createdAt: '15/05/2026 08:30:00',
    updatedAt: '15/05/2026 09:00:00',
    documents: [],
  },
  // Agendamento com especialista — encaminhamento UNFINISHED
  {
    uuid: 'hist-006',
    type: 'scheduled',
    status: 'UNFINISHED',
    appointmentBegin: null,
    appointmentEnd: null,
    professional: { name: 'Fernanda Rocha', specialties: [{ name: 'Ortopedia' }] },
    beneficiaryMedicalReferral: {
      urlPath: 'https://example.com/docs/encaminhamento-006.pdf',
      referredByDoctor: { name: 'André Faria' },
    },
    createdAt: '10/05/2026 14:00:00',
    updatedAt: '10/05/2026 14:00:00',
    documents: [],
  },
  // Agendamento com especialista — SCHEDULED com encaminhamento
  {
    uuid: 'hist-007',
    type: 'scheduled',
    status: 'SCHEDULED',
    appointmentBegin: '30/07/2026 10:00',
    appointmentEnd: null,
    professional: { name: 'Carlos Alves', specialties: [{ name: 'Psiquiatria' }] },
    beneficiaryMedicalReferral: {
      urlPath: 'https://example.com/docs/encaminhamento-007.pdf',
      referredByDoctor: { name: 'André Faria' },
    },
    createdAt: '20/07/2026 09:00:00',
    updatedAt: '22/07/2026 11:00:00',
    documents: [],
  },
  // Agendamento com especialista — SCHEDULED consulta avulsa
  {
    uuid: 'hist-008',
    type: 'scheduled',
    status: 'SCHEDULED',
    appointmentBegin: '05/08/2026 15:00',
    appointmentEnd: null,
    professional: { name: 'Carla Borges', specialties: [{ name: 'Psicologia' }] },
    beneficiaryMedicalReferral: null,
    createdAt: '25/07/2026 10:00:00',
    updatedAt: '25/07/2026 10:00:00',
    documents: [],
  },
  // Consulta avulsa cancelada — sem encaminhamento = apt-005
  {
    uuid: 'hist-004',
    type: 'scheduled',
    status: 'CANCELED',
    appointmentBegin: '12/05/2026 11:00',
    appointmentEnd: null,
    professional: { name: 'Carlos Mendes', specialties: [{ name: 'Cardiologia' }] },
    beneficiaryMedicalReferral: null,
    documents: [],
  },
  // Pronto atendimento mais antigo — com avaliação preenchida
  {
    uuid: 'hist-005',
    type: 'emergency',
    status: 'FINISHED',
    appointmentBegin: '30/04/2026 21:30',
    appointmentEnd: '30/04/2026 21:55',
    professional: { name: 'André Faria', specialties: [{ name: 'Clínica Geral' }] },
    beneficiaryMedicalReferral: null,
    documents: [
      { type: 'medicines', url: 'https://example.com/docs/receita-hist005.pdf' },
    ],
    evaluation: { rating: 5, comment: 'Atendimento excelente!' },
  },
];

export const mockAppointments = [
  // SCHEDULED (futuro) — originado de ref-003 (Ortopedia SCHEDULED)
  {
    uuid: 'apt-001',
    status: 'SCHEDULED',
    professional: { name: 'Roberto Silva', specialties: [{ name: 'Ortopedia' }] },
    specialty: { name: 'Ortopedia' },
    detail: { date: '28/06/2026', from: '10:00' },
    beneficiaryMedicalReferral: { createdAt: '20/05/2026' },
    cancel: true,
  },
  // SCHEDULED (futuro) — consulta avulsa, sem encaminhamento
  {
    uuid: 'apt-002',
    status: 'SCHEDULED',
    professional: { name: 'Carla Borges', specialties: [{ name: 'Psicologia' }] },
    specialty: { name: 'Psicologia' },
    detail: { date: '05/07/2026', from: '15:00' },
    beneficiaryMedicalReferral: null,
    createdAt: '25/06/2026',
    cancel: false,
  },
  // FINISHED — originado de ref-004 (Neurologia FINISHED) → também em hist-002
  {
    uuid: 'apt-003',
    status: 'FINISHED',
    professional: { name: 'Paulo Salave', specialties: [{ name: 'Neurologia' }] },
    specialty: { name: 'Neurologia' },
    detail: { date: '20/05/2026', from: '10:00' },
    beneficiaryMedicalReferral: { createdAt: '05/05/2026' },
    cancel: false,
  },
  // UNFINISHED — originado de ref-005 (Dermatologia UNFINISHED) → também em hist-003
  {
    uuid: 'apt-004',
    status: 'UNFINISHED',
    professional: { name: 'Fernanda Rocha', specialties: [{ name: 'Dermatologia' }] },
    specialty: { name: 'Dermatologia' },
    detail: { date: '15/05/2026', from: '09:00' },
    beneficiaryMedicalReferral: { createdAt: '10/05/2026' },
    cancel: false,
  },
  // CANCELED — consulta avulsa cancelada, sem encaminhamento → também em hist-004
  {
    uuid: 'apt-005',
    status: 'CANCELED',
    professional: { name: 'Carlos Mendes', specialties: [{ name: 'Cardiologia' }] },
    specialty: { name: 'Cardiologia' },
    detail: { date: '12/05/2026', from: '11:00' },
    beneficiaryMedicalReferral: null,
    cancel: false,
  },
];

export const mockSpecialties = [
  { uuid: 'spec-001', name: 'Cardiologia',   price: 95, referral: true  },
  { uuid: 'spec-002', name: 'Nutrição',      price: 70, referral: false },
  { uuid: 'spec-003', name: 'Ortopedia',     price: 95, referral: true  },
  { uuid: 'spec-004', name: 'Neurologia',    price: 95, referral: true  },
  { uuid: 'spec-005', name: 'Dermatologia',  price: 95, referral: true  },
  { uuid: 'spec-006', name: 'Psicologia',    price: 70, referral: true  },
  { uuid: 'spec-007', name: 'Clínica Geral', price: 95, referral: true  },
];

export function getMockAvailability(specialtyUuid) {
  const times = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const slots = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 1; i <= 30; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const day = String(d.getDate()).padStart(2, '0');
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    const yr = d.getFullYear();
    const dateStr = `${day}/${mon}/${yr}`;
    const key = `${day}${mon}${yr}`;
    times.forEach(from => {
      slots.push({
        uuid: `avail-${specialtyUuid}-${key}-${from.replace(':', '')}`,
        date: dateStr,
        from,
      });
    });
  }
  return slots;
}

export function generateMockAppointments() {
  function offsetDetail(minutesFromNow) {
    const d = new Date(Date.now() + minutesFromNow * 60000);
    const parts = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(d);
    const get = type => parts.find(p => p.type === type)?.value ?? '00';
    return {
      date: `${get('day')}/${get('month')}/${get('year')}`,
      from: `${get('hour')}:${get('minute')}`,
    };
  }

  const todayDate = offsetDetail(0).date;

  return [
    // 🗓 Em 3 dias
    {
      uuid: 'apt-dyn-3days',
      status: 'SCHEDULED',
      professional: { name: 'Roberto Silva', specialties: [{ name: 'Ortopedia' }] },
      specialty: { name: 'Ortopedia' },
      detail: offsetDetail(3 * 1440),
      beneficiaryMedicalReferral: { createdAt: '20/05/2026' },
      cancel: true,
    },
    // 🗓 Amanhã (~26h)
    {
      uuid: 'apt-dyn-tomorrow',
      status: 'SCHEDULED',
      professional: { name: 'Ana Lima', specialties: [{ name: 'Clínica Geral' }] },
      specialty: { name: 'Clínica Geral' },
      detail: offsetDetail(26 * 60),
      beneficiaryMedicalReferral: null,
      createdAt: todayDate,
      cancel: true,
    },
    // ⏱ Em 5 horas
    {
      uuid: 'apt-dyn-5h',
      status: 'SCHEDULED',
      professional: { name: 'Marcos Teixeira', specialties: [{ name: 'Cardiologia' }] },
      specialty: { name: 'Cardiologia' },
      detail: offsetDetail(5 * 60),
      beneficiaryMedicalReferral: null,
      createdAt: todayDate,
      cancel: false,
    },
    // ⏱ Em 30 minutos
    {
      uuid: 'apt-dyn-30min',
      status: 'SCHEDULED',
      professional: { name: 'Carlos Mendes', specialties: [{ name: 'Neurologia' }] },
      specialty: { name: 'Neurologia' },
      detail: offsetDetail(30),
      beneficiaryMedicalReferral: null,
      createdAt: todayDate,
      cancel: true,
    },
    // 🟢 Em 8 minutos (Você já pode entrar)
    {
      uuid: 'apt-dyn-8min',
      status: 'SCHEDULED',
      professional: { name: 'Carla Borges', specialties: [{ name: 'Psicologia' }] },
      specialty: { name: 'Psicologia' },
      detail: offsetDetail(8),
      beneficiaryMedicalReferral: null,
      createdAt: todayDate,
      cancel: false,
    },
    // 🟢 Em instantes (passado)
    {
      uuid: 'apt-dyn-now',
      status: 'SCHEDULED',
      professional: { name: 'Fernanda Rocha', specialties: [{ name: 'Dermatologia' }] },
      specialty: { name: 'Dermatologia' },
      detail: offsetDetail(-5),
      beneficiaryMedicalReferral: null,
      createdAt: todayDate,
      cancel: false,
    },
    // FINISHED
    {
      uuid: 'apt-003',
      status: 'FINISHED',
      professional: { name: 'Paulo Salave', specialties: [{ name: 'Neurologia' }] },
      specialty: { name: 'Neurologia' },
      detail: { date: '20/05/2026', from: '10:00' },
      beneficiaryMedicalReferral: { createdAt: '05/05/2026' },
      cancel: false,
    },
    // UNFINISHED
    {
      uuid: 'apt-004',
      status: 'UNFINISHED',
      professional: { name: 'Fernanda Rocha', specialties: [{ name: 'Dermatologia' }] },
      specialty: { name: 'Dermatologia' },
      detail: { date: '15/05/2026', from: '09:00' },
      beneficiaryMedicalReferral: { createdAt: '10/05/2026' },
      cancel: false,
    },
    // CANCELED
    {
      uuid: 'apt-005',
      status: 'CANCELED',
      professional: { name: 'Carlos Mendes', specialties: [{ name: 'Cardiologia' }] },
      specialty: { name: 'Cardiologia' },
      detail: { date: '12/05/2026', from: '11:00' },
      beneficiaryMedicalReferral: null,
      cancel: false,
    },
  ];
}

export const requerimentos = [
  { title: 'Requerimento de Abertura', protocol: '#2025-001', date: '12/05/2026', status: 'Em andamento', variant: 'warning', icon: 'FileText'    },
  { title: 'Alteração Contratual',      protocol: '#2025-002', date: '10/04/2026', status: 'Concluído',    variant: 'success', icon: 'CheckCircle' },
  { title: 'Cancelamento de Registro',  protocol: '#2025-003', date: '08/03/2026', status: 'Pendente',     variant: 'danger',  icon: 'AlertCircle' },
  { title: 'Atualização Cadastral',     protocol: '#2025-004', date: '01/03/2026', status: 'Em andamento', variant: 'warning', icon: 'Edit'        },
  { title: 'Certidão de Regularidade',  protocol: '#2025-005', date: '15/02/2026', status: 'Concluído',    variant: 'success', icon: 'CheckCircle' },
];
