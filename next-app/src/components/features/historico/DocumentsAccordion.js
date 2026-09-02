'use client';

import { useState } from 'react';
import { IconChevronDown } from './icons';

const DOC_CONFIG = {
  notes:     { emoji: '📋', label: 'Atestado médico' },
  medicines: { emoji: '💊', label: 'Receita médica' },
  exam:      { emoji: '🔬', label: 'Solicitação de exames' },
  referral:  { emoji: '📎', label: 'Encaminhamento' },
  report:         { emoji: '📝', label: 'Laudo médico' },
  medical_report: { emoji: '📄', label: 'Relatório médico' },
};

function getDocConfig(type) {
  return DOC_CONFIG[type] ?? { emoji: '📄', label: 'Documento' };
}

export default function DocumentsAccordion({ documents }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: '10px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '4px' }}>
      <div
        style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ fontSize: '13px', fontWeight: 600 }}>Documentos do atendimento</span>
        <IconChevronDown open={open} />
      </div>
      {open && (
        <div style={{ padding: '4px 14px 14px' }}>
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {documents.map((doc, idx) => {
              const { emoji, label } = getDocConfig(doc.type);
              return (
                <li key={idx} style={{ fontSize: '13px', color: '#5e5873' }}>
                  {/* O sublinhado sai no hover e no toque, como no "Ver
                      encaminhamento" e no "Detalhes da compra" ao lado — era o
                      que faltava aqui (issue #27). Vai no rótulo, e não no
                      link inteiro, para não riscar também o ícone. */}
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="_doc-link"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span style={{ fontSize: '16px', lineHeight: 1 }}>{emoji}</span>
                    <span className="_doc-nome">{label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
