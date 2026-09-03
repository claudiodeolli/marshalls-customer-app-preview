'use client';

import { useRef, useState } from 'react';

const DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com.br',
  'yahoo.com',
  'icloud.com',
  'live.com',
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'ig.com.br',
  'msn.com',
  'protonmail.com',
];

export default function EmailInput({
  name = 'email',
  required = false,
  value = '',
  onChange,
  placeholder = 'seu@email.com',
  className = 'form-control',
}) {
  // Duas ideias diferentes, e por isso dois estados. Elas viviam numa
  // variável só, e escolher um domínio fechava a lista fingindo que o campo
  // tinha perdido o foco — que ele nunca perdia. Como `onFocus` só dispara ao
  // *receber* foco, nada reabria a lista, e a pessoa precisava sair do campo e
  // voltar para o autocomplete funcionar de novo (issue #32).
  const [temFoco, setTemFoco] = useState(false);
  const [listaDispensada, setListaDispensada] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const ref = useRef(null);

  const atIndex = value.indexOf('@');
  const domainPart = atIndex >= 0 ? value.slice(atIndex + 1).toLowerCase() : null;
  const suggestions = domainPart !== null
    ? DOMAINS.filter(d => d.startsWith(domainPart))
    : [];
  const isOpen = temFoco && !listaDispensada && suggestions.length > 0;

  function selectDomain(domain) {
    const local = atIndex >= 0 ? value.slice(0, atIndex) : value;
    onChange?.(`${local}@${domain}`);
    // Dispensa a lista sem mexer no foco: digitar de novo a traz de volta.
    setListaDispensada(true);
  }

  function handleKeyDown(e) {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (suggestions[highlightedIndex]) {
        e.preventDefault();
        selectDomain(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setListaDispensada(true);
    }
  }

  const localPart = atIndex >= 0 ? value.slice(0, atIndex) : value;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <input
        type="email"
        name={name}
        required={required}
        value={value}
        onChange={e => {
          onChange?.(e.target.value);
          setHighlightedIndex(0);
          // Qualquer edição desfaz a dispensa: é o que faltava para a lista
          // voltar depois de apagar um e-mail escolhido por engano.
          setListaDispensada(false);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => { setTemFoco(true); setListaDispensada(false); }}
        onBlur={() => setTemFoco(false)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {isOpen && (
        <div className="_dropdown-enter" style={{
          position: 'absolute', zIndex: 9999, left: 0, right: 0, top: 'calc(100% + 4px)',
          background: '#fff', border: '1px solid #d8d6de', borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(34,41,47,0.12)', overflow: 'hidden',
        }}>
          {suggestions.map((domain, i) => (
            <div
              key={domain}
              onMouseDown={e => { e.preventDefault(); selectDomain(domain); }}
              onMouseEnter={() => setHighlightedIndex(i)}
              style={{
                padding: '9px 14px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#5e5873',
                background: i === highlightedIndex ? '#f3f2f7' : '#fff',
              }}
            >
              {localPart}<strong>@{domain}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
