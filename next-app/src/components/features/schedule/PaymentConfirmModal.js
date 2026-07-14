export default function PaymentConfirmModal({ avulsaSpecialty, paymentMethodLabel, onClose, onConfirm }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="_modal-enter"
        style={{
          background: '#fff', borderRadius: 12, width: '100%', maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f2f7' }}>
          <h6 style={{ fontWeight: 700, color: '#5e5873', margin: 0 }}>Confirmar pagamento</h6>
        </div>
        <div style={{ padding: '16px 24px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: '#6e6b7b' }}>Especialidade</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#5e5873' }}>{avulsaSpecialty?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: '#6e6b7b' }}>Tipo</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#5e5873' }}>Consulta avulsa</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: '#6e6b7b' }}>Pagamento</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#5e5873' }}>{paymentMethodLabel}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f3f2f7' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#5e5873' }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#28c76f' }}>
              R$ {(avulsaSpecialty?.price ?? 0).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 20px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: 'none', border: '1.5px solid #ebe9f1',
              borderRadius: 24, fontWeight: 600, fontSize: 14, color: '#6e6b7b',
              cursor: 'pointer', padding: '10px',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary"
            style={{ flex: 1, borderRadius: 24, fontWeight: 700, fontSize: 14 }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
