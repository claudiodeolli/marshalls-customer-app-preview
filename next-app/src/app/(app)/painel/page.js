'use client';

export default function PlantaoPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 16rem)' }}>
      <h4 style={{ fontWeight: '600', fontSize: '1.25rem', color: '#5e5873', marginBottom: '1.5rem', lineHeight: '1.5' }}>
        Inicie seu atendimento médico online de forma segura
      </h4>
      <div className="card" style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', padding: '13px 40px', fontSize: '16px', borderRadius: '8px', fontWeight: '600', letterSpacing: '0.3px' }}
        >
          <div className="plantao-pulse-dot-container">
            <span className="plantao-pulse-dot" />
          </div>
          Iniciar atendimento
        </button>
      </div>
    </div>
  );
}
