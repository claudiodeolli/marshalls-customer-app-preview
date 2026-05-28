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
  {
    uuid: 'ref-001',
    status: 'PENDING',
    beneficiary: { name: 'João da Silva' },
    specialty: { name: 'Cardiologia' },
    createdAt: '15/05/2025 09:30:00',
    updatedAt: '15/05/2025 09:30:00',
    urlPath: null,
  },
  {
    uuid: 'ref-002',
    status: 'PENDING',
    beneficiary: { name: 'Carlos Ferreira' },
    specialty: { name: 'Nutrição' },
    createdAt: '22/05/2025 15:40:00',
    updatedAt: '22/05/2025 15:40:00',
    urlPath: null,
  },
  {
    uuid: 'ref-003',
    status: 'SCHEDULED',
    beneficiary: { name: 'Maria Oliveira' },
    specialty: { name: 'Ortopedia' },
    createdAt: '10/05/2025 14:20:00',
    updatedAt: '20/05/2025 11:45:00',
    urlPath: 'https://example.com/docs/encaminhamento-003.pdf',
  },
  {
    uuid: 'ref-004',
    status: 'FINISHED',
    beneficiary: { name: 'Pedro Costa' },
    specialty: { name: 'Neurologia' },
    createdAt: '01/04/2025 10:00:00',
    updatedAt: '20/04/2025 16:30:00',
    urlPath: 'https://example.com/docs/encaminhamento-004.pdf',
  },
  {
    uuid: 'ref-005',
    status: 'UNFINISHED',
    beneficiary: { name: 'Ana Santos' },
    specialty: { name: 'Dermatologia' },
    createdAt: '25/03/2025 08:15:00',
    updatedAt: '01/04/2025 12:00:00',
    urlPath: null,
  },
];

export const mockHistory = [
  {
    uuid: 'hist-001',
    type: 'scheduled',
    status: 'FINISHED',
    appointmentBegin: '15/05/2026 09:00',
    appointmentEnd: '15/05/2026 09:32',
    professional: { name: 'Carlos Mendes', specialties: [{ name: 'Cardiologia' }] },
    beneficiaryMedicalReferral: { urlPath: 'https://example.com/docs/referral-001.pdf' },
    documents: [
      { type: 'report', url: 'https://example.com/docs/report-001.pdf' },
      { type: 'exam',   url: 'https://example.com/docs/exam-001.pdf' },
    ],
  },
  {
    uuid: 'hist-002',
    type: 'emergency',
    status: 'FINISHED',
    appointmentBegin: '10/05/2026 14:10',
    appointmentEnd: '10/05/2026 14:28',
    professional: { name: 'Ana Beatriz Lima', specialties: [{ name: 'Clínica Geral' }] },
    beneficiaryMedicalReferral: null,
    documents: [
      { type: 'notes',    url: 'https://example.com/docs/atestado-002.pdf' },
      { type: 'medicines', url: 'https://example.com/docs/receita-002.pdf' },
    ],
  },
  {
    uuid: 'hist-003',
    type: 'scheduled',
    status: 'UNFINISHED',
    appointmentBegin: '05/05/2026 10:00',
    appointmentEnd: null,
    professional: { name: 'Roberto Silva', specialties: [{ name: 'Ortopedia' }] },
    beneficiaryMedicalReferral: null,
    documents: [],
  },
  {
    uuid: 'hist-004',
    type: 'emergency',
    status: 'CANCELLED',
    appointmentBegin: '01/05/2026 16:00',
    appointmentEnd: null,
    professional: { name: 'Fernanda Rocha', specialties: [{ name: 'Dermatologia' }] },
    beneficiaryMedicalReferral: null,
    documents: [],
  },
  {
    uuid: 'hist-005',
    type: 'scheduled',
    status: 'FINISHED',
    appointmentBegin: '20/04/2026 11:00',
    appointmentEnd: '20/04/2026 11:45',
    professional: { name: 'Paulo Salave', specialties: [{ name: 'Neurologia' }] },
    beneficiaryMedicalReferral: { urlPath: 'https://example.com/docs/referral-005.pdf' },
    documents: [
      { type: 'referral', url: 'https://example.com/docs/ref-doc-005.pdf' },
    ],
  },
];

export const mockAppointments = [
  {
    uuid: 'apt-001',
    status: 'SCHEDULED',
    professional: { name: 'Carlos Mendes', specialties: [{ name: 'Cardiologia' }] },
    specialty: { name: 'Cardiologia' },
    detail: { date: '28/05/2026', from: '10:00' },
    beneficiaryMedicalReferral: { createdAt: '15/05/2026' },
    cancel: true,
  },
  {
    uuid: 'apt-002',
    status: 'SCHEDULED',
    professional: { name: 'Ana Beatriz Lima', specialties: [{ name: 'Nutrição' }] },
    specialty: { name: 'Nutrição' },
    detail: { date: '02/06/2026', from: '14:00' },
    beneficiaryMedicalReferral: null,
    cancel: false,
  },
  {
    uuid: 'apt-003',
    status: 'FINISHED',
    professional: { name: 'Roberto Silva', specialties: [{ name: 'Ortopedia' }] },
    specialty: { name: 'Ortopedia' },
    detail: { date: '10/05/2026', from: '09:00' },
    beneficiaryMedicalReferral: { createdAt: '01/05/2026' },
    cancel: false,
  },
  {
    uuid: 'apt-004',
    status: 'CANCELED',
    professional: { name: 'Fernanda Rocha', specialties: [{ name: 'Dermatologia' }] },
    specialty: { name: 'Dermatologia' },
    detail: { date: '05/05/2026', from: '11:00' },
    beneficiaryMedicalReferral: null,
    cancel: false,
  },
  {
    uuid: 'apt-005',
    status: 'UNFINISHED',
    professional: { name: 'Paulo Salave', specialties: [{ name: 'Neurologia' }] },
    specialty: { name: 'Neurologia' },
    detail: { date: '01/05/2026', from: '15:00' },
    beneficiaryMedicalReferral: { createdAt: '20/04/2026' },
    cancel: false,
  },
];

export const requerimentos = [
  { title: 'Requerimento de Abertura', protocol: '#2025-001', date: '12/05/2026', status: 'Em andamento', variant: 'warning', icon: 'FileText'    },
  { title: 'Alteração Contratual',      protocol: '#2025-002', date: '10/04/2026', status: 'Concluído',    variant: 'success', icon: 'CheckCircle' },
  { title: 'Cancelamento de Registro',  protocol: '#2025-003', date: '08/03/2026', status: 'Pendente',     variant: 'danger',  icon: 'AlertCircle' },
  { title: 'Atualização Cadastral',     protocol: '#2025-004', date: '01/03/2026', status: 'Em andamento', variant: 'warning', icon: 'Edit'        },
  { title: 'Certidão de Regularidade',  protocol: '#2025-005', date: '15/02/2026', status: 'Concluído',    variant: 'success', icon: 'CheckCircle' },
];
