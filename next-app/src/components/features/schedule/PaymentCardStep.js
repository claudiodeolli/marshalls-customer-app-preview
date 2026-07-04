export default function PaymentCardStep({ cardForm, setCardForm, onConfirmPayment, onBack, confirmModal }) {
  return (
    <>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header" style={{ padding: '16px 20px' }}>
            <h6 style={{ margin: 0, fontWeight: 700, color: '#5e5873' }}>Dados do Cartão</h6>
          </div>
          <div className="card-body">
            <div className="form-group mb-1">
              <label style={{ fontSize: 13, color: '#6e6b7b', display: 'block', marginBottom: 4 }}>Número do cartão</label>
              <input
                type="text"
                className="form-control"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                value={cardForm.number}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '');
                  const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
                  setCardForm(f => ({ ...f, number: formatted }));
                }}
              />
            </div>
            <div className="form-group mb-1">
              <label style={{ fontSize: 13, color: '#6e6b7b', display: 'block', marginBottom: 4 }}>Nome do titular</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nome impresso no cartão"
                value={cardForm.name}
                onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="row">
              <div className="col-6">
                <div className="form-group mb-1">
                  <label style={{ fontSize: 13, color: '#6e6b7b', display: 'block', marginBottom: 4 }}>Validade</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MM/AA"
                    maxLength={5}
                    value={cardForm.expiry}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '');
                      setCardForm(f => ({ ...f, expiry: v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v }));
                    }}
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group mb-1">
                  <label style={{ fontSize: 13, color: '#6e6b7b', display: 'block', marginBottom: 4 }}>CVV</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="000"
                    maxLength={4}
                    value={cardForm.cvv}
                    onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={onConfirmPayment}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: 24, fontWeight: 700, marginTop: 10 }}
            >
              Finalizar pagamento
            </button>
          </div>
        </div>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6e6b7b', fontWeight: 600, fontSize: 14, marginTop: 12, padding: '4px 0' }}
        >
          ← Voltar
        </button>
      </div>
      {confirmModal}
    </>
  );
}
