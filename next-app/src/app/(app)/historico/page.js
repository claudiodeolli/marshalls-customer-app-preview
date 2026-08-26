'use client';
import { MODAL_OVERLAY } from '@/components/ui/modalScale';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { USER } from '@/data/user';
import { mockHistory } from '@/data/mockData';
import { IconEvent, IconChevronDown } from '@/components/features/historico/icons';
import { X } from 'lucide-react';
import StatusBadge from '@/components/features/historico/StatusBadge';
import StatusSelect from '@/components/features/historico/StatusSelect';
import TypeSelect from '@/components/features/historico/TypeSelect';
import Stars from '@/components/features/historico/Stars';
import EvaluationModal from '@/components/features/historico/EvaluationModal';
import DocumentsAccordion from '@/components/features/historico/DocumentsAccordion';
import SkeletonCard from '@/components/features/historico/SkeletonCard';
import EmptyState from '@/components/features/historico/EmptyState';

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === '1';

/* ── Helpers ──────────────────────────────────────────── */

// Ordem dos grupos no filtro "Todos os status", definida pelo cliente
// (issue #4): finalizadas → em andamento → agendadas → canceladas →
// não realizadas. CANCELLED e CANCELED convivem nos dados, então ambos
// mapeiam para a mesma posição.
const STATUS_DISPLAY_ORDER = ['FINISHED', 'PENDING', 'SCHEDULED', 'CANCELLED', 'CANCELED', 'UNFINISHED'];
const STATUS_RANK = {
  FINISHED: 0, PENDING: 1, SCHEDULED: 2, CANCELLED: 3, CANCELED: 3, UNFINISHED: 4,
};

// Dentro de cada status: Pronto Atendimento, depois Encaminhamento, depois
// consulta avulsa.
function originRank(record) {
  if (record.type === 'emergency') return 0;
  return record.beneficiaryMedicalReferral ? 1 : 2;
}

/** Comparador de grupo: status primeiro, origem depois. */
function compareForDisplay(a, b) {
  const rankA = STATUS_RANK[a.status] ?? STATUS_DISPLAY_ORDER.length;
  const rankB = STATUS_RANK[b.status] ?? STATUS_DISPLAY_ORDER.length;
  return rankA !== rankB ? rankA - rankB : originRank(a) - originRank(b);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function parseRecordDate(str) {
  if (!str) return null;
  const [datePart] = str.split(' ');
  if (!datePart) return null;
  const [d, m, y] = datePart.split('/');
  return new Date(+y, +m - 1, +d);
}
function inputToDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-');
  return new Date(+y, +m - 1, +d);
}

function typeLabel(type) {
  if (type === 'emergency') return 'Pronto Atendimento';
  if (type === 'scheduled') return 'Agendamento com especialista';
  return type;
}

function formatHistDate(str) {
  if (!str) return 'Não informado';
  const parts = str.split(' ');
  if (parts.length === 2) return `${parts[0]}, às ${parts[1]}`;
  return str;
}

function getBrowserTz() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function isSameAsBrazil(tz) {
  const t = tz || getBrowserTz();
  try {
    const ref = new Date('2024-07-01T12:00:00Z');
    const fmt = (zone) => parseInt(
      new Intl.DateTimeFormat('en', { timeZone: zone, hour: 'numeric', hour12: false }).format(ref)
    );
    return fmt(t) === fmt('America/Sao_Paulo');
  } catch { return true; }
}

function convertApptDateTime(date, time, tz) {
  if (!date || !time) return null;
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

function getLastRecord(records) {
  if (!records.length) return null;
  return records.reduce((latest, r) => {
    const d  = parseRecordDate(r.appointmentBegin);
    const ld = parseRecordDate(latest.appointmentBegin);
    return d && ld && d > ld ? r : latest;
  });
}

function saveFilter(params) {
  try { localStorage.setItem('historico_filter', JSON.stringify(params)); } catch {}
}

function loadFilter(defaults) {
  try {
    const saved = localStorage.getItem('historico_filter');
    if (saved) return { ...defaults, ...JSON.parse(saved) };
  } catch {}
  return defaults;
}

/* Converte YYYY-MM-DD → DD/MM/YYYY (formato esperado pela API) */
function isoToBR(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

/* ── Main page ────────────────────────────────────────── */
export default function HistoricoPage() {
  const today = todayStr();
  const sevenAgo = daysAgoStr(7);
  const router = useRouter();
  const { user } = useAuth();

  const [filterOpen, setFilterOpen]   = useState(false);
  const [dateInitial, setDateInitial] = useState(sevenAgo);
  const [dateFinal, setDateFinal]     = useState(today);
  const [typeFilter, setTypeFilter]   = useState('all');
  const [statusFilter, setStatus]     = useState('');
  const [loading, setLoading]           = useState(false);
  const [pageLoading, setPageLoading]   = useState(true);
  const [allRecords, setAllRecords]     = useState([]);
  const [records, setRecords]           = useState([]);
  const [evalTarget, setEvalTarget]         = useState(null);
  const [referralModal, setReferralModal]   = useState(null);
  const [purchaseModal, setPurchaseModal]   = useState(null);
  const [timezone, setTimezone]             = useState('');
  const [fetchError, setFetchError]     = useState(null);

  /* Busca histórico — mocks sempre incluídos; API real adicionada no Vercel */
  function filterMocks({ typeFilter: type, statusFilter: status }) {
    return mockHistory.filter(r => {
      if (type && type !== 'all' && r.type !== type) return false;
      if (status) {
        const match = r.status === status ||
          (status === 'CANCELLED' && r.status === 'CANCELED') ||
          (status === 'CANCELED'  && r.status === 'CANCELLED');
        if (!match) return false;
      }
      return true;
    });
  }

  async function fetchHistory(params) {
    if (IS_MOCK) {
      const mocks = filterMocks(params);
      const stored = [];
      try {
        const raw = localStorage.getItem('MOCK_HISTORY');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const mockUuids = new Set(mocks.map(m => m.uuid));
            parsed
              .filter(r => !mockUuids.has(r.uuid))
              .filter(r => {
                if (params.typeFilter && params.typeFilter !== 'all' && r.type !== params.typeFilter) return false;
                if (params.statusFilter) {
                  const match = r.status === params.statusFilter ||
                    (params.statusFilter === 'CANCELLED' && r.status === 'CANCELED') ||
                    (params.statusFilter === 'CANCELED'  && r.status === 'CANCELLED');
                  if (!match) return false;
                }
                return true;
              })
              .forEach(r => stored.push(r));
          }
        }
      } catch {}
      return [...mocks, ...stored];
    }

    const { dateInitial: di, dateFinal: df, typeFilter: type, statusFilter: status } = params;
    const beneficiaryUuid = typeof window !== 'undefined' ? (localStorage.getItem('BENEFICIARY_UUID') ?? '') : '';

    const qs = new URLSearchParams();
    const diStr = isoToBR(di);
    const dfStr = isoToBR(df);
    if (diStr === dfStr) {
      qs.append('date', diStr);
    } else {
      qs.append('dateInitial', diStr);
      qs.append('dateFinal', dfStr);
    }
    if (type && type !== 'all') qs.append('type', type);
    if (status) qs.append('status', status);
    qs.append('beneficiaryUuid', beneficiaryUuid);

    const res = await api.get(`/api/history?${qs.toString()}`);
    return Array.isArray(res.data) ? res.data : [];
  }

  useEffect(() => { setTimezone(getBrowserTz()); }, []);

  useEffect(() => {
    const defaults = { dateInitial: sevenAgo, dateFinal: today, typeFilter: 'all', statusFilter: '' };
    setDateInitial(defaults.dateInitial);
    setDateFinal(defaults.dateFinal);
    setTypeFilter(defaults.typeFilter);
    setStatus(defaults.statusFilter);

    (async () => {
      try {
        const data = await fetchHistory(defaults);
        setAllRecords(data);
        setRecords(data);
      } catch (err) {
        console.error(err);
        setFetchError('Erro ao carregar histórico.');
      } finally {
        setPageLoading(false);
      }
    })();

    return () => {
      try { localStorage.removeItem('historico_filter'); } catch {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function applyFilter() {
    const params = { dateInitial, dateFinal, typeFilter, statusFilter };
    saveFilter(params);
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchHistory(params);
      setAllRecords(data);
      setRecords(data);
    } catch (err) {
      console.error(err);
      setFetchError('Erro ao buscar registros.');
    } finally {
      setLoading(false);
      if (typeof window !== 'undefined' && window.innerWidth < 1200) setFilterOpen(false);
    }
  }

  const isFilterModified = dateInitial !== sevenAgo || dateFinal !== today || typeFilter !== 'all' || statusFilter !== '';

  return (
    <div style={{ paddingBottom: '1.5rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
          Acompanhe seu histórico completo<br className="_br-mobile" /> e visualize consultas anteriores.
        </p>
      </div>

      {/* Filter panel */}
      <div
        className="card mb-2"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid #e3f2fd',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <div className="card-body _filter-card-body">
          {/* Toggle header */}
          <div
            className="_filter-card-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '0 16px',
              minHeight: '46px',
            }}
            onClick={() => setFilterOpen(o => !o)}
          >
            <h6 style={{ margin: 0, fontWeight: 600, color: 'var(--primary, #0052ff)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconEvent /> {filterOpen ? 'Filtros de Pesquisa' : 'Procurar consultas'}
            </h6>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '13px' }}>
              {!filterOpen && 'Toque para abrir'}
              <IconChevronDown open={filterOpen} />
            </span>
          </div>

          {filterOpen && (
            <div style={{ padding: '0 16px 16px' }}>
              <div className="_hist-filter-row">
                {/* Data inicial */}
                <div className="_hist-filter-date">
                  <label className="form-label" style={{ fontSize: '13px', color: 'var(--primary,#0052ff)', marginBottom: '4px', display: 'block' }}>
                    Data inicial
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateInitial}
                    onChange={e => setDateInitial(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                {/* Data final */}
                <div className="_hist-filter-date">
                  <label className="form-label" style={{ fontSize: '13px', color: 'var(--primary,#0052ff)', marginBottom: '4px', display: 'block' }}>
                    Data final
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateFinal}
                    onChange={e => setDateFinal(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                {/* Tipo de consulta */}
                <div className="_hist-filter-type">
                  <label className="form-label" style={{ fontSize: '13px', color: 'var(--primary,#0052ff)', marginBottom: '4px', display: 'block' }}>
                    Tipo de consulta
                  </label>
                  <TypeSelect
                    value={typeFilter}
                    onChange={val => {
                      setTypeFilter(val);
                      if (val === 'emergency') setStatus('FINISHED');
                    }}
                  />
                </div>

                {/* Status */}
                <div className="_hist-filter-status">
                  <label className="form-label" style={{ fontSize: '13px', color: 'var(--primary,#0052ff)', marginBottom: '4px', display: 'block' }}>
                    Status
                  </label>
                  <StatusSelect value={statusFilter} onChange={setStatus} disabled={typeFilter === 'emergency'} />
                </div>

                {/* Filtrar + Limpar */}
                <div className="_hist-filter-actions" style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignSelf: 'flex-end', flexShrink: 0 }}>
                  <button
                    disabled={loading}
                    onClick={applyFilter}
                    className={`_hist-filter-btn${loading ? '' : ' _ct-gradient'}`}
                    style={{
                      padding: '0 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: loading ? 'default' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#fff',
                      background: loading
                        ? '#e0e0e0'
                        : 'linear-gradient(135deg, #0052ff 0%, #00b7ff 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                        Buscando...
                      </>
                    ) : (
                      <><IconEvent /> Filtrar</>
                    )}
                  </button>
                  {isFilterModified && (
                    <button
                      onClick={() => {
                        setDateInitial(sevenAgo);
                        setDateFinal(today);
                        setTypeFilter('all');
                        setStatus('');
                        const defaults = { dateInitial: sevenAgo, dateFinal: today, typeFilter: 'all', statusFilter: '' };
                        saveFilter(defaults);
                        (async () => {
                          setLoading(true);
                          try {
                            const data = await fetchHistory(defaults);
                            setAllRecords(data);
                            setRecords(data);
                          } catch { /* ignore */ } finally { setLoading(false); }
                        })();
                      }}
                      style={{
                        height: '32px', borderRadius: '8px', whiteSpace: 'nowrap',
                        border: '1px solid #d8d6de', background: '#fff',
                        cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#6e6b7b',
                        padding: '0 16px',
                      }}
                    >
                      Limpar filtro
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="_hist-results" style={{ backgroundColor: 'white', borderRadius: '5px', padding: '15px' }}>
        {fetchError && (
          <div className="alert alert-danger mb-2" style={{ borderRadius: '8px', fontSize: '14px' }}>{fetchError}</div>
        )}
        {pageLoading ? (
          <div className="row" style={{}}>
            {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <div className="spinner-border text-primary" />
          </div>
        ) : (() => {
          // Ordem principal é status → origem (issue #4). A data, que antes
          // ordenava tudo, virou desempate entre cards do mesmo grupo.
          const displayRecords = [...records].sort((a, b) => {
            const byGroup = compareForDisplay(a, b);
            if (byGroup !== 0) return byGroup;

            const da = parseRecordDate(a.appointmentBegin);
            const db = parseRecordDate(b.appointmentBegin);
            if (!da && !db) {
              const ca = parseRecordDate(a.createdAt);
              const cb = parseRecordDate(b.createdAt);
              if (!ca && !cb) return 0;
              if (!ca) return 1;
              if (!cb) return -1;
              return ca - cb;
            }
            if (!da) return 1;
            if (!db) return -1;
            return da - db;
          });
          if (displayRecords.length === 0) return <EmptyState />;
          return (
          <div className="row" style={{}}>
            {displayRecords.map(r => (
              <div key={r.uuid} className="col-12 col-sm-6 col-md-4 mb-2">
                <div className="card mb-0 h-100" style={{ backgroundColor: '#e9f2fa' }}>
                  <div className="card-body" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>

                    {/* Type row */}
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ color: '#5e5873' }}>
                        <strong className="hist-label">Tipo: </strong>
                        {r.type === 'scheduled' ? (
                          <>
                            <span className="hist-value _type-mobile">Agendamento com especialista</span>
                            <span className="hist-value _type-desktop">Agendamento especialista</span>
                          </>
                        ) : (
                          <span className="hist-value">{typeLabel(r.type)}</span>
                        )}
                      </span>
                    </div>

                    {/* Início + Término */}
                    {r.status !== 'SCHEDULED' && r.status !== 'UNFINISHED' && (r.appointmentBegin || r.appointmentEnd) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '6px' }}>
                        {r.appointmentBegin && (
                          <div className="_hist-datetime" style={{ color: '#777' }}>
                            <strong>Início: </strong>{r.appointmentBegin}
                          </div>
                        )}
                        {r.appointmentEnd && (
                          <div className="_hist-datetime" style={{ color: '#777' }}>
                            <strong>Término: </strong>{r.appointmentEnd}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Badge row */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '6px', alignItems: 'flex-end' }}>
                      <div style={{ marginTop: '6px', marginBottom: '6px' }}><StatusBadge status={r.status} /></div>
                      {(r.status === 'CANCELLED' || r.status === 'CANCELED') && (
                        <small style={{ fontSize: '11px', color: '#6e6b7b', textAlign: 'right' }}>Usuário cancelou a consulta</small>
                      )}
                      {r.status === 'UNFINISHED' && (
                        <small style={{ fontSize: '11px', color: '#6e6b7b', textAlign: 'right' }}>Usuário não compareceu à consulta</small>
                      )}
                    </div>

                    <hr style={{ margin: '8px 0', borderColor: 'rgba(0,0,0,0.1)' }} />

                    {r.status === 'SCHEDULED' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <p style={{ marginBottom: '4px' }}>
                          <small className="hist-label"><b>Especialidade</b></small><br />
                          <span className="hist-value">{r.professional.specialties[0].name}</span>
                        </p>

                        <p style={{ marginBottom: '4px' }}>
                          <small className="hist-label"><b>Origem</b></small><br />
                          <span className="hist-value">
                            {r.beneficiaryMedicalReferral ? (
                              <>
                                Encaminhamento<br />
                                <button
                                  onClick={() => setReferralModal({
                                    referredByDoctor: r.beneficiaryMedicalReferral.referredByDoctor,
                                    createdAt: r.createdAt,
                                    updatedAt: r.updatedAt,
                                  })}
                                  className="_hist-link" style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit' }}
                                >
                                  Ver encaminhamento
                                </button>
                              </>
                            ) : (
                              <>
                                Consulta avulsa<br />
                                <button onClick={() => setPurchaseModal(r)} className="_hist-link" style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit' }}>
                                  Detalhes da compra
                                </button>
                              </>
                            )}
                          </span>
                        </p>

                        {(() => {
                          const [date, time] = (r.appointmentBegin || '').split(' ');
                          const tz = timezone || getBrowserTz();
                          const converted = date && time && !isSameAsBrazil(tz) ? convertApptDateTime(date, time, tz) : null;
                          const dateChanged = converted && converted.date !== date;
                          return date && time ? (
                            <p style={{ marginBottom: '4px' }}>
                              <small className="hist-label"><b>Data e horário da consulta</b></small><br />
                              <span className="hist-value">
                                <span style={{ whiteSpace: 'nowrap' }}>
                                  {date} às {time} <span title="Horário de Brasília">🇧🇷</span>{' '}
                                  <span style={{ color: '#9a9a9a', fontSize: '12px' }}>Sao Paulo (GMT-3)</span>
                                </span>
                                {converted && (
                                  <><br /><span style={{ fontSize: '12px', color: '#6e6b7b' }}>no seu horário:{dateChanged ? ` ${converted.date} às` : ''} {converted.time}</span></>
                                )}
                              </span>
                            </p>
                          ) : null;
                        })()}

                        <div className="_hist-card-footer" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-primary btn-sm btn-agendar-referral"
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                            onClick={() => router.push('/agendamentos')}
                          >
                            Ver agendamento
                          </button>
                        </div>
                      </div>
                    ) : r.status === 'PENDING' ? (
                      /* Consulta em andamento: ainda falta escolher data, então
                         o card oferece "Agendar". A não realizada segue pelo
                         caminho genérico, igual à cancelada — o PDF pede que
                         ela seja "semelhante ao de cancelamento". */
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <p style={{ marginBottom: '4px' }}>
                          <small className="hist-label"><b>Especialidade</b></small><br />
                          <span className="hist-value">{r.professional.specialties[0].name}</span>
                        </p>

                        <p style={{ marginBottom: '4px' }}>
                          <small className="hist-label"><b>Origem</b></small><br />
                          <span className="hist-value">
                            {r.beneficiaryMedicalReferral ? (
                              <>
                                Encaminhamento<br />
                                <button
                                  onClick={() => setReferralModal({
                                    referredByDoctor: r.beneficiaryMedicalReferral.referredByDoctor,
                                    createdAt: r.createdAt,
                                    updatedAt: r.updatedAt,
                                  })}
                                  className="_hist-link" style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit' }}
                                >
                                  Ver encaminhamento
                                </button>
                              </>
                            ) : (
                              <>
                                Consulta avulsa<br />
                                <button onClick={() => setPurchaseModal(r)} className="_hist-link" style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit' }}>
                                  Detalhes da compra
                                </button>
                              </>
                            )}
                          </span>
                        </p>

                        <div className="_hist-card-footer" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-primary btn-sm btn-agendar-referral"
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                            onClick={() => router.push('/schedule/calendar')}
                          >
                            Agendar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        {/* Professional */}
                        <p style={{ marginBottom: '4px' }}>
                          <small className="hist-label"><b>Profissional</b></small><br />
                          <span className="hist-value">Dr(a) {r.professional.name}</span>
                        </p>

                        {/* Specialty */}
                        <p style={{ marginBottom: '4px' }}>
                          <small className="hist-label"><b>Especialidade</b></small><br />
                          <span className="hist-value">{r.professional.specialties[0].name}</span>
                        </p>

                        {/* Referral origin */}
                        {r.type === 'scheduled' && (
                          <p style={{ marginBottom: '4px' }}>
                            <small className="hist-label"><b>Origem</b></small><br />
                            {r.beneficiaryMedicalReferral ? (
                              <span className="hist-value">
                                Encaminhamento
                                {(r.status === 'FINISHED' || r.status === 'CANCELED' || r.status === 'CANCELLED') && (
                                  <><br />
                                    <button
                                      onClick={() => setReferralModal(r.beneficiaryMedicalReferral)}
                                      className="_hist-link" style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit' }}
                                    >
                                      Ver encaminhamento
                                    </button>
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="hist-value">
                                Consulta avulsa<br />
                                <button onClick={() => setPurchaseModal(r)} className="_hist-link" style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit' }}>
                                  Detalhes da compra
                                </button>
                              </span>
                            )}
                          </p>
                        )}

                        {/* Documents accordion */}
                        {'documents' in r && r.documents.length > 0 && (
                          <DocumentsAccordion documents={r.documents} />
                        )}

                        {/* Evaluation */}
                        {r.status === 'FINISHED' && (
                          <div className="_hist-card-footer" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'flex-end' }}>
                            {r.evaluation ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Stars value={r.evaluation.rating} size={16} />
                                {r.evaluation.comment && (
                                  <span style={{ fontSize: '11px', color: '#6e6b7b', fontStyle: 'italic' }}>"{r.evaluation.comment}"</span>
                                )}
                              </div>
                            ) : (
                              <button
                                className="btn btn-outline-primary btn-sm btn-agendar-referral"
                                onClick={() => setEvalTarget(r)}
                              >
                                ★ Avaliar consulta
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          );
        })()}
      </div>

      {evalTarget && (
        <EvaluationModal
          record={evalTarget}
          onClose={() => setEvalTarget(null)}
          onSave={(uuid, ev) => {
            setAllRecords(prev => prev.map(r => r.uuid === uuid ? { ...r, evaluation: ev } : r));
            setRecords(prev => prev.map(r => r.uuid === uuid ? { ...r, evaluation: ev } : r));
          }}
        />
      )}

      {referralModal && (
        <div
          style={{ ...MODAL_OVERLAY, zIndex: 10000, background: 'rgba(34,41,47,0.55)', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setReferralModal(null); }}
        >
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: 420, boxShadow: '0 12px 40px rgba(34,41,47,0.25)' }}>
            <div style={{ padding: '18px 24px 16px', borderBottom: '1px solid #ebe9f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0, fontWeight: 700, color: '#5e5873', fontSize: '16px' }}>Encaminhamento</h5>
              <button onClick={() => setReferralModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '24px', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {referralModal.referredByDoctor?.name && (
                <div>
                  <small style={{ fontSize: '11px', color: '#6e6b7b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Encaminhado por</small>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#5e5873' }}>Dr(a). {referralModal.referredByDoctor.name}</p>
                </div>
              )}
              {referralModal.createdAt && (
                <div>
                  <small style={{ fontSize: '11px', color: '#6e6b7b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Criado em</small>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#5e5873' }}>{referralModal.createdAt}</p>
                </div>
              )}
              {referralModal.updatedAt && (
                <div>
                  <small style={{ fontSize: '11px', color: '#6e6b7b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Atualizado em</small>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#5e5873' }}>{referralModal.updatedAt}</p>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #ebe9f1', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setReferralModal(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {purchaseModal && (
        <div
          style={{ ...MODAL_OVERLAY, zIndex: 10000, background: 'rgba(34,41,47,0.55)', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setPurchaseModal(null); }}
        >
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: 420, boxShadow: '0 12px 40px rgba(34,41,47,0.25)' }}>
            <div style={{ padding: '18px 24px 16px', borderBottom: '1px solid #ebe9f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>🛒</span>
                <h5 style={{ margin: 0, fontWeight: 700, color: '#5e5873', fontSize: '16px' }}>Detalhes da compra</h5>
              </div>
              <button onClick={() => setPurchaseModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '13px', lineHeight: 1 }}>🩺</span>
                  <small style={{ fontSize: '11px', color: '#6e6b7b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Consulta</small>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#5e5873' }}>
                  Consulta avulsa — {purchaseModal.professional.specialties[0].name}
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '13px', lineHeight: 1 }}>👤</span>
                  <small style={{ fontSize: '11px', color: '#6e6b7b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adquirida por</small>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#5e5873' }}>{USER.name} {USER.lastName}</p>
              </div>
              {purchaseModal.purchasedAt && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '13px', lineHeight: 1 }}>📅</span>
                    <small style={{ fontSize: '11px', color: '#6e6b7b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data da compra</small>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#5e5873' }}>{purchaseModal.purchasedAt}</p>
                </div>
              )}
              {purchaseModal.purchaseDetails?.amount && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '13px', lineHeight: 1 }}>💰</span>
                    <small style={{ fontSize: '11px', color: '#6e6b7b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Valor pago</small>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#5e5873' }}>{purchaseModal.purchaseDetails.amount}</p>
                </div>
              )}
              {purchaseModal.purchaseDetails?.paymentMethod === 'card' ? (
                <>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '13px', lineHeight: 1 }}>💳</span>
                      <small style={{ fontSize: '11px', color: '#6e6b7b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Forma de pagamento</small>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#5e5873' }}>Cartão de crédito</p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '13px', lineHeight: 1 }}>💳</span>
                      <small style={{ fontSize: '11px', color: '#6e6b7b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cartão utilizado</small>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#5e5873' }}>
                      {purchaseModal.purchaseDetails.card.brand} •••• {purchaseModal.purchaseDetails.card.last4}
                    </p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '13px', lineHeight: 1 }}>📋</span>
                      <small style={{ fontSize: '11px', color: '#6e6b7b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Parcelamento</small>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#5e5873' }}>{purchaseModal.purchaseDetails.card.installments}</p>
                  </div>
                </>
              ) : purchaseModal.purchaseDetails?.paymentMethod === 'pix' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '13px', lineHeight: 1 }}>⚡</span>
                    <small style={{ fontSize: '11px', color: '#6e6b7b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Forma de pagamento</small>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#5e5873' }}>Pix</p>
                </div>
              ) : null}
              {purchaseModal.purchaseDetails?.status && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '13px', lineHeight: 1 }}>✅</span>
                    <small style={{ fontSize: '11px', color: '#6e6b7b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status do pagamento</small>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#28c76f', fontWeight: 600 }}>{purchaseModal.purchaseDetails.status}</p>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #ebe9f1', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setPurchaseModal(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
