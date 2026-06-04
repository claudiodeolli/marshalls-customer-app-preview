'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAppointments, updateAppointment, getReferrals } from '@/data/storage';

const STATUS_BADGE = {
  SCHEDULED:  'badge-light-primary',
  FINISHED:   'badge-light-success',
  CANCELED:   'badge-light-danger',
  UNFINISHED: 'badge-light-secondary',
};

const STATUS_OPTIONS = [
  { label: 'Agendado',      value: 'SCHEDULED'  },
  { label: 'Cancelado',     value: 'CANCELED'   },
  { label: 'Finalizado',    value: 'FINISHED'   },
  { label: 'Não realizado', value: 'UNFINISHED' },
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

function IconDoctor() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function IconHospital() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 3c1.93 0 3.5 1.57 3.5 3.5S14.93 13 13 13s-3.5-1.57-3.5-3.5S11.07 6 13 6zm7 13H6v-.23c0-.62.28-1.2.76-1.58C8.47 15.82 10.64 15 13 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IconArticle() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  );
}

function IconAdd() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="card">
      <div className="card-body" style={{ textAlign: 'center', padding: '2.5rem', color: '#aaa' }}>
        <p className="mb-0" style={{ fontSize: '15px' }}>Não há agendamentos no momento.</p>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="card mb-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div style={{ flex: 1 }}>
            <div className="d-flex align-items-center mb-50">
              <div className="sk" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
              <div className="sk" style={{ width: '42%', height: 18 }} />
            </div>
            <div className="d-flex align-items-center mb-50">
              <div className="sk" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
              <div className="sk" style={{ width: '36%', height: 14 }} />
            </div>
            <div className="d-flex align-items-center mb-50">
              <div className="sk" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
              <div className="sk" style={{ width: '52%', height: 14 }} />
            </div>
            <div className="sk" style={{ width: 70, height: 18, borderRadius: '10px', marginTop: '6px' }} />
          </div>
          <div style={{ marginLeft: '16px', flexShrink: 0 }}>
            <div className="sk" style={{ width: 135, height: 30, borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CancelDialog({ open, appointment, loading, onClose, onConfirm }) {
  if (!open || !appointment) return null;
  const specialtyName = appointment.professional?.specialties?.[0]?.name || '';
  const doctorName = appointment.professional?.name || '';
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="card mb-0" style={{ width: '400px', maxWidth: '90vw', borderRadius: '12px' }}>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <h5 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Atenção</h5>
          <p style={{ color: '#333', marginBottom: '1.5rem', fontSize: '14px' }}>
            Você está prestes a cancelar o agendamento de <strong>{specialtyName}</strong> com o(a) Dr(a). <strong>{doctorName}</strong>. Deseja continuar?
          </p>
          <div className="d-flex justify-content-end" style={{ gap: '8px' }}>
            <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Não</button>
            <button className="btn btn-danger btn-sm" disabled={loading} onClick={onConfirm}>
              {loading ? 'Aguarde...' : 'Sim'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Especialidades disponíveis para consulta avulsa ── */
const SPECIALTIES = [
  { name: 'Cardiologia',               price: 150 },
  { name: 'Dermatologia',              price: 130 },
  { name: 'Ginecologia e Obstetrícia', price: 140 },
  { name: 'Neurologia',                price: 160 },
  { name: 'Nutrição',                  price: 100 },
  { name: 'Ortopedia',                 price: 150 },
  { name: 'Otorrinolaringologia',      price: 130 },
  { name: 'Pediatria',                 price: 120 },
  { name: 'Psiquiatria',               price: 180 },
  { name: 'Urologia',                  price: 140 },
];

/* ── Modal de encaminhamento por especialidade ── */
function ReferralModal({ specialty, onClose, onSchedule, onBuyAvulsa }) {
  const referrals = getReferrals().filter(
    r => r.status === 'PENDING' && r.specialty?.name === specialty.name
  );

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}
      onClick={onClose}
    >
      <div
        style={{ background:'#fff', borderRadius:'16px', padding:'24px', width:'100%', maxWidth:'420px', boxShadow:'0 8px 32px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
          <h5 style={{ fontWeight:700, margin:0 }}>Selecionar Encaminhamento</h5>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'18px', color:'#aaa', lineHeight:1 }}>✕</button>
        </div>
        <p style={{ fontSize:'13px', color:'#6e6b7b', marginBottom:'16px' }}>
          Selecione um encaminhamento médico. A especialidade do encaminhamento será selecionada automaticamente:
        </p>

        {referrals.length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {referrals.map(r => (
              <button
                key={r.uuid}
                className="btn btn-outline-primary"
                style={{ textAlign:'left', fontSize:'13px' }}
                onClick={() => onSchedule(r)}
              >
                {r.beneficiary?.name} — {r.specialty?.name}
                <br /><small className="text-muted">Criado em: {r.createdAt}</small>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'16px 0' }}>
            <p style={{ fontWeight:600, color:'#5e5873', marginBottom:'6px' }}>Você não possui encaminhamentos disponíveis.</p>
            <p style={{ fontSize:'13px', color:'#6e6b7b', marginBottom:'20px' }}>
              Solicite um encaminhamento médico para agendar esta especialidade, ou:
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => onBuyAvulsa(specialty)}>
              Comprar consulta avulsa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Modal de seleção de especialidade ── */
function SpecialtyModal({ onClose, onSelect }) {
  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}
      onClick={onClose}
    >
      <div
        style={{ background:'#fff', borderRadius:'16px', width:'100%', maxWidth:'440px', maxHeight:'80vh', display:'flex', flexDirection:'column', boxShadow:'0 8px 32px rgba(0,0,0,0.15)', overflow:'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding:'20px 24px 12px', borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h5 style={{ fontWeight:700, margin:0 }}>Nova Consulta</h5>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'18px', color:'#aaa', lineHeight:1 }}>✕</button>
        </div>
        <p style={{ fontSize:'13px', color:'#6e6b7b', margin:'12px 24px 4px' }}>Selecione a especialidade desejada:</p>
        <div style={{ overflowY:'auto', padding:'0 16px 16px' }}>
          {SPECIALTIES.map(sp => (
            <button
              key={sp.name}
              onClick={() => onSelect(sp)}
              style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                width:'100%', padding:'12px 8px', background:'none', border:'none',
                borderBottom:'1px solid #f5f5f5', cursor:'pointer', textAlign:'left',
                fontSize:'14px', color:'#5e5873',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8f9ff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <span>{sp.name}</span>
              <span style={{ fontSize:'13px', color:'#aaa' }}>R$ {sp.price},00</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type, visible }) {
  if (!visible) return null;
  const cls = type === 'success' ? 'alert-success' : 'alert-danger';
  return (
    <div className={`alert ${cls} mb-0`} style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      zIndex: 9999, minWidth: '280px', maxWidth: '380px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      borderRadius: '8px', fontWeight: 500,
    }}>
      {message}
    </div>
  );
}

export default function AgendamentosPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter]       = useState('SCHEDULED');
  const [appliedFilter, setAppliedFilter]     = useState('SCHEDULED');
  const [showSpecialty, setShowSpecialty]     = useState(false);
  const [referralTarget, setReferralTarget]   = useState(null);
  const [timezone, setTimezone]           = useState('');
  const [appointments, setAppointments]   = useState([]);
  const [cancelTarget, setCancelTarget]   = useState(null);
  const [canceling, setCanceling]         = useState(false);
  const [toast, setToast]                 = useState({ visible: false, message: '', type: 'success' });
  const [pageLoading, setPageLoading]     = useState(true);

  useEffect(() => {
    const tz = getBrowserTz();
    if (TIMEZONE_OPTIONS.find(o => o.value === tz)) setTimezone(tz);
    const t = setTimeout(() => {
      setAppointments(getAppointments());
      setPageLoading(false);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  function showToast(message, type = 'success') {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  }

  function handleCancelConfirm() {
    if (!cancelTarget) return;
    setCanceling(true);
    setTimeout(() => {
      const updated = updateAppointment(cancelTarget.uuid, { status: 'CANCELED', cancel: false });
      setAppointments(updated);
      setCanceling(false);
      setCancelTarget(null);
      showToast('Agendamento deletado com sucesso.');
    }, 800);
  }

  function handleEnterAppointment(apt) {
    if (typeof window !== 'undefined') localStorage.setItem('APPOINTMENT', JSON.stringify(apt));
    router.push('/schedule/appointment');
  }

  const visible = appointments.filter(a => a.status === appliedFilter);

  return (
    <div>
      {/* Banner informativo */}
      <div className="alert mb-2" style={{ background:'#eef3ff', border:'1px solid #c7d8ff', borderRadius:'10px', fontSize:'13px', color:'#3b5bdb', padding:'12px 16px' }}>
        <strong>Como funciona o agendamento:</strong>
        <ul style={{ margin:'6px 0 0', paddingLeft:'18px' }}>
          <li>Se você foi encaminhado por um médico do <strong>Pronto Atendimento</strong>, pode agendar aqui <strong>sem custos adicionais</strong>.</li>
          <li>Caso não possua encaminhamento, é possível adquirir uma <strong>consulta avulsa</strong> com a especialidade desejada.</li>
        </ul>
      </div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap mb-2 _agend-header" style={{ gap: '16px' }}>
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Agendamentos</h4>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            Gerencie seus agendamentos médicos e agende novas consultas
          </p>
        </div>
        <div className="_agend-tz-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <small className="text-muted" style={{ paddingLeft: '2px' }}>Fuso horário</small>
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
      </div>

      {/* Filter bar */}
      <div
        className="d-flex justify-content-between align-items-center flex-wrap pb-75 mb-2 _agend-filters"
        style={{ borderBottom: '1px solid #ddd', gap: '12px' }}
      >
        <div className="d-flex align-items-center flex-wrap" style={{ gap: '10px' }}>
          <select
            className="custom-select"
            style={{ maxWidth: '200px' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setAppliedFilter(statusFilter)}
            style={{ height: '38px', whiteSpace: 'nowrap' }}
          >
            Buscar
          </button>
        </div>
        <button
          className="btn btn-primary _agend-new-btn"
          onClick={() => setShowSpecialty(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}
        >
          <IconAdd /> Novo Agendamento
        </button>
      </div>

      {/* Appointment list */}
      <div style={{ marginTop: '1rem' }}>
        {pageLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[0, 1, 2].map(i => <SkeletonRow key={i} />)}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {visible.map(apt => {
              const badge = STATUS_BADGE[apt.status] || 'badge-light-secondary';
              const tz = timezone || getBrowserTz();
              const converted = !isSameAsBrazil(tz) ? convertDateTime(apt.detail.date, apt.detail.from, tz) : null;
              const dateChanged = converted && converted.date !== apt.detail.date;

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

                      {/* Left: appointment info */}
                      <div className="_appt-card-info" style={{ flex: 1 }}>

                        {/* Doctor name */}
                        <div className="d-flex align-items-center mb-50" style={{ color: 'var(--primary, #0052ff)' }}>
                          <span style={{ marginRight: '8px', flexShrink: 0 }}><IconDoctor /></span>
                          <span style={{ fontWeight: 600, fontSize: '16px' }}>Dr(a). {apt.professional.name}</span>
                        </div>

                        {/* Specialty */}
                        <div className="d-flex align-items-center mb-50" style={{ color: '#5e5873' }}>
                          <span style={{ marginRight: '8px', flexShrink: 0, color: '#6e6b7b' }}><IconHospital /></span>
                          <span style={{ fontSize: '14px' }}>
                            <strong>Especialidade:</strong> {apt.specialty.name}
                          </span>
                        </div>

                        {/* Date/time with optional timezone conversion */}
                        <div className="d-flex align-items-start mb-50" style={{ color: '#6e6b7b' }}>
                          <span style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }}><IconClock /></span>
                          <div>
                            <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', color: '#5e5873' }}>
                              {apt.detail.date} às <strong>{apt.detail.from}</strong>
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

                        {/* Referral date (if linked) */}
                        {apt.beneficiaryMedicalReferral && (
                          <div className="d-flex align-items-center mb-75" style={{ color: '#6e6b7b' }}>
                            <span style={{ marginRight: '8px', flexShrink: 0 }}><IconArticle /></span>
                            <span style={{ fontSize: '14px', color: '#5e5873' }}>
                              <strong>Encaminhamento criado em:</strong> {apt.beneficiaryMedicalReferral.createdAt}
                            </span>
                          </div>
                        )}

                        {/* Status badge */}
                        <span className={`badge ${badge}`} style={{ fontWeight: 700, fontSize: '11px' }}>
                          {translateStatus(apt.status)}
                        </span>
                      </div>

                      {/* Right: action buttons (SCHEDULED only) */}
                      {apt.status === 'SCHEDULED' && (
                        <div className="d-flex flex-column _appt-card-actions" style={{ gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
                          <button
                            className="btn btn-success btn-sm"
                            style={{ whiteSpace: 'nowrap' }}
                            onClick={() => handleEnterAppointment(apt)}
                          >
                            Entrar no atendimento
                          </button>
                          {apt.cancel && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              style={{ whiteSpace: 'nowrap' }}
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

      {showSpecialty && (
        <SpecialtyModal
          onClose={() => setShowSpecialty(false)}
          onSelect={sp => { setShowSpecialty(false); setReferralTarget(sp); }}
        />
      )}

      {referralTarget && (
        <ReferralModal
          specialty={referralTarget}
          onClose={() => setReferralTarget(null)}
          onSchedule={ref => {
            setReferralTarget(null);
            router.push(`/schedule/calendar?referral=${ref.uuid}`);
          }}
          onBuyAvulsa={sp => {
            setReferralTarget(null);
            router.push(`/schedule/calendar?specialty=${encodeURIComponent(sp.name)}&avulsa=1`);
          }}
        />
      )}

      <Toast {...toast} />
    </div>
  );
}
