'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { mockHistory } from '@/data/mockData';

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

/* ── Icons (SVG inline) ───────────────────────────────── */
function IconEvent() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 12h-5v5h5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
    </svg>
  );
}
function IconSchedule() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
    </svg>
  );
}
function IconHospital() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 3c1.93 0 3.5 1.57 3.5 3.5S14.93 13 13 13s-3.5-1.57-3.5-3.5S11.07 6 13 6zm7 13H6v-.23c0-.62.28-1.2.76-1.58C8.47 15.82 10.64 15 13 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
    </svg>
  );
}
function IconChevronDown({ open }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function IconOpenInNew() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}
function IconExam() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary,#0052ff)' }}>
      <path d="M7 2v2H6c-1.1 0-2 .9-2 2v15c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-1V2h-2v2H9V2H7zm11 4v15H6V6h12zM8 14h2v2H8v-2zm4-4h2v2h-2v-2zm-4 0h2v2H8v-2zm4 4h2v2h-2v-2zm4-4h2v2h-2v-2z"/>
    </svg>
  );
}
function IconReferral() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary,#0052ff)' }}>
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  );
}
function IconMedicine() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary,#0052ff)' }}>
      <path d="m17.73 12.02 3.98-3.98c.39-.39.39-1.02 0-1.41l-4.34-4.34c-.39-.39-1.02-.39-1.41 0l-3.98 3.98L8 2.29C7.61 1.9 6.98 1.9 6.59 2.29L2.25 6.63c-.39.39-.39 1.02 0 1.41l3.98 3.98L2.25 16c-.39.39-.39 1.02 0 1.41l4.34 4.34c.39.39 1.02.39 1.41 0l3.98-3.98 3.98 3.98c.2.2.45.29.71.29.26 0 .51-.1.71-.29l4.34-4.34c.39-.39.39-1.02 0-1.41l-3.99-3.98zM12 9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-4.71 1.96L3.66 7.34l4-4 3.63 3.62-4 4zm10 10-3.62-3.62 4-4 3.62 3.62-4 4z"/>
    </svg>
  );
}
function IconNotes() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary,#0052ff)' }}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  );
}
function IconReport() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary,#0052ff)' }}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    </svg>
  );
}
function IconInbox() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#aaa' }}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5v-3h3.56c.69 1.19 1.97 2 3.45 2s2.75-.81 3.45-2H19v3zm0-5h-4c0 1.1-.9 2-2 2s-2-.9-2-2H5V5h14v9z"/>
    </svg>
  );
}

function getDocInfo(type) {
  switch (type) {
    case 'exam':      return { icon: <IconExam />,      title: 'Exame' };
    case 'referral':  return { icon: <IconReferral />,  title: 'Encaminhamento' };
    case 'medicines': return { icon: <IconMedicine />,  title: 'Medicamento' };
    case 'notes':     return { icon: <IconNotes />,     title: 'Atestado' };
    case 'report':    return { icon: <IconReport />,    title: 'Relatório' };
    default:          return { icon: <IconReferral />,  title: 'Documento' };
  }
}

/* ── Documents accordion ──────────────────────────────── */
function DocumentsAccordion({ documents }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: '10px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '4px' }}>
      <div
        style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ fontSize: '13px', fontWeight: 500 }}>Documentos do atendimento</span>
        <IconChevronDown open={open} />
      </div>
      {open && (
        <div style={{ padding: '0 14px 8px' }}>
          {documents.map((doc, idx) => {
            const { icon, title } = getDocInfo(doc.type);
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < documents.length - 1 ? '1px solid #ddd' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {icon}
                  <span style={{ fontWeight: 500, fontSize: '13px' }}>{title}</span>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                  <IconOpenInNew />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Status / Type helpers ────────────────────────────── */
function typeLabel(type) {
  if (type === 'emergency') return 'Pronto atendimento';
  if (type === 'scheduled') return 'Agendamento com especialista';
  return type;
}

const STATUS_BADGE = {
  FINISHED:   { label: 'Finalizado',   cls: 'badge-light-success', color: '#28c76f' },
  UNFINISHED: { label: 'Em Andamento', cls: 'badge-light-warning',  color: '#ff9f43' },
  CANCELLED:  { label: 'Cancelado',    cls: 'badge-light-danger',   color: '#ea5455' },
  CANCELED:   { label: 'Cancelado',    cls: 'badge-light-danger',   color: '#ea5455' },
  SCHEDULED:  { label: 'Agendado',     cls: 'badge-light-primary',  color: '#00cfe8' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_BADGE[status] ?? { label: status, cls: 'badge-light-secondary', color: '#6e6b7b' };
  return <span className={`badge ${cfg.cls}`} style={{ fontWeight: 700, fontSize: '11px' }}>{cfg.label}</span>;
}

const STATUS_OPTIONS = [
  { value: '',          label: 'Todos os status', color: null },
  { value: 'FINISHED',  label: 'Finalizado',      color: '#28c76f' },
  { value: 'UNFINISHED',label: 'Em Andamento',    color: '#ff9f43' },
  { value: 'SCHEDULED', label: 'Agendado',        color: '#00cfe8' },
  { value: 'CANCELLED', label: 'Cancelado',       color: '#ea5455' },
];

function StatusChip({ label, color }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      border: `1px solid ${color}`,
      borderRadius: '20px',
      color,
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: 1.4,
      background: 'transparent',
    }}>
      {label}
    </span>
  );
}

function StatusSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = STATUS_OPTIONS.find(o => o.value === value) ?? STATUS_OPTIONS[0];

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', height: '38px',
          border: '1px solid #d8d6de', borderRadius: '8px',
          background: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 12px', fontSize: '14px', color: '#6e6b7b',
        }}
      >
        <span>
          {selected.color
            ? <StatusChip label={selected.label} color={selected.color} />
            : <span style={{ fontSize: '14px' }}>{selected.label}</span>
          }
        </span>
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
          {STATUS_OPTIONS.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '8px 14px', cursor: 'pointer',
                background: value === opt.value ? '#f3f2f7' : '#fff',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f3f2f7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = value === opt.value ? '#f3f2f7' : '#fff'; }}
            >
              {opt.color
                ? <StatusChip label={opt.label} color={opt.color} />
                : <span style={{ fontSize: '14px', color: '#6e6b7b' }}>{opt.label}</span>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Evaluation star display ─────────────────────────── */
function Stars({ value, onChange, size = 20 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1,2,3,4,5].map(n => (
        <svg
          key={n}
          xmlns="http://www.w3.org/2000/svg"
          width={size} height={size}
          viewBox="0 0 24 24"
          fill={(hover || value) >= n ? '#f6c90e' : 'none'}
          stroke={(hover || value) >= n ? '#f6c90e' : '#ccc'}
          strokeWidth="1.5"
          style={{ cursor: onChange ? 'pointer' : 'default', flexShrink: 0 }}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

/* ── Evaluation modal ─────────────────────────────────── */
function EvaluationModal({ record, onClose, onSave }) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [saving,  setSaving]  = useState(false);

  function handleSave() {
    if (!rating) return;
    setSaving(true);
    setTimeout(() => {
      onSave(record.uuid, { rating, comment });
      setSaving(false);
      onClose();
    }, 400);
  }

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1060, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}
      onClick={onClose}
    >
      <div
        style={{ background:'#fff', borderRadius:'16px', padding:'28px', width:'100%', maxWidth:'420px', boxShadow:'0 8px 32px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <h5 style={{ fontWeight:700, marginBottom:'4px' }}>Avaliar consulta</h5>
        <p style={{ fontSize:'13px', color:'#6e6b7b', marginBottom:'20px' }}>
          Dr(a) {record.professional.name} — {record.professional.specialties[0].name}
        </p>

        <div style={{ marginBottom:'20px' }}>
          <label style={{ fontSize:'13px', fontWeight:600, display:'block', marginBottom:'8px' }}>Sua nota</label>
          <Stars value={rating} onChange={setRating} size={32} />
          {!rating && <small style={{ color:'#ea5455', display:'block', marginTop:'4px' }}>Selecione uma nota para continuar</small>}
        </div>

        <div style={{ marginBottom:'24px' }}>
          <label style={{ fontSize:'13px', fontWeight:600, display:'block', marginBottom:'6px' }}>Comentário <span style={{ color:'#aaa', fontWeight:400 }}>(opcional)</span></label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Compartilhe sua experiência..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ resize:'none', fontSize:'13px' }}
          />
        </div>

        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!rating || saving}>
            {saving ? 'Salvando...' : 'Enviar avaliação'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton card ────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="col-12 col-sm-6 col-md-4 mb-2">
      <div className="card mb-0 h-100" style={{ backgroundColor: '#e9f2fa' }}>
        <div className="card-body" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div className="sk" style={{ width: 82, height: 11 }} />
              <div className="sk" style={{ width: 70, height: 11 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
              <div className="sk" style={{ width: 105, height: 11 }} />
              <div className="sk" style={{ width: 85, height: 11 }} />
            </div>
          </div>
          <hr style={{ margin: '8px 0', borderColor: 'rgba(0,0,0,0.1)' }} />
          <div className="sk" style={{ width: 72, height: 10, marginBottom: 5 }} />
          <div className="sk" style={{ width: '78%', height: 15, marginBottom: '1rem' }} />
          <div className="sk" style={{ width: 72, height: 10, marginBottom: 5 }} />
          <div className="sk" style={{ width: '55%', height: 15 }} />
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem', padding: '3rem' }}>
      <IconInbox />
      <p style={{ marginTop: '8px', color: '#888', fontSize: '15px' }}>Nenhum registro encontrado.</p>
    </div>
  );
}

/* ── Filter logic ─────────────────────────────────────── */
function filterRecords(records, { dateInitial, dateFinal, typeFilter, statusFilter }) {
  const di = inputToDate(dateInitial);
  const df = inputToDate(dateFinal);
  return records.filter(r => {
    const rd = parseRecordDate(r.appointmentBegin);
    if (rd && di && rd < di) return false;
    if (rd && df) {
      const dfEnd = new Date(df); dfEnd.setHours(23, 59, 59);
      if (rd > dfEnd) return false;
    }
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (statusFilter) {
      const match = r.status === statusFilter ||
        (statusFilter === 'CANCELLED' && r.status === 'CANCELED') ||
        (statusFilter === 'CANCELED'  && r.status === 'CANCELLED');
      if (!match) return false;
    }
    return true;
  });
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
    const saved = loadFilter({ dateInitial: sevenAgo, dateFinal: today, typeFilter: 'all', statusFilter: '' });
    setDateInitial(saved.dateInitial);
    setDateFinal(saved.dateFinal);
    setTypeFilter(saved.typeFilter);
    setStatus(saved.statusFilter);

    (async () => {
      try {
        const data = await fetchHistory(saved);
        setAllRecords(data);
        setRecords(data);
      } catch (err) {
        console.error(err);
        setFetchError('Erro ao carregar histórico.');
      } finally {
        setPageLoading(false);
      }
    })();
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

  return (
    <div style={{ paddingBottom: '1.5rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
          Acompanhe seu histórico completo<br className="_br-mobile" /> e visualize consultas anteriores  
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
        <div className="card-body">
          {/* Toggle header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              marginBottom: filterOpen ? '1.25rem' : 0,
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

          {filterOpen && <div className="row" style={{ rowGap: '12px', alignItems: 'flex-end' }}>
            {/* Date initial */}
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--primary,#0052ff)', marginBottom: '4px' }}>
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

            {/* Date final */}
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--primary,#0052ff)', marginBottom: '4px' }}>
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

            {/* Type */}
            <div className="col-12 col-sm-6 col-md-2">
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--primary,#0052ff)', marginBottom: '4px' }}>
                Tipo
              </label>
              <select
                className="custom-select"
                style={{ borderRadius: '8px' }}
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="scheduled">Agendamento com especialista</option>
                <option value="emergency">Pronto atendimento</option>
              </select>
            </div>

            {/* Status */}
            <div className="col-12 col-sm-6 col-md-2">
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--primary,#0052ff)', marginBottom: '4px' }}>
                Status
              </label>
              <StatusSelect value={statusFilter} onChange={setStatus} />
            </div>

            {/* Filter button */}
            <div className="col-12 col-sm-12 col-md-2">
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
            </div>
          </div>}
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
          const displayRecords = filterOpen
            ? records
            : (allRecords.length > 0 ? [getLastRecord(allRecords)] : []);
          if (displayRecords.length === 0) return <EmptyState />;
          return (
          <div className="row" style={{}}>
            {displayRecords.map(r => (
              <div key={r.uuid} className="col-12 col-sm-6 col-md-4 mb-2">
                <div className="card mb-0 h-100" style={{ backgroundColor: '#e9f2fa' }}>
                  <div className="card-body" style={{ padding: '14px' }}>

                    {/* Type + Status row (top labels) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: 11, color: '#777' }}>
                          <strong>Tipo: </strong>
                          {typeLabel(r.type)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <StatusBadge status={r.status} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', textAlign: 'right', gap: '2px' }}>
                        <div style={{ fontSize: 11, color: '#777' }}>
                          <strong>Início: </strong>{r.appointmentBegin}
                        </div>
                        {r.status === 'FINISHED' && r.appointmentEnd && (
                          <div style={{ fontSize: 11, color: '#777' }}>
                            <strong>Término: </strong>{r.appointmentEnd}
                          </div>
                        )}
                      </div>
                    </div>

                    <hr style={{ margin: '8px 0', borderColor: 'rgba(0,0,0,0.1)' }} />

                    {/* Professional */}
                    <p style={{ fontSize: '13px', marginBottom: '4px' }}>
                      <small><b>Profissional</b></small><br />
                      Dr(a) {r.professional.name}
                    </p>

                    {/* Specialty */}
                    <p style={{ fontSize: '13px', marginBottom: '4px' }}>
                      <small><b>Especialidade</b></small><br />
                      {r.professional.specialties[0].name}
                    </p>

                    {/* Referral link */}
                    {r.beneficiaryMedicalReferral && (
                      <p style={{ fontSize: '13px', marginBottom: '4px' }}>
                        <small><b>Agendado em função de:</b></small><br />
                        <a
                          href={r.beneficiaryMedicalReferral.urlPath}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          ver encaminhamento
                        </a>
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
