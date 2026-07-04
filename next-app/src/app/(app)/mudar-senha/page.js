'use client';

import { useState } from 'react';
import PasswordField from '@/components/ui/PasswordField';

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
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
          Informe a senha atual e defina uma nova<br className="_br-mobile" /> para acessar sua conta.
        </p>
      </div>
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
    </div>
  );
}
