'use client';

export default function MeuClubePage() {
  return (
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
  );
}
