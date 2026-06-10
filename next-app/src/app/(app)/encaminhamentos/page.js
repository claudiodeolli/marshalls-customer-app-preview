'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { mockReferrals } from '@/data/mockData';

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === '1';

const STATUS_CONFIG = {
  PENDING:   { label: 'Pendente', badge: 'badge-light-warning',   gradient: 'linear-gradient(90deg, #ff9800, #ffb74d)' },
  SCHEDULED: { label: 'Agendado', badge: 'badge-light-success',   gradient: 'linear-gradient(90deg, #4caf50, #81c784)' },
  default:   { label: 'Pendente', badge: 'badge-light-secondary', gradient: 'linear-gradient(90deg, #757575, #bdbdbd)' },
};

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.default;
}

const FILTER_OPTIONS = [
  { label: 'Todos',         value: '',           color: null },
  { label: 'Pendente',      value: 'PENDING',    color: '#ff9800' },
  { label: 'Agendada',      value: 'SCHEDULED',  color: '#4caf50' },
  { label: 'Realizada',     value: 'FINISHED',   color: '#28c76f' },
  { label: 'Não Realizada', value: 'UNFINISHED', color: '#ea5455' },
];

function formatDate(str) {
  if (!str) return 'Não informado';
  const parts = str.split(' ');
  if (parts.length === 2) {
    const [d, m, y] = parts[0].split('/').map(Number);
    const [h, min] = parts[1].split(':').map(Number);
    const date = new Date(y, m - 1, d, h, min);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  return str;
}

function FilterChip({ label, color }) {
  if (!color) return <span style={{ fontSize: '14px', color: '#6e6b7b' }}>{label}</span>;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px',
      border: `1px solid ${color}`, borderRadius: '20px',
      color, fontSize: '12px', fontWeight: 600, lineHeight: 1.4, background: 'transparent',
    }}>
      {label}
    </span>
  );
}

function FilterSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = FILTER_OPTIONS.find(o => o.value === value) ?? FILTER_OPTIONS[0];

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width: '200px' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', height: '38px', border: '1px solid #d8d6de', borderRadius: '8px',
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
          background: '#fff', border: '1px solid #d8d6de', borderRadius: '8px',
          boxShadow: '0 4px 24px rgba(34,41,47,0.12)', zIndex: 9999, overflow: 'hidden',
        }}>
          {FILTER_OPTIONS.map(opt => (
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

function IconPerson() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconMedical() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8"/><rect x="3" y="2" width="18" height="5" rx="1"/><path d="M3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/><path d="M12 12v6"/><path d="M9 15h6"/>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

function IconSchedule() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="15" x2="12" y2="17"/><line x1="11" y1="16" x2="13" y2="16"/>
    </svg>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#aaa' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <p style={{ fontSize: '15px', margin: 0 }}>Nenhum encaminhamento encontrado.</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="col-12 col-sm-6 col-xl-4 mb-2">
      <div className="card h-100 mb-0" style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ height: '4px', background: '#e9ecef' }} />
        <div className="card-body" style={{ flexGrow: 1 }}>
          <div className="d-flex align-items-center mb-75">
            <div className="sk" style={{ width: 18, height: 18, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
            <div className="sk" style={{ width: '62%', height: 16 }} />
          </div>
          <div className="d-flex align-items-center mb-75">
            <div className="sk" style={{ width: 16, height: 16, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
            <div className="sk" style={{ width: '48%', height: 13 }} />
          </div>
          <div className="d-flex align-items-center mb-50">
            <div className="sk" style={{ width: 14, height: 14, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
            <div className="sk" style={{ width: '72%', height: 11 }} />
          </div>
          <div className="d-flex align-items-center mb-1">
            <div className="sk" style={{ width: 14, height: 14, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
            <div className="sk" style={{ width: '66%', height: 11 }} />
          </div>
          <div className="sk" style={{ width: 62, height: 18, borderRadius: '10px' }} />
        </div>
        <div className="d-flex justify-content-end" style={{ gap: '8px', borderTop: '1px solid #f0f0f0', padding: '12px 16px' }}>
          <div className="sk" style={{ width: 68, height: 29, borderRadius: '4px' }} />
          <div className="sk" style={{ width: 72, height: 29, borderRadius: '4px' }} />
        </div>
      </div>
    </div>
  );
}

export default function EncaminhamentosPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [filter, setFilter]         = useState('PENDING');
  const [referrals, setReferrals]   = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  /* Busca encaminhamentos — usa mock em GitHub Pages, API real no Vercel */
  useEffect(() => {
    if (!user) return;
    (async () => {
      setPageLoading(true);
      setFetchError(null);
      try {
        if (IS_MOCK) {
          setReferrals(mockReferrals);
          return;
        }
        const { data } = await api.get('/api/referrals');
        setReferrals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setFetchError('Ocorreu um erro ao acessar os seus encaminhamentos.');
      } finally {
        setPageLoading(false);
      }
    })();
  }, [user]);

  const visible = filter ? referrals.filter(r => r.status === filter) : referrals;

  return (
    <div>
      <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
        <p className="text-muted mb-75">Visualize e acompanhe seus encaminhamentos médicos</p>
        <FilterSelect value={filter} onChange={setFilter} />
      </div>

      {fetchError && (
        <div className="alert alert-danger" style={{ borderRadius: '8px' }}>{fetchError}</div>
      )}

      {pageLoading ? (
        <div className="row">
          {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="card">
          <div className="card-body p-0">
            <EmptyState />
          </div>
        </div>
      ) : (
        <div className="row">
          {visible.map(ref => {
            const cfg = getStatusConfig(ref.status);
            const canOpen = !!(ref.urlPath && ref.urlPath.trim());
            const canSchedule = ref.status === 'PENDING';

            return (
              <div key={ref.uuid} className="col-12 col-sm-6 col-xl-4 mb-2">
                <div
                  className="card h-100 mb-0"
                  style={{
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.13)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
                  }}
                >
                  <div style={{ height: '4px', background: cfg.gradient, flexShrink: 0 }} />

                  <div className="card-body" style={{ flexGrow: 1 }}>
                    {/* Beneficiary */}
                    <div className="d-flex align-items-center mb-75" style={{ color: 'var(--primary, #0052ff)' }}>
                      <span style={{ marginRight: '8px', flexShrink: 0 }}><IconPerson /></span>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>
                        {ref.beneficiary?.name || 'Beneficiário'}
                      </span>
                    </div>

                    {/* Specialty */}
                    <div className="d-flex align-items-center mb-75" style={{ color: '#5e5873' }}>
                      <span style={{ marginRight: '8px', flexShrink: 0, color: '#6e6b7b' }}><IconMedical /></span>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>
                        {ref.specialty?.name || 'Especialidade não informada'}
                      </span>
                    </div>

                    {/* Created at */}
                    <div className="d-flex align-items-center mb-50" style={{ color: '#6e6b7b' }}>
                      <span style={{ marginRight: '8px', flexShrink: 0 }}><IconCalendar /></span>
                      <small>Criado em: {formatDate(ref.createdAt)}</small>
                    </div>

                    {/* Updated at */}
                    <div className="d-flex align-items-center mb-1" style={{ color: '#6e6b7b' }}>
                      <span style={{ marginRight: '8px', flexShrink: 0 }}><IconRefresh /></span>
                      <small>Atualizado em: {formatDate(ref.updatedAt)}</small>
                    </div>

                    <span className={`badge ${cfg.badge}`} style={{ fontWeight: 700, fontSize: '11px' }}>
                      {cfg.label}
                    </span>
                  </div>

                  {(canOpen || canSchedule) && (
                    <div
                      className="d-flex justify-content-end"
                      style={{ gap: '8px', borderTop: '1px solid #f0f0f0', padding: '12px 16px' }}
                    >
                      {canOpen && (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => window.open(ref.urlPath, '_blank', 'noopener,noreferrer')}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <IconExternalLink /> Abrir
                        </button>
                      )}
                      {canSchedule && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => router.push(`/schedule/calendar?referral=${ref.uuid}`)}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <IconSchedule /> Agendar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
