'use client';

import { useState } from 'react';

export default function LGPDSection() {
  const [open, setOpen] = useState(false);
  return (
    <div className="card mt-2" style={{ border: '1px solid #e3f2fd' }}>
      <div
        className="card-body"
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#3b5bdb' }}>
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei 13.709, de 14 de agosto de 2018),
            entenda por que coletamos os seus dados.
          </p>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#3b5bdb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        {open && (
          <div style={{ marginTop: '16px', fontSize: '13px', color: '#5e5873', lineHeight: 1.7, borderTop: '1px solid #e3f2fd', paddingTop: '16px' }}>
            <p><strong>Por que coletamos seus dados?</strong></p>
            <p>Coletamos seus dados pessoais com a finalidade de prestar os serviços de saúde contratados, incluindo o agendamento de consultas, emissão de documentos médicos e comunicações relacionadas ao seu atendimento.</p>
            <p><strong>Base legal:</strong> Os dados são tratados com base no consentimento do titular e no cumprimento de obrigação legal ou regulatória, conforme o Art. 7º da Lei nº 13.709/2018.</p>
            <p><strong>Seus direitos:</strong> Você tem direito à confirmação da existência de tratamento, acesso aos dados, correção, anonimização, portabilidade, eliminação e revogação do consentimento, conforme Art. 18 da LGPD.</p>
            <p style={{ marginBottom: 0 }}>Para exercer seus direitos, entre em contato pelo canal de atendimento disponível na plataforma.</p>
          </div>
        )}
      </div>
    </div>
  );
}
