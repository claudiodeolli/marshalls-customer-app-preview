export default function BookingSuccessScreen({ selectedSpecialty, selectedDate, selectedSlot, avulsaConfirmed, onViewAppointments, onBack }) {
  return (
    <div className="card" style={{ maxWidth: '520px', margin: '2rem auto' }}>
      <div className="card-body" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: '#e6f9ee',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h5 style={{ fontWeight: 700, color: '#5e5873', marginBottom: '0.5rem' }}>
          Agendado com sucesso!
        </h5>
        <p className="text-muted">
          {selectedSpecialty?.name} — {selectedDate} às {selectedSlot?.from}
        </p>
        {avulsaConfirmed && (
          <div style={{
            textAlign: 'left', background: '#f8f8f8', borderRadius: 10,
            padding: '14px 18px', marginTop: 8, marginBottom: 16,
          }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#5e5873', marginBottom: 8 }}>
              Dicas para o dia da sua consulta
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#6e6b7b', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Chegue com 15 minutos de antecedência</li>
              <li>Traga um documento de identificação com foto</li>
              <li>Leve exames ou laudos médicos anteriores, se houver</li>
              <li>Em caso de cancelamento, avise com pelo menos 24h de antecedência</li>
            </ul>
          </div>
        )}
        {avulsaConfirmed ? (
          <button className="btn btn-primary" style={{ width: '100%', borderRadius: 24, fontWeight: 700 }}
            onClick={onViewAppointments}>
            Ver meus Agendamentos
          </button>
        ) : (
          <button className="btn btn-primary mt-2" onClick={onBack}>
            Voltar
          </button>
        )}
      </div>
    </div>
  );
}
