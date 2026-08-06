'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BRAND_COLOR = '#4F68C7';

const BULLETS = [
  'Sua conta será imediatamente encerrada tanto para os atendimentos médicos quanto no Clube de Vantagens e na Marshalls Academy;',
  'Você perderá o acesso a todas as plataformas, benefícios, serviços e recursos vinculados à sua conta;',
  'Se desejar, poderá criar uma nova conta a qualquer momento. Entretanto, suas informações atuais, como histórico de atendimentos, receitas, atestados, solicitações e demais registros existentes, serão excluídas das telas atuais, e eventuais saldos de cashback acumulados no Clube de Vantagens, bem como descontos recorrentes na Marshalls Academy, também serão perdidos;',
  'Seus dados pessoais serão excluídos ou anonimizados, (quando aplicável), conforme a LGPD;',
  'Informações que devam ser preservadas por obrigação legal ou regulatória poderão ser mantidas pelo prazo exigido na legislação.',
];

export default function EncerrarContaPage() {
  const router = useRouter();
  const [password, setPassword]       = useState('');
  const [confirmWord, setConfirmWord] = useState('');
  const [submitted, setSubmitted]     = useState(false);

  const canClose = password.trim() !== '' && confirmWord.trim().toLowerCase() === 'encerrar';

  if (submitted) {
    return (
      <div style={{ maxWidth: 560, margin: '2rem auto', textAlign: 'center', padding: '0 16px' }}>
        <div className="card" style={{ border: `1px solid ${BRAND_COLOR}33`, padding: '40px 24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
              fill="none" stroke={BRAND_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h5 style={{ fontWeight: 700, color: '#5e5873', marginBottom: '8px' }}>Solicitação recebida</h5>
          <p style={{ fontSize: '14px', color: '#6e6b7b', marginBottom: '24px' }}>
            Sua solicitação de encerramento de conta foi registrada. Nossa equipe entrará em contato em até <strong>5 dias úteis</strong> para concluir o processo.
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/meus-dados')}>
            Voltar para Meus Dados
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', paddingBottom: '3rem' }}>

      {/* Parágrafo introdutório */}
      <p style={{ fontSize: '14px', color: '#5e5873', fontWeight: 600, lineHeight: 1.7, marginBottom: '20px' }}>
        Para solicitar o encerramento definitivo da sua conta e a exclusão dos seus dados pessoais armazenados em nosso sistema, conforme previsto na LGPD, revise e confirme as informações abaixo.
      </p>

      {/* Bloco de atenção */}
      <div style={{
        background: '#fff8f8', border: '1.5px solid #fca5a5', borderRadius: '10px',
        padding: '16px 20px', marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="#ea5455" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span style={{ fontWeight: 700, color: '#ea5455', fontSize: '14px' }}>Atenção</span>
        </div>

        <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#ea5455', fontWeight: 600 }}>
          Esta solicitação é irreversível.
        </p>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6e6b7b' }}>
          Ao confirmar:
        </p>

        <div style={{ background: '#fff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '14px 16px' }}>
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {BULLETS.map((text, i) => (
              <li key={i} style={{ fontSize: '13px', color: '#ea5455', lineHeight: 1.6 }}>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Senha atual */}
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ fontWeight: 600, color: '#5e5873' }}>Senha atual</label>
        <input
          type="password"
          className="form-control"
          placeholder="Digite sua senha atual"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      {/* Confirmação por palavra */}
      <div className="form-group" style={{ marginBottom: '28px' }}>
        <label className="form-label" style={{ fontWeight: 600, color: '#5e5873' }}>
          Digite a palavra <em>encerrar</em> para confirmar
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="encerrar"
          value={confirmWord}
          onChange={e => setConfirmWord(e.target.value)}
        />
      </div>

      {/* Botões */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline-secondary" onClick={() => router.push('/meus-dados')}>
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          disabled={!canClose}
          onClick={() => setSubmitted(true)}
          style={{ opacity: canClose ? 1 : 0.5, textAlign: 'center', lineHeight: 1.4 }}
        >
          Encerrar Conta<br />e Excluir meus Dados
        </button>
      </div>
    </div>
  );
}
