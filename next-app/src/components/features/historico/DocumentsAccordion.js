'use client';

import { useState } from 'react';
import { IconChevronDown, IconOpenInNew, IconExam, IconReferral, IconMedicine, IconNotes, IconReport } from './icons';

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

export default function DocumentsAccordion({ documents }) {
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
              <div
                key={idx}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < documents.length - 1 ? '1px solid #ddd' : 'none' }}
              >
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
