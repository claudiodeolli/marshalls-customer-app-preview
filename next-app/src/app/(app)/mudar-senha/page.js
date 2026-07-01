'use client';

import { useState } from 'react';

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, id, hint }) {
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

export default function MudarSenhaPage() {
  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext,    setShowNext]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!current) { setError('Informe sua senha atual.'); return; }
    if (next.length < 8) { setError('A nova senha deve ter no mínimo 8 caracteres.'); return; }
    if (next !== confirm) { setError('A confirmação não corresponde à nova senha.'); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setCurrent(''); setNext(''); setConfirm('');
    }, 1200);
  }

  return (
    <div className="row">
      <div className="col-12 col-md-6 col-lg-5">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title mb-0">Alterar senha</h4>
          </div>
          <div className="card-body">
            {success && (
              <div className="alert alert-success" style={{ fontSize: '14px' }}>
                Senha alterada com sucesso!
              </div>
            )}
            {error && (
              <div className="alert alert-danger" style={{ fontSize: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <PasswordField
                id="current-password"
                label="Senha atual"
                value={current}
                onChange={setCurrent}
                show={showCurrent}
                onToggle={() => setShowCurrent(v => !v)}
              />
              <PasswordField
                id="new-password"
                label="Nova senha"
                value={next}
                onChange={v => { setNext(v); setSuccess(false); }}
                show={showNext}
                onToggle={() => setShowNext(v => !v)}
                hint="Mínimo de 8 caracteres."
              />
              <PasswordField
                id="confirm-password"
                label="Confirmar nova senha"
                value={confirm}
                onChange={setConfirm}
                show={showConfirm}
                onToggle={() => setShowConfirm(v => !v)}
              />

              <div className="d-flex justify-content-end mt-1">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ padding: '10px 28px' }}
                >
                  {loading ? 'Salvando...' : 'Alterar senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
