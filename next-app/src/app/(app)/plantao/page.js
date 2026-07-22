'use client';

import { USER } from '@/data/user';
import { useState } from 'react';
import PaymentModal from '@/components/features/plantao/PaymentModal';

/*
  Chunk: beneficiary.js (módulo 88764)
  Rota original: /beneficiary → /plantao

  Fluxo original:
  1. Verifica totem local (127.0.0.1:5117) → redireciona /totem se disponível
  2. Mostra botão(s) de iniciar (config por clientId via módulo 21844)
  3. Ao clicar: chama /api/appointment
     - Sucesso → exibe iframe teleconsulta + solicita câmera/microfone
     - "Alcançou o limite de atendimentos mensais." → abre modal de pagamento (módulo 3918)
  4. Modal de pagamento: Dados Pessoais + Endereço + Dados do Cartão → POST /api/schedule/transaction
  5. Sucesso no pagamento → chama /api/appointment com rdpayTransactionUuid → iframe

  No preview: totem ignorado, API mockada, modal de pagamento sempre exibido (simula limite atingido).
*/

/* Módulo 21844 — config de botões por clientId */
const DEFAULT_BUTTONS = [{ label: 'INICIAR ATENDIMENTO' }];


/* ─── Page ─── */
export default function PlantaoPage() {
  const [consultaUrl, setConsultaUrl] = useState(null);
  const [loadingState, setLoadingState] = useState(null); // null | 'media'
  const [mediaError, setMediaError] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  async function handleStartAppointment() {
    if (loadingState === 'media') return;
    setConsultaUrl(null);
    setMediaError(false);
    setLoadingState('media');

    /* Simula chamada à API de agendamento — retorna "limite atingido" */
    await new Promise(r => setTimeout(r, 1000));
    setLoadingState(null);
    setPaymentOpen(true);
  }

  async function handlePaymentSuccess() {
    setPaymentOpen(false);
    setLoadingState('media');

    /* Simula obtenção da URL após pagamento + solicita câmera/microfone */
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      setMediaError(true);
    }

    await new Promise(r => setTimeout(r, 800));
    setConsultaUrl('mock');
    setLoadingState(null);
  }

  return (
    <div className="_plantao-page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 16rem)' }}>
      <h4 style={{ fontWeight: '600', fontSize: '1.25rem', color: '#5e5873', marginBottom: '1.5rem', lineHeight: '1.5' }}>
        <span className="_hidden-desktop"><span className="_plantao-name">{USER.firstName}</span>, inicie seu atendimento médico <br /> online de forma segura</span>
        <span className="_hidden-mobile">Inicie seu atendimento médico online de forma segura</span>
      </h4>

      {/* Aviso de permissão de mídia */}
      {mediaError && (
        <div className="alert alert-warning mb-2" style={{ borderRadius: '8px', fontSize: '14px' }}>
          O acesso à câmera e/ou ao microfone está bloqueado. Verifique as permissões no seu navegador e tente novamente.
        </div>
      )}

      <div
        className="card"
        style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '2rem' }}
      >
        {consultaUrl ? (
          /* Sala de teleconsulta (mock) */
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0d1b2a, #1b2a3b)',
              color: '#fff',
              gap: '1.5rem',
            }}
          >
            <div style={{ opacity: 0.7 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7 16 12 23 17V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Sala de Teleconsulta</p>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.6 }}>Aguardando o médico entrar na sala...</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: '#28c76f', display: 'inline-block',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '13px', opacity: 0.8, color: '#28c76f' }}>Conectado</span>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', marginTop: '1rem' }}
              onClick={() => { setConsultaUrl(null); setLoadingState(null); }}
            >
              Encerrar atendimento
            </button>
          </div>
        ) : loadingState === 'media' ? (
          <div className="spinner-border text-primary" style={{ width: '3.5rem', height: '3.5rem' }} />
        ) : (
          <>
            <div className="_plantao-mobile-hint">
              <p>
                Toque no botão abaixo para iniciar
              </p>
              <div style={{ animation: 'fade_down 2.6s ease-in-out infinite', display: 'inline-flex' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="7 8 12 13 17 8" />
                  <polyline points="7 13 12 18 17 13" />
                </svg>
              </div>
            </div>
            <button
              className="btn btn-primary _start-btn"
              onClick={handleStartAppointment}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                padding: '27px 28px',
                fontSize: '18px',
                borderRadius: '100px',
                fontWeight: '600',
                letterSpacing: '0.3px',
                whiteSpace: 'nowrap',
                boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.5)'
              }}
            >
              <span className="plantao-pulse-dot" style={{ width: '10px', height: '10px', flexShrink: 0 }} />
              Iniciar atendimento
            </button>
          </>
        )}
      </div>

      {/* Modal de pagamento (módulo 3918) */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        alertMessage="Você já realizou suas 3 consultas gratuitas neste mês. Para realizar uma nova consulta, por favor, siga com o pagamento abaixo. Após a confirmação, iniciaremos o seu atendimento."
        price={70}
      />
    </div>
  );
}
