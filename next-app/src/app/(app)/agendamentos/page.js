'use client';

import CancelDialog from '@/components/features/agendamentos/CancelDialog';
import EmptyState from '@/components/features/agendamentos/EmptyState';
import { IconAdd, IconArticle, IconClock, IconDoctor, IconHospital } from '@/components/features/agendamentos/icons';
import SkeletonRow from '@/components/features/agendamentos/SkeletonRow';
import FilterChip from '@/components/features/encaminhamentos/FilterChip';
import AttachDocumentsModal from '@/components/features/agendamentos/AttachDocumentsModal';
import { MODAL_OVERLAY, MODAL_CARD, MODAL_BODY, MODAL_TEXT_MUTED, MODAL_ACTIONS, MODAL_BUTTON } from '@/components/ui/modalScale';
import Toast from '@/components/ui/Toast';
import { generateMockAppointments } from '@/data/mockData';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import EmojiIcon from '@/components/ui/EmojiIcon';
import RescheduleDialog from '@/components/features/agendamentos/RescheduleDialog';
import SlotChoiceModal from '@/components/features/schedule/SlotChoiceModal';
import { aplicarReagendamentos } from '@/lib/reagendamentos';
import { mockSpecialties } from '@/data/mockData';
import { getMinutesUntilStart } from '@/lib/appointmentTime';

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

// Ordem dos grupos no filtro "Todos", definida pelo cliente (issue #3):
// agendadas → pendentes → canceladas → não realizadas. Status fora desta
// lista (ex: FINISHED, que pertence à tela Histórico) vai para o fim.
const STATUS_DISPLAY_ORDER = ['SCHEDULED', 'PENDING', 'CANCELED', 'UNFINISHED'];

function statusRank(status) {
  const index = STATUS_DISPLAY_ORDER.indexOf(status);
  return index === -1 ? STATUS_DISPLAY_ORDER.length : index;
}

// Dentro de cada status, Encaminhamento vem antes de Consulta avulsa.
function originRank(apt) {
  return apt.beneficiaryMedicalReferral ? 0 : 1;
}

/**
 * Ordena para exibição: primeiro por status (na ordem pedida pelo cliente),
 * depois por origem. Vale tanto para o filtro "Todos" — onde os grupos
 * precisam aparecer nessa sequência — quanto para um filtro específico, em
 * que só a ordenação por origem tem efeito.
 */
function sortForDisplay(appointments) {
  return [...appointments].sort((a, b) => {
    const byStatus = statusRank(a.status) - statusRank(b.status);
    if (byStatus !== 0) return byStatus;

    const byOrigin = originRank(a) - originRank(b);
    if (byOrigin !== 0) return byOrigin;

    // Dentro da mesma origem, do prazo mais distante para o mais próximo —
    // é a sequência em que o PDF percorre os estágios da contagem (issue #8).
    return getMinutesUntilStart(b) - getMinutesUntilStart(a);
  });
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

// Assets do Microsoft Fluent Emoji 3D servidos pelo próprio projeto, e não
// caracteres unicode (issue #11): o emoji do sistema muda de desenho entre
// Windows, macOS, iOS e Android, e o cliente quer o mesmo em todos. Os
// codepoints que ele especificou são U+1F4C5 (Calendar) e U+1F552 (Three
// o'clock) — não os que a tela usava antes.
//
// alt vazio de propósito: são decorativos, o texto ao lado já informa.
const ICON_SIZE = 24;

function CountdownIcon({ minutes }) {
  const stage = getCountdownStage(minutes);
  const emDias = stage === 'days' || stage === 'tomorrow';
  return (
    <EmojiIcon name={emDias ? 'calendario' : 'relogio'} size={ICON_SIZE} />
  );
}

// Prazo em que o "Entrar no atendimento" destrava, conforme o PDF. O mesmo
// número aparece no texto do tooltip do botão bloqueado — manter em sincronia.
const UNLOCK_MINUTES = 15;

const BLOCKED_ENTER_TOOLTIP =
  `Este botão será liberado faltando ${UNLOCK_MINUTES} minutos para o atendimento ` +
  'e você poderá anexar documentos para avaliação médica caso desejar.';

// Tamanhos definidos pelo cliente no PDF (altura x largura, em px). Valem
// para Desktop e Mobile — antes o mobile esticava os botões na largura do
// card (issue #13).
// Alturas medidas por ele no print de 27/08: 37px no "Entrar no atendimento"
// e 34px nos outros dois. As larguras seguem as da #13, que ele não mexeu.
const ENTER_BUTTON_SIZE = { height: '37px', width: '272.72px' };
const SECONDARY_BUTTON_SIZE = { height: '34px', width: '200px' };

const ENTER_BUTTON = {
  height: ENTER_BUTTON_SIZE.height,
  width: ENTER_BUTTON_SIZE.width,
  maxWidth: '100%',
  padding: '0 12px',
};

// Só o "Entrar no atendimento" segue preenchido. Reagendar e Cancelar ficam
// com fundo claro, borda e texto na própria cor (issue #13).
const SECONDARY_BUTTON_BASE = {
  height: SECONDARY_BUTTON_SIZE.height,
  width: SECONDARY_BUTTON_SIZE.width,
  maxWidth: '100%',
  padding: '0 12px',
  background: '#fff',
  borderRadius: '6px',
  fontSize: '13px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};
// Borda na mesma cor do texto nos dois: o Cancelar já era assim, e ele pediu
// que o Reagendar acompanhasse — antes a borda era um cinza mais claro que a
// letra. O fundo leve do hover vive em globals.css (._card-btn-*).
const RESCHEDULE_COLOR = '#6e6b7b';
const CANCEL_COLOR = '#ea5455';
const RESCHEDULE_BUTTON = { ...SECONDARY_BUTTON_BASE, border: `1px solid ${RESCHEDULE_COLOR}`, color: RESCHEDULE_COLOR };
const CANCEL_BUTTON = { ...SECONDARY_BUTTON_BASE, border: `1px solid ${CANCEL_COLOR}`, color: CANCEL_COLOR };

/**
 * Envolve o "Entrar no atendimento" para explicar por que ele está travado.
 *
 * No hover, um tooltip do próprio app (issue #14) — o `title` nativo até
 * respondia, mas quem o desenhava era o sistema operacional, com atraso e
 * fonte de fora. No clique, o diálogo continua, porque em tela de toque não
 * existe hover. Liberado, nada disso aparece.
 */
function BlockedEnterWrapper({ apt, canEnter, onBlockedClick, style, children }) {
  if (canEnter) return <span style={{ display: 'block', ...style }}>{children}</span>;

  return (
    <span
      className="_blocked-enter"
      onClick={onBlockedClick}
      style={style}
    >
      {children}
      <span className="_blocked-tip" role="tooltip" id={`entrar-bloqueado-${apt.uuid}`}>
        {BLOCKED_ENTER_TOOLTIP}
      </span>
    </span>
  );
}

// Respiro entre o "Entrar no atendimento" e os outros dois botões. No
// desktop é o que desce Reagendar e Cancelar até a linha da tag de status,
// que o cliente usou como referência de alinhamento.
const ENTER_GAP = '20px';

// Padrão tipográfico do card, pedido para o texto do contador (issue #13).
const COUNTDOWN_FONT_SIZE = '14px';

// Conta em horas cheias antes de dividir por 24. Dividir os minutos direto
// faria 48h05 virar "3 dias", quebrando o par que o PDF usa para ensinar a
// regra: 48h e 47:59 mostram os dois "2 dias", e só o botão Reagendar muda.
function daysUntil(minutes) {
  return Math.ceil(Math.floor(minutes / 60) / 24);
}

// No estágio liberado o contador segue mostrando os minutos; quem anuncia a
// liberação é o indicador verde ao lado ("Você já pode entrar!"), como na
// pág. 8 do PDF. Antes os dois diziam a mesma coisa.
function getCountdownText(minutes) {
  const stage = getCountdownStage(minutes);
  // A exclamação faz parte do texto que o cliente especificou, em todos os
  // estágios — ver o print anexado à issue #12.
  if (stage === 'unlocked' || stage === 'minutes') {
    return `Sua consulta começa em ${Math.max(minutes, 0)} minutos!`;
  }
  if (stage === 'hours') {
    const hours = Math.floor(minutes / 60);
    return `Sua consulta será daqui a ${hours} hora${hours > 1 ? 's' : ''}!`;
  }
  if (stage === 'tomorrow') return 'Sua consulta é amanhã!';
  return `Sua consulta será em ${daysUntil(minutes)} dias!`;
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
  return canReschedule(getMinutesUntilStart(appointment));
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
  // Duas etapas, como no PDF: primeiro confirmar a intenção, depois escolher
  // quando (issue #25).
  const [reagendarTarget, setReagendarTarget] = useState(null);
  const [escolherNovaData, setEscolherNovaData] = useState(null);
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

  /**
   * Leva ao fluxo de marcação com a especialidade já definida, carregando o
   * agendamento que será substituído ao concluir.
   */
  function irParaNovaData(apt) {
    const referralUuid = apt.beneficiaryMedicalReferral?.uuid;
    const especialidade = mockSpecialties.find(e => e.name === (apt.specialty?.name ?? apt.professional?.specialties?.[0]?.name));
    const origem = referralUuid
      ? `referral=${referralUuid}`
      : `avulsaSpec=${especialidade?.uuid ?? ''}`;

    router.push(`/schedule/calendar?${origem}&reagendarDe=${apt.uuid}`);
  }

  async function fetchAppointments() {
    setLoading(true);
    try {
      if (IS_MOCK) {
        // Um reagendamento concluído substitui o card original: o antigo sai
        // e o novo entra em seu lugar (issue #25).
        const allMock = aplicarReagendamentos(generateMockAppointments());
        const filtered = statusFilter
          ? allMock.filter(a => a.status === statusFilter)
          : allMock;
        setAppointments(sortForDisplay(filtered));
        return;
      }
      const beneficiaryUuid = typeof window !== 'undefined' ? localStorage.getItem('BENEFICIARY_UUID') : '';
      const res = await api.get(`/api/schedule/appointments?status=${statusFilter}`, {
        headers: { beneficiaryUuid },
      });
      if (!('success' in (res.data ?? {}))) {
        setAppointments(sortForDisplay(Array.isArray(res.data) ? res.data : []));
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

  // Card pendente ainda não tem data escolhida — o PDF (regra de
  // cancelamento dentro do prazo, issue #2) pede que ele volte para o
  // estado "Agendar", levando ao calendário da mesma especialidade.
  function handleScheduleAppointment(apt) {
    const referralUuid = apt.beneficiaryMedicalReferral?.uuid;
    if (referralUuid) {
      router.push(`/schedule/calendar?referral=${referralUuid}`);
      return;
    }
    const specialtyUuid = apt.specialty?.uuid;
    router.push(specialtyUuid ? `/schedule/calendar?avulsaSpec=${specialtyUuid}` : '/schedule/calendar');
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
              const mins = apt.status === 'SCHEDULED' ? getMinutesUntilStart(apt) : -1;
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

                        {/* Consulta pendente ainda não tem data escolhida. */}
                        <div className="d-flex align-items-start mb-50" style={{ color: '#6e6b7b' }}>
                          <span style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }}><IconClock /></span>
                          <div>
                            <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', color: '#5e5873' }}>
                              {apt.detail?.date ? (
                                <>
                                  {apt.detail.date} às <strong>{apt.detail.from}</strong>
                                  <span title="Horário de Brasília">🇧🇷</span>
                                  <span style={{ color: '#9a9a9a', fontSize: '13px' }}>Sao Paulo (GMT-3)</span>
                                </>
                              ) : (
                                <span style={{ color: '#9a9a9a' }}>Data e horário ainda não escolhidos</span>
                              )}
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
                          <div style={{ fontSize: '11px', color: '#6e6b7b', marginTop: '3px' }}>Usuário cancelou a consulta.</div>
                        )}
                        {apt.status === 'UNFINISHED' && (
                          <div style={{ fontSize: '11px', color: '#6e6b7b', marginTop: '3px' }}>Usuário não compareceu à consulta.</div>
                        )}

                        {/* Mobile: cronômetro + botões */}
                        {apt.status === 'SCHEDULED' && (
                          <div className="d-xl-none" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            {/* A coluna alinha à esquerda para o Reagendar e o Cancelar
                                começarem na borda do "Entrar no atendimento"; o contador
                                e o aviso verde se centralizam sozinhos, esticando na
                                largura do Entrar (pedido de 27 e 29/08). */}
                            <span data-testid="countdown" style={{ fontSize: COUNTDOWN_FONT_SIZE, color: '#5e5873', display: 'flex', alignItems: 'center', gap: '5px', width: ENTER_BUTTON_SIZE.width, maxWidth: '100%', justifyContent: 'center' }}>
                              <CountdownIcon minutes={mins} /> {getCountdownText(mins)}
                            </span>
                            {canEnter && (
                              <div data-testid="ready-to-enter" style={{
                                display: 'flex', alignItems: 'center', gap: '6px', width: ENTER_BUTTON_SIZE.width, maxWidth: '100%', justifyContent: 'center',
                                marginTop: '8px', fontSize: COUNTDOWN_FONT_SIZE, color: '#28c76f', fontWeight: 600,
                              }}>
                                <EmojiIcon name="circuloVerde" size={ICON_SIZE} />
                                Você já pode entrar!
                              </div>
                            )}
                            {/* O PDF mostra os três botões juntos mesmo em consultas
                                futuras (ex: card "faltando 12 dias" e "faltando
                                47:59h") — só o Reagendar depende do prazo. */}
                            <BlockedEnterWrapper
                              apt={apt}
                              canEnter={canEnter}
                              onBlockedClick={() => setBlockedEnterTooltip(true)}
                              style={{ marginTop: ENTER_GAP, marginBottom: ENTER_GAP }}
                            >
                              <button
                                className="btn btn-success btn-sm"
                                disabled={!canEnter}
                                onClick={() => handleEnterAppointment(apt)}
                                aria-describedby={canEnter ? undefined : `entrar-bloqueado-${apt.uuid}`}
                                style={{ ...ENTER_BUTTON, pointerEvents: canEnter ? 'auto' : 'none' }}
                              >
                                Entrar no atendimento
                              </button>
                            </BlockedEnterWrapper>
                            {canReschedule(mins) ? (
                              <button
                                className="btn btn-sm _card-btn-reagendar"
                                style={RESCHEDULE_BUTTON}
                                onClick={() => setReagendarTarget(apt)}
                              >
                                Reagendar
                              </button>
                            ) : (
                              /* Espaço do "Reagendar" preservado mesmo quando ele some (regra do PDF) */
                              <div aria-hidden="true" data-testid="reagendar-placeholder" style={{ height: SECONDARY_BUTTON_SIZE.height, width: SECONDARY_BUTTON_SIZE.width, maxWidth: '100%' }} />
                            )}
                            {apt.cancel && (
                              <button
                                className="btn btn-sm _card-btn-cancelar"
                                style={{ ...CANCEL_BUTTON, marginTop: '8px' }}
                                onClick={() => setCancelTarget(apt)}
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        )}

                        {apt.status === 'PENDING' && (
                          <div className="d-xl-none" style={{ marginTop: '16px' }}>
                            <button
                              className="btn btn-success btn-sm"
                              style={{ width: '100%', height: SECONDARY_BUTTON_SIZE.height, padding: '0 12px' }}
                              onClick={() => handleScheduleAppointment(apt)}
                            >
                              Agendar
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Desktop: cronômetro + botões */}
                      {apt.status === 'SCHEDULED' && (
                        <div className="d-none d-xl-flex flex-column _appt-card-actions" style={{ gap: '8px', marginLeft: '16px', flexShrink: 0, minWidth: ENTER_BUTTON_SIZE.width, alignItems: 'stretch' }}>
                          <span data-testid="countdown" style={{ fontSize: COUNTDOWN_FONT_SIZE, color: '#5e5873', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                            <CountdownIcon minutes={mins} /> {getCountdownText(mins)}
                          </span>
                          {canEnter && (
                            <div data-testid="ready-to-enter" style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              fontSize: COUNTDOWN_FONT_SIZE, color: '#28c76f', fontWeight: 600,
                            }}>
                              <EmojiIcon name="circuloVerde" size={ICON_SIZE} />
                              Você já pode entrar!
                            </div>
                          )}
                          {/* Ver comentário no bloco mobile: os três botões coexistem
                              mesmo em consultas futuras, conforme os cards do PDF. */}
                          <BlockedEnterWrapper
                            apt={apt}
                            canEnter={canEnter}
                            onBlockedClick={() => setBlockedEnterTooltip(true)}
                            style={{ alignSelf: 'center', marginBottom: ENTER_GAP }}
                          >
                            <button
                              className="btn btn-success _contact-btn"
                              disabled={!canEnter}
                              onClick={() => handleEnterAppointment(apt)}
                              aria-describedby={canEnter ? undefined : `entrar-bloqueado-${apt.uuid}`}
                              style={{ ...ENTER_BUTTON, pointerEvents: canEnter ? 'auto' : 'none' }}
                            >
                              Entrar no atendimento
                            </button>
                          </BlockedEnterWrapper>
                          {canReschedule(mins) ? (
                            <button
                              className="btn _card-btn-reagendar"
                              style={{ ...RESCHEDULE_BUTTON, alignSelf: 'flex-start' }}
                              onClick={() => setReagendarTarget(apt)}
                            >
                              Reagendar
                            </button>
                          ) : (
                            /* Espaço do "Reagendar" preservado mesmo quando ele some (regra do PDF) */
                            <div aria-hidden="true" data-testid="reagendar-placeholder" style={{ height: SECONDARY_BUTTON_SIZE.height, width: SECONDARY_BUTTON_SIZE.width, maxWidth: '100%' }} />
                          )}
                          {apt.cancel && (
                            <button
                              className="btn _card-btn-cancelar"
                              onClick={() => setCancelTarget(apt)}
                              style={{ ...CANCEL_BUTTON, alignSelf: 'flex-start' }}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      )}

                      {apt.status === 'PENDING' && (
                        <div className="d-none d-xl-flex flex-column _appt-card-actions" style={{ gap: '8px', marginLeft: '16px', flexShrink: 0, minWidth: ENTER_BUTTON_SIZE.width, alignItems: 'stretch' }}>
                          <button
                            className="btn btn-success _contact-btn"
                            onClick={() => handleScheduleAppointment(apt)}
                            style={{ height: SECONDARY_BUTTON_SIZE.height, padding: '0 12px', alignSelf: 'center', width: SECONDARY_BUTTON_SIZE.width, maxWidth: '100%' }}
                          >
                            Agendar
                          </button>
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

      {/* Reagendar em dois passos (issue #25): confirmar a intenção e, só
          então, escolher a nova data. */}
      <RescheduleDialog
        appointment={reagendarTarget}
        onBack={() => setReagendarTarget(null)}
        onConfirm={() => { setEscolherNovaData(reagendarTarget); setReagendarTarget(null); }}
      />

      <SlotChoiceModal
        show={!!escolherNovaData}
        testId="reagendar-nova-data"
        mensagem="Escolha uma nova data e horário"
        rotuloPrimario="Escolher agora"
        rotuloSecundario="Cancelar"
        onClose={() => setEscolherNovaData(null)}
        onAgendarAgora={() => irParaNovaData(escolherNovaData)}
        onAgendarDepois={() => setEscolherNovaData(null)}
      />

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
            ...MODAL_OVERLAY, zIndex: 9998, padding: 24,
          }}
        >
          <div className="card mb-0 _modal-enter" style={MODAL_CARD}>
            <div className="card-body" style={MODAL_BODY}>
              <p style={{ ...MODAL_TEXT_MUTED, margin: 0 }}>{BLOCKED_ENTER_TOOLTIP}</p>
              <div style={MODAL_ACTIONS}>
                <button className="btn btn-outline-secondary" style={MODAL_BUTTON} onClick={() => setBlockedEnterTooltip(false)}>
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
            ...MODAL_OVERLAY, zIndex: 10000,
            // Escurecimento proprio desta modal, mais frio.
            background: 'rgba(34,41,47,0.55)',
            padding: '16px',
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
