export default function FilterChip({ label, color }) {
  if (!color) return <span style={{ fontSize: '14px', color: '#6e6b7b' }}>{label}</span>;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px',
      border: `1px solid ${color}`, borderRadius: '20px',
      color, fontSize: '12px', fontWeight: 600, lineHeight: 1.4, background: 'transparent',
    }}>
      {label}
    </span>
  );
}
