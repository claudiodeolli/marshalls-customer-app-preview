export default function PaymentSuccessStep({ avulsaSpecialty, avulsaBooked, selectedDate, selectedSlot, onViewAppointment, onAgendarAgora, onAgendarDepois }) {
  const price = avulsaSpecialty?.price ?? 0;

  if (avulsaBooked) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '2.5rem 0' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#e6f9ee',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none"
            stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h5 style={{ fontWeight: 700, color: '#5e5873', marginBottom: 4 }}>Pagamento confirmado!</h5>
        <p style={{ color: '#6e6b7b', fontSize: 14, marginBottom: 20 }}>Sua consulta está agendada.</p>
        <div style={{
          background: '#f8f8f8', borderRadius: 10, padding: '16px 20px',
          marginBottom: 28, textAlign: 'center',
        }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#5e5873', margin: '0 0 4px' }}>
            {avulsaSpecialty?.name}
          </p>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#5e5873', margin: '0 0 10px' }}>
            {selectedDate} às {selectedSlot?.from}
          </p>
          <p style={{ fontWeight: 700, fontSize: 18, color: '#28c76f', margin: 0 }}>
            R$ {price.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <button
          onClick={onViewAppointment}
          className="btn btn-primary"
          style={{ width: '100%', borderRadius: 24, fontWeight: 700, fontSize: 16 }}
        >
          Ver meu agendamento
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '2.5rem 0' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: '#e6f9ee',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none"
          stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h5 style={{ fontWeight: 700, color: '#5e5873', marginBottom: 6 }}>Recebemos seu pagamento!</h5>
      <p style={{ color: '#6e6b7b', fontSize: 14, marginBottom: 28 }}>
        {avulsaSpecialty?.name} — <span style={{ color: '#28c76f', fontWeight: 700 }}>R$ {price.toFixed(2).replace('.', ',')}</span>
      </p>
      <button
        onClick={onAgendarAgora}
        className="btn btn-primary"
        style={{ width: '100%', borderRadius: 24, fontWeight: 700, marginBottom: 12, fontSize: 16 }}
      >
        Agendar Agora
      </button>
      <button
        onClick={onAgendarDepois}
        style={{
          width: '100%', background: 'none', border: '1.5px solid #ebe9f1',
          borderRadius: 24, fontWeight: 600, fontSize: 15, color: '#6e6b7b',
          cursor: 'pointer', padding: '10px',
        }}
      >
        Agendar depois
      </button>
    </div>
  );
}
