export default function FilterChip({ label, color }) {
  const safeColor = color ?? '#82868b';
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px',
      border: `1px solid ${safeColor}`, borderRadius: '20px',
      color: safeColor, fontSize: '12px', fontWeight: 600, lineHeight: 1.4,
      background: `${safeColor}1f`,
    }}>
      {label}
    </span>
  );
}
