'use client';

import { useEffect, useRef, useState } from 'react';
import EmojiIcon from '@/components/ui/EmojiIcon';
import FlagIcon from '@/components/ui/FlagIcon';

// Substitui o <select> nativo porque `<option>` só aceita texto: com a
// bandeira como caractere, o Windows mostrava as letras do país — "BR", "PT"
// — em vez do desenho, que é justamente o defeito que a issue #34 ataca.
//
// A troca custa o seletor nativo do celular. O ganho é a bandeira aparecer
// igual em todo sistema, que foi o que o cliente pediu.
export default function TimezoneSelect({ options, value, onChange, style }) {
  const [aberto, setAberto] = useState(false);
  const container = useRef(null);

  const selecionada = options.find(o => o.value === value) ?? options[0];

  useEffect(() => {
    if (!aberto) return undefined;

    function aoClicarFora(evento) {
      if (!container.current?.contains(evento.target)) setAberto(false);
    }
    function aoTeclar(evento) {
      if (evento.key === 'Escape') setAberto(false);
    }

    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [aberto]);

  return (
    <div ref={container} style={{ position: 'relative', ...style }}>
      <button
        type="button"
        className="custom-select _agend-tz-select"
        data-testid="timezone-select"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        onClick={() => setAberto(atual => !atual)}
        style={{
          minWidth: '220px', fontSize: '13px', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
        }}
      >
        <OpcaoConteudo opcao={selecionada} />
      </button>

      {aberto && (
        <div
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 9999,
            background: '#fff', border: '1px solid #d8d6de', borderRadius: '8px',
            boxShadow: '0 4px 24px rgba(34,41,47,0.15)', minWidth: '220px',
            maxHeight: '260px', overflowY: 'auto',
          }}
        >
          {options.map(opcao => (
            <div
              key={opcao.value}
              role="option"
              aria-selected={opcao.value === value}
              onClick={() => { onChange(opcao.value); setAberto(false); }}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: opcao.value === value ? '#f3f2f7' : '#fff',
                color: '#5e5873',
              }}
            >
              <OpcaoConteudo opcao={opcao} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Bandeira (ou o globo do automático) seguida do rótulo. */
function OpcaoConteudo({ opcao }) {
  return (
    <>
      {opcao.pais
        ? <FlagIcon codigo={opcao.pais} height={12} style={{ borderRadius: '2px', flexShrink: 0 }} />
        : <EmojiIcon name="globo" size={14} />}
      <span style={{ whiteSpace: 'nowrap' }}>{opcao.label}</span>
    </>
  );
}
