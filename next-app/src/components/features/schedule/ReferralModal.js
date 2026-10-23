'use client';

import styles from './ReferralModal.module.css';
import { MODAL_OVERLAY } from '@/components/ui/modalScale';
import ModalPortal from '@/components/ui/ModalPortal';

export default function ReferralModal({ open, loadingReferrals, pendingReferrals, referralId, onClose, onAvulsa, onSelectReferral, onConfirm }) {
  if (!open) return null;
  return (
    <ModalPortal>
    <div
      style={{ ...MODAL_OVERLAY, zIndex: 9999, padding: '14px' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="referral-modal-title"
    >
      <div
        className="_modal-enter"
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 500,
          height: 'min(80dvh, 440px)', maxHeight: 'calc(100dvh - 32px)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h6 id="referral-modal-title" style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#333' }}>
            Selecionar Encaminhamento
          </h6>
          <button
            type="button"
            autoFocus
            className={styles.closeButton}
            aria-label="Fechar seleção de encaminhamento"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', lineHeight: 1, color: '#5e5873' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <p style={{ fontSize: 14, lineHeight: 1.5, color: '#666', margin: '0 0 12px' }}>
            Selecione um encaminhamento médico.
            <br /><br />
            A especialidade do encaminhamento será encontrada automaticamente:
          </p>

          {loadingReferrals ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px', gap: 12 }}>
              <p style={{ margin: 0, color: '#666', fontSize: 14 }}>Carregando encaminhamentos...</p>
              <div className="spinner-border" style={{ color: '#4daab6', width: '35px', height: '35px' }} />
            </div>
          ) : pendingReferrals.length === 0 ? (
            <div className={`_referral-empty-state ${styles.stateArea} ${styles.emptyState}`}>
              <div className={styles.emptyMessage}>
                <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
                  Você não possui encaminhamentos disponíveis.
                </p>
              </div>
              <p className={styles.emptyGuidance} style={{ color: '#666', fontSize: 14, margin: 0 }}>
                Solicite um encaminhamento médico para agendar esta especialidade, ou:
              </p>
              <div className={styles.emptyAction}>
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
            <div className={styles.stateArea} style={{ maxHeight: 300 }}>
              {pendingReferrals.map(ref => {
                const isSelected = referralId === ref.uuid;
                // Com um único encaminhamento, ele é o match automático; com vários, usa-se o selecionado.
                const shouldAnimateSnake = pendingReferrals.length === 1 || isSelected;
                return (
                  <div
                    key={ref.uuid}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => onSelectReferral(ref)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectReferral(ref);
                      }
                    }}
                    className={shouldAnimateSnake ? styles.snakeCard : undefined}
                    style={{
                      padding: '12px 14px',
                      border: `1px solid ${isSelected ? '#4daab6' : '#e0e0e0'}`,
                      borderRadius: 8, marginBottom: 8, cursor: 'pointer',
                      background: isSelected ? '#f0f9ff' : 'transparent',
                      transition: 'all 0.15s', flexShrink: 0,
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8f9fa'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {shouldAnimateSnake && (
                      <>
                        <span aria-hidden="true" className={`${styles.snake} ${styles.top}`} />
                        <span aria-hidden="true" className={`${styles.snake} ${styles.right}`} />
                        <span aria-hidden="true" className={`${styles.snake} ${styles.bottom}`} />
                        <span aria-hidden="true" className={`${styles.snake} ${styles.left}`} />
                      </>
                    )}
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
          <div className={styles.footer}>
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
              className="btn btn-primary btn-sm _referral-confirm-btn"
              style={{
                borderRadius: 24, padding: '8px 24px', fontWeight: 600,
                color: '#fff',
                cursor: referralId ? 'pointer' : 'default', fontSize: 14,
              }}
            >
              Confirmar
            </button>
          </div>
        )}
      </div>
    </div>
    </ModalPortal>
  );
}
