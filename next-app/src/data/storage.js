/*
  Camada de dados via localStorage.
  Seed carregado na primeira visita; todas as operações persistem.
*/

const KEYS = {
  REFERRALS:    'APP_REFERRALS',
  APPOINTMENTS: 'APP_APPOINTMENTS',
  HISTORY:      'APP_HISTORY',
};

/* ─── Seed data ─── */
const SEED_REFERRALS = [
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

const SEED_APPOINTMENTS = [
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

const SEED_HISTORY = [
  {
    uuid: 'hist-001',
    type: 'scheduled',
    status: 'FINISHED',
    appointmentBegin: '15/05/2026 09:00',
    appointmentEnd:   '15/05/2026 09:32',
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
    appointmentEnd:   '10/05/2026 14:28',
    professional: { name: 'Ana Beatriz Lima', specialties: [{ name: 'Clínica Geral' }] },
    beneficiaryMedicalReferral: null,
    documents: [
      { type: 'notes',     url: 'https://example.com/docs/atestado-002.pdf' },
      { type: 'medicines', url: 'https://example.com/docs/receita-002.pdf' },
    ],
  },
  {
    uuid: 'hist-003',
    type: 'scheduled',
    status: 'UNFINISHED',
    appointmentBegin: '05/05/2026 10:00',
    appointmentEnd:   null,
    professional: { name: 'Roberto Silva', specialties: [{ name: 'Ortopedia' }] },
    beneficiaryMedicalReferral: null,
    documents: [],
  },
  {
    uuid: 'hist-004',
    type: 'emergency',
    status: 'CANCELLED',
    appointmentBegin: '01/05/2026 16:00',
    appointmentEnd:   null,
    professional: { name: 'Fernanda Rocha', specialties: [{ name: 'Dermatologia' }] },
    beneficiaryMedicalReferral: null,
    documents: [],
  },
  {
    uuid: 'hist-005',
    type: 'scheduled',
    status: 'FINISHED',
    appointmentBegin: '20/04/2026 11:00',
    appointmentEnd:   '20/04/2026 11:45',
    professional: { name: 'Paulo Salave', specialties: [{ name: 'Neurologia' }] },
    beneficiaryMedicalReferral: { urlPath: 'https://example.com/docs/referral-005.pdf' },
    documents: [
      { type: 'referral', url: 'https://example.com/docs/ref-doc-005.pdf' },
    ],
  },
];

/* ─── Primitivas ─── */
function load(key, seed) {
  if (typeof window === 'undefined') return seed;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return JSON.parse(raw);
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch {
    return seed;
  }
}

function persist(key, data) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

/* ─── Referrals ─── */
export function getReferrals() { return load(KEYS.REFERRALS, SEED_REFERRALS); }
export function saveReferrals(data) { persist(KEYS.REFERRALS, data); }
export function updateReferral(uuid, patch) {
  const now = new Date().toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' }).replace(',', '');
  const list = getReferrals().map(r => r.uuid === uuid ? { ...r, ...patch, updatedAt: now } : r);
  saveReferrals(list);
  return list;
}

/* ─── Appointments ─── */
export function getAppointments() { return load(KEYS.APPOINTMENTS, SEED_APPOINTMENTS); }
export function saveAppointments(data) { persist(KEYS.APPOINTMENTS, data); }
export function addAppointment(apt) {
  const list = [apt, ...getAppointments()];
  saveAppointments(list);
  return list;
}
export function updateAppointment(uuid, patch) {
  const list = getAppointments().map(a => a.uuid === uuid ? { ...a, ...patch } : a);
  saveAppointments(list);
  return list;
}

/* ─── History (somente leitura pela UI) ─── */
export function getHistory() { return load(KEYS.HISTORY, SEED_HISTORY); }
