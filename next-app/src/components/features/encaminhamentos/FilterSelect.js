'use client';

import { useState, useEffect, useRef } from 'react';
import FilterChip from './FilterChip';

const FILTER_OPTIONS = [
  { label: 'Todos',     value: '',          color: '#82868b' },
  { label: 'Pendentes', value: 'PENDING',   color: '#ff9f43' },
  { label: 'Agendados', value: 'SCHEDULED', color: '#00cfe8' },
];

export default function FilterSelect({ value, onChange }) {
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
          width: '100%', height: '42px', border: '1px solid #d8d6de', borderRadius: '12px',
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
        <div className="_dropdown-enter" style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid #d8d6de', borderRadius: '12px',
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
