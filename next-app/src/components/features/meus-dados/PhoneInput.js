'use client';

import { useState, useEffect, useRef } from 'react';

const COUNTRIES = [
  { code: 'BR', name: 'Brasil',               dial: '+55',  flag: '🇧🇷' },
  { code: 'PT', name: 'Portugal',             dial: '+351', flag: '🇵🇹' },
  { code: 'AO', name: 'Angola',               dial: '+244', flag: '🇦🇴' },
  { code: 'MZ', name: 'Moçambique',           dial: '+258', flag: '🇲🇿' },
  { code: 'CV', name: 'Cabo Verde',           dial: '+238', flag: '🇨🇻' },
  { code: 'ST', name: 'São Tomé e Príncipe',  dial: '+239', flag: '🇸🇹' },
  { code: 'GW', name: 'Guiné-Bissau',         dial: '+245', flag: '🇬🇼' },
  { code: 'TL', name: 'Timor-Leste',          dial: '+670', flag: '🇹🇱' },
  { code: 'US', name: 'Estados Unidos',       dial: '+1',   flag: '🇺🇸' },
  { code: 'GB', name: 'Reino Unido',          dial: '+44',  flag: '🇬🇧' },
  { code: 'DE', name: 'Alemanha',             dial: '+49',  flag: '🇩🇪' },
  { code: 'FR', name: 'França',               dial: '+33',  flag: '🇫🇷' },
  { code: 'ES', name: 'Espanha',              dial: '+34',  flag: '🇪🇸' },
  { code: 'IT', name: 'Itália',               dial: '+39',  flag: '🇮🇹' },
  { code: 'CH', name: 'Suíça',               dial: '+41',  flag: '🇨🇭' },
  { code: 'NL', name: 'Países Baixos',        dial: '+31',  flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica',             dial: '+32',  flag: '🇧🇪' },
  { code: 'AT', name: 'Áustria',             dial: '+43',  flag: '🇦🇹' },
  { code: 'SE', name: 'Suécia',              dial: '+46',  flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega',             dial: '+47',  flag: '🇳🇴' },
  { code: 'DK', name: 'Dinamarca',           dial: '+45',  flag: '🇩🇰' },
  { code: 'FI', name: 'Finlândia',           dial: '+358', flag: '🇫🇮' },
  { code: 'PL', name: 'Polônia',             dial: '+48',  flag: '🇵🇱' },
  { code: 'CZ', name: 'República Tcheca',    dial: '+420', flag: '🇨🇿' },
  { code: 'RU', name: 'Rússia',              dial: '+7',   flag: '🇷🇺' },
  { code: 'UA', name: 'Ucrânia',             dial: '+380', flag: '🇺🇦' },
  { code: 'TR', name: 'Turquia',             dial: '+90',  flag: '🇹🇷' },
  { code: 'GR', name: 'Grécia',              dial: '+30',  flag: '🇬🇷' },
  { code: 'CA', name: 'Canadá',              dial: '+1',   flag: '🇨🇦' },
  { code: 'MX', name: 'México',              dial: '+52',  flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina',           dial: '+54',  flag: '🇦🇷' },
  { code: 'CL', name: 'Chile',               dial: '+56',  flag: '🇨🇱' },
  { code: 'CO', name: 'Colômbia',            dial: '+57',  flag: '🇨🇴' },
  { code: 'PE', name: 'Peru',                dial: '+51',  flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela',           dial: '+58',  flag: '🇻🇪' },
  { code: 'UY', name: 'Uruguai',             dial: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguai',            dial: '+595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolívia',             dial: '+591', flag: '🇧🇴' },
  { code: 'EC', name: 'Equador',             dial: '+593', flag: '🇪🇨' },
  { code: 'JP', name: 'Japão',               dial: '+81',  flag: '🇯🇵' },
  { code: 'CN', name: 'China',               dial: '+86',  flag: '🇨🇳' },
  { code: 'KR', name: 'Coreia do Sul',       dial: '+82',  flag: '🇰🇷' },
  { code: 'IN', name: 'Índia',               dial: '+91',  flag: '🇮🇳' },
  { code: 'AU', name: 'Austrália',           dial: '+61',  flag: '🇦🇺' },
  { code: 'NZ', name: 'Nova Zelândia',       dial: '+64',  flag: '🇳🇿' },
  { code: 'ZA', name: 'África do Sul',       dial: '+27',  flag: '🇿🇦' },
  { code: 'NG', name: 'Nigéria',             dial: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Quênia',              dial: '+254', flag: '🇰🇪' },
  { code: 'EG', name: 'Egito',               dial: '+20',  flag: '🇪🇬' },
  { code: 'MA', name: 'Marrocos',            dial: '+212', flag: '🇲🇦' },
  { code: 'IL', name: 'Israel',              dial: '+972', flag: '🇮🇱' },
  { code: 'AE', name: 'Emirados Árabes',     dial: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Arábia Saudita',      dial: '+966', flag: '🇸🇦' },
  { code: 'SG', name: 'Singapura',           dial: '+65',  flag: '🇸🇬' },
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
        <img
          src={`https://flagcdn.com/w20/${selected.code.toLowerCase()}.png`}
          width="20"
          height="14"
          alt={selected.name}
          style={{ borderRadius: '2px', objectFit: 'cover' }}
        />
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
              <img
                src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                width="20"
                height="14"
                alt={c.name}
                style={{ borderRadius: '2px', objectFit: 'cover', flexShrink: 0 }}
              />
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
