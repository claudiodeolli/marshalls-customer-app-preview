export default function BookingSuccessScreen({ selectedSpecialty, selectedDate, selectedSlot, onViewAppointments }) {
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
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          {selectedSpecialty?.name} — {selectedDate} às {selectedSlot?.from}
        </p>
        <div style={{
          textAlign: 'left', background: '#f8f8f8', borderRadius: 10,
          padding: '14px 18px', marginBottom: '1.5rem',
        }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#5e5873', marginBottom: 10 }}>
            Orientações para sua consulta online
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#6e6b7b', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Acesse a sala da consulta com <strong>5 minutos de antecedência</strong>.</li>
            <li>Verifique se sua conexão com a internet, câmera e microfone estão funcionando corretamente.</li>
            <li>Escolha um ambiente silencioso, privado e bem iluminado.</li>
            <li>Tenha em mãos um documento de identificação, seus exames ou laudos médicos, se houver, e a relação dos medicamentos em uso.</li>
          </ul>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', borderRadius: 24, fontWeight: 700 }}
          onClick={onViewAppointments}>
          Ver meus agendamentos
        </button>
      </div>
    </div>
  );
}
