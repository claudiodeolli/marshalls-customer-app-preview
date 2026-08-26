import { MODAL_OVERLAY } from '@/components/ui/modalScale';
export default function SlotChoiceModal({ show, onClose, onAgendarAgora, onAgendarDepois }) {
  if (!show) return null;
  return (
    <div
      onClick={onClose}
      style={{
        ...MODAL_OVERLAY, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        padding: '1rem',
      }}
    >
      <div
        className="_modal-enter"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, width: '100%', maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '28px 24px 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 15, color: '#5e5873', lineHeight: 1.6, marginBottom: 20 }}>
          Você não precisa escolher o dia e horário agora, pode fazer isso depois.
          <br /><br />
          Mas, se preferir, vá em frente e selecione agora mesmo o dia e horário da sua consulta avulsa.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onAgendarAgora}
            className="btn btn-primary"
            style={{ width: '100%', borderRadius: 24, fontWeight: 700, padding: '10px', lineHeight: 1.5, border: '1.5px solid transparent' }}
          >
            Escolher agora
          </button>
          <button
            onClick={onAgendarDepois}
            style={{
              width: '100%', background: 'none', border: '1.5px solid #ebe9f1',
              borderRadius: 24, fontWeight: 600, fontSize: 14, color: '#6e6b7b',
              cursor: 'pointer', padding: '10px', lineHeight: 1.5,
            }}
          >
            Escolher depois, continuar para o pagamento
          </button>
        </div>
      </div>
    </div>
  );
}
