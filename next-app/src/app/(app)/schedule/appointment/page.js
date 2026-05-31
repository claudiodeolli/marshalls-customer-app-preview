'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/*
  Chunk: beneficiary.js aplicado ao fluxo de agendamento.
  Chega aqui após clicar "Entrar no atendimento" em /agendamentos.
  O appointment foi salvo em localStorage sob a chave APPOINTMENT.
*/

export default function ScheduleAppointmentPage() {
  const router = useRouter();
  const [appointment, setAppointment] = useState(null);
  const [loadingState, setLoadingState] = useState(null); // null | 'media'
  const [consultaUrl, setConsultaUrl]   = useState(null);
  const [mediaError, setMediaError]     = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('APPOINTMENT');
      if (raw) setAppointment(JSON.parse(raw));
    } catch {}
  }, []);

  async function handleStart() {
    if (loadingState === 'media') return;
    setConsultaUrl(null);
    setMediaError(false);
    setLoadingState('media');

    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      setMediaError(true);
    }

    await new Promise(r => setTimeout(r, 1000));
    setConsultaUrl('mock');
    setLoadingState(null);
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Atendimento Médico</h4>
        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
          Inicie seu atendimento médico online de forma segura
        </p>
      </div>

      {/* Appointment info banner */}
      {appointment && !consultaUrl && (
        <div className="alert alert-primary mb-2" style={{ borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>
            Consulta com <strong>Dr(a). {appointment.professional?.name}</strong> &mdash;{' '}
            <strong>{appointment.specialty?.name}</strong> — {appointment.detail?.date} às {appointment.detail?.from}
          </span>
        </div>
      )}

      {/* Aviso de permissão de mídia */}
      {mediaError && (
        <div className="alert alert-warning mb-2" style={{ borderRadius: '8px', fontSize: '14px' }}>
          O acesso à câmera e/ou ao microfone está bloqueado. Verifique as permissões no seu navegador e tente novamente.
        </div>
      )}

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '1.5rem',
          position: 'relative',
        }}
      >
        {consultaUrl ? (
          /* Iframe da teleconsulta */
          <div
            style={{
              width: '100%',
              height: '70vh',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
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
                  <path d="M23 7 16 12 23 17V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </div>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Sala de Teleconsulta</p>
              {appointment && (
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
                  Dr(a). {appointment.professional?.name} — {appointment.specialty?.name}
                </p>
              )}
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.5 }}>Aguardando o médico entrar na sala...</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c76f', display: 'inline-block' }} />
                <span style={{ fontSize: '13px', opacity: 0.8, color: '#28c76f' }}>Conectado</span>
              </div>
              <button
                className="btn btn-outline-secondary btn-sm"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', marginTop: '1rem' }}
                onClick={() => router.push('/agendamentos')}
              >
                Encerrar atendimento
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h6 style={{ fontWeight: 400, marginBottom: '2rem', color: '#5e5873' }}>
              {loadingState === 'media'
                ? 'Acessando sua câmera e microfone...'
                : 'Clique no botão abaixo para iniciar seu atendimento'}
            </h6>

            {loadingState === 'media' ? (
              <div className="spinner-border text-primary" style={{ width: '3.5rem', height: '3.5rem' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary _start-btn"
                  onClick={handleStart}
                  style={{
                    padding: '14px 40px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '50px',
                    letterSpacing: '0.5px',
                    minWidth: '260px',
                  }}
                >
                  INICIAR ATENDIMENTO
                </button>
                <button
                  className="btn btn-flat-secondary btn-sm"
                  onClick={() => router.push('/agendamentos')}
                >
                  ← Voltar aos agendamentos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
