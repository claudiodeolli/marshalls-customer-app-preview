'use client';

import { useState, useEffect, useRef } from 'react';
import StatusChip from './StatusChip';

const STATUS_OPTIONS = [
  { value: '',          label: 'Todos os status',       color: '#82868b' },
  { value: 'FINISHED',  label: 'Consultas finalizadas', color: '#28c76f' },
  { value: 'UNFINISHED',label: 'Consultas em andamento', color: '#ff9f43' },
  { value: 'SCHEDULED', label: 'Consultas agendadas',   color: '#00cfe8' },
  { value: 'CANCELLED', label: 'Consultas canceladas',  color: '#ea5455' },
];

export default function StatusSelect({ value, onChange, disabled = false }) {
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
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        className="_status-select-btn"
        style={{
          width: '100%',
          border: '1px solid #d8d6de', borderRadius: '12px',
          background: disabled ? '#f8f8f8' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 12px', fontSize: '14px', color: '#6e6b7b',
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <span style={{ overflow: 'hidden', minWidth: 0 }}>
          <StatusChip label={selected.label} color={selected.color} large={true} />
        </span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, marginLeft: 6 }}>
          <path d="M1 1l4 4 4-4" stroke="#6e6b7b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="_dropdown-enter" style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid #d8d6de', borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(34,41,47,0.12)', zIndex: 9999, overflow: 'hidden',
        }}>
          {STATUS_OPTIONS.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{ padding: '8px 14px', cursor: 'pointer', background: value === opt.value ? '#f3f2f7' : '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f3f2f7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = value === opt.value ? '#f3f2f7' : '#fff'; }}
            >
              <StatusChip label={opt.label} color={opt.color} large={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
