export default function PaymentSuccessStep({ avulsaSpecialty, avulsaBooked, selectedDate, selectedSlot, onViewAppointment, onAgendarAgora, onAgendarDepois }) {
  const price = avulsaSpecialty?.price ?? 0;

  if (avulsaBooked) {
    return (
      <div className="card" style={{ maxWidth: '520px', margin: '28px auto' }}>
        <div className="card-body" style={{ padding: '35px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#e6f9ee',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 17.5px',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h5 style={{ fontWeight: 700, color: '#5e5873', marginBottom: '7px' }}>
            Pagamento confirmado!
          </h5>
          <p className="text-muted" style={{ marginBottom: '21px' }}>
            Sua consulta está agendada.
          </p>
          <div style={{
            textAlign: 'left', background: '#f8f8f8', borderRadius: 10,
            padding: '14px 18px', marginBottom: '21px',
          }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#5e5873', marginBottom: 10 }}>
              {avulsaSpecialty?.name}
            </p>
            <p style={{ color: '#6e6b7b', fontSize: 13, marginBottom: 8 }}>
              {selectedDate} às {selectedSlot?.from}
            </p>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#28c76f', margin: 0 }}>
              R$ {price.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div data-testid="orientacoes-consulta-online" style={{
            textAlign: 'left', background: '#f8f8f8', borderRadius: 10,
            padding: '14px 18px', marginBottom: '21px',
          }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#5e5873', marginBottom: 10 }}>
              Orientações para sua consulta online
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#6e6b7b', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Acesse a sala da consulta com 5 minutos de antecedência.</li>
              <li>Verifique se sua conexão com a internet, câmera e microfone estão funcionando corretamente.</li>
              <li>Escolha um ambiente silencioso, privado e bem iluminado.</li>
              <li>Tenha em mãos um documento de identificação, seus exames ou laudos médicos, se houver, e a relação dos medicamentos em uso.</li>
            </ul>
          </div>
          <button
            onClick={onViewAppointment}
            className="btn btn-primary"
            style={{ width: '100%', borderRadius: 24, fontWeight: 700 }}
          >
            Ver meu agendamento
          </button>
        </div>
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
