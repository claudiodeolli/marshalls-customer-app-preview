'use client';

export default function MeuClubePage() {
  return (
    <div
      className="card"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', gap: '16px' }}
    >
      <div style={{ textAlign: 'center' }}>
        <h4 className="mb-50">Clube de Benefícios</h4>
        <p className="text-muted mb-0">Acesse seu clube e aproveite vantagens exclusivas.</p>
      </div>
      <a
        className="btn btn-primary btn-lg"
        href="https://marshalls.com.br/clube"
        target="_blank"
        rel="noopener noreferrer"
        style={{ padding: '12px 36px', fontSize: '16px', borderRadius: '8px' }}
      >
        Ir para o meu Clube Favorito
      </a>
    </div>
  );
}
