'use client';

import CancelDialog from '@/components/features/agendamentos/CancelDialog';
import EmptyState from '@/components/features/agendamentos/EmptyState';
import { IconAdd, IconArticle, IconClock, IconDoctor, IconHospital } from '@/components/features/agendamentos/icons';
import SkeletonRow from '@/components/features/agendamentos/SkeletonRow';
import FilterChip from '@/components/features/encaminhamentos/FilterChip';
import Toast from '@/components/ui/Toast';
import { mockAppointments } from '@/data/mockData';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === '1';

const STATUS_BADGE = {
  SCHEDULED:  'badge-light-primary',
  FINISHED:   'badge-light-success',
  CANCELED:   'badge-light-danger',
  UNFINISHED: 'badge-light-secondary',
};

const AGEND_STATUS_OPTIONS = [
  { label: 'Todos',         value: '',           color: null },
  { label: 'Pendente',      value: 'PENDING',    color: '#ff9800' },
  { label: 'Agendada',      value: 'SCHEDULED',  color: '#00cfe8' },
  { label: 'Cancelada',     value: 'CANCELED',   color: '#ea5455' },
  { label: 'Não Realizada', value: 'UNFINISHED', color: '#6e6b7b' },
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
  return { SCHEDULED: 'Agendado', CANCELED: 'Cancelado', FINISHED: 'Finalizado', UNFINISHED: 'Não realizado' }[s] || s;
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

function getCountdownText(minutes) {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor(minutes / 60);
  if (days > 1) return `Faltam ${days} dias...`;
  if (days === 1) return 'Falta 1 dia...';
  if (hours > 1) return `Faltam ${hours} horas...`;
  if (hours === 1) return 'Falta 1 hora...';
  if (minutes > 1) return `Faltam ${minutes} minutos...`;
  return 'Em instantes...';
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
        <div style={{
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
        const filtered = statusFilter
          ? mockAppointments.filter(a => a.status === statusFilter)
          : mockAppointments;
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
        setAppointments(prev => prev.filter(a => a.uuid !== cancelTarget.uuid));
        setCancelTarget(null);
        showToast('Agendamento deletado com sucesso.');
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

  function handleEnterAppointment(apt) {
    if (typeof window !== 'undefined') localStorage.setItem('APPOINTMENT', JSON.stringify(apt));
    router.push('/schedule/appointment');
  }

  function renderEntrarButton(apt) {
    if (IS_MOCK) {
      return (
        <button className="btn btn-success _contact-btn" onClick={() => handleEnterAppointment(apt)}>
          Entrar no atendimento
        </button>
      );
    }
    const mins = getMinutesUntil(apt.detail?.date, apt.detail?.from);
    if (mins <= 15) {
      return (
        <button className="btn btn-success _contact-btn" onClick={() => handleEnterAppointment(apt)}>
          Entrar no atendimento
        </button>
      );
    }
    return (
      <span style={{ fontSize: 13, color: '#6e6b7b', textAlign: 'center', lineHeight: 1.4 }}>
        {getCountdownText(mins)}
      </span>
    );
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
                <small className="text-muted" style={{ paddingLeft: '2px' }}>Fuso horário da nova consulta</small>
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
            <small className="text-muted">Fuso horário da nova consulta</small>
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
            <button
              type="button"
              onClick={() => setTooltipOpen(true)}
              style={{
                width: 20, height: 20, borderRadius: '50%',
                background: '#e8e8e8', color: '#555',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                border: '1px solid #c0c0c0', padding: 0, lineHeight: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
              }}
            >?</button>
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
              const badge = STATUS_BADGE[apt.status] || 'badge-light-secondary';
              const tz = timezone || getBrowserTz();
              const converted = !isSameAsBrazil(tz) ? convertDateTime(apt.detail?.date, apt.detail?.from, tz) : null;
              const dateChanged = converted && converted.date !== apt.detail?.date;

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

                        <span className={`badge ${badge}`} style={{ fontWeight: 700, fontSize: '11px' }}>
                          {translateStatus(apt.status)}
                        </span>
                      </div>

                      {apt.status === 'SCHEDULED' && (
                        <div className="d-flex flex-column _appt-card-actions" style={{ gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
                          {renderEntrarButton(apt)}
                          {apt.cancel && (
                            <button
                              className="btn btn-outline-danger _contact-btn"
                              onClick={() => setCancelTarget(apt)}
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
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 360, boxShadow: '0 12px 40px rgba(34,41,47,0.25)' }}
          >
            <div style={{ padding: '18px 24px 16px', borderBottom: '1px solid #ebe9f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0, fontWeight: 600, color: '#5e5873', fontSize: 16 }}>Filtrar consultas</h5>
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
