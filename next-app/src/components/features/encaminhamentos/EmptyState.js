export default function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '56px 28px', color: '#aaa' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '14px' }}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <p style={{ fontSize: '15px', margin: 0 }}>Nenhum encaminhamento encontrado.</p>
    </div>
  );
}
