'use client';

export default function CanaisDeContatoPage() {
  return (
    <div className="row">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title mb-0">Canais de contato</h4>
          </div>
          <div className="card-body">

            <div className="form-group">
              <label className="form-label d-flex align-items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366', marginRight: '6px' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L.057 23.633a.75.75 0 0 0 .921.919l5.763-1.481A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.5-5.222-1.375l-.374-.217-3.878.996.997-3.82-.232-.386A9.959 9.959 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                WhatsApp
              </label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">+55</span>
                </div>
                <input
                  className="form-control"
                  type="tel"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <small className="form-text text-muted mt-50">Número com DDD, usado para atendimento via WhatsApp.</small>
            </div>

            <div className="form-group mt-2">
              <label className="form-label d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 5.9 5.9l.91-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.27 16z"/>
                </svg>
                Telefone fixo
              </label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">+55</span>
                </div>
                <input
                  className="form-control"
                  type="tel"
                  placeholder="(00) 0000-0000"
                />
              </div>
              <small className="form-text text-muted mt-50">Número com DDD do telefone fixo para atendimento.</small>
            </div>

          </div>
          <div className="card-footer d-flex justify-content-end">
            <button className="btn btn-primary" style={{ padding: '10px 28px' }}>Salvar contatos</button>
          </div>
        </div>
      </div>
    </div>
  );
}
