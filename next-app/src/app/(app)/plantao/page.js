'use client';

import { useState } from 'react';
import { USER } from '@/data/user';

/*
  Chunk: beneficiary.js (módulo 88764)
  Rota original: /beneficiary → /plantao

  Fluxo original:
  1. Verifica totem local (127.0.0.1:5117) → redireciona /totem se disponível
  2. Mostra botão(s) de iniciar (config por clientId via módulo 21844)
  3. Ao clicar: chama /api/appointment
     - Sucesso → exibe iframe teleconsulta + solicita câmera/microfone
     - "Alcançou o limite de atendimentos mensais." → abre modal de pagamento (módulo 3918)
  4. Modal de pagamento: Dados Pessoais + Endereço + Dados do Cartão → POST /api/schedule/transaction
  5. Sucesso no pagamento → chama /api/appointment com rdpayTransactionUuid → iframe

  No preview: totem ignorado, API mockada, modal de pagamento sempre exibido (simula limite atingido).
*/

/* Módulo 21844 — config de botões por clientId */
const DEFAULT_BUTTONS = [{ label: 'INICIAR ATENDIMENTO' }];

/* ─── Helpers de máscara ─── */
function maskCPF(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
function maskPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (!d.length) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
function maskCEP(v) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}
function maskCard(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ');
}
function maskExpiry(v) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}
function maskCVV(v) {
  return v.replace(/\D/g, '').slice(0, 3);
}

const ESTADOS = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
];

/* ─── Módulo 3918: PaymentModal ─── */
function PaymentModal({ open, onClose, onSuccess, alertMessage, price = 0, specialty }) {
  const [loading, setLoading] = useState(false);
  const [birthday, setBirthday] = useState('');
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  async function handleSubmit() {
    if (loading) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    onSuccess({ approveAdditionalPayment: true, rdpayTransactionUuid: 'mock-txn-001' });
  }

  if (!open) return null;

  const sectionStyle = {
    marginBottom: '24px',
    padding: '24px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
  };
  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#2c3e50',
    marginBottom: '20px',
    paddingBottom: '8px',
    borderBottom: '2px solid #e9ecef',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative', background: '#fff', borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          width: '100%', maxWidth: '800px', minWidth: '330px',
          maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden',
          padding: '32px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <div
          onClick={onClose}
          style={{ cursor: 'pointer', position: 'absolute', right: '16px', top: '16px', color: '#94a3b8' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </div>

        <div style={{ padding: '20px 0' }}>
          <h5 style={{ textAlign: 'center', fontWeight: 'bold', color: '#1e293b', marginBottom: '24px' }}>
            Finalizar Pagamento
          </h5>

          {alertMessage && (
            <div style={{
              backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px',
              marginBottom: '24px', marginRight: '12px', marginLeft: '12px',
              color: '#dc2626', border: '1px solid #fecaca',
            }}>
              <p style={{ margin: 0 }}>{alertMessage}</p>
            </div>
          )}

          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Price box */}
            <div style={{
              ...sectionStyle,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px', marginBottom: '24px',
            }}>
              <div>
                {specialty ? (
                  <>
                    <p style={{ fontSize: '13px', margin: 0 }}>Valor a pagar:</p>
                    <p style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{specialty.name}</p>
                  </>
                ) : (
                  <p style={{ fontSize: '17px', fontWeight: 600, margin: 0 }}>Valor a pagar:</p>
                )}
              </div>
              <p style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                R$ {price.toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Dados Pessoais */}
            <div style={sectionStyle}>
              <p style={sectionTitleStyle}>Dados Pessoais</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '13px' }}>Data de Nascimento</label>
                    <input type="date" className="form-control" value={birthday} onChange={e => setBirthday(e.target.value)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '13px' }}>CPF</label>
                    <input className="form-control" placeholder="Digite somente números" value={cpf} onChange={e => setCpf(maskCPF(e.target.value))} />
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '13px' }}>Nome</label>
                  <input className="form-control" placeholder="Digite seu nome..." value={nome} onChange={e => setNome(e.target.value)} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '13px' }}>Email</label>
                  <input type="email" className="form-control" placeholder="Digite seu email..." value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '13px' }}>Telefone</label>
                  <input className="form-control" placeholder="Digite somente números" value={phone} onChange={e => setPhone(maskPhone(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div style={sectionStyle}>
              <p style={sectionTitleStyle}>Endereço</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '13px' }}>Estado</label>
                    <select className="custom-select" value={estado} onChange={e => setEstado(e.target.value)}>
                      <option value="">Selecione...</option>
                      {ESTADOS.map(([uf, nome]) => (
                        <option key={uf} value={uf}>{nome}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '13px' }}>Cidade</label>
                    <input className="form-control" placeholder="Digite o nome da sua cidade..." value={cidade} onChange={e => setCidade(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '13px' }}>Endereço</label>
                  <input className="form-control" placeholder="Digite seu endereço..." value={endereco} onChange={e => setEndereco(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '13px' }}>Número</label>
                    <input className="form-control" placeholder="Número da residência..." value={numero} onChange={e => setNumero(e.target.value)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '13px' }}>Bairro</label>
                    <input className="form-control" placeholder="Nome do seu bairro..." value={bairro} onChange={e => setBairro(e.target.value)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '13px' }}>CEP</label>
                    <input className="form-control" placeholder="Digite somente números" value={cep} onChange={e => setCep(maskCEP(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>

            {/* Dados do Cartão */}
            <div style={sectionStyle}>
              <p style={sectionTitleStyle}>Dados do Cartão</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '13px' }}>Número do cartão</label>
                  <input className="form-control" placeholder="Digite somente números" value={cardNumber} onChange={e => setCardNumber(maskCard(e.target.value))} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '13px' }}>Nome do titular</label>
                  <input className="form-control" placeholder="Digite o nome impresso no cartão" value={cardholder} onChange={e => setCardholder(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '13px' }}>Validade</label>
                    <input className="form-control" placeholder="Digite somente números" value={expiry} onChange={e => setExpiry(maskExpiry(e.target.value))} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '13px' }}>CVV</label>
                    <input className="form-control" placeholder="Digite somente números" value={cvv} onChange={e => setCvv(maskCVV(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                ...(loading ? { backgroundColor: '#94a3b8', borderColor: '#94a3b8' } : {}),
              }}
            >
              {loading ? 'Processando...' : 'Finalizar pagamento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function PlantaoPage() {
  const [consultaUrl, setConsultaUrl] = useState(null);
  const [loadingState, setLoadingState] = useState(null); // null | 'media'
  const [mediaError, setMediaError] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  async function handleStartAppointment() {
    if (loadingState === 'media') return;
    setConsultaUrl(null);
    setMediaError(false);
    setLoadingState('media');

    /* Simula chamada à API de agendamento — retorna "limite atingido" */
    await new Promise(r => setTimeout(r, 1000));
    setLoadingState(null);
    setPaymentOpen(true);
  }

  async function handlePaymentSuccess() {
    setPaymentOpen(false);
    setLoadingState('media');

    /* Simula obtenção da URL após pagamento + solicita câmera/microfone */
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      setMediaError(true);
    }

    await new Promise(r => setTimeout(r, 800));
    setConsultaUrl('mock');
    setLoadingState(null);
  }

  return (
    <div className="_plantao-page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 16rem)' }}>
      <h4 style={{ fontWeight: '600', fontSize: '1.25rem', color: '#5e5873', marginBottom: '1.5rem', lineHeight: '1.5' }}>
        <span className="_hidden-desktop"><span className="_plantao-name">{USER.firstName}</span>, inicie seu atendimento médico <br /> online de forma segura</span>
        <span className="_hidden-mobile">Inicie seu atendimento médico online de forma segura</span>
      </h4>

      {/* Aviso de permissão de mídia */}
      {mediaError && (
        <div className="alert alert-warning mb-2" style={{ borderRadius: '8px', fontSize: '14px' }}>
          O acesso à câmera e/ou ao microfone está bloqueado. Verifique as permissões no seu navegador e tente novamente.
        </div>
      )}

      <div
        className="card"
        style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '2rem' }}
      >
        {consultaUrl ? (
          /* Sala de teleconsulta (mock) */
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0d1b2a, #1b2a3b)',
              color: '#fff',
              gap: '1.5rem',
            }}
          >
            <div style={{ opacity: 0.7 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7 16 12 23 17V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Sala de Teleconsulta</p>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.6 }}>Aguardando o médico entrar na sala...</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: '#28c76f', display: 'inline-block',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '13px', opacity: 0.8, color: '#28c76f' }}>Conectado</span>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', marginTop: '1rem' }}
              onClick={() => { setConsultaUrl(null); setLoadingState(null); }}
            >
              Encerrar atendimento
            </button>
          </div>
        ) : loadingState === 'media' ? (
          <div className="spinner-border text-primary" style={{ width: '3.5rem', height: '3.5rem' }} />
        ) : (
          <>
            <div className="_plantao-mobile-hint">
              <p>
                Toque no botão abaixo para iniciar
              </p>
              <div style={{ animation: 'fade_down 2s ease-in-out infinite', display: 'inline-flex' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="7 8 12 13 17 8" />
                  <polyline points="7 13 12 18 17 13" />
                </svg>
              </div>
            </div>
            <button
              className="btn btn-primary _start-btn"
              onClick={handleStartAppointment}
              style={{
                display: 'flex',
                padding: '27px 32px',
                fontSize: '18px',
                borderRadius: '100px',
                fontWeight: '600',
                letterSpacing: '0.3px',
                whiteSpace: 'nowrap',
                boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.5)'
              }}
            >
              <div className="plantao-pulse-dot-container">
                <span className="plantao-pulse-dot" />
              </div>
              Iniciar atendimento
            </button>
          </>
        )}
      </div>

      {/* Modal de pagamento (módulo 3918) */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        alertMessage="Você já realizou suas 3 consultas gratuitas neste mês. Para realizar uma nova consulta, por favor, siga com o pagamento abaixo. Após a confirmação, iniciaremos o seu atendimento."
        price={70}
      />
    </div>
  );
}
