'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EncerrarContaPage() {
  const router = useRouter();
  const [agreed, setAgreed]       = useState(false);
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);

  const canSubmit = agreed && password.trim().length > 0 && confirm.trim() === 'encerrar' && !loading;

  function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1200);
  }

  if (done) {
    return (
      <div style={{ maxWidth: '560px', margin: '3rem auto', textAlign: 'center', padding: '0 16px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none"
          stroke="#28c76f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
          <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
        </svg>
        <h5 style={{ fontWeight: 700, marginBottom: '8px' }}>Solicitação recebida</h5>
        <p style={{ color: '#6e6b7b', fontSize: '14px' }}>
          Sua solicitação de encerramento de conta foi registrada. Você receberá uma confirmação por e-mail em breve.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', padding: '0 8px' }}>
      <h4 style={{ fontWeight: 700, marginBottom: '4px', color: '#ea5455' }}>Encerrar Conta e Excluir meus Dados</h4>
      <p style={{ fontSize: '14px', color: '#6e6b7b', marginBottom: '1.5rem' }}>
        Para solicitar o encerramento da sua conta e a exclusão dos seus dados armazenados em nosso sistema,
        por gentileza, confirme no formulário abaixo.
      </p>

      {/* Aviso em vermelho */}
      <div style={{
        background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px',
        padding: '16px', marginBottom: '1.5rem', color: '#dc2626', fontSize: '13px', lineHeight: 1.7,
      }}>
        <strong>Atenção: esta operação é irreversível.</strong> Uma vez removidos, seus dados e informações
        atuais não poderão ser recuperados e sua conta será imediatamente encerrada tanto aqui quanto no seu
        clube de vantagens. Se desejar, poderá criar uma nova conta a qualquer momento, porém, suas
        informações atuais como histórico de atendimentos, receitas etc também serão deletadas; e os
        possíveis saldos de cashback acumulados no Clube até o momento também serão deletados.
      </div>

      {/* Checkbox de ciência */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#5e5873' }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            style={{ marginTop: '2px', flexShrink: 0, accentColor: '#ea5455' }}
          />
          Ao encerrar minha conta, concordo e reconheço que não mais terei acesso a eventuais pedidos
          realizados através da minha conta que sejam pendentes de processamento ou utilização.
        </label>
      </div>

      {/* Senha */}
      <div className="form-group">
        <label className="form-label" style={{ fontWeight: 600 }}>Senha atual</label>
        <input
          type="password"
          className="form-control"
          placeholder="Digite sua senha atual"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ maxWidth: '280px' }}
        />
      </div>

      {/* Confirmação por texto */}
      <div className="form-group">
        <label className="form-label" style={{ fontWeight: 600 }}>
          Digite a palavra <span style={{ fontStyle: 'italic' }}>"encerrar"</span> para confirmar
        </label>
        <input
          type="text"
          className="form-control"
          placeholder='encerrar'
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          style={{
            maxWidth: '280px',
            borderColor: confirm.length > 0 && confirm !== 'encerrar' ? '#ea5455' : undefined,
          }}
        />
        {confirm.length > 0 && confirm !== 'encerrar' && (
          <small style={{ color: '#ea5455' }}>Digite exatamente a palavra "encerrar"</small>
        )}
      </div>

      {/* Botões */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-outline-secondary"
          onClick={() => router.push('/meus-dados')}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          style={{
            background: canSubmit ? '#ea5455' : '#e0e0e0',
            color: '#fff', border: 'none', borderRadius: '6px',
            padding: '10px 24px', fontWeight: 700, fontSize: '14px',
            cursor: canSubmit ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'background 0.2s',
          }}
        >
          {loading && <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />}
          Encerrar Conta e Excluir meus Dados
        </button>
      </div>
    </div>
  );
}
