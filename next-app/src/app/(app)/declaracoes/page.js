'use client';

export default function MeusDadosPage() {
  return (
    <div style={{ padding: '1.5rem' }}>
      <div className="row">
        <div className="col-md-6 mb-2">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Minhas informações pessoais</h4>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Nome completo</label>
                <input className="form-control bg-light" type="text" placeholder="Seu nome completo" disabled />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input className="form-control bg-light" type="email" placeholder="seu@email.com" disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-control" type="text" placeholder="(00) 00000-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input className="form-control bg-light" type="text" placeholder="000.000.000-00" disabled />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-2">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Meu endereço</h4>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">CEP</label>
                <input className="form-control" type="text" placeholder="00000-000" />
              </div>
              <div className="form-group">
                <label className="form-label">Rua</label>
                <input className="form-control" type="text" placeholder="Nome da rua" />
              </div>
              <div className="row">
                <div className="col-5">
                  <div className="form-group">
                    <label className="form-label">Número</label>
                    <input className="form-control" type="text" placeholder="Nº" />
                  </div>
                </div>
                <div className="col-7">
                  <div className="form-group">
                    <label className="form-label">Complemento</label>
                    <input className="form-control" type="text" placeholder="Apto, sala..." />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-8">
                  <div className="form-group">
                    <label className="form-label">Cidade</label>
                    <input className="form-control" type="text" placeholder="Sua cidade" />
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <input className="form-control" type="text" placeholder="UF" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" style={{ padding: '10px 28px' }}>Atualizar Informações</button>
        </div>
      </div>
    </div>
  );
}
