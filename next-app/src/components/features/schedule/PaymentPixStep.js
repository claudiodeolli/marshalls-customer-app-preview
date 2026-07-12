'use client';

import { useState, useEffect } from 'react';

const PIX_KEY = 'contato@marshallsmed.com.br';

export default function PaymentPixStep({ avulsaSpecialty, onConfirmPayment, onBack }) {
  const [pixState, setPixState] = useState('waiting'); // 'waiting' | 'received'
  const price = avulsaSpecialty?.price ?? 0;

  useEffect(() => {
    if (pixState === 'waiting') {
      const t = setTimeout(() => setPixState('received'), 4500);
      return () => clearTimeout(t);
    }
    if (pixState === 'received') {
      const t = setTimeout(onConfirmPayment, 800);
      return () => clearTimeout(t);
    }
  }, [pixState, onConfirmPayment]);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="card">
        <div className="card-header" style={{ padding: '16px 20px' }}>
          <h6 style={{ margin: 0, fontWeight: 700, color: '#5e5873' }}>Pagamento via PIX</h6>
        </div>
        <div className="card-body" style={{ textAlign: 'center' }}>
          <div style={{
            width: 160, height: 160, margin: '0 auto 16px',
            border: '2px solid #32BCAD', borderRadius: 8,
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <rect width="120" height="120" fill="white" />
              <rect x="10" y="10" width="40" height="40" fill="none" stroke="#000" strokeWidth="4" />
              <rect x="18" y="18" width="24" height="24" fill="#000" />
              <rect x="70" y="10" width="40" height="40" fill="none" stroke="#000" strokeWidth="4" />
              <rect x="78" y="18" width="24" height="24" fill="#000" />
              <rect x="10" y="70" width="40" height="40" fill="none" stroke="#000" strokeWidth="4" />
              <rect x="18" y="78" width="24" height="24" fill="#000" />
              <rect x="70" y="70" width="8" height="8" fill="#000" />
              <rect x="82" y="70" width="8" height="8" fill="#000" />
              <rect x="94" y="70" width="16" height="8" fill="#000" />
              <rect x="70" y="82" width="16" height="8" fill="#000" />
              <rect x="90" y="82" width="8" height="8" fill="#000" />
              <rect x="70" y="94" width="8" height="16" fill="#000" />
              <rect x="82" y="94" width="8" height="8" fill="#000" />
              <rect x="94" y="90" width="16" height="10" fill="#000" />
              <rect x="50" y="50" width="8" height="8" fill="#000" />
              <rect x="62" y="50" width="8" height="8" fill="#000" />
              <rect x="50" y="62" width="8" height="8" fill="#000" />
              <rect x="62" y="62" width="8" height="8" fill="#000" />
            </svg>
          </div>
          <p style={{ fontSize: 13, color: '#6e6b7b', marginBottom: 6 }}>Ou copie a chave PIX:</p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
            background: '#f3f2f7', borderRadius: 8, padding: '8px 12px', marginBottom: 8,
          }}>
            <span style={{ fontSize: 13, color: '#5e5873', wordBreak: 'break-all' }}>{PIX_KEY}</span>
            <button
              onClick={() => navigator.clipboard?.writeText(PIX_KEY)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6e6b7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#28c76f', marginBottom: 4 }}>
            Valor: R$ {price.toFixed(2).replace('.', ',')}
          </p>
          {avulsaSpecialty?.name && (
            <p style={{ fontSize: 13, color: '#6e6b7b', marginBottom: 20 }}>
              {avulsaSpecialty.name}<br />Consulta avulsa
            </p>
          )}

          {pixState === 'waiting' && (
            <div style={{
              background: '#28c76f', color: '#fff', borderRadius: 24,
              padding: '12px 16px', fontWeight: 700, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <span className="spinner-border spinner-border-sm" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Aguardando confirmação
            </div>
          )}
          {pixState === 'received' && (
            <div style={{
              background: '#1aad5b', color: '#fff', borderRadius: 24,
              padding: '12px 16px', fontWeight: 700, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              ✓ Recebemos seu pagamento!
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onBack}
        disabled
        style={{
          background: 'none', border: 'none', cursor: 'default',
          color: '#ccc', fontWeight: 600, fontSize: 14, marginTop: 12, padding: '4px 0',
        }}
      >
        ← Voltar
      </button>
    </div>
  );
}
