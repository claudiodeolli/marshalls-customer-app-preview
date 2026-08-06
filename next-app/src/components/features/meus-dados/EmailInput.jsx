'use client';

import { useState } from 'react';

const DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com.br',
  'uol.com.br',
  'bol.com.br',
  'icloud.com',
];

export default function EmailInput({
  name = 'email',
  required = false,
  value = '',
  onChange,
  placeholder = 'seu@email.com',
  className = 'form-control',
}) {
  const [suggestion, setSuggestion] = useState('');

  function computeSuggestion(val) {
    if (!val.includes('@')) return '';
    const [, domainPart] = val.split('@');
    if (!domainPart) return DOMAINS[0];
    const match = DOMAINS.find(d => d.startsWith(domainPart.toLowerCase()));
    return match ? match.slice(domainPart.length) : '';
  }

  function handleChange(e) {
    const val = e.target.value;
    onChange?.(val);
    setSuggestion(computeSuggestion(val));
  }

  function applySuggestion() {
    if (!suggestion) return;
    const completed = value + suggestion;
    onChange?.(completed);
    setSuggestion('');
  }

  function handleKeyDown(e) {
    if (suggestion && (e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'Enter')) {
      e.preventDefault();
      applySuggestion();
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {suggestion && (
        <input
          type="text"
          value={value + suggestion}
          disabled
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            padding: '0.438rem 1rem', border: '1px solid transparent',
            background: 'transparent', color: '#b0b0b0',
            borderRadius: '0.357rem', fontSize: '1rem',
            boxSizing: 'border-box', pointerEvents: 'none',
          }}
        />
      )}
      <input
        type="email"
        name={name}
        required={required}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="email"
        style={{ position: 'relative', background: suggestion ? 'transparent' : undefined }}
      />
      {suggestion && (
        <div
          role="button"
          tabIndex={0}
          onClick={applySuggestion}
          onKeyDown={e => e.key === 'Enter' && applySuggestion()}
          style={{
            position: 'absolute', zIndex: 10, left: 0, right: 0, top: 'calc(100% + 2px)',
            padding: '8px 12px', background: '#f8f8f8',
            border: '1px solid #d8d6de', borderRadius: '6px',
            fontSize: '13px', color: '#5e5873', cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        >
          Completar: <strong>{value + suggestion}</strong>
        </div>
      )}
    </div>
  );
}
