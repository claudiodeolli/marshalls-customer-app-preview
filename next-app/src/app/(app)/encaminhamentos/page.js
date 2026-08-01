'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { mockReferrals } from '@/data/mockData';
import { IconPerson, IconMedical, IconCalendar, IconRefresh, IconSchedule, IconReferral } from '@/components/features/encaminhamentos/icons';
import FilterSelect from '@/components/features/encaminhamentos/FilterSelect';
import EmptyState from '@/components/features/encaminhamentos/EmptyState';
import SkeletonCard from '@/components/features/encaminhamentos/SkeletonCard';

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === '1';

const STATUS_CONFIG = {
  PENDING:   { label: 'Pendente', color: '#ff9f43', gradient: 'linear-gradient(90deg, #ff9f43, #ffcd94)' },
  SCHEDULED: { label: 'Agendado', color: '#00cfe8', gradient: 'linear-gradient(90deg, #00cfe8, #84e0f0)' },
};

const DEFAULT_STATUS = { color: '#82868b', gradient: 'linear-gradient(90deg, #757575, #bdbdbd)' };

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || DEFAULT_STATUS;
}

function formatDate(str) {
  if (!str) return 'Não informado';
  let date;
  const parts = str.split(' ');
  if (parts.length === 2) {
    const [d, m, y] = parts[0].split('/').map(Number);
    const [h, min] = parts[1].split(':').map(Number);
    date = new Date(y, m - 1, d, h, min);
  } else {
    date = new Date(str);
  }
  if (!isNaN(date.getTime())) {
    const datePart = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `${datePart}, às ${timePart}`;
  }
  return str;
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

  function parseCreatedAt(str) {
    if (!str) return new Date(0);
    const iso = new Date(str);
    if (!isNaN(iso.getTime())) return iso;
    const parts = str.split(' ');
    if (parts.length === 2) {
      const [d, m, y] = parts[0].split('/').map(Number);
      const [h, min, sec] = parts[1].split(':').map(Number);
      return new Date(y, m - 1, d, h, min, sec || 0);
    }
    return new Date(0);
  }

  const visible = (filter ? referrals.filter(r => r.status === filter) : referrals)
    .filter(r => STATUS_CONFIG[r.status])
    .slice()
    .sort((a, b) => parseCreatedAt(a.createdAt) - parseCreatedAt(b.createdAt));

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Visualize e acompanhe seus encaminhamentos médicos.</p>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
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
            const isScheduled = ref.status === 'SCHEDULED';
            const isPending = ref.status === 'PENDING';

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
                    <div className="d-flex align-items-start mb-50" style={{ color: 'var(--primary, #0052ff)' }}>
                      <span style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }}><IconPerson /></span>
                      <div>
                        <div><small><strong>Beneficiário</strong></small></div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{ref.beneficiary?.name || 'Beneficiário'}</div>
                      </div>
                    </div>

                    {/* Specialty */}
                    <div className="d-flex align-items-center mb-50" style={{ color: '#6e6b7b' }}>
                      <span style={{ marginRight: '8px', flexShrink: 0 }}><IconMedical /></span>
                      <span style={{ fontSize: '13px', color: '#5e5873' }}><strong>Especialidade:</strong> {ref.specialty?.name || 'Não informada'}</span>
                    </div>

                    {/* Created at */}
                    <div className="d-flex align-items-start mb-50" style={{ color: '#6e6b7b' }}>
                      <span style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }}><IconCalendar /></span>
                      <div>
                        <div><small><strong>Criado em</strong></small></div>
                        <div><small>{formatDate(ref.createdAt)}</small></div>
                      </div>
                    </div>

                    {/* Updated at */}
                    <div className="d-flex align-items-start mb-50" style={{ color: '#6e6b7b' }}>
                      <span style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }}><IconRefresh /></span>
                      <div>
                        <div><small><strong>Atualizado em</strong></small></div>
                        <div><small>{formatDate(ref.updatedAt)}</small></div>
                      </div>
                    </div>

                    {/* Referred by */}
                    {ref.referredByDoctor?.name && (
                      <div className="d-flex align-items-start mb-50" style={{ color: '#6e6b7b' }}>
                        <span style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }}><IconReferral /></span>
                        <div>
                          <div><small><strong>Encaminhado por</strong></small></div>
                          <div><small>Dr(a). {ref.referredByDoctor.name}</small></div>
                        </div>
                      </div>
                    )}

                    {cfg.label && (
                      <span style={{
                        display: 'inline-block', padding: '3px 10px',
                        border: `1px solid ${cfg.color}`, borderRadius: '20px',
                        color: cfg.color, fontSize: '11px', fontWeight: 700,
                        lineHeight: 1.4, background: `${cfg.color}1f`, whiteSpace: 'nowrap',
                        marginTop: '14px',
                      }}>
                        {cfg.label}
                      </span>
                    )}
                  </div>

                  {(isPending || isScheduled) && (
                    <div
                      className="d-flex justify-content-end"
                      style={{ gap: '8px', borderTop: '1px solid #f0f0f0', padding: '12px 16px' }}
                    >
                      {isScheduled && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => router.push('/agendamentos')}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <IconSchedule /> Ver agendamento
                        </button>
                      )}
                      {isPending && (
                        <button
                          className="btn btn-primary btn-sm btn-agendar-referral"
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
