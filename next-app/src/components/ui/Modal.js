export default function Modal({ title, onClose, children, footer }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(34,41,47,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px',
        width: '100%', maxWidth: 500,
        boxShadow: '0 12px 40px rgba(34,41,47,0.25)',
      }}>
        <div style={{
          padding: '18px 24px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid #ebe9f1',
        }}>
          <h5 style={{ margin: 0, fontWeight: 600, color: '#5e5873', fontSize: '16px' }}>{title}</h5>
          {onClose && (
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#aaa', fontSize: '24px', lineHeight: 1, padding: '0 4px',
            }}>×</button>
          )}
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
        {footer && (
          <div style={{ padding: '0 24px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
