'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { USER } from '@/data/user';
import { mockHistory } from '@/data/mockData';
import { IconEvent, IconChevronDown } from '@/components/features/historico/icons';
import StatusBadge from '@/components/features/historico/StatusBadge';
import StatusSelect from '@/components/features/historico/StatusSelect';
import Stars from '@/components/features/historico/Stars';
import EvaluationModal from '@/components/features/historico/EvaluationModal';
import DocumentsAccordion from '@/components/features/historico/DocumentsAccordion';
import SkeletonCard from '@/components/features/historico/SkeletonCard';
import EmptyState from '@/components/features/historico/EmptyState';

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === '1';

/* ── Helpers ──────────────────────────────────────────── */
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
  const [evalTarget, setEvalTarget]     = useState(null);
  const [fetchError, setFetchError]     = useState(null);

  /* Busca histórico — usa mock em GitHub Pages, API real no Vercel */
  async function fetchHistory(params) {
    if (IS_MOCK) {
      const { typeFilter: type, statusFilter: status } = params;
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

          {filterOpen && <div style={{ padding: '0 16px 16px' }}><div className="row" style={{ rowGap: '12px', alignItems: 'flex-end' }}>
            {/* Date initial */}
            <div className="col-12 col-sm-6 col-md-2">
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--primary,#0052ff)', marginBottom: '4px' }}>
                Data inicial
              </label>
              <input
                type="date"
                className="form-control"
                value={dateInitial}
                onChange={e => setDateInitial(e.target.value)}
                style={{ borderRadius: '8px', minWidth: '140px' }}
              />
            </div>

            {/* Date final */}
            <div className="col-12 col-sm-6 col-md-2">
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--primary,#0052ff)', marginBottom: '4px' }}>
                Data final
              </label>
              <input
                type="date"
                className="form-control"
                value={dateFinal}
                onChange={e => setDateFinal(e.target.value)}
                style={{ borderRadius: '8px', minWidth: '140px' }}
              />
            </div>

            {/* Type */}
            <div className="col-12 col-sm-6 col-md-2">
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--primary,#0052ff)', marginBottom: '4px' }}>
                Tipo de consulta
              </label>
              <select
                className="custom-select"
                style={{ borderRadius: '8px' }}
                value={typeFilter}
                onChange={e => {
                  const val = e.target.value;
                  setTypeFilter(val);
                  if (val === 'emergency') setStatus('FINISHED');
                }}
              >
                <option value="all">Todos</option>
                <option value="scheduled">Agendamento com especialista</option>
                <option value="emergency">Pronto Atendimento</option>
              </select>
            </div>

            {/* Status */}
            <div className="col-12 col-sm-6 col-md-4">
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--primary,#0052ff)', marginBottom: '4px' }}>
                Status
              </label>
              <StatusSelect value={statusFilter} onChange={setStatus} disabled={typeFilter === 'emergency'} />
            </div>

            {/* Filter + Limpar buttons */}
            <div className="col-12 col-sm-12 col-md-2" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                disabled={loading}
                onClick={applyFilter}
                className={loading ? '' : '_ct-gradient'}
                style={{
                  width: '100%',
                  height: '38px',
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
                    width: '100%', height: '32px', borderRadius: '8px',
                    border: '1px solid #d8d6de', background: '#fff',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#6e6b7b',
                  }}
                >
                  Limpar filtro
                </button>
              )}
            </div>
          </div></div>}
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
          const displayRecords = [...records].sort((a, b) => {
            const da = parseRecordDate(a.appointmentBegin);
            const db = parseRecordDate(b.appointmentBegin);
            if (!da && !db) return 0;
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
                  <div className="card-body" style={{ padding: '14px' }}>

                    {/* Type row */}
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ color: '#5e5873' }}>
                        <strong className="hist-label">Tipo: </strong><span className="hist-value">{typeLabel(r.type)}</span>
                      </span>
                    </div>

                    {/* Início + Término */}
                    {r.status !== 'UNFINISHED' && (r.appointmentBegin || r.appointmentEnd) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '6px' }}>
                        {r.appointmentBegin && (
                          <div style={{ fontSize: 12, color: '#777' }}>
                            <strong>Início: </strong>{r.appointmentBegin}
                          </div>
                        )}
                        {r.appointmentEnd && (
                          <div style={{ fontSize: 12, color: '#777' }}>
                            <strong>Término: </strong>{r.appointmentEnd}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Badge row */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '6px', alignItems: 'flex-end' }}>
                      <div><StatusBadge status={r.status} /></div>
                      {(r.status === 'CANCELLED' || r.status === 'CANCELED') && (
                        <small style={{ fontSize: '11px', color: '#6e6b7b', textAlign: 'right' }}>usuário cancelou a consulta</small>
                      )}
                    </div>

                    <hr style={{ margin: '8px 0', borderColor: 'rgba(0,0,0,0.1)' }} />

                    {r.status === 'SCHEDULED' ? (
                      <>
                        <p style={{ marginBottom: '4px' }}>
                          <small className="hist-label"><b>Especialidade</b></small><br />
                          <span className="hist-value">{r.professional.specialties[0].name}</span>
                        </p>

                        <p style={{ marginBottom: '4px' }}>
                          <small className="hist-label"><b>Origem</b></small><br />
                          <span className="hist-value">{r.beneficiaryMedicalReferral ? 'Encaminhamento' : 'Consulta avulsa'}</span>
                        </p>

                        {r.beneficiaryMedicalReferral?.referredByDoctor?.name ? (
                          <p style={{ marginBottom: '4px' }}>
                            <small className="hist-label"><b>Encaminhado por</b></small><br />
                            <span className="hist-value">Dr(a). {r.beneficiaryMedicalReferral.referredByDoctor.name}</span>
                          </p>
                        ) : (
                          <p style={{ marginBottom: '4px' }}>
                            <small className="hist-label"><b>Adquirida por</b></small><br />
                            <span className="hist-value" style={{ color: '#4F68C7' }}>{USER.name} {USER.lastName}</span>
                          </p>
                        )}

                        {r.createdAt && (
                          <p style={{ marginBottom: '4px', color: '#6e6b7b' }}>
                            <small className="hist-label">Criado em: {formatHistDate(r.createdAt)}</small>
                          </p>
                        )}
                        {r.updatedAt && (
                          <p style={{ marginBottom: '2px', color: '#6e6b7b' }}>
                            <small className="hist-label">Atualizado em: {formatHistDate(r.updatedAt)}</small>
                          </p>
                        )}

                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                            onClick={() => router.push('/agendamentos')}
                          >
                            Ver agendamento
                          </button>
                        </div>
                      </>
                    ) : r.status === 'UNFINISHED' ? (
                      <>
                        <p style={{ marginBottom: '4px' }}>
                          <small className="hist-label"><b>Especialidade</b></small><br />
                          <span className="hist-value">{r.professional.specialties[0].name}</span>
                        </p>

                        <p style={{ marginBottom: '4px' }}>
                          <small className="hist-label"><b>Origem</b></small><br />
                          <span className="hist-value">{r.beneficiaryMedicalReferral ? 'Encaminhamento' : 'Consulta avulsa'}</span>
                        </p>

                        {r.beneficiaryMedicalReferral?.referredByDoctor?.name ? (
                          <p style={{ marginBottom: '4px' }}>
                            <small className="hist-label"><b>Encaminhado por</b></small><br />
                            <span className="hist-value">Dr(a). {r.beneficiaryMedicalReferral.referredByDoctor.name}</span>
                          </p>
                        ) : (
                          <p style={{ marginBottom: '4px' }}>
                            <small className="hist-label"><b>Adquirida por</b></small><br />
                            <span className="hist-value" style={{ color: '#4F68C7' }}>{USER.name} {USER.lastName}</span>
                          </p>
                        )}

                        {r.createdAt && (
                          <p style={{ marginBottom: '4px', color: '#6e6b7b' }}>
                            <small className="hist-label">Criado em: {formatHistDate(r.createdAt)}</small>
                          </p>
                        )}
                        {r.updatedAt && (
                          <p style={{ marginBottom: '2px', color: '#6e6b7b' }}>
                            <small className="hist-label">Atualizado em: {formatHistDate(r.updatedAt)}</small>
                          </p>
                        )}

                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                            onClick={() => router.push('/schedule/calendar')}
                          >
                            Agendar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
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
                                {r.status === 'FINISHED' && (
                                  <><br />
                                    <a
                                      href={r.beneficiaryMedicalReferral.urlPath}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      ver encaminhamento
                                    </a>
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="hist-value">Consulta avulsa</span>
                            )}
                          </p>
                        )}

                        {/* Adquirida por — consulta avulsa cancelada */}
                        {(r.status === 'CANCELLED' || r.status === 'CANCELED') && r.type === 'scheduled' && !r.beneficiaryMedicalReferral && (
                          <p style={{ marginBottom: '4px' }}>
                            <small className="hist-label"><b>Adquirida por</b></small><br />
                            <span className="hist-value" style={{ color: '#4F68C7' }}>{USER.name} {USER.lastName}</span>
                          </p>
                        )}

                        {/* Documents accordion */}
                        {'documents' in r && r.documents.length > 0 && (
                          <DocumentsAccordion documents={r.documents} />
                        )}

                        {/* Evaluation */}
                        {r.status === 'FINISHED' && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                            {r.evaluation ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Stars value={r.evaluation.rating} size={16} />
                                {r.evaluation.comment && (
                                  <span style={{ fontSize: '11px', color: '#6e6b7b', fontStyle: 'italic' }}>"{r.evaluation.comment}"</span>
                                )}
                              </div>
                            ) : (
                              <button
                                className="btn btn-outline-primary btn-sm"
                                style={{ fontSize: '12px', padding: '3px 10px' }}
                                onClick={() => setEvalTarget(r)}
                              >
                                ★ Avaliar consulta
                              </button>
                            )}
                          </div>
                        )}
                      </>
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
    </div>
  );
}
