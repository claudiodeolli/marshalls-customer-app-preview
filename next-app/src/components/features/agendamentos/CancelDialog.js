export default function CancelDialog({ open, appointment, loading, onClose, onConfirm }) {
  if (!open || !appointment) return null;
  const specialtyName = appointment.professional?.specialties?.[0]?.name || '';
  const doctorName = appointment.professional?.name || '';
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="card mb-0 _modal-enter" style={{ width: '400px', maxWidth: '90vw', borderRadius: '12px' }}>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <h5 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Atenção</h5>
          <p style={{ color: '#333', marginBottom: '1.5rem', fontSize: '14px' }}>
            Você está prestes a cancelar o agendamento de <strong>{specialtyName}</strong> com o(a) Dr(a). <strong>{doctorName}</strong>. Deseja continuar?
          </p>
          <div className="d-flex justify-content-end" style={{ gap: '8px' }}>
            <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Não</button>
            <button className="btn btn-danger btn-sm" disabled={loading} onClick={onConfirm}>
              {loading ? 'Aguarde...' : 'Sim'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
