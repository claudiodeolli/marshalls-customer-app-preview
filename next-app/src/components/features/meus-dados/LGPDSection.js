'use client';

import { useState } from 'react';

const BRAND_COLOR = '#4F68C7';

export default function LGPDSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className="card mt-2 _lgpd-card mb-2 mb-sm-3"
        style={{ border: `1px solid ${BRAND_COLOR}33`, cursor: 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s' }}
        onClick={() => setModalOpen(true)}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `0 4px 16px ${BRAND_COLOR}22`;
          e.currentTarget.style.borderColor = BRAND_COLOR;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '';
          e.currentTarget.style.borderColor = `${BRAND_COLOR}33`;
        }}
      >
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ color: '#4F68C7', flexShrink: 0, marginTop: '2px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#4F68C7', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span>Privacidade e proteção dos seus dados</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke='#4F68C7' strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </p>
            </div>
          </div>
          <p className="_lgpd-desc" style={{ margin: '12px 0 0', fontWeight: 700, fontSize: '14px', color: '#4F68C7', lineHeight: 1.6, textAlign: 'justify' }}>
            Sua privacidade é importante para nós. Revise como tratamos e protegemos seus dados
            pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
          </p>
        </div>
      </div>

      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(34,41,47,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="_modal-enter" style={{
            background: '#fff', borderRadius: '12px',
            width: '100%', maxWidth: 540,
            boxShadow: '0 12px 40px rgba(34,41,47,0.25)',
            display: 'flex', flexDirection: 'column', maxHeight: '90vh',
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 24px 16px',
              borderBottom: '1px solid #ebe9f1',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexShrink: 0,
            }}>
              <h5 style={{ margin: 0, fontWeight: 700, color: BRAND_COLOR, fontSize: '16px' }}>
                Política de Privacidade – MarshallsMed
              </h5>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '24px', lineHeight: 1, padding: '0 4px' }}
              >×</button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', fontSize: '13px', color: '#5e5873', lineHeight: 1.7 }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Última atualização:</strong> 22/06/2026
              </p>
              <p style={{ marginBottom: '16px' }}>
                <strong>Aceita por você em:</strong> 22/06/2026
              </p>

              <p><strong>Por que coletamos seus dados?</strong></p>
              <p>Coletamos seus dados pessoais com a finalidade de prestar os serviços de saúde contratados, incluindo o agendamento de consultas, emissão de documentos médicos e comunicações relacionadas ao seu atendimento.</p>

              <p><strong>Base legal</strong></p>
              <p>Os dados são tratados com base no consentimento do titular e no cumprimento de obrigação legal ou regulatória, conforme o Art. 7º da Lei nº 13.709/2018.</p>

              <p><strong>Seus direitos</strong></p>
              <p>Você tem direito à confirmação da existência de tratamento, acesso aos dados, correção, anonimização, portabilidade, eliminação e revogação do consentimento, conforme Art. 18 da LGPD.</p>

              <p style={{ marginBottom: 0 }}>Para exercer seus direitos, entre em contato pelo canal de atendimento disponível na plataforma.</p>
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 24px 20px', borderTop: '1px solid #ebe9f1', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button className="btn btn-primary" style={{ padding: '8px 24px' }} onClick={() => setModalOpen(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
