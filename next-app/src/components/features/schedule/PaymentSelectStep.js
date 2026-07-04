export default function PaymentSelectStep({ avulsaSpecialty, onSelectPix, onSelectSaved, onSelectNew, onBack, onCancel, confirmModal }) {
  const price = avulsaSpecialty?.price ?? 0;

  function OptionCard({ onClick, icon, title, subtitle }) {
    return (
      <div
        className="card mb-2"
        onClick={onClick}
        style={{ cursor: 'pointer', border: '1.5px solid #ebe9f1' }}
        onMouseEnter={e => { e.currentTarget.style.border = '1.5px solid #4daab6'; }}
        onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid #ebe9f1'; }}
      >
        <div className="card-body d-flex align-items-center" style={{ gap: 14, padding: '14px 18px' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3f2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#5e5873' }}>{title}</div>
            <div style={{ fontSize: 13, color: '#6e6b7b' }}>{subtitle}</div>
          </div>
          <svg style={{ marginLeft: 'auto', flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b9b9c3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card mb-3">
          <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
            <div>
              <div style={{ fontSize: 12, color: '#6e6b7b', marginBottom: 2 }}>Consulta avulsa</div>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#5e5873' }}>{avulsaSpecialty?.name}</div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 20, color: '#28c76f' }}>
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <h6 style={{ fontWeight: 700, color: '#5e5873', marginBottom: 14 }}>Forma de pagamento</h6>

        <OptionCard
          onClick={onSelectPix}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#32BCAD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.5 2L2 11.5l10 10 9.5-9.5L11.5 2z" />
              <path d="M7 11.5l4.5 4.5 5.5-5.5" />
            </svg>
          }
          title="PIX"
          subtitle="Gera chave ou QR Code"
        />

        <OptionCard
          onClick={onSelectSaved}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6e6b7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          }
          title="Visa •••• 4242"
          subtitle="Cartão já cadastrado"
        />

        <OptionCard
          onClick={onSelectNew}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6e6b7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
              <line x1="7" y1="15" x2="7.01" y2="15" />
              <line x1="11" y1="15" x2="11.01" y2="15" />
            </svg>
          }
          title="Usar outro cartão"
          subtitle="Pagar com novo cartão de crédito"
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6e6b7b', fontWeight: 600, fontSize: 14, padding: '8px 0' }}
          >
            ← Voltar
          </button>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea5455', fontWeight: 600, fontSize: 14, padding: '8px 0' }}
          >
            Cancelar
          </button>
        </div>
      </div>
      {confirmModal}
    </>
  );
}
