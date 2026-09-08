'use client';

import { useState } from 'react';
import { IconChevronDown } from './icons';
import EmojiIcon from '@/components/ui/EmojiIcon';

// Assets locais do Fluent Emoji 3D, como no resto do aplicativo: os
// caracteres unicode que estavam aqui mudavam de desenho conforme o sistema
// (issue #34). Os desenhos são os mais próximos dos que já apareciam.
const DOC_CONFIG = {
  notes:          { icone: 'prancheta',   label: 'Atestado médico' },
  medicines:      { icone: 'comprimido',  label: 'Receita médica' },
  exam:           { icone: 'microscopio', label: 'Solicitação de exames' },
  referral:       { icone: 'clipe',       label: 'Encaminhamento' },
  report:         { icone: 'bloco',       label: 'Laudo médico' },
  medical_report: { icone: 'documento',   label: 'Relatório médico' },
};

const DOC_PADRAO = { icone: 'documento', label: 'Documento' };

function getDocConfig(type) {
  return DOC_CONFIG[type] ?? DOC_PADRAO;
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
              const { icone, label } = getDocConfig(doc.type);
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
                    <EmojiIcon name={icone} size={16} />
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
