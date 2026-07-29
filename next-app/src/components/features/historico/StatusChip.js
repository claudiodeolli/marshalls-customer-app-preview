export default function StatusChip({ label, color, large }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: large ? '6px 16px' : '3px 10px',
      border: `1px solid ${color}`,
      borderRadius: '20px',
      color,
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: 1.4,
      background: `${color}1f`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
