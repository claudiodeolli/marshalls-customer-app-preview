import { MODAL_OVERLAY } from '@/components/ui/modalScale';

export default function ReferralModal({ open, loadingReferrals, pendingReferrals, referralId, onClose, onAvulsa, onSelectReferral, onConfirm }) {
  if (!open) return null;
  return (
    <div
      style={{ ...MODAL_OVERLAY, zIndex: 9999, padding: '1rem' }}
      onClick={onClose}
    >
      <div
        className="_modal-enter"
        style={{
          background: '#fff', borderRadius: 8, width: '100%', maxWidth: 500,
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
          <h6 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#333' }}>
            Selecionar Encaminhamento
          </h6>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', lineHeight: 1, color: '#5e5873' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
            Selecione um encaminhamento médico.
            <br /><br />
            A especialidade do encaminhamento será encontrada automaticamente:
          </p>

          {loadingReferrals ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gap: 12 }}>
              <p style={{ margin: 0, color: '#666', fontSize: 14 }}>Carregando encaminhamentos...</p>
              <div className="spinner-border" style={{ color: '#4daab6', width: '2.5rem', height: '2.5rem' }} />
            </div>
          ) : pendingReferrals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: '#666', marginBottom: 8, fontSize: 14 }}>
                Você não possui encaminhamentos disponíveis.
              </p>
              <p style={{ color: '#666', fontSize: 13, marginBottom: '1.5rem' }}>
                Solicite um encaminhamento médico para agendar esta especialidade, ou:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={onAvulsa}
                  style={{
                    borderRadius: 24, padding: '10px 28px', fontWeight: 600,
                    background: 'linear-gradient(90deg, #4daab6 0%, #461bef 100%)',
                    border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14,
                  }}
                >
                  Adquirir consulta avulsa
                </button>
              </div>
            </div>
          ) : (
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
              {pendingReferrals.map(ref => {
                const isSelected = referralId === ref.uuid;
                return (
                  <div
                    key={ref.uuid}
                    onClick={() => onSelectReferral(ref)}
                    style={{
                      padding: '12px 14px',
                      border: `1px solid ${isSelected ? '#4daab6' : '#e0e0e0'}`,
                      borderRadius: 8, marginBottom: 8, cursor: 'pointer',
                      background: isSelected ? '#f0f9ff' : 'transparent',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8f9fa'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 15, color: '#333' }}>
                      {ref.specialty?.name || 'Especialidade não informada'}
                    </p>
                    <p style={{ margin: 0, color: '#666', fontSize: 13 }}>
                      Criado em: {ref.createdAt}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loadingReferrals && pendingReferrals.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '12px 20px', borderTop: '1px solid #eee' }}>
            <button
              onClick={onClose}
              style={{
                borderRadius: 24, padding: '8px 24px', fontWeight: 600,
                background: 'transparent', border: '1px solid #ccc', color: '#666',
                cursor: 'pointer', fontSize: 14,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={!referralId}
              style={{
                borderRadius: 24, padding: '8px 24px', fontWeight: 600,
                background: referralId ? '#4daab6' : '#ccc',
                border: 'none', color: '#fff',
                cursor: referralId ? 'pointer' : 'default', fontSize: 14,
              }}
            >
              Confirmar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
