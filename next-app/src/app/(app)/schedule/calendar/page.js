'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
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
    if (loadingAvailability || specialtyLocked) return;
    if (showPrices) {
      setAvulsaSpecialty(spec);
      doSelectSpecialty(spec);
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
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
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
    setSlotSearch('');
    setLoadingSlots(true);
    setTimeout(() => {
      setSlots(availabilities.filter(a => a.date === dateStr));
      setLoadingSlots(false);
      if (showPrices) setShowSlotChoiceModal(true);
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

  // When locked, show only the locked specialty; otherwise filter by search
  const filteredSpecialties = (() => {
    if (specialtyLocked && lockedSpecialtyUuid) {
      return specialties.filter(s => s.uuid === lockedSpecialtyUuid);
    }
    return specSearch
      ? specialties.filter(s => s.name.toLowerCase().includes(specSearch.toLowerCase()))
      : specialties;
  })();

  const filteredSlots = slotSearch
    ? slots.filter(s => s.from.includes(slotSearch))
    : slots;

  const pendingReferrals = IS_MOCK && pendingSpecialty
    ? referrals.filter(r => r.status === 'PENDING' && r.specialty?.name === pendingSpecialty.name)
    : referrals.filter(r => r.status === 'PENDING');

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
      <div className="card" style={{ maxWidth: '520px', margin: '2rem auto' }}>
        <div className="card-body" style={{ padding: '2.5rem', textAlign: 'center' }}>
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
            Agendado com sucesso!
          </h5>
          <p className="text-muted">
            {selectedSpecialty?.name} — {selectedDate} às {selectedSlot?.from}
          </p>
          {avulsaConfirmed && (
            <div style={{
              textAlign: 'left', background: '#f8f8f8', borderRadius: 10,
              padding: '14px 18px', marginTop: 8, marginBottom: 16,
            }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#5e5873', marginBottom: 8 }}>
                Dicas para o dia da sua consulta
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#6e6b7b', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Chegue com 15 minutos de antecedência</li>
                <li>Traga um documento de identificação com foto</li>
                <li>Leve exames ou laudos médicos anteriores, se houver</li>
                <li>Em caso de cancelamento, avise com pelo menos 24h de antecedência</li>
              </ul>
            </div>
          )}
          {avulsaConfirmed ? (
            <button className="btn btn-primary" style={{ width: '100%', borderRadius: 24, fontWeight: 700 }}
              onClick={() => {
                if (typeof window !== 'undefined') localStorage.removeItem('pendingAvulsa');
                router.push('/agendamentos');
              }}>
              Ver meus Agendamentos
            </button>
          ) : (
            <button className="btn btn-primary mt-2" onClick={() => router.back()}>
              Voltar
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Payment confirmation modal (shared across payment steps) ─────────────
  const paymentMethodLabel =
    paymentStep === 'pix' ? 'PIX'
    : paymentStep === 'card-new' ? 'Cartão de crédito'
    : 'Visa •••• 4242';

  const confirmModal = showPaymentConfirm ? (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={() => setShowPaymentConfirm(false)}
    >
      <div
        style={{
          background: '#fff', borderRadius: 12, width: '100%', maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f2f7' }}>
          <h6 style={{ fontWeight: 700, color: '#5e5873', margin: 0 }}>Confirmar pagamento</h6>
        </div>
        <div style={{ padding: '16px 24px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: '#6e6b7b' }}>Especialidade</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#5e5873' }}>{avulsaSpecialty?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: '#6e6b7b' }}>Tipo</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#5e5873' }}>Consulta avulsa</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: '#6e6b7b' }}>Pagamento</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#5e5873' }}>{paymentMethodLabel}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f3f2f7' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#5e5873' }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#28c76f' }}>
              R$ {(avulsaSpecialty?.price ?? 0).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 20px' }}>
          <button
            onClick={() => setShowPaymentConfirm(false)}
            style={{
              flex: 1, background: 'none', border: '1.5px solid #ebe9f1',
              borderRadius: 24, fontWeight: 600, fontSize: 14, color: '#6e6b7b',
              cursor: 'pointer', padding: '10px',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => { setShowPaymentConfirm(false); setPaymentStep('success'); }}
            className="btn btn-primary"
            style={{ flex: 1, borderRadius: 24, fontWeight: 700, fontSize: 14 }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // ── Payment flow: select method ───────────────────────────────────────────
  if (paymentStep === 'select') {
    const price = avulsaSpecialty?.price ?? 0;
    const optionCard = (onClick, icon, title, subtitle) => (
      <div
        className="card mb-2"
        onClick={onClick}
        style={{ cursor: 'pointer', border: '1.5px solid #ebe9f1' }}
        onMouseEnter={e => { e.currentTarget.style.border = '1.5px solid #4daab6'; }}
        onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid #ebe9f1'; }}
      >
        <div className="card-body d-flex align-items-center" style={{ gap: 14, padding: '14px 18px' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3f2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#5e5873' }}>{title}</div>
            <div style={{ fontSize: 13, color: '#6e6b7b' }}>{subtitle}</div>
          </div>
          <svg style={{ marginLeft: 'auto', flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b9b9c3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    );
    return (
      <>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card mb-3">
          <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
            <div>
              <div style={{ fontSize: 12, color: '#6e6b7b', marginBottom: 2 }}>Consulta avulsa</div>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#5e5873' }}>{avulsaSpecialty?.name}</div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 20, color: '#28c76f' }}>
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <h6 style={{ fontWeight: 700, color: '#5e5873', marginBottom: 14 }}>Forma de pagamento</h6>

        {optionCard(
          () => setPaymentStep('pix'),
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#32BCAD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11.5 2L2 11.5l10 10 9.5-9.5L11.5 2z" />
            <path d="M7 11.5l4.5 4.5 5.5-5.5" />
          </svg>,
          'PIX',
          'Gera chave ou QR Code'
        )}

        {optionCard(
          () => setShowPaymentConfirm(true),
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6e6b7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>,
          'Visa •••• 4242',
          'Cartão já cadastrado'
        )}

        {optionCard(
          () => setPaymentStep('card-new'),
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6e6b7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
            <line x1="7" y1="15" x2="7.01" y2="15" />
            <line x1="11" y1="15" x2="11.01" y2="15" />
          </svg>,
          'Usar outro cartão',
          'Pagar com novo cartão de crédito'
        )}

        <button
          onClick={() => { setPaymentStep(null); setShowPrices(false); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea5455', fontWeight: 600, fontSize: 14, padding: '8px 0', marginTop: 4 }}
        >
          Cancelar
        </button>
      </div>
      {confirmModal}
    </>
    );
  }

  // ── Payment flow: PIX ─────────────────────────────────────────────────────
  if (paymentStep === 'pix') {
    const pixKey = 'contato@marshallsmed.com.br';
    const price = avulsaSpecialty?.price ?? 0;
    return (
      <>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header" style={{ padding: '16px 20px' }}>
            <h6 style={{ margin: 0, fontWeight: 700, color: '#5e5873' }}>Pagamento via PIX</h6>
          </div>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{
              width: 160, height: 160, margin: '0 auto 16px',
              border: '2px solid #32BCAD', borderRadius: 8,
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <rect width="120" height="120" fill="white" />
                <rect x="10" y="10" width="40" height="40" fill="none" stroke="#000" strokeWidth="4" />
                <rect x="18" y="18" width="24" height="24" fill="#000" />
                <rect x="70" y="10" width="40" height="40" fill="none" stroke="#000" strokeWidth="4" />
                <rect x="78" y="18" width="24" height="24" fill="#000" />
                <rect x="10" y="70" width="40" height="40" fill="none" stroke="#000" strokeWidth="4" />
                <rect x="18" y="78" width="24" height="24" fill="#000" />
                <rect x="70" y="70" width="8" height="8" fill="#000" />
                <rect x="82" y="70" width="8" height="8" fill="#000" />
                <rect x="94" y="70" width="16" height="8" fill="#000" />
                <rect x="70" y="82" width="16" height="8" fill="#000" />
                <rect x="90" y="82" width="8" height="8" fill="#000" />
                <rect x="70" y="94" width="8" height="16" fill="#000" />
                <rect x="82" y="94" width="8" height="8" fill="#000" />
                <rect x="94" y="90" width="16" height="10" fill="#000" />
                <rect x="50" y="50" width="8" height="8" fill="#000" />
                <rect x="62" y="50" width="8" height="8" fill="#000" />
                <rect x="50" y="62" width="8" height="8" fill="#000" />
                <rect x="62" y="62" width="8" height="8" fill="#000" />
              </svg>
            </div>
            <p style={{ fontSize: 13, color: '#6e6b7b', marginBottom: 6 }}>Ou copie a chave PIX:</p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
              background: '#f3f2f7', borderRadius: 8, padding: '8px 12px', marginBottom: 8,
            }}>
              <span style={{ fontSize: 13, color: '#5e5873', wordBreak: 'break-all' }}>{pixKey}</span>
              <button
                onClick={() => navigator.clipboard?.writeText(pixKey)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6e6b7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#b9b9c3', marginBottom: 20 }}>
              Valor: R$ {price.toFixed(2).replace('.', ',')}
            </p>
            <button
              onClick={() => setShowPaymentConfirm(true)}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: 24, fontWeight: 700 }}
            >
              Confirmar pagamento
            </button>
          </div>
        </div>
        <button
          onClick={() => setPaymentStep('select')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6e6b7b', fontWeight: 600, fontSize: 14, marginTop: 12, padding: '4px 0' }}
        >
          ← Voltar
        </button>
      </div>
      {confirmModal}
      </>
    );
  }

  // ── Payment flow: new card ─────────────────────────────────────────────────
  if (paymentStep === 'card-new') {
    return (
      <>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header" style={{ padding: '16px 20px' }}>
            <h6 style={{ margin: 0, fontWeight: 700, color: '#5e5873' }}>Dados do Cartão</h6>
          </div>
          <div className="card-body">
            <div className="form-group mb-1">
              <label style={{ fontSize: 13, color: '#6e6b7b', display: 'block', marginBottom: 4 }}>Número do cartão</label>
              <input
                type="text"
                className="form-control"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                value={cardForm.number}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '');
                  const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
                  setCardForm(f => ({ ...f, number: formatted }));
                }}
              />
            </div>
            <div className="form-group mb-1">
              <label style={{ fontSize: 13, color: '#6e6b7b', display: 'block', marginBottom: 4 }}>Nome do titular</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nome impresso no cartão"
                value={cardForm.name}
                onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="row">
              <div className="col-6">
                <div className="form-group mb-1">
                  <label style={{ fontSize: 13, color: '#6e6b7b', display: 'block', marginBottom: 4 }}>Validade</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MM/AA"
                    maxLength={5}
                    value={cardForm.expiry}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '');
                      setCardForm(f => ({ ...f, expiry: v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v }));
                    }}
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group mb-1">
                  <label style={{ fontSize: 13, color: '#6e6b7b', display: 'block', marginBottom: 4 }}>CVV</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="000"
                    maxLength={4}
                    value={cardForm.cvv}
                    onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPaymentConfirm(true)}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: 24, fontWeight: 700, marginTop: 10 }}
            >
              Finalizar pagamento
            </button>
          </div>
        </div>
        <button
          onClick={() => setPaymentStep('select')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6e6b7b', fontWeight: 600, fontSize: 14, marginTop: 12, padding: '4px 0' }}
        >
          ← Voltar
        </button>
      </div>
      {confirmModal}
      </>
    );
  }

  // ── Payment flow: success ─────────────────────────────────────────────────
  if (paymentStep === 'success') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '2.5rem 0' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#e6f9ee',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none"
            stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h5 style={{ fontWeight: 700, color: '#5e5873', marginBottom: 6 }}>Recebemos seu pagamento!</h5>
        <p style={{ color: '#6e6b7b', fontSize: 14, marginBottom: 28 }}>
          {avulsaSpecialty?.name} — R$ {(avulsaSpecialty?.price ?? 0).toFixed(2).replace('.', ',')}
        </p>
        {avulsaBooked ? (
          <button
            onClick={() => router.push('/agendamentos')}
            className="btn btn-primary"
            style={{ width: '100%', borderRadius: 24, fontWeight: 700, fontSize: 16 }}
          >
            Ver meu agendamento
          </button>
        ) : (
          <>
            <button
              onClick={handleAgendarAgora}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: 24, fontWeight: 700, marginBottom: 12, fontSize: 16 }}
            >
              Agendar Agora
            </button>
            <button
              onClick={handleAgendarDepois}
              style={{
                width: '100%', background: 'none', border: '1.5px solid #ebe9f1',
                borderRadius: 24, fontWeight: 600, fontSize: 15, color: '#6e6b7b',
                cursor: 'pointer', padding: '10px',
              }}
            >
              Agendar depois
            </button>
          </>
        )}
      </div>
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
      )}

      {/* Specialty list */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h6 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#5e5873' }}>
          {specialtyLocked ? 'Especialidade do Encaminhamento' : 'Nossas especialidades'}
        </h6>
        {showPrices && (
          <span style={{
            fontSize: 12, color: '#4daab6', fontWeight: 600,
            background: '#f0f9ff', border: '1px solid #b3e0ea',
            borderRadius: 12, padding: '2px 10px',
          }}>
            Consulta avulsa
          </span>
        )}
      </div>

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
                      <div
                        className="spinner-border spinner-border-sm"
                        style={{ width: 16, height: 16, borderWidth: 2, color: '#4daab6' }}
                      />
                    )}
                  </div>
                  {showPrices && s.price != null && (
                    <span style={{
                      fontSize: 13, fontWeight: 600, color: '#28c76f',
                      background: '#e6f9ee', borderRadius: 10, padding: '2px 10px',
                      flexShrink: 0,
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
              style={{
                width: '100%', marginTop: 8, padding: '14px',
                borderRadius: 24, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(90deg, #4daab6 0%, #461bef 100%)',
                color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: 1,
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
            color: '#ea5455', fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 0', marginTop: 4,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Cancelar
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
      {showSlotChoiceModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{
            background: '#fff', borderRadius: 12, width: '100%', maxWidth: 420,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '28px 24px 24px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 15, color: '#5e5873', lineHeight: 1.6, marginBottom: 20 }}>
              Você não precisa escolher o horário agora, pode fazer isso depois.
              <br /><br />
              Mas, se preferir, vá em frente e selecione agora mesmo o horário da sua consulta avulsa.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowSlotChoiceModal(false)}
                className="btn btn-primary"
                style={{ flex: 1, borderRadius: 24, fontWeight: 700 }}
              >
                Escolher horário agora
              </button>
              <button
                onClick={() => {
                  setShowSlotChoiceModal(false);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setSlots([]);
                }}
                style={{
                  flex: 1, background: 'none', border: '1.5px solid #ebe9f1',
                  borderRadius: 24, fontWeight: 600, fontSize: 14, color: '#6e6b7b',
                  cursor: 'pointer', padding: '10px',
                }}
              >
                Escolher horário depois
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Referral selection modal ────────────────────────────────────────── */}
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
            style={{
              background: '#fff',
              borderRadius: 8,
              width: '100%',
              maxWidth: 500,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid #eee',
            }}>
              <h6 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#333' }}>
                Selecionar Encaminhamento
              </h6>
              <button
                onClick={handleReferralModalClose}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px', lineHeight: 1, color: '#5e5873',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
                Selecione um encaminhamento médico. A especialidade do encaminhamento será selecionada automaticamente:
              </p>

              {loadingReferrals ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gap: 12 }}>
                  <p style={{ margin: 0, color: '#666', fontSize: 14 }}>Carregando encaminhamentos...</p>
                  <div className="spinner-border" style={{ color: '#4daab6', width: '2.5rem', height: '2.5rem' }} />
                </div>
              ) : pendingReferrals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <p style={{ color: '#666', marginBottom: 8, fontSize: 14 }}>
                    Você não possui encaminhamentos disponíveis.
                  </p>
                  <p style={{ color: '#666', fontSize: 13, marginBottom: '1.5rem' }}>
                    Solicite um encaminhamento médico para agendar esta especialidade, ou:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={handleAvulsa}
                      style={{
                        borderRadius: 24, padding: '10px 28px', fontWeight: 600,
                        background: 'linear-gradient(90deg, #4daab6 0%, #461bef 100%)',
                        border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14,
                      }}
                    >
                      Adquirir consulta avulsa
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
                  {pendingReferrals.map(ref => {
                    const isSelected = referralId === ref.uuid;
                    return (
                      <div
                        key={ref.uuid}
                        onClick={() => handleReferralItemClick(ref)}
                        style={{
                          padding: '12px 14px',
                          border: `1px solid ${isSelected ? '#4daab6' : '#e0e0e0'}`,
                          borderRadius: 8,
                          marginBottom: 8,
                          cursor: 'pointer',
                          background: isSelected ? '#f0f9ff' : 'transparent',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8f9fa'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 15, color: '#333' }}>
                          {ref.specialty?.name || 'Especialidade não informada'}
                        </p>
                        <p style={{ margin: 0, color: '#666', fontSize: 13 }}>
                          Criado em: {ref.createdAt}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal footer — only show buttons when there are referrals */}
            {!loadingReferrals && pendingReferrals.length > 0 && (
              <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: 12,
                padding: '12px 20px', borderTop: '1px solid #eee',
              }}>
                <button
                  onClick={handleReferralModalClose}
                  style={{
                    borderRadius: 24, padding: '8px 24px', fontWeight: 600,
                    background: 'transparent', border: '1px solid #ccc', color: '#666',
                    cursor: 'pointer', fontSize: 14,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReferralConfirm}
                  disabled={!referralId}
                  style={{
                    borderRadius: 24, padding: '8px 24px', fontWeight: 600,
                    background: referralId ? '#4daab6' : '#ccc',
                    border: 'none', color: '#fff',
                    cursor: referralId ? 'pointer' : 'default', fontSize: 14,
                  }}
                >
                  Confirmar
                </button>
              </div>
            )}
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
