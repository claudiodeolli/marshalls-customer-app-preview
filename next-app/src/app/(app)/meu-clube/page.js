'use client';

export default function MeuClubePage() {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
          Acesse seu Clube e aproveite<br className="_br-mobile" /> vantagens exclusivas.
        </p>
      </div>
      <div
        className="card"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}
      >
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
    </div>
  );
}
