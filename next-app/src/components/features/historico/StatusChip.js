export default function StatusChip({ label, color }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      border: `1px solid ${color}`,
      borderRadius: '20px',
      color,
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: 1.4,
      background: 'transparent',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
