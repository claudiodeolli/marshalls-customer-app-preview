export default function PaymentSuccessStep({ avulsaSpecialty, avulsaBooked, selectedDate, selectedSlot, onViewAppointment, onAgendarAgora, onAgendarDepois }) {
  const price = avulsaSpecialty?.price ?? 0;

  if (avulsaBooked) {
    return (
      <div className="_payment-success-booked" style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center', padding: '22px 0' }}>
        <div className="_payment-success-icon" style={{
          width: 56, height: 56, borderRadius: '50%', background: '#e6f9ee',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none"
            stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h5 style={{ fontWeight: 700, color: '#5e5873', marginBottom: 2 }}>Pagamento confirmado!</h5>
        <p style={{ color: '#6e6b7b', fontSize: 13, marginBottom: 12 }}>Sua consulta está agendada.</p>
        <div className="_payment-success-summary" style={{
          background: '#f8f8f8', borderRadius: '10px 10px 0 0', padding: '12px 18px',
          marginBottom: 0, textAlign: 'center',
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
        <div className="_payment-success-guidance" data-testid="orientacoes-consulta-online" style={{
          background: '#f8f8f8', borderRadius: '0 0 10px 10px', padding: '10px 14px',
          marginBottom: 10, textAlign: 'left', color: '#6e6b7b', fontSize: 13,
        }}>
          <strong style={{ display: 'block', color: '#5e5873', marginBottom: 8 }}>
            Orientações para sua consulta online
          </strong>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Acesse a sala da consulta com 5 minutos de antecedência.</li>
            <li>Verifique se sua conexão com a internet, câmera e microfone estão funcionando corretamente.</li>
            <li>Escolha um ambiente silencioso, privado e bem iluminado.</li>
            <li>Tenha em mãos um documento de identificação, seus exames ou laudos médicos, se houver, e a relação dos medicamentos em uso.</li>
          </ul>
        </div>
        <button
          onClick={onViewAppointment}
          className="btn btn-primary _payment-success-appointment-button"
          style={{ width: '100%', borderRadius: 24, fontWeight: 700, fontSize: 15 }}
        >
          Ver meu agendamento
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '35px 0' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: '#e6f9ee',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 17.5px',
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
