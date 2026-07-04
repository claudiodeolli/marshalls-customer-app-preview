export default function Toast({ message, type, visible }) {
  if (!visible) return null;
  const cls = type === 'success' ? 'alert-success' : 'alert-danger';
  return (
    <div className={`alert ${cls} mb-0`} style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      zIndex: 9999, minWidth: '280px', maxWidth: '380px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      borderRadius: '8px', fontWeight: 500,
    }}>
      {message}
    </div>
  );
}
