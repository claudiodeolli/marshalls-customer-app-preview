export default function Snackbar({ snack }) {
  if (!snack.show) return null;
  const isSuccess = snack.type === 'success';
  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 99999,
      display: 'flex', alignItems: 'center', gap: '10px',
      background: isSuccess ? '#28c76f' : '#ea5455',
      color: '#fff', fontWeight: 500, fontSize: '14px',
      padding: '12px 20px', borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      animation: 'snackIn 0.25s ease',
    }}>
      {isSuccess ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      )}
      {snack.msg}
      <style>{`@keyframes snackIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
