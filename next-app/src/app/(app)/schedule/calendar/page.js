'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { getReferrals, updateReferral, addAppointment } from '@/data/storage';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const TIMES = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function CalendarContent() {
  const router = useRouter();
  const params = useSearchParams();
  const referralId = params.get('referral');

  const [referral, setReferral]             = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  useEffect(() => {
    if (referralId) {
      const found = getReferrals().find(r => r.uuid === referralId) ?? null;
      setReferral(found);
    } else {
      try {
        const raw = localStorage.getItem('SPECIALT_SELECTED');
        if (raw) setSelectedSpecialty(JSON.parse(raw));
      } catch {}
    }
  }, [referralId]);

  /* Origem determina para onde "Voltar" e "Confirmar" navegam */
  const backRoute = referralId ? '/encaminhamentos' : '/agendamentos';

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const cells = buildCalendar(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
    setSelectedTime(null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
    setSelectedTime(null);
  }

  function isPast(day) {
    if (!day) return false;
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  }

  function isToday(day) {
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  }

  const specialtyName = referral?.specialty?.name || selectedSpecialty?.name || 'Consulta';
  const beneficiaryName = referral?.beneficiary?.name || 'Beneficiário';

  if (confirmed) {
    const dateLabel = `${String(selectedDay).padStart(2,'0')}/${String(viewMonth+1).padStart(2,'0')}/${viewYear}`;
    return (
      <div className="card" style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card-body" style={{ padding: '2.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e6f9ee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h5 style={{ fontWeight: 700, color: '#5e5873', marginBottom: '0.5rem' }}>Agendamento confirmado!</h5>
          <p className="text-muted mb-1">
            <strong>{specialtyName}</strong> para{' '}
            <strong>{beneficiaryName}</strong>
          </p>
          <p className="text-muted mb-2">
            📅 {dateLabel} às {selectedTime}
          </p>
          <button className="btn btn-primary" onClick={() => router.push(backRoute)}>
            {referralId ? 'Voltar aos encaminhamentos' : 'Voltar aos agendamentos'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {(referral || selectedSpecialty) && (
        <div className="alert alert-primary mb-2" style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>
            {referral
              ? <>Agendando encaminhamento de <strong>{specialtyName}</strong> para <strong>{beneficiaryName}</strong></>
              : <>Agendando consulta de <strong>{specialtyName}</strong></>
            }
          </span>
        </div>
      )}

      <div className="row">
        {/* Calendar */}
        <div className="col-12 col-lg-7 mb-2">
          <div className="card mb-0">
            <div className="card-header d-flex align-items-center justify-content-between" style={{ padding: '14px 20px' }}>
              <button className="btn btn-flat-secondary btn-sm p-50" onClick={prevMonth}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <h6 className="mb-0" style={{ fontWeight: 700 }}>
                {MONTHS[viewMonth]} {viewYear}
              </h6>
              <button className="btn btn-flat-secondary btn-sm p-50" onClick={nextMonth}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
            <div className="card-body" style={{ padding: '0 16px 16px' }}>
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                {DAYS.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#b9b9c3', padding: '6px 0', letterSpacing: '0.5px' }}>{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {cells.map((day, idx) => {
                  const past = isPast(day);
                  const sel = day && selectedDay === day && viewMonth === (viewMonth) && viewYear === (viewYear);
                  const todayCls = isToday(day);
                  return (
                    <div
                      key={idx}
                      onClick={() => !past && day && (setSelectedDay(day), setSelectedTime(null))}
                      style={{
                        textAlign: 'center',
                        padding: '8px 4px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: sel ? 700 : 400,
                        cursor: day && !past ? 'pointer' : 'default',
                        background: sel ? 'var(--primary, #0052ff)' : todayCls ? '#e8f0ff' : 'transparent',
                        color: sel ? '#fff' : past ? '#d0d0d0' : todayCls ? 'var(--primary, #0052ff)' : '#5e5873',
                        border: sel ? 'none' : todayCls ? '1px solid var(--primary, #0052ff)' : '1px solid transparent',
                        transition: 'background 0.15s',
                        userSelect: 'none',
                      }}
                      onMouseEnter={e => { if (day && !past && !sel) e.currentTarget.style.background = '#f3f2f7'; }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.background = todayCls ? '#e8f0ff' : 'transparent'; }}
                    >
                      {day || ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Time slots */}
        <div className="col-12 col-lg-5 mb-2">
          <div className="card mb-0 h-100">
            <div className="card-header" style={{ padding: '14px 20px' }}>
              <h6 className="mb-0" style={{ fontWeight: 700 }}>
                {selectedDay
                  ? `Horários — ${String(selectedDay).padStart(2,'0')}/${String(viewMonth+1).padStart(2,'0')}`
                  : 'Selecione um dia'}
              </h6>
            </div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              {!selectedDay ? (
                <p className="text-muted small mb-0">Clique em um dia no calendário para ver os horários disponíveis.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {TIMES.map(t => (
                    <button
                      key={t}
                      className={selectedTime === t ? 'btn btn-primary btn-sm' : 'btn btn-outline-secondary btn-sm'}
                      onClick={() => setSelectedTime(t)}
                      style={{ fontWeight: 600 }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedDay && selectedTime && (
              <div className="card-footer" style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => {
                    const dateLabel = `${String(selectedDay).padStart(2,'0')}/${String(viewMonth+1).padStart(2,'0')}/${viewYear}`;
                    addAppointment({
                      uuid: `apt-${Date.now()}`,
                      status: 'SCHEDULED',
                      professional: { name: 'A ser confirmado', specialties: [{ name: specialtyName }] },
                      specialty: { name: specialtyName },
                      detail: { date: dateLabel, from: selectedTime },
                      beneficiaryMedicalReferral: referral ? { createdAt: referral.createdAt } : null,
                      cancel: true,
                    });
                    if (referralId) updateReferral(referralId, { status: 'SCHEDULED' });
                    setConfirmed(true);
                  }}
                >
                  Confirmar agendamento
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        className="btn btn-flat-secondary btn-sm mt-25"
        onClick={() => router.push(backRoute)}
      >
        {referralId ? '← Voltar aos encaminhamentos' : '← Voltar aos agendamentos'}
      </button>
    </div>
  );
}

export default function ScheduleCalendarPage() {
  return (
    <Suspense fallback={<div className="card"><div className="card-body">Carregando...</div></div>}>
      <CalendarContent />
    </Suspense>
  );
}
