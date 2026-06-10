'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { mockSpecialties, getMockAvailability, mockReferrals } from '@/data/mockData';

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === '1';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function ScheduleContent() {
  const router = useRouter();
  const params = useSearchParams();
  const urlReferral = params.get('referral') || '';

  const [referralId, setReferralId] = useState(urlReferral);

  // Phase 1: specialty list
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [specSearch, setSpecSearch] = useState('');

  // Phase 2: availability / calendar
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilities, setAvailabilities] = useState([]);
  const [availableDates, setAvailableDates] = useState(new Set());

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  // Phase 3: time slots
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotSearch, setSlotSearch] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Phase 4: booking
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Referral selection modal
  const [referralModal, setReferralModal] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [pendingSpecialty, setPendingSpecialty] = useState(null);

  const calendarRef = useRef(null);
  const slotsRef = useRef(null);

  // Load specialties on mount
  useEffect(() => {
    (async () => {
      try {
        if (IS_MOCK) {
          setSpecialties(mockSpecialties);
        } else {
          const { data } = await api.get('/api/schedule/specialties');
          setSpecialties(Array.isArray(data) ? data : []);
        }
      } catch {
        setSpecialties([]);
      } finally {
        setLoadingSpecialties(false);
      }
    })();
  }, []);

  // Auto-select specialty when coming from a referral URL param
  useEffect(() => {
    if (!urlReferral || loadingSpecialties || specialties.length === 0) return;
    (async () => {
      try {
        let ref;
        if (IS_MOCK) {
          ref = mockReferrals.find(r => r.uuid === urlReferral);
        } else {
          const { data } = await api.get('/api/referrals');
          ref = Array.isArray(data) ? data.find(r => r.uuid === urlReferral) : null;
        }
        if (!ref?.specialty) return;
        const match = specialties.find(
          s => (s.uuid && s.uuid === ref.specialty.uuid) || s.name === ref.specialty.name
        );
        if (match) doSelectSpecialty(match);
      } catch { }
    })();
  }, [urlReferral, loadingSpecialties, specialties]); // eslint-disable-line react-hooks/exhaustive-deps

  function doSelectSpecialty(spec) {
    setSelectedSpecialty(spec);
    setSelectedDate(null);
    setSlots([]);
    setSelectedSlot(null);
    setSlotSearch('');
    fetchAvailability(spec);
  }

  async function fetchAvailability(spec) {
    setLoadingAvailability(true);
    setAvailabilities([]);
    setAvailableDates(new Set());
    try {
      let data;
      if (IS_MOCK) {
        data = getMockAvailability(spec.uuid);
      } else {
        const pad = n => String(n).padStart(2, '0');
        const fmtDate = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        const now = new Date();
        const end = new Date(now);
        end.setDate(end.getDate() + 30);
        const { data: raw } = await api.post('/api/schedule/specialty-availability', {
          specialtyUuid: spec.uuid,
          dateInitial: fmtDate(now),
          dateFinal: fmtDate(end),
        });
        data = Array.isArray(raw) ? raw : [];
      }
      setAvailabilities(data);
      setAvailableDates(new Set(data.map(a => a.date)));
      setTimeout(() => calendarRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      setAvailabilities([]);
      setAvailableDates(new Set());
    } finally {
      setLoadingAvailability(false);
    }
  }

  function handleSpecialtyClick(spec) {
    if (loadingAvailability) return;
    // If specialty requires referral and none selected, show referral picker modal
    if (spec.referral && !referralId) {
      setPendingSpecialty(spec);
      setReferralModal(true);
      fetchReferrals();
      return;
    }
    doSelectSpecialty(spec);
  }

  async function fetchReferrals() {
    setLoadingReferrals(true);
    try {
      if (IS_MOCK) {
        setReferrals(mockReferrals.filter(r => r.status === 'PENDING'));
      } else {
        const { data } = await api.get('/api/referrals');
        setReferrals(Array.isArray(data) ? data.filter(r => r.status === 'PENDING') : []);
      }
    } catch {
      setReferrals([]);
    } finally {
      setLoadingReferrals(false);
    }
  }

  function handleReferralSelect(ref) {
    setReferralId(ref.uuid);
    setReferralModal(false);
    if (pendingSpecialty) {
      doSelectSpecialty(pendingSpecialty);
      setPendingSpecialty(null);
    }
  }

  function handleReferralModalClose() {
    setReferralModal(false);
    setPendingSpecialty(null);
  }

  function handleDayClick(day) {
    if (!day || !isAvailable(day)) return;
    const dateStr = dateStrFromParts(viewYear, viewMonth, day);
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setSlotSearch('');
    setLoadingSlots(true);
    setTimeout(() => {
      setSlots(availabilities.filter(a => a.date === dateStr));
      setLoadingSlots(false);
      setTimeout(() => slotsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, 800);
  }

  async function handleBook() {
    if (!selectedSlot || booking) return;
    setBooking(true);
    setBookingError('');
    try {
      if (IS_MOCK) {
        await new Promise(r => setTimeout(r, 1000));
        setConfirmed(true);
        return;
      }
      await api.post('/api/schedule/appointments', {
        specialtyUuid: selectedSpecialty.uuid,
        availabilityUuid: selectedSlot.uuid,
        beneficiaryMedicalReferralUuid: referralId || null,
        rdpayTransactionUuid: null,
        approveAdditionalPayment: true,
      });
      setConfirmed(true);
      setTimeout(() => router.back(), 2000);
    } catch (e) {
      setBookingError(e?.response?.data?.message || 'Falha ao executar esta ação.');
    } finally {
      setBooking(false);
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
    setSlots([]);
    setSelectedSlot(null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
    setSlots([]);
    setSelectedSlot(null);
  }

  function dateStrFromParts(y, m, d) {
    return `${String(d).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}/${y}`;
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
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  }

  function isAvailable(day) {
    if (!day || isPast(day)) return false;
    return availableDates.has(dateStrFromParts(viewYear, viewMonth, day));
  }

  function isSelected(day) {
    return !!(day && selectedDate === dateStrFromParts(viewYear, viewMonth, day));
  }

  const filteredSpecialties = specSearch
    ? specialties.filter(s => s.name.toLowerCase().includes(specSearch.toLowerCase()))
    : specialties;

  const filteredSlots = slotSearch
    ? slots.filter(s => s.from.includes(slotSearch))
    : slots;

  const cells = buildCalendar(viewYear, viewMonth);

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loadingSpecialties) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <h6 style={{ fontWeight: 400, color: '#5e5873', marginBottom: '1.5rem' }}>
          Carregando especialidades...
        </h6>
        <div className="spinner-border" style={{ color: '#4daab6', width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="card" style={{ maxWidth: '520px', margin: '2rem auto', textAlign: 'center' }}>
        <div className="card-body" style={{ padding: '2.5rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#e6f9ee',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h5 style={{ fontWeight: 700, color: '#5e5873', marginBottom: '0.5rem' }}>
            Agendado com sucesso.
          </h5>
          <p className="text-muted mb-0">
            {selectedSpecialty?.name} — {selectedDate} às {selectedSlot?.from}
          </p>
          <button className="btn btn-primary mt-2" onClick={() => router.back()}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // ── Main page ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Search field */}
      <div style={{ marginBottom: 20 }}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Digite a especialidade"
            value={specSearch}
            onChange={e => setSpecSearch(e.target.value)}
          />
          <div className="input-group-append">
            <span className="input-group-text" style={{ background: '#f8f8f8' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#6e6b7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Specialty list */}
      <h6 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, color: '#5e5873' }}>
        Nossas especialidades
      </h6>

      <div className="card mb-3">
        <div className="card-body p-0">
          {filteredSpecialties.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6e6b7b', fontSize: 14 }}>
              Nenhuma especialidade encontrada para &ldquo;{specSearch}&rdquo;
            </div>
          ) : (
            filteredSpecialties.map((s, idx) => {
              const active = selectedSpecialty?.uuid === s.uuid || selectedSpecialty?.name === s.name;
              const isLast = idx === filteredSpecialties.length - 1;
              return (
                <div
                  key={s.uuid || s.name}
                  onClick={() => handleSpecialtyClick(s)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderBottom: isLast ? 'none' : '1px solid #ebe9f1',
                    cursor: loadingAvailability ? 'default' : 'pointer',
                    background: active ? '#f2f8fc' : 'transparent',
                    borderLeft: active ? '3px solid #4daab6' : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!active && !loadingAvailability) e.currentTarget.style.background = '#f8f8f8'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: active ? 600 : 400, color: '#5e5873', fontSize: 15 }}>
                      {s.name}
                    </span>
                    {loadingAvailability && active && (
                      <div
                        className="spinner-border spinner-border-sm"
                        style={{ width: 16, height: 16, borderWidth: 2, color: '#4daab6' }}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Calendar — shown after specialty is selected and availability loaded */}
      {selectedSpecialty && !loadingAvailability && (
        <div ref={calendarRef}>
          <div className="card mb-2">
            <div
              className="card-header d-flex align-items-center justify-content-between"
              style={{ padding: '14px 20px' }}
            >
              <button className="btn btn-flat-secondary btn-sm p-50" onClick={prevMonth}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h6 className="mb-0" style={{ fontWeight: 700 }}>
                {MONTHS[viewMonth]} {viewYear}
              </h6>
              <button className="btn btn-flat-secondary btn-sm p-50" onClick={nextMonth}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <div className="card-body" style={{ padding: '0 16px 16px' }}>
              {/* Day-of-week headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
                {DAYS.map(d => (
                  <div key={d} style={{
                    textAlign: 'center', fontSize: 11, fontWeight: 700,
                    color: '#b9b9c3', padding: '6px 0', letterSpacing: '0.5px',
                  }}>
                    {d}
                  </div>
                ))}
              </div>
              {/* Day cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {cells.map((day, idx) => {
                  const past = isPast(day);
                  const avail = isAvailable(day);
                  const sel = isSelected(day);
                  const tod = isToday(day);
                  return (
                    <div
                      key={idx}
                      className="_cal-cell"
                      onClick={() => handleDayClick(day)}
                      style={{
                        textAlign: 'center',
                        padding: '6px 4px 4px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: sel ? 700 : 400,
                        cursor: avail ? 'pointer' : 'default',
                        background: sel ? '#4daab6' : tod ? '#e8f0ff' : 'transparent',
                        color: sel ? '#fff' : past ? '#d0d0d0' : tod ? 'var(--primary, #0052ff)' : '#5e5873',
                        border: sel ? 'none' : tod ? '1px solid var(--primary, #0052ff)' : '1px solid transparent',
                        opacity: day && !avail && !past ? 0.35 : 1,
                        userSelect: 'none',
                        transition: 'background 0.12s',
                        lineHeight: 1.4,
                      }}
                      onMouseEnter={e => { if (avail && !sel) e.currentTarget.style.background = '#e0f4f7'; }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.background = tod ? '#e8f0ff' : 'transparent'; }}
                    >
                      {day || ''}
                      {/* Blue dot marks available dates */}
                      {avail ? (
                        <div style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: sel ? '#fff' : '#4daab6',
                          margin: '2px auto 0',
                        }} />
                      ) : <div style={{ height: 7 }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time slots — shown after a date is selected */}
          {selectedDate && (
            <div ref={slotsRef} className="card mb-2">
              <div className="card-header" style={{ padding: '14px 20px' }}>
                <h6 className="mb-0" style={{ fontWeight: 700 }}>
                  Horários disponíveis — {selectedDate}
                </h6>
              </div>
              <div className="card-body">
                {loadingSlots ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gap: 12 }}>
                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                      Carregando horários disponíveis...
                    </p>
                    <div className="spinner-border" style={{ color: '#4daab6', width: '2.5rem', height: '2.5rem' }} />
                  </div>
                ) : (
                  <>
                    {/* Slot search */}
                    <div style={{ marginBottom: 14 }}>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Filtrar horários"
                        value={slotSearch}
                        onChange={e => setSlotSearch(e.target.value)}
                        style={{ maxWidth: 200 }}
                      />
                    </div>

                    {filteredSlots.length === 0 ? (
                      <p className="text-muted small mb-0">
                        Não há horários disponíveis para esta data.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {filteredSlots.map(slot => (
                          <button
                            key={slot.uuid || slot.from}
                            onClick={() => setSelectedSlot(slot)}
                            className={
                              selectedSlot?.from === slot.from
                                ? 'btn btn-primary btn-sm'
                                : 'btn btn-outline-secondary btn-sm'
                            }
                            style={{ borderRadius: 24, minWidth: 72, fontWeight: 600 }}
                          >
                            {slot.from}
                          </button>
                        ))}
                      </div>
                    )}

                    {bookingError && (
                      <div className="alert alert-danger mt-2 mb-0" style={{ fontSize: 13 }}>
                        {bookingError}
                      </div>
                    )}

                    <button
                      onClick={handleBook}
                      disabled={!selectedSlot || booking}
                      style={{
                        width: '100%',
                        marginTop: 20,
                        padding: '12px',
                        borderRadius: 24,
                        background: selectedSlot && !booking
                          ? 'linear-gradient(90deg, #4daab6 0%, #461bef 100%)'
                          : '#ccc',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 15,
                        letterSpacing: 1,
                        border: 'none',
                        cursor: selectedSlot && !booking ? 'pointer' : 'default',
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {booking ? 'AGENDANDO...' : 'AGENDAR'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        className="btn btn-flat-secondary btn-sm mt-1"
        onClick={() => router.back()}
      >
        ← Voltar
      </button>

      {/* Referral selection modal */}
      {referralModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={handleReferralModalClose}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="card-header d-flex align-items-center justify-content-between">
              <h6 className="mb-0" style={{ fontWeight: 700 }}>Selecionar encaminhamento</h6>
              <button className="btn btn-flat-secondary btn-sm p-50" onClick={handleReferralModalClose}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="card-body" style={{ overflowY: 'auto' }}>
              {loadingReferrals ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
                  <div className="spinner-border" style={{ color: '#4daab6' }} />
                </div>
              ) : referrals.length === 0 ? (
                <p className="text-muted small mb-0">Nenhum encaminhamento pendente encontrado.</p>
              ) : (
                referrals.map((ref, idx) => (
                  <div
                    key={ref.uuid}
                    onClick={() => handleReferralSelect(ref)}
                    style={{
                      padding: '12px 0',
                      borderBottom: idx < referrals.length - 1 ? '1px solid #ebe9f1' : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8f8f8'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <p className="mb-0" style={{ fontWeight: 600, fontSize: 14 }}>
                      {ref.specialty?.name}
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                      {ref.createdAt}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScheduleCalendarPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <h6 style={{ fontWeight: 400, color: '#5e5873', marginBottom: '1.5rem' }}>Carregando especialidades...</h6>
        <div className="spinner-border" style={{ color: '#4daab6', width: '3rem', height: '3rem' }} />
      </div>
    }>
      <ScheduleContent />
    </Suspense>
  );
}
