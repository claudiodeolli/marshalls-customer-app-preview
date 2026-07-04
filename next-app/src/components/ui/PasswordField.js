import EyeIcon from '@/components/icons/EyeIcon';

export default function PasswordField({ label, value, onChange, show, onToggle, id, hint }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div style={{
        display: 'flex',
        border: '1px solid #d8d6de',
        borderRadius: '0.357rem',
      }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="form-control"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          style={{
            border: 'none',
            borderRadius: '0.357rem 0 0 0.357rem',
            boxShadow: 'none',
            flex: 1,
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          style={{
            background: 'none',
            border: 'none',
            borderRadius: '0 0.357rem 0.357rem 0',
            padding: '0 12px',
            cursor: 'pointer',
            color: '#6e6b7b',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <EyeIcon open={show} />
        </button>
      </div>
      {hint && <small className="text-muted d-block mt-25" style={{ fontSize: '12px' }}>{hint}</small>}
    </div>
  );
}
