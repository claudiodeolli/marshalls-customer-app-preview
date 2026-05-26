'use client';

export default function AssinaturasPage() {
  return (
    <div>
      {/* Header: plan name left, Titular + ATIVA badge right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h4 style={{ fontWeight: 600, fontSize: '1.1rem', color: '#5e5873', margin: 0 }}>
          Plano de Assinatura Individual
        </h4>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#6e6b7b', fontSize: '0.9rem' }}>Titular</span>
          <span style={{ background: '#28c76f', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.5px' }}>ATIVA</span>
        </span>
      </div>
      <p style={{ color: '#6e6b7b', marginBottom: '1.5rem' }}>
        Titular Responsável: José da Silva – CPF 432.198.765-09
      </p>

      <div className="row">
        {/* Left column: plan cards */}
        <div className="col-md-4">
          {/* Contabilidade card */}
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h5 className="mb-0 font-weight-bolder">Contabilidade</h5>
                <span className="badge badge-light-danger">Cancelada</span>
              </div>
              <p className="text-muted small mb-25 mt-50" style={{ letterSpacing: '.5px', fontSize: '10px' }}>PLANO</p>
              <h3 className="font-weight-bolder mb-1" style={{ color: '#0052ff' }}>
                <sup className="font-small-2">R$</sup>290,00<sub className="font-small-3 text-muted">/mês</sub>
              </h3>
              <p className="text-muted small mb-25" style={{ letterSpacing: '.5px', fontSize: '10px' }}>ÚLTIMA COBRANÇA</p>
              <span className="badge badge-light-danger">Pagamentos atrasados</span>
            </div>
          </div>

          {/* MarshallsMed card */}
          <div className="card">
            <div className="card-body d-flex align-items-center" style={{ gap: '12px' }}>
              <div style={{ background: '#e8f0ff', borderRadius: '8px', padding: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0052ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
              </div>
              <div>
                <p className="font-weight-bolder mb-0" style={{ fontSize: '14px' }}>MarshallsMed Individual</p>
                <small className="text-muted d-block">Consultas Ilimitadas + [Plantão 24h]</small>
                <strong style={{ color: '#0052ff' }}>R$ 57,90/mês</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: alert + billing table */}
        <div className="col-md-8">
          {/* Pending payment alert */}
          <div style={{ background: '#fff5f5', border: '1px solid #ffcccc', borderRadius: '8px', color: '#333', display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px 16px', marginBottom: '1.5rem' }}>
            <span style={{ color: '#e55353', fontSize: '18px', flexShrink: 0, marginTop: '2px' }}>⊙</span>
            <p className="mb-0" style={{ fontSize: '13px', fontWeight: 500 }}>
              A sua mensalidade está pendente. Realize o pagamento da mensalidade para que sua empresa não fique irregular perante a receita federal. Enquanto você possuir mensalidades em atraso, a Marshalls se isenta 100% das responsabilidades contábeis da sua empresa.
            </p>
          </div>

          {/* Billing history card */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Histórico de cobranças</h5>
            </div>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th style={{ fontSize: '11px', letterSpacing: '.5px', color: '#6e6b7b' }}>DESCRIÇÃO</th>
                    <th style={{ fontSize: '11px', letterSpacing: '.5px', color: '#6e6b7b' }}>PERÍODO</th>
                    <th style={{ fontSize: '11px', letterSpacing: '.5px', color: '#6e6b7b' }}>TOTAL</th>
                    <th style={{ fontSize: '11px', letterSpacing: '.5px', color: '#6e6b7b' }}>STATUS</th>
                    <th style={{ fontSize: '11px', letterSpacing: '.5px', color: '#6e6b7b' }}>PAGO EM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><a href="#" style={{ color: '#e55353', fontWeight: 500 }}>Contabilidade</a></td>
                    <td style={{ fontSize: '13px', color: '#6e6b7b' }}>02 Jun, 24 – 02 Jul, 24</td>
                    <td style={{ fontSize: '13px' }}>R$ 290,00</td>
                    <td><span className="badge badge-light-warning">Pendente</span></td>
                    <td><button className="btn btn-success btn-sm" style={{ fontSize: '12px', padding: '4px 14px', fontWeight: 700 }}>PAGAR</button></td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: '13px' }}>Contabilidade</td>
                    <td style={{ fontSize: '13px', color: '#6e6b7b' }}>02 Mai, 24 – 02 Jun, 24</td>
                    <td style={{ fontSize: '13px' }}>R$ 0,00</td>
                    <td><span className="badge badge-light-success">Pago</span></td>
                    <td style={{ fontSize: '13px', color: '#6e6b7b' }}>02 Mai, 24</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center" style={{ padding: '12px 20px' }}>
              <small className="text-muted">Mostrando 1 até 2 de 2 registros</small>
              <div className="d-flex align-items-center" style={{ gap: '4px' }}>
                <button className="btn btn-sm btn-flat-secondary" disabled style={{ padding: '4px 10px' }}>&lt;</button>
                <button className="btn btn-sm btn-primary" style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, lineHeight: 1 }}>1</button>
                <button className="btn btn-sm btn-flat-secondary" style={{ padding: '4px 10px' }}>&gt;</button>
              </div>
            </div>
          </div>

          <p className="text-muted" style={{ fontSize: '12px', marginTop: '-8px' }}>
            Nós da Marshalls somos responsáveis pela sua empresa perante a receita federal enquanto suas mensalidades estiverem em dia. Em caso de inadimplência, nós não realizaremos as atividades contábeis obrigatórias perante a receita federal. Sua empresa consequentemente ficará irregular perante os órgãos fiscais.
          </p>
        </div>
      </div>
    </div>
  );
}
