'use client';

import { useState, useEffect, useRef } from 'react';
import FlagIcon from '@/components/ui/FlagIcon';

const COUNTRIES = [
  { code: 'BR', name: 'Brasil',               dial: '+55' },
  { code: 'PT', name: 'Portugal',             dial: '+351' },
  { code: 'AO', name: 'Angola',               dial: '+244' },
  { code: 'MZ', name: 'Moçambique',           dial: '+258' },
  { code: 'CV', name: 'Cabo Verde',           dial: '+238' },
  { code: 'ST', name: 'São Tomé e Príncipe',  dial: '+239' },
  { code: 'GW', name: 'Guiné-Bissau',         dial: '+245' },
  { code: 'TL', name: 'Timor-Leste',          dial: '+670' },
  { code: 'US', name: 'Estados Unidos',       dial: '+1' },
  { code: 'GB', name: 'Reino Unido',          dial: '+44' },
  { code: 'DE', name: 'Alemanha',             dial: '+49' },
  { code: 'FR', name: 'França',               dial: '+33' },
  { code: 'ES', name: 'Espanha',              dial: '+34' },
  { code: 'IT', name: 'Itália',               dial: '+39' },
  { code: 'CH', name: 'Suíça',               dial: '+41' },
  { code: 'NL', name: 'Países Baixos',        dial: '+31' },
  { code: 'BE', name: 'Bélgica',             dial: '+32' },
  { code: 'AT', name: 'Áustria',             dial: '+43' },
  { code: 'SE', name: 'Suécia',              dial: '+46' },
  { code: 'NO', name: 'Noruega',             dial: '+47' },
  { code: 'DK', name: 'Dinamarca',           dial: '+45' },
  { code: 'FI', name: 'Finlândia',           dial: '+358' },
  { code: 'PL', name: 'Polônia',             dial: '+48' },
  { code: 'CZ', name: 'República Tcheca',    dial: '+420' },
  { code: 'RU', name: 'Rússia',              dial: '+7' },
  { code: 'UA', name: 'Ucrânia',             dial: '+380' },
  { code: 'TR', name: 'Turquia',             dial: '+90' },
  { code: 'GR', name: 'Grécia',              dial: '+30' },
  { code: 'CA', name: 'Canadá',              dial: '+1' },
  { code: 'MX', name: 'México',              dial: '+52' },
  { code: 'AR', name: 'Argentina',           dial: '+54' },
  { code: 'CL', name: 'Chile',               dial: '+56' },
  { code: 'CO', name: 'Colômbia',            dial: '+57' },
  { code: 'PE', name: 'Peru',                dial: '+51' },
  { code: 'VE', name: 'Venezuela',           dial: '+58' },
  { code: 'UY', name: 'Uruguai',             dial: '+598' },
  { code: 'PY', name: 'Paraguai',            dial: '+595' },
  { code: 'BO', name: 'Bolívia',             dial: '+591' },
  { code: 'EC', name: 'Equador',             dial: '+593' },
  { code: 'JP', name: 'Japão',               dial: '+81' },
  { code: 'CN', name: 'China',               dial: '+86' },
  { code: 'KR', name: 'Coreia do Sul',       dial: '+82' },
  { code: 'IN', name: 'Índia',               dial: '+91' },
  { code: 'AU', name: 'Austrália',           dial: '+61' },
  { code: 'NZ', name: 'Nova Zelândia',       dial: '+64' },
  { code: 'ZA', name: 'África do Sul',       dial: '+27' },
  { code: 'NG', name: 'Nigéria',             dial: '+234' },
  { code: 'KE', name: 'Quênia',              dial: '+254' },
  { code: 'EG', name: 'Egito',               dial: '+20' },
  { code: 'MA', name: 'Marrocos',            dial: '+212' },
  { code: 'IL', name: 'Israel',              dial: '+972' },
  { code: 'AE', name: 'Emirados Árabes',     dial: '+971' },
  { code: 'SA', name: 'Arábia Saudita',      dial: '+966' },
  { code: 'SG', name: 'Singapura',           dial: '+65' },
];

function applyPhoneMask(digits, countryCode) {
  if (countryCode !== 'BR') return digits;
  const d = digits.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function PhoneInput({ countryCode, onCountryChange, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selected = COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0];

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={wrapperRef} style={{ display: 'flex', position: 'relative', border: '1px solid #d8d6de', borderRadius: '11px' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '0 10px', alignSelf: 'stretch',
          border: 'none', borderRight: '1px solid #d8d6de', borderRadius: '11px 0 0 11px',
          background: '#f8f8f8', cursor: 'pointer',
          fontSize: '14px', whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        <FlagIcon codigo={selected.code} height={14} style={{ borderRadius: '2px' }} />
        <span style={{ color: '#6e6b7b', fontSize: '13px' }}>{selected.dial}</span>
        <svg width="8" height="5" viewBox="0 0 10 6" fill="none" style={{ marginLeft: '2px' }}>
          <path d="M1 1l4 4 4-4" stroke="#6e6b7b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 9999,
          background: '#fff', border: '1px solid #d8d6de', borderRadius: '8px',
          boxShadow: '0 4px 24px rgba(34,41,47,0.15)', minWidth: '220px',
          maxHeight: '260px', overflowY: 'auto',
        }}>
          {COUNTRIES.map(c => (
            <div
              key={c.code}
              onClick={() => { onCountryChange(c.code); setOpen(false); }}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '10px',
                background: c.code === countryCode ? '#f3f2f7' : '#fff',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f3f2f7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = c.code === countryCode ? '#f3f2f7' : '#fff'; }}
            >
              <FlagIcon codigo={c.code} height={14} style={{ borderRadius: '2px', flexShrink: 0 }} />
              <span style={{ flex: 1, color: '#5e5873' }}>{c.name}</span>
              <span style={{ color: '#aaa', fontWeight: 500 }}>{c.dial}</span>
            </div>
          ))}
        </div>
      )}

      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={applyPhoneMask(value, countryCode)}
        onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
        style={{ border: 'none', borderRadius: '0 11px 11px 0', flex: 1, boxShadow: 'none' }}
        onClick={() => open && setOpen(false)}
      />
    </div>
  );
}
