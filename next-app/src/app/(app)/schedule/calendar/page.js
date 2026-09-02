'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { mockSpecialties, getMockAvailability, mockReferrals } from '@/data/mockData';
import BookingSuccessScreen from '@/components/features/schedule/BookingSuccessScreen';
import PaymentConfirmModal from '@/components/features/schedule/PaymentConfirmModal';
import PaymentSelectStep from '@/components/features/schedule/PaymentSelectStep';
import PaymentPixStep from '@/components/features/schedule/PaymentPixStep';
import PaymentCardStep from '@/components/features/schedule/PaymentCardStep';
import PaymentSuccessStep from '@/components/features/schedule/PaymentSuccessStep';
import SlotChoiceModal from '@/components/features/schedule/SlotChoiceModal';
import ReferralModal from '@/components/features/schedule/ReferralModal';
import BookingRulesAlert from '@/components/features/schedule/BookingRulesAlert';
import { useHistoricoDeEtapas } from '@/hooks/useHistoricoDeEtapas';

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
  const { user } = useAuth();
  const params = useSearchParams();
  const urlReferral = params.get('referral') || '';
  const urlAvulsaSpec = params.get('avulsaSpec') || '';

  const [referralId, setReferralId] = useState(urlReferral);

  // Phase 1: specialty list
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [specSearch, setSpecSearch] = useState('');

  // Specialty locked from referral (eI / eN in original)
  const [specialtyLocked, setSpecialtyLocked] = useState(false);
  const [lockedSpecialtyUuid, setLockedSpecialtyUuid] = useState(null);

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

  // Show avulsa prices on specialty list
  const [showPrices, setShowPrices] = useState(false);

  // Avulsa payment flow
  const [paymentStep, setPaymentStep] = useState(null); // null | 'select' | 'pix' | 'card-new' | 'success'
  const [avulsaSpecialty, setAvulsaSpecialty] = useState(null);
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showSlotChoiceModal, setShowSlotChoiceModal] = useState(false);
  const [avulsaBooked, setAvulsaBooked] = useState(false);   // selected slot before payment
  const [avulsaConfirmed, setAvulsaConfirmed] = useState(false); // came via avulsa path

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
        if (match) {
          setSpecialtyLocked(true);
          setLockedSpecialtyUuid(match.uuid);
          doSelectSpecialty(match);
        }
      } catch { }
    })();
  }, [urlReferral, loadingSpecialties, specialties]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-enter avulsa mode when coming from "Agendar agora" in /agendamentos (already paid)
  useEffect(() => {
    if (!urlAvulsaSpec || loadingSpecialties || specialties.length === 0) return;
    const spec = specialties.find(s => s.uuid === urlAvulsaSpec);
    if (!spec) return;
    setShowPrices(false);
    setAvulsaConfirmed(true);
    setAvulsaSpecialty(spec);
    setSpecialtyLocked(true);
    setLockedSpecialtyUuid(spec.uuid);
    doSelectSpecialty(spec);
  }, [urlAvulsaSpec, loadingSpecialties, specialties]); // eslint-disable-line react-hooks/exhaustive-deps

  function doSelectSpecialty(spec) {
    setSelectedSpecialty(spec);
    setSelectedDate(null);
    setSlots([]);
    setSelectedSlot(null);
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
    if (loadingAvailability || specialtyLocked) return;
    if (showPrices) {
      setAvulsaSpecialty(spec);
      setShowSlotChoiceModal(true);
      return;
    }
    let requiresReferral;
    if (IS_MOCK) {
      requiresReferral = spec.referral === true;
    } else {
      // Especialidades que não exigem encaminhamento com assinatura "S"
      const EXEMPT = ['Nutrição', 'Psicologia'];
      const hasSubscription = Array.isArray(user?.plans) && user.plans.some(p => p.paymentType === 'S');
      const hasAvulsa = Array.isArray(user?.plans) && user.plans.some(p => p.paymentType === 'A');
      requiresReferral = hasSubscription && !EXEMPT.includes(spec.name) && !hasAvulsa;
    }
    if (requiresReferral && !referralId) {
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
        setReferrals(mockReferrals);
      } else {
        const { data } = await api.get('/api/referrals');
        setReferrals(Array.isArray(data) ? data : []);
      }
    } catch {
      setReferrals([]);
    } finally {
      setLoadingReferrals(false);
    }
  }

  // Just highlights the referral in the modal (same state used for booking submission)
  function handleReferralItemClick(ref) {
    setReferralId(ref.uuid);
  }

  // Cancel modal: close and clear referral selection
  function handleReferralModalClose() {
    setReferralModal(false);
    setReferralId('');
    setPendingSpecialty(null);
  }

  function handleAvulsa() {
    setReferralModal(false);
    setReferralId('');
    setPendingSpecialty(null);
    setSelectedSpecialty(null);
    setSelectedDate(null);
    setSlots([]);
    setSelectedSlot(null);
    setAvailabilities([]);
    setAvailableDates(new Set());
    setShowPrices(true);
    setAvulsaBooked(false);
    setAvulsaConfirmed(false);
    setShowSlotChoiceModal(false);
    setPaymentStep(null);
  }

  // ── Voltar passo a passo (issue #23) ───────────────────────────────────
  // O fluxo inteiro vive nesta rota e avança por estado, então o histórico
  // do navegador só conhecia a página de origem. Cada etapa passa a deixar
  // sua marca, e o "Voltar" — junto com o gesto do aparelho — recua uma de
  // cada vez em vez de sair de tudo.
  const etapa = confirmed ? 'confirmado'
    : paymentStep ? `pagamento-${paymentStep}`
      : selectedSpecialty ? 'calendario'
        : showPrices ? 'precos'
          : 'especialidades';

  const retratoDaEtapa = {
    referralId, specialtyLocked, lockedSpecialtyUuid,
    selectedSpecialty, showPrices, paymentStep, selectedDate, selectedSlot,
  };

  const restaurarEtapa = useCallback(retrato => {
    setReferralId(retrato.referralId);
    setSpecialtyLocked(retrato.specialtyLocked);
    setLockedSpecialtyUuid(retrato.lockedSpecialtyUuid);
    setSelectedSpecialty(retrato.selectedSpecialty);
    setShowPrices(retrato.showPrices);
    setPaymentStep(retrato.paymentStep);
    // Voltar do calendário para a lista precisa soltar data e horário, senão
    // a próxima escolha começa suja.
    setSelectedDate(retrato.selectedDate);
    setSelectedSlot(retrato.selectedSlot);
  }, []);

  // A confirmação é ponto final: dali o caminho é "Ver meus agendamentos",
  // e voltar para o pagamento de uma consulta já marcada não faz sentido.
  useHistoricoDeEtapas(etapa === 'confirmado' ? 'confirmado' : etapa, retratoDaEtapa, restaurarEtapa);

  // Confirm modal: find referral's specialty, lock list, auto-select
  function handleReferralConfirm() {
    if (!referralId) return;
    const ref = referrals.find(r => r.uuid === referralId);
    if (!ref?.specialty) return;
    const spec =
      specialties.find(s => s.uuid && s.uuid === ref.specialty.uuid) ||
      specialties.find(s => s.name === ref.specialty.name);
    if (!spec) return;
    setSpecialtyLocked(true);
    setLockedSpecialtyUuid(spec.uuid);
    setReferralModal(false);
    doSelectSpecialty(spec);
  }

  function handleRealizarPagamento() {
    setAvulsaBooked(!!selectedSlot);
    setPaymentStep('select');
  }

  function handleAgendarAgora() {
    setAvulsaConfirmed(true);
    setPaymentStep(null);
    setShowPrices(false);
    setSpecialtyLocked(true);
    setLockedSpecialtyUuid(avulsaSpecialty?.uuid);
    doSelectSpecialty(avulsaSpecialty);
  }

  function handleAgendarDepois() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingAvulsa', JSON.stringify({
        uuid: avulsaSpecialty?.uuid,
        name: avulsaSpecialty?.name,
        price: avulsaSpecialty?.price,
      }));
    }
    router.push('/agendamentos');
  }

  function handleDayClick(day) {
    if (!day || !isAvailable(day)) return;
    const dateStr = dateStrFromParts(viewYear, viewMonth, day);
    setSelectedDate(dateStr);
    setSelectedSlot(null);
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
        const pad = n => String(n).padStart(2, '0');
        const now = new Date();
        const nowStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        const purchasedAtStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}, às ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        const referral = referralId ? mockReferrals.find(r => r.uuid === referralId) : null;
        const record = {
          uuid: `ls-hist-${now.getTime()}`,
          type: 'scheduled',
          status: 'SCHEDULED',
          appointmentBegin: `${selectedSlot.date} ${selectedSlot.from}`,
          appointmentEnd: null,
          professional: { name: 'A confirmar', specialties: [{ name: selectedSpecialty.name }] },
          beneficiaryMedicalReferral: referral ? {
            referredByDoctor: referral.referredByDoctor,
            createdAt: nowStr,
            updatedAt: nowStr,
          } : null,
          purchasedAt: avulsaConfirmed ? purchasedAtStr : null,
          documents: [],
          evaluation: null,
          createdAt: nowStr,
          updatedAt: nowStr,
        };
        try {
          const existing = JSON.parse(localStorage.getItem('MOCK_HISTORY') || '[]');
          localStorage.setItem('MOCK_HISTORY', JSON.stringify([...existing, record]));
        } catch {}
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

  // When locked, show only the locked specialty; otherwise filter by search
  const filteredSpecialties = (() => {
    if (specialtyLocked && lockedSpecialtyUuid) {
      return specialties.filter(s => s.uuid === lockedSpecialtyUuid);
    }
    return specSearch
      ? specialties.filter(s => s.name.toLowerCase().includes(specSearch.toLowerCase()))
      : specialties;
  })();

  const filteredSlots = slots;

  const pendingReferrals = IS_MOCK && pendingSpecialty
    ? referrals.filter(r => r.status === 'PENDING' && r.specialty?.name === pendingSpecialty.name)
    : referrals.filter(r => r.status === 'PENDING');

  const cells = buildCalendar(viewYear, viewMonth);

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loadingSpecialties || (urlAvulsaSpec && !selectedSpecialty)) {
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
      <BookingSuccessScreen
        selectedSpecialty={selectedSpecialty}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        avulsaConfirmed={avulsaConfirmed}
        onViewAppointments={() => {
          if (typeof window !== 'undefined') localStorage.removeItem('pendingAvulsa');
          router.push('/agendamentos');
        }}
        onBack={() => router.back()}
      />
    );
  }

  // ── Payment confirmation modal (shared across payment steps) ─────────────
  const paymentMethodLabel =
    paymentStep === 'pix' ? 'PIX'
    : paymentStep === 'card-new' ? 'Cartão de crédito'
    : 'Visa •••• 4242';

  const confirmModal = showPaymentConfirm ? (
    <PaymentConfirmModal
      avulsaSpecialty={avulsaSpecialty}
      paymentMethodLabel={paymentMethodLabel}
      onClose={() => setShowPaymentConfirm(false)}
      onConfirm={() => { setShowPaymentConfirm(false); setPaymentStep('success'); }}
    />
  ) : null;

  // ── Payment flow: select method ───────────────────────────────────────────
  if (paymentStep === 'select') {
    return (
      <PaymentSelectStep
        avulsaSpecialty={avulsaSpecialty}
        onSelectPix={() => setPaymentStep('pix')}
        onSelectSaved={() => setShowPaymentConfirm(true)}
        onSelectNew={() => setPaymentStep('card-new')}
        onBack={() => setPaymentStep(null)}
        onCancel={() => { setPaymentStep(null); setShowPrices(false); }}
        confirmModal={confirmModal}
      />
    );
  }

  // ── Payment flow: PIX ─────────────────────────────────────────────────────
  if (paymentStep === 'pix') {
    return (
      <PaymentPixStep
        avulsaSpecialty={avulsaSpecialty}
        onConfirmPayment={() => setPaymentStep('success')}
        onBack={() => setPaymentStep('select')}
      />
    );
  }

  // ── Payment flow: new card ─────────────────────────────────────────────────
  if (paymentStep === 'card-new') {
    return (
      <PaymentCardStep
        cardForm={cardForm}
        setCardForm={setCardForm}
        onConfirmPayment={() => setShowPaymentConfirm(true)}
        onBack={() => setPaymentStep('select')}
        confirmModal={confirmModal}
      />
    );
  }

  // ── Payment flow: success ─────────────────────────────────────────────────
  if (paymentStep === 'success') {
    return (
      <PaymentSuccessStep
        avulsaSpecialty={avulsaSpecialty}
        avulsaBooked={avulsaBooked}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        onViewAppointment={() => router.push('/agendamentos')}
        onAgendarAgora={handleAgendarAgora}
        onAgendarDepois={handleAgendarDepois}
      />
    );
  }

  // ── Main page ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Search field — hidden when specialty is locked from referral */}
      {!specialtyLocked && (
        <div style={{ marginBottom: 20 }}>
          <div className="input-group">
            <input
              type="text"
              className="form-control _search-input"
              placeholder="Buscar especialidade"
              value={specSearch}
              onChange={e => setSpecSearch(e.target.value)}
            />
            <div className="input-group-append">
              <span className="input-group-text" style={{ background: '#f8f8f8', borderRadius: '0 11px 11px 0' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#6e6b7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Specialty list / selected specialty */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h6 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#5e5873' }}>
          {!selectedSpecialty
            ? 'Nossas especialidades'
            : referralId
              ? 'Especialidade do Encaminhamento'
              : 'Consulta Avulsa'}
        </h6>
      </div>

      {selectedSpecialty && !specialtyLocked ? (
        <div className="card mb-3">
          <div className="card-body p-0">
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px',
              borderLeft: '3px solid #4daab6',
              background: '#f2f8fc',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, color: '#5e5873', fontSize: 15 }}>
                  {selectedSpecialty.name}
                </span>
                {loadingAvailability && (
                  <div className="spinner-border spinner-border-sm"
                    style={{ width: 16, height: 16, borderWidth: 2, color: '#4daab6' }} />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {showPrices && selectedSpecialty.price != null && (
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: '#28c76f',
                    background: '#e6f9ee', borderRadius: 10, padding: '2px 10px', flexShrink: 0,
                  }}>
                    R$ {selectedSpecialty.price.toFixed(2).replace('.', ',')}
                  </span>
                )}
                <button
                  onClick={() => setSelectedSpecialty(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 12, padding: 0, flexShrink: 0 }}
                  title="Trocar especialidade"
                >
                  Trocar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
                const clickable = !loadingAvailability && !specialtyLocked;
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
                      cursor: clickable ? 'pointer' : 'default',
                      background: active ? '#f2f8fc' : 'transparent',
                      borderLeft: active ? '3px solid #4daab6' : '3px solid transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!active && clickable) e.currentTarget.style.background = '#f8f8f8'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: active ? 600 : 400, color: '#5e5873', fontSize: 15 }}>
                        {s.name}
                      </span>
                      {loadingAvailability && active && (
                        <div className="spinner-border spinner-border-sm"
                          style={{ width: 16, height: 16, borderWidth: 2, color: '#4daab6' }} />
                      )}
                    </div>
                    {showPrices && s.price != null && (
                      <span style={{
                        fontSize: 13, fontWeight: 600, color: '#28c76f',
                        background: '#e6f9ee', borderRadius: 10, padding: '2px 10px', flexShrink: 0,
                      }}>
                        R$ {s.price.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Informational text — shown after specialty is selected and availability loaded */}
      {selectedSpecialty && !loadingAvailability && (
        <div data-testid="aviso-origem" style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          background: referralId ? '#f0f9ff' : '#f6f4ff',
          border: `1px solid ${referralId ? '#b3e0ea' : '#d0c8f8'}`,
          borderRadius: 10, padding: '12px 14px', marginBottom: 16,
          fontSize: 13, color: '#5e5873', lineHeight: 1.6,
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke={referralId ? '#4daab6' : '#7367f0'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {referralId
            ? 'Esta consulta é gratuita e está coberta pelo seu encaminhamento médico. Selecione a data e o horário de sua preferência para confirmar o agendamento.'
            : 'Você optou por uma consulta avulsa. Selecione a data e o horário desejados. O pagamento será realizado na próxima etapa.'}
        </div>
      )}

      {/* Regras de reagendamento/cancelamento (issue #5): o cliente pediu este
          texto imediatamente acima da data e horário, e só aqui — depois de
          confirmado o encaminhamento, ou já dentro da compra de uma avulsa.
          Fora daí o fluxo do "Novo Agendamento" não muda em nada. */}
      {selectedSpecialty && !loadingAvailability && (
        /* referralId, e não specialtyLocked: a especialidade também fica
           travada quando se retoma uma avulsa pendente, então só a presença
           do encaminhamento distingue as duas origens. */
        <BookingRulesAlert origin={referralId ? 'referral' : 'avulsa'} />
      )}

      {/* Calendar — shown after specialty is selected and availability loaded */}
      {selectedSpecialty && !loadingAvailability && (
        <div ref={calendarRef}>
          <div className="card mb-2" data-testid="calendario">
            {/* Mesmo tratamento do "Horários disponíveis" logo abaixo: dentro
                da caixa, no cabeçalho — foi a referência que o cliente deu. */}
            <div className="card-header" style={{ padding: '14px 20px 0' }}>
              <h6 className="mb-0" data-testid="titulo-calendario" style={{ fontWeight: 700 }}>
                Escolha uma data para sua consulta
              </h6>
            </div>
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
                  </>
                )}
              </div>
            </div>
          )}

          {/* Bottom action button */}
          {bookingError && (
            <div className="alert alert-danger mb-1" style={{ fontSize: 13 }}>
              {bookingError}
            </div>
          )}
          {showPrices ? (
            <button
              onClick={handleRealizarPagamento}
              disabled={!selectedSlot}
              style={{
                width: '100%', marginTop: 8, padding: '14px',
                borderRadius: 24, border: 'none',
                cursor: selectedSlot ? 'pointer' : 'not-allowed',
                background: selectedSlot
                  ? 'linear-gradient(90deg, #4daab6 0%, #461bef 100%)'
                  : '#d0d0d0',
                color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: 1,
                opacity: selectedSlot ? 1 : 0.7,
              }}
            >
              Realizar Pagamento
            </button>
          ) : (
            <button
              onClick={handleBook}
              disabled={!selectedSlot || booking}
              style={{
                width: '100%', marginTop: 8, padding: '12px', borderRadius: 24,
                background: selectedSlot && !booking ? 'linear-gradient(90deg, #4daab6 0%, #461bef 100%)' : '#ccc',
                color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: 1,
                border: 'none', cursor: selectedSlot && !booking ? 'pointer' : 'default',
                transition: 'opacity 0.2s', opacity: selectedSlot && !booking ? 1 : 0.7,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {booking ? (
                <>
                  <div className="spinner-border spinner-border-sm" style={{ width: 18, height: 18, borderWidth: 2, color: '#fff' }} />
                  AGENDANDO...
                </>
              ) : 'AGENDAR'}
            </button>
          )}
        </div>
      )}

      {showPrices ? (
        <button
          onClick={() => router.back()}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6e6b7b', fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 0', marginTop: 4,
          }}
        >
          ← Voltar
        </button>
      ) : (
        <button
          className="btn btn-flat-secondary btn-sm mt-1"
          onClick={() => router.back()}
        >
          ← Voltar
        </button>
      )}

      {/* ── Slot choice modal (avulsa) ───────────────────────────────────────── */}
      <SlotChoiceModal
        show={showSlotChoiceModal}
        onClose={() => setShowSlotChoiceModal(false)}
        onAgendarAgora={() => { setShowSlotChoiceModal(false); doSelectSpecialty(avulsaSpecialty); }}
        onAgendarDepois={() => { setShowSlotChoiceModal(false); setAvulsaBooked(false); setPaymentStep('select'); }}
      />

      {/* ── Referral selection modal ────────────────────────────────────────── */}
      <ReferralModal
        open={referralModal}
        loadingReferrals={loadingReferrals}
        pendingReferrals={pendingReferrals}
        referralId={referralId}
        onClose={handleReferralModalClose}
        onAvulsa={handleAvulsa}
        onSelectReferral={handleReferralItemClick}
        onConfirm={handleReferralConfirm}
      />
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
