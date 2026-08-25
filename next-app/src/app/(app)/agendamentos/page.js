'use client';

import CancelDialog from '@/components/features/agendamentos/CancelDialog';
import EmptyState from '@/components/features/agendamentos/EmptyState';
import { IconAdd, IconArticle, IconClock, IconDoctor, IconHospital } from '@/components/features/agendamentos/icons';
import SkeletonRow from '@/components/features/agendamentos/SkeletonRow';
import FilterChip from '@/components/features/encaminhamentos/FilterChip';
import AttachDocumentsModal from '@/components/features/agendamentos/AttachDocumentsModal';
import { CalendarDays, Clock } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import { generateMockAppointments } from '@/data/mockData';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === '1';

const STATUS_BADGE = {
  SCHEDULED:  '#00cfe8',
  FINISHED:   '#28c76f',
  CANCELED:   '#ea5455',
  UNFINISHED: '#82868b',
  PENDING:    '#ff9f43',
};

const AGEND_STATUS_OPTIONS = [
  { label: 'Todos',          value: '',           color: '#82868b' },
  { label: 'Agendadas',      value: 'SCHEDULED',  color: '#00cfe8' },
  { label: 'Pendentes',      value: 'PENDING',    color: '#ff9f43' },
  { label: 'Canceladas',     value: 'CANCELED',   color: '#ea5455' },
  { label: 'Não realizadas', value: 'UNFINISHED', color: '#82868b' },
];

const TIMEZONE_OPTIONS = [
  { label: '🌐 Automático (navegador)', value: ''                  },
  { label: '🇧🇷 Brasil — GMT-3',        value: 'America/Sao_Paulo' },
  { label: '🇦🇴 Angola — GMT+1',        value: 'Africa/Luanda'    },
  { label: '🇵🇹 Portugal — GMT+0/+1',   value: 'Europe/Lisbon'    },
  { label: '🇲🇿 Moçambique — GMT+2',    value: 'Africa/Maputo'    },
  { label: '🇺🇸 Nova York — GMT-5/-4',  value: 'America/New_York' },
];

function translateStatus(s) {
  return {
    SCHEDULED:  'Consulta agendada',
    CANCELED:   'Consulta cancelada',
    FINISHED:   'Consulta finalizada',
    UNFINISHED: 'Consulta não realizada',
    PENDING:    'Consulta pendente',
  }[s] || s;
}

function getAppointmentOrigin(apt) {
  if (apt.type === 'emergency') return 'Pronto Atendimento';
  if (apt.beneficiaryMedicalReferral) return 'Encaminhamento';
  return 'Consulta avulsa';
}

function getBrowserTz() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function isSameAsBrazil(tz) {
  const t = tz || getBrowserTz();
  try {
    const ref = new Date('2024-07-01T12:00:00Z');
    const fmt = (zone) => parseInt(
      new Intl.DateTimeFormat('en', { timeZone: zone, hour: 'numeric', hour12: false })
        .formatToParts(ref).find(p => p.type === 'hour')?.value ?? '0'
    );
    return fmt('America/Sao_Paulo') === fmt(t);
  } catch { return false; }
}

function convertDateTime(date, time, tz) {
  try {
    const [d, m, y] = date.split('/');
    const [h, min] = time.split(':');
    const dt = new Date(`${y}-${m}-${d}T${h}:${min}:00-03:00`);
    if (isNaN(dt.getTime())) return null;
    const zone = tz || getBrowserTz();
    return {
      date: dt.toLocaleDateString('pt-BR', { timeZone: zone, day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: dt.toLocaleTimeString('pt-BR', { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: false }),
    };
  } catch { return null; }
}

function getMinutesUntil(dateStr, timeStr) {
  try {
    const [d, m, y] = (dateStr ?? '').split('/');
    const [h, min] = (timeStr ?? '').split(':');
    const apptTime = new Date(`${y}-${m}-${d}T${h}:${min}:00-03:00`);
    if (isNaN(apptTime.getTime())) return -1;
    return Math.floor((apptTime - Date.now()) / 60000);
  } catch { return -1; }
}

// Estágios (cliente pediu granularidade específica, ver issue #2 no GitHub):
// dias (>24h) -> "amanhã" (exatamente 24h) -> horas (23h-1h) -> minutos (<60min) -> liberado (<=15min).
// Isso é o que também decide o rótulo "N dias" para hora >24h: usa Math.ceil,
// não Math.floor, porque faltando 47h ainda deve mostrar "2 dias" (e não "1 dia").
function getCountdownStage(minutes) {
  if (minutes <= 15) return 'unlocked';
  if (minutes < 60) return 'minutes';
  const hours = Math.floor(minutes / 60);
  if (hours <= 23) return 'hours';
  if (hours === 24) return 'tomorrow';
  return 'days';
}

// O PDF pede ícone de calendário enquanto a contagem é em dias e relógio a
// partir das 23h, ambos coloridos — não o emoji monocromático de antes.
function CountdownIcon({ minutes }) {
  const stage = getCountdownStage(minutes);
  if (stage === 'days' || stage === 'tomorrow') {
    return <CalendarDays color="#0052ff" size={16} />;
  }
  return <Clock color="#0052ff" size={16} />;
}

// Prazo em que o "Entrar no atendimento" destrava, conforme o PDF. O mesmo
// número aparece no texto do tooltip do botão bloqueado — manter em sincronia.
const UNLOCK_MINUTES = 15;

const BLOCKED_ENTER_TOOLTIP =
  `Este botão será liberado faltando ${UNLOCK_MINUTES} minutos para o atendimento ` +
  'e você poderá anexar documentos para avaliação médica caso desejar.';

// Tamanhos definidos pelo cliente no PDF (altura x largura, em px).
const ENTER_BUTTON_SIZE = { height: '32px', width: '272.72px' };
const SECONDARY_BUTTON_SIZE = { height: '32px', width: '200px' };

function getCountdownText(minutes) {
  const stage = getCountdownStage(minutes);
  if (stage === 'unlocked') return 'Você já pode entrar';
  if (stage === 'minutes') return `Sua consulta começa em ${minutes} minutos`;
  if (stage === 'hours') {
    const hours = Math.floor(minutes / 60);
    return `Sua consulta será daqui a ${hours} hora${hours > 1 ? 's' : ''}`;
  }
  if (stage === 'tomorrow') return 'Sua consulta é amanhã!';
  const days = Math.ceil(minutes / 1440);
  return `Sua consulta será em ${days} dias`;
}

function getCountdownTextMobile(minutes) {
  const stage = getCountdownStage(minutes);
  if (stage === 'unlocked') return 'Pode entrar';
  if (stage === 'minutes') return `${minutes} min`;
  if (stage === 'hours') return `${Math.floor(minutes / 60)} h`;
  if (stage === 'tomorrow') return 'É amanhã';
  return `${Math.ceil(minutes / 1440)} dias`;
}

// Regra do cliente: reagendar só é permitido até 48h antes do horário exato
// da consulta — independente da origem (Encaminhamento ou Avulsa).
function canReschedule(minutes) {
  return minutes >= 48 * 60;
}

// Só a consulta Avulsa cancelada com 48h+ de antecedência preserva o valor
// pago; Encaminhamento sempre perde o encaminhamento ao cancelar.
function keepsPaidCredit(appointment) {
  if (appointment.beneficiaryMedicalReferral) return false;
  return canReschedule(getMinutesUntil(appointment.detail?.date, appointment.detail?.from));
}

function AgendFilterSelect({ value, onChange, minWidth = '200px' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = AGEND_STATUS_OPTIONS.find(o => o.value === value) ?? AGEND_STATUS_OPTIONS[0];

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', minWidth }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', height: '42px', border: '1px solid #d8d6de', borderRadius: '12px',
          background: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 12px', fontSize: '14px', color: '#6e6b7b',
        }}
      >
        <FilterChip label={selected.label} color={selected.color} />
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, marginLeft: 6 }}>
          <path d="M1 1l4 4 4-4" stroke="#6e6b7b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="_dropdown-enter" style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid #d8d6de', borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(34,41,47,0.12)', zIndex: 9999, overflow: 'hidden',
        }}>
          {AGEND_STATUS_OPTIONS.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{ padding: '8px 14px', cursor: 'pointer', background: value === opt.value ? '#f3f2f7' : '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f3f2f7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = value === opt.value ? '#f3f2f7' : '#fff'; }}
            >
              <FilterChip label={opt.label} color={opt.color} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgendamentosPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter]   = useState('SCHEDULED');
  const [appointments, setAppointments]   = useState([]);
  const [cancelTarget, setCancelTarget]   = useState(null);
  const [canceling, setCanceling]         = useState(false);
  const [loading, setLoading]             = useState(false);
  const [pageLoading, setPageLoading]     = useState(true);
  const [timezone, setTimezone]           = useState('');
  const [toast, setToast]                 = useState({ visible: false, message: '', type: 'success' });
  const [pendingAvulsa, setPendingAvulsa] = useState(null);
  const [isMobile, setIsMobile]           = useState(false);
  const [tooltipOpen, setTooltipOpen]     = useState(false);
  const [blockedEnterTooltip, setBlockedEnterTooltip] = useState(false);
  const [attachTarget, setAttachTarget]   = useState(null);
  const [tick, setTick]                   = useState(0);

  useEffect(() => {
    setIsMobile(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
    const tz = getBrowserTz();
    if (TIMEZONE_OPTIONS.find(o => o.value === tz)) setTimezone(tz);

    const raw = localStorage.getItem('pendingAvulsa');
    if (raw) {
      try { setPendingAvulsa(JSON.parse(raw)); } catch { /* ignore */ }
    }

    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  async function fetchAppointments() {
    setLoading(true);
    try {
      if (IS_MOCK) {
        const allMock = generateMockAppointments();
        const filtered = statusFilter
          ? allMock.filter(a => a.status === statusFilter)
          : allMock;
        setAppointments(filtered);
        return;
      }
      const beneficiaryUuid = typeof window !== 'undefined' ? localStorage.getItem('BENEFICIARY_UUID') : '';
      const res = await api.get(`/api/schedule/appointments?status=${statusFilter}`, {
        headers: { beneficiaryUuid },
      });
      if (!('success' in (res.data ?? {}))) {
        setAppointments(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(message, type = 'success') {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  }

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    setCanceling(true);
    try {
      if (IS_MOCK) {
        // Regra do PDF (issue #2): cancelamento de Avulsa DENTRO do prazo de 48h
        // devolve o card ao estado "Pendente" (o valor pago é preservado para
        // um novo agendamento). Encaminhamento — e Avulsa fora do prazo —
        // destroem o agendamento, que passa a viver na tela Histórico.
        if (keepsPaidCredit(cancelTarget)) {
          setAppointments(prev => prev.map(a => (
            a.uuid === cancelTarget.uuid ? { ...a, status: 'PENDING', cancel: false } : a
          )));
          setCancelTarget(null);
          showToast('Consulta cancelada. Você pode agendar uma nova data sem custo adicional.');
          return;
        }
        setAppointments(prev => prev.filter(a => a.uuid !== cancelTarget.uuid));
        setCancelTarget(null);
        showToast('Consulta cancelada. Ela ficará disponível na tela Histórico.');
        return;
      }
      const beneficiaryUuid = typeof window !== 'undefined' ? localStorage.getItem('BENEFICIARY_UUID') : '';
      const res = await api.delete(`/api/schedule/appointments/${cancelTarget.uuid}`, {
        headers: { beneficiaryUuid },
      });
      if (res.data === true) {
        setCancelTarget(null);
        fetchAppointments();
        showToast('Agendamento deletado com sucesso.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.toString() || 'Erro ao cancelar.';
      showToast(msg, 'error');
    } finally {
      setCanceling(false);
    }
  }

  // O PDF pede que o clique no botão liberado abra antes o modal de anexos —
  // a navegação em si acontece em goToAppointment, após essa escolha.
  function handleEnterAppointment(apt) {
    setAttachTarget(apt);
  }

  function goToAppointment(apt, attachments = []) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('APPOINTMENT', JSON.stringify(apt));
      localStorage.setItem('APPOINTMENT_ATTACHMENTS', JSON.stringify(attachments.map(f => f.name)));
    }
    router.push('/schedule/appointment');
  }


  return (
    <div style={{ paddingBottom: '1.5rem' }}>

      {/* Texto descritivo — acima do banner */}
      <div className="mb-2">
        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
          Gerencie seus agendamentos<br className="_mob-break" /> médicos e agende novas consultas.
        </p>
      </div>

      {/* Banner informativo */}
      <div className="alert mb-2" style={{ background:'#eef3ff', border:'1px solid #c7d8ff', borderRadius:'10px', fontSize:'13px', color:'#3b5bdb', padding:'12px 16px' }}>

        {/* Desktop: texto + controles abaixo alinhados à direita */}
        <div className="d-none d-xl-block">
          <strong>Como funciona o agendamento:</strong>
          <p style={{ margin:'8px 0 0' }}>- Se você foi encaminhado(a) a um especialista por um médico do <strong>Pronto Atendimento</strong>, pode agendar aqui <strong>sem custos adicionais</strong>.</p>
          <p style={{ margin:'10px 0 0' }}>- Caso não possua encaminhamento, você também pode adquirir uma <strong>consulta avulsa</strong> com a especialidade desejada.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginRight: 5 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <small className="text-muted" style={{ paddingLeft: '2px' }}>Fuso horário da nova consulta</small>
                  <button
                    type="button"
                    onClick={() => setTooltipOpen(true)}
                    style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#e8e8e8', color: '#555',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      border: '1px solid #c0c0c0', padding: 0, lineHeight: 1,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
                    }}
                  >?</button>
                </div>
                <select
                  className="custom-select _agend-tz-select"
                  style={{ minWidth: '220px', fontSize: '13px' }}
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                >
                  {TIMEZONE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-primary _agend-new-btn"
                onClick={() => router.push('/schedule/calendar')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}
              >
                <IconAdd /> Novo Agendamento
              </button>
            </div>
          </div>
        </div>

        {/* Mobile: só o texto */}
        <div className="d-xl-none">
          <strong>Como funciona o agendamento:</strong>
          <p style={{ margin:'8px 0 0' }}>- Se você foi encaminhado(a) a um especialista por um médico do <strong>Pronto Atendimento</strong>, pode agendar aqui <strong>sem custos adicionais</strong>.</p>
          <p style={{ margin:'10px 0 0' }}>- Caso não possua encaminhamento, você também pode adquirir uma <strong>consulta avulsa</strong> com a especialidade desejada.</p>
        </div>
      </div>

      {/* Mobile: Grupo 1 — Novo agendamento */}
      <div className="d-xl-none card mb-2">
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <small className="text-muted">Fuso horário da nova consulta</small>
              <button
                type="button"
                onClick={() => setTooltipOpen(true)}
                style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#e8e8e8', color: '#555',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  border: '1px solid #c0c0c0', padding: 0, lineHeight: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
                }}
              >?</button>
            </div>
            <select
              className="custom-select"
              style={{ fontSize: '13px' }}
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
            >
              {TIMEZONE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/schedule/calendar')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 700 }}
          >
            <IconAdd /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="pb-75 mb-2 _agend-filters" style={{ borderBottom: '1px solid #ddd', paddingBottom: '12px' }}>

        {/* Desktop: filtro horizontal */}
        <div className="d-none d-xl-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <small style={{ fontWeight: 700, color: '#5e5873', fontSize: '13px' }}>Filtrar consultas</small>
          </div>
          <div className="d-flex align-items-center flex-wrap" style={{ gap: '10px' }}>
            <AgendFilterSelect value={statusFilter} onChange={setStatusFilter} minWidth="220px" />
            <button
              className="btn btn-outline-secondary"
              onClick={fetchAppointments}
              disabled={loading}
              style={{ height: '42px', whiteSpace: 'nowrap' }}
            >
              {loading ? <span className="spinner-border spinner-border-sm" style={{ width:'14px', height:'14px', borderWidth:'2px' }} /> : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Mobile: Grupo 2 — Filtrar consultas */}
        <div className="d-xl-none">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <small style={{ fontWeight: 700, color: '#5e5873', fontSize: '13px' }}>Filtrar consultas</small>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AgendFilterSelect value={statusFilter} onChange={setStatusFilter} />
            <button
              className="btn btn-outline-secondary"
              onClick={fetchAppointments}
              disabled={loading}
              style={{ height: '42px', whiteSpace: 'nowrap' }}
            >
              {loading ? <span className="spinner-border spinner-border-sm" style={{ width:'14px', height:'14px', borderWidth:'2px' }} /> : 'Buscar'}
            </button>
          </div>
        </div>
      </div>

      {/* Consulta avulsa pendente de agendamento */}
      {pendingAvulsa && (
        <div className="card mb-2" style={{ border: '1.5px solid #ffe0a3', background: '#fffbf2' }}>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#5e5873' }}>{pendingAvulsa.name}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#ff9f43', background: '#fff4e5', borderRadius: 12, padding: '2px 10px' }}>
                  Aguardando agendamento
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#6e6b7b', margin: 0 }}>
                Consulta avulsa — R$ {(pendingAvulsa.price ?? 0).toFixed(2).replace('.', ',')}
              </p>
              <p style={{ fontSize: 12, color: '#b9b9c3', margin: '4px 0 0' }}>
                Pagamento confirmado · Escolha uma data e horário quando quiser
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                className="btn btn-primary btn-sm"
                style={{ borderRadius: 24, fontWeight: 700, whiteSpace: 'nowrap' }}
                onClick={() => router.push(`/schedule/calendar?avulsaSpec=${pendingAvulsa.uuid}`)}
              >
                Agendar agora
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                style={{ borderRadius: 24, whiteSpace: 'nowrap' }}
                onClick={() => {
                  setPendingAvulsa(null);
                  if (typeof window !== 'undefined') localStorage.removeItem('pendingAvulsa');
                }}
              >
                Dispensar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de agendamentos */}
      <div style={{ marginTop: '1rem' }}>
        {pageLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[0, 1, 2].map(i => <SkeletonRow key={i} />)}
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {appointments.map(apt => {
              const badgeColor = STATUS_BADGE[apt.status] ?? '#82868b';
              const tz = timezone || getBrowserTz();
              const converted = !isSameAsBrazil(tz) ? convertDateTime(apt.detail?.date, apt.detail?.from, tz) : null;
              const dateChanged = converted && converted.date !== apt.detail?.date;
              const mins = apt.status === 'SCHEDULED' ? getMinutesUntil(apt.detail?.date, apt.detail?.from) : -1;
              const canEnter = mins <= UNLOCK_MINUTES;

              return (
                <div
                  key={apt.uuid}
                  className="card mb-0"
                  style={{ transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start _appt-card-row">

                      <div className="_appt-card-info" style={{ flex: 1 }}>
                        <div className="d-flex align-items-center mb-50" style={{ color: 'var(--primary, #0052ff)' }}>
                          <span style={{ marginRight: '8px', flexShrink: 0 }}><IconDoctor /></span>
                          <span style={{ fontWeight: 600, fontSize: '16px' }}>Dr(a). {apt.professional?.name}</span>
                        </div>

                        <div className="d-flex align-items-center mb-50" style={{ color: '#5e5873' }}>
                          <span style={{ marginRight: '8px', flexShrink: 0, color: '#6e6b7b' }}><IconHospital /></span>
                          <span style={{ fontSize: '14px' }}>
                            <strong>Especialidade:</strong> {apt.specialty?.name}
                          </span>
                        </div>

                        <div className="mb-50" style={{ fontSize: '13px', color: '#6e6b7b' }}>
                          <strong>Origem: </strong>{getAppointmentOrigin(apt)}
                        </div>

                        <div className="d-flex align-items-start mb-50" style={{ color: '#6e6b7b' }}>
                          <span style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }}><IconClock /></span>
                          <div>
                            <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', color: '#5e5873' }}>
                              {apt.detail?.date} às <strong>{apt.detail?.from}</strong>
                              <span title="Horário de Brasília">🇧🇷</span>
                              <span style={{ color: '#9a9a9a', fontSize: '13px' }}>Sao Paulo (GMT-3)</span>
                            </div>
                            {converted && (
                              <div style={{ fontSize: '13px', marginTop: '2px', color: '#5e5873' }}>
                                no seu horário:{dateChanged ? ` ${converted.date} às` : ''} <strong>{converted.time}</strong>
                              </div>
                            )}
                          </div>
                        </div>

                        {apt.beneficiaryMedicalReferral && (
                          <div className="d-flex align-items-center mb-75" style={{ color: '#6e6b7b' }}>
                            <span style={{ marginRight: '8px', flexShrink: 0 }}><IconArticle /></span>
                            <span style={{ fontSize: '14px', color: '#5e5873' }}>
                              <strong>Encaminhamento criado em:</strong> {apt.beneficiaryMedicalReferral.createdAt}
                            </span>
                          </div>
                        )}

                        {!apt.beneficiaryMedicalReferral && apt.createdAt && apt.status === 'SCHEDULED' && (
                          <div className="d-flex align-items-center mb-75" style={{ color: '#6e6b7b' }}>
                            <span style={{ marginRight: '8px', flexShrink: 0 }}><IconArticle /></span>
                            <span style={{ fontSize: '14px', color: '#5e5873' }}>
                              <strong>Consulta adquirida em:</strong> {apt.createdAt}
                            </span>
                          </div>
                        )}

                        <span style={{
                          display: 'inline-block', padding: '3px 10px',
                          border: `1px solid ${badgeColor}`, borderRadius: '20px',
                          color: badgeColor, fontSize: '11px', fontWeight: 700,
                          lineHeight: 1.4, background: `${badgeColor}1f`, whiteSpace: 'nowrap',
                        }}>
                          {translateStatus(apt.status)}
                        </span>
                        {apt.status === 'CANCELED' && (
                          <div style={{ fontSize: '11px', color: '#6e6b7b', marginTop: '3px' }}>usuário cancelou a consulta</div>
                        )}
                        {apt.status === 'UNFINISHED' && (
                          <div style={{ fontSize: '11px', color: '#6e6b7b', marginTop: '3px' }}>usuário não compareceu a consulta</div>
                        )}

                        {/* Mobile: cronômetro + botões */}
                        {apt.status === 'SCHEDULED' && (
                          <div className="d-xl-none" style={{ marginTop: '16px' }}>
                            <span style={{ fontSize: '13px', color: '#5e5873', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <CountdownIcon minutes={mins} /> {getCountdownTextMobile(mins)}
                            </span>
                            {canEnter && (
                              <div data-testid="ready-to-enter" style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                marginTop: '8px', fontSize: '13px', color: '#28c76f', fontWeight: 600,
                              }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c76f', flexShrink: 0 }} />
                                Você já pode entrar!
                              </div>
                            )}
                            {/* O PDF mostra os três botões juntos mesmo em consultas
                                futuras (ex: card "faltando 12 dias" e "faltando
                                47:59h") — só o Reagendar depende do prazo. */}
                            <span
                              title={canEnter ? undefined : BLOCKED_ENTER_TOOLTIP}
                              onClick={() => { if (!canEnter) setBlockedEnterTooltip(true); }}
                              style={{ display: 'block', marginTop: '16px' }}
                            >
                              <button
                                className="btn btn-success btn-sm"
                                disabled={!canEnter}
                                onClick={() => handleEnterAppointment(apt)}
                                style={{ width: '100%', height: ENTER_BUTTON_SIZE.height, padding: '0 12px', pointerEvents: canEnter ? 'auto' : 'none' }}
                              >
                                Entrar no atendimento
                              </button>
                            </span>
                            {canReschedule(mins) ? (
                              <button className="btn btn-success btn-sm" style={{ width: '100%', marginTop: '8px', height: SECONDARY_BUTTON_SIZE.height, padding: '0 12px' }}>
                                Reagendar
                              </button>
                            ) : (
                              /* Espaço do "Reagendar" preservado mesmo quando ele some (regra do PDF) */
                              <div aria-hidden="true" data-testid="reagendar-placeholder" style={{ height: SECONDARY_BUTTON_SIZE.height, marginTop: '8px' }} />
                            )}
                            {apt.cancel && (
                              <button
                                className="btn btn-danger btn-sm"
                                style={{ width: '100%', marginTop: '8px', height: SECONDARY_BUTTON_SIZE.height, padding: '0 12px' }}
                                onClick={() => setCancelTarget(apt)}
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Desktop: cronômetro + botões */}
                      {apt.status === 'SCHEDULED' && (
                        <div className="d-none d-xl-flex flex-column _appt-card-actions" style={{ gap: '8px', marginLeft: '16px', flexShrink: 0, minWidth: ENTER_BUTTON_SIZE.width, alignItems: 'stretch' }}>
                          <span style={{ fontSize: '13px', color: '#5e5873', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                            <CountdownIcon minutes={mins} /> {getCountdownText(mins)}
                          </span>
                          {canEnter && (
                            <div data-testid="ready-to-enter" style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              fontSize: '13px', color: '#28c76f', fontWeight: 600,
                            }}>
                              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c76f', flexShrink: 0 }} />
                              Você já pode entrar!
                            </div>
                          )}
                          {/* Ver comentário no bloco mobile: os três botões coexistem
                              mesmo em consultas futuras, conforme os cards do PDF. */}
                          <span
                            title={canEnter ? undefined : BLOCKED_ENTER_TOOLTIP}
                            onClick={() => { if (!canEnter) setBlockedEnterTooltip(true); }}
                            style={{ display: 'block' }}
                          >
                            <button
                              className="btn btn-success _contact-btn"
                              disabled={!canEnter}
                              onClick={() => handleEnterAppointment(apt)}
                              style={{ width: '100%', height: ENTER_BUTTON_SIZE.height, padding: '0 12px', pointerEvents: canEnter ? 'auto' : 'none' }}
                            >
                              Entrar no atendimento
                            </button>
                          </span>
                          {canReschedule(mins) ? (
                            <button
                              className="btn btn-success _contact-btn"
                              style={{ height: SECONDARY_BUTTON_SIZE.height, padding: '0 12px', alignSelf: 'center', width: SECONDARY_BUTTON_SIZE.width, maxWidth: '100%' }}
                            >
                              Reagendar
                            </button>
                          ) : (
                            /* Espaço do "Reagendar" preservado mesmo quando ele some (regra do PDF) */
                            <div aria-hidden="true" data-testid="reagendar-placeholder" style={{ height: SECONDARY_BUTTON_SIZE.height }} />
                          )}
                          {apt.cancel && (
                            <button
                              className="btn btn-outline-danger _contact-btn"
                              onClick={() => setCancelTarget(apt)}
                              style={{ height: SECONDARY_BUTTON_SIZE.height, padding: '0 12px', alignSelf: 'center', width: SECONDARY_BUTTON_SIZE.width, maxWidth: '100%' }}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CancelDialog
        open={!!cancelTarget}
        appointment={cancelTarget}
        loading={canceling}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
      />

      <AttachDocumentsModal
        open={!!attachTarget}
        onClose={() => setAttachTarget(null)}
        onContinue={files => {
          const apt = attachTarget;
          setAttachTarget(null);
          goToAppointment(apt, files);
        }}
      />

      {/* Explicação do botão bloqueado — em telas de toque não há hover pro title */}
      {blockedEnterTooltip && (
        <div
          onClick={() => setBlockedEnterTooltip(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div className="card mb-0 _modal-enter" style={{ width: 360, maxWidth: '100%', borderRadius: 12 }}>
            <div className="card-body" style={{ padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem', fontSize: 14, color: '#5e5873' }}>{BLOCKED_ENTER_TOOLTIP}</p>
              <div className="d-flex justify-content-end">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setBlockedEnterTooltip(false)}>
                  Entendi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast {...toast} />

      {/* Tooltip modal mobile */}
      {tooltipOpen && (
        <div
          onClick={() => setTooltipOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(34,41,47,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
        >
          <div
            className="_modal-enter"
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 360, boxShadow: '0 12px 40px rgba(34,41,47,0.25)' }}
          >
            <div style={{ padding: '18px 24px 16px', borderBottom: '1px solid #ebe9f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0, fontWeight: 600, color: '#5e5873', fontSize: 16 }}>Fuso horário da nova consulta</h5>
              <button onClick={() => setTooltipOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 24, lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ color: '#6e6b7b', fontSize: 14, margin: 0 }}>
                Selecione o fuso horário da consulta antes de um novo agendamento.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
