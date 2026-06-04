export default function CanaisDeContatoPage() {
  return (
    <div className="row">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title mb-0">Fale conosco</h4>
          </div>
          <div className="card-body">
            <p className="text-muted mb-2">
              Entre em contato com nossa equipe pelos canais abaixo. Estamos prontos para te atender!
            </p>

            {/* WhatsApp */}
            <div className="_contact-row mb-1 rounded" style={{ background: '#f4f4f4' }}>
              <div className="_contact-info">
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L.057 23.633a.75.75 0 0 0 .921.919l5.763-1.481A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.5-5.222-1.375l-.374-.217-3.878.996.997-3.82-.232-.386A9.959 9.959 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-weight-bold" style={{ fontSize: '0.9rem' }}>WhatsApp</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Atendimento via mensagem</div>
                </div>
              </div>
              <a
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm _contact-btn"
              >
                Falar no WhatsApp
              </a>
            </div>

            {/* E-mail */}
            <div className="_contact-row rounded" style={{ background: '#f4f4f4' }}>
              <div className="_contact-info">
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#003DFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <div className="font-weight-bold" style={{ fontSize: '0.9rem' }}>E-mail</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>contato@marshallsmed.com.br</div>
                </div>
              </div>
              <a
                href="mailto:contato@marshallsmed.com.br"
                className="btn btn-outline-primary btn-sm _contact-btn"
              >
                Enviar e-mail
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
