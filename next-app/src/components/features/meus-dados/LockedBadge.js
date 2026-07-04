export default function LockedBadge() {
  return (
    <span
      title="Entre em contato com o suporte se precisar alterar"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#aaa', marginLeft: '8px' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      Somente via suporte
    </span>
  );
}
