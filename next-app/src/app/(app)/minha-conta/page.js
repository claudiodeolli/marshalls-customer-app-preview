'use client';

import { useState, Fragment } from 'react';
import Modal from '@/components/ui/Modal';
import { MastercardIcon, AlertTriangle } from '@/components/features/minha-conta/icons';
import SituacaoBadge from '@/components/features/minha-conta/SituacaoBadge';
import EmailInput from '@/components/features/meus-dados/EmailInput';
import PhoneInput from '@/components/features/meus-dados/PhoneInput';
import { isValidCpf } from '@/lib/cpf';
import { fetchViaCEP } from '@/lib/viaCep';

function maskCPF(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskDate(v) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function maskCEP(v) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

const HEADERS = ['Assinatura', 'Plano', 'Data de Geração', 'Descrição', 'Valor', 'Situação', 'Nota Fiscal'];

const SUBSCRIPTION = {
  titular:     'João Oliveira da Silva',
  cpf:         '074.832.915-60',
  contract:    '0001234',
  since:       'Agosto de 2025',
  nextPayment: '9 de julho de 2026',
  cardMasked:  '•••• •••• •••• 3511',
};

const PLAN_INFO = {
  individual: {
    label:       'Plano de assinatura Individual',
    name:        'MarshallsMed Individual',
    description: 'Consultas Ilimitadas + [Plantão 24h]',
    price:       'R$ 57,90/mês',
    priceLabel:  '1x de R$ 57,90/mês',
  },
  familiar: {
    label:       'Plano de assinatura Familiar',
    name:        'MarshallsMed Familiar',
    description: 'Consultas Ilimitadas + [Plantão 24h] + até 3 Dependentes',
    price:       'R$ 89,90/mês',
    priceLabel:  '1x de R$ 89,90/mês',
  },
};

const MOCK_PAYMENTS = [
  {
    contrato:    '0001234',
    assinatura:  'MarshallsMed Individual',
    dataGeracao: '09/06/2026',
    descricao:   'Mensalidade julho/2026',
    valor:       'R$ 57,90',
    situacao:    'Pago',
    notaFiscal:  '#',
  },
  {
    contrato:    '0001234',
    assinatura:  'MarshallsMed Individual',
    dataGeracao: '09/05/2026',
    descricao:   'Mensalidade junho/2026',
    valor:       'R$ 57,90',
    situacao:    'Pago',
    notaFiscal:  '#',
  },
];

const PARENTESCO_OPTIONS = ['Cônjuge', 'Filho(a)', 'Pai', 'Mãe', 'Irmão(ã)'];
const EMPTY_DEP = {
  nome: '', dataNasc: '', cpf: '', parentesco: '', genero: '',
  email: '', telefone: '', phoneCountry: 'BR',
  cep: '', rua: '', numero: '', compl: '', bairro: '', cidade: '', estado: '',
};

export default function MinhaContaPage() {
  const [planType, setPlanType] = useState('individual');
  const [activeTab, setActiveTab] = useState('historico');

const [showAlterarCartao, setShowAlterarCartao] = useState(false);
  const [cartao, setCartao] = useState({ titular: '', numero: '', vencimento: '', cvv: '', parcelas: '' });

  const [showCancelar, setShowCancelar] = useState(false);

  // null | 'warning' | 'checkout' | 'success'
  const [planoStep, setPlanoStep] = useState(null);
  // 'toFamiliar' | 'toIndividual'
  const [planoDir, setPlanoDir] = useState(null);

  const [dependents, setDependents] = useState([]);
  const [addingDep, setAddingDep] = useState(false);
  const [newDep, setNewDep] = useState(EMPTY_DEP);
  const [depError, setDepError] = useState('');
  const [depCpfError, setDepCpfError] = useState('');
  const [depDateError, setDepDateError] = useState('');

  const plan = PLAN_INFO[planType];

  function handleAlterarPlano() {
    if (planType === 'individual') {
      setPlanoDir('toFamiliar');
      setPlanoStep('checkout');
    } else {
      setPlanoDir('toIndividual');
      setPlanoStep('warning');
    }
  }

  function handleCheckoutConfirm() {
    if (planoDir === 'toFamiliar') {
      setPlanType('familiar');
    } else {
      setPlanType('individual');
      setDependents([]);
      setAddingDep(false);
      setNewDep(EMPTY_DEP);
    }
    setPlanoStep('success');
  }

  function handleSuccessClose() {
    setPlanoStep(null);
    setPlanoDir(null);
    setActiveTab('historico');
  }

  function closePlanoModal() {
    setPlanoStep(null);
    setPlanoDir(null);
  }

  function handleConfirmDep() {
    if (!newDep.nome || !newDep.dataNasc || !newDep.cpf || !newDep.parentesco ||
        !newDep.genero || !newDep.email || !newDep.telefone ||
        !newDep.cep || !newDep.rua || !newDep.numero || !newDep.bairro || !newDep.cidade || !newDep.estado) {
      setDepError('Preencha todos os campos obrigatórios.');
      return;
    }
    const [dd, mm, yyyy] = newDep.dataNasc.split('/');
    const birthDate = new Date(+yyyy, +mm - 1, +dd);
    if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
      setDepDateError('Data de nascimento inválida ou futura.');
      return;
    }
    if (!isValidCpf(newDep.cpf)) {
      setDepCpfError('CPF inválido.');
      return;
    }
    setDependents(prev => [...prev, { ...newDep }]);
    setNewDep(EMPTY_DEP);
    setAddingDep(false);
    setDepError('');
    setDepCpfError('');
    setDepDateError('');
  }

  async function handleDepCepChange(raw) {
    setNewDep(d => ({ ...d, cep: maskCEP(raw) }));
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 8) {
      const addr = await fetchViaCEP(digits);
      if (addr) setNewDep(d => ({ ...d, rua: addr.logradouro, bairro: addr.bairro, cidade: addr.cidade, estado: addr.estado }));
    }
  }

  const targetPlan = PLAN_INFO[planoDir === 'toFamiliar' ? 'familiar' : 'individual'];

  return (
    <div>
<div style={{ marginBottom: '1.5rem' }}>
        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
          Consulte as informações do seu plano<br className="_br-mobile" /> e gerencie sua assinatura.
        </p>
      </div>
      {/* ── Cabeçalho da assinatura ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
        <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: '#5e5873' }}>
          Plano de assinatura: {planType === 'individual' ? 'Individual' : 'Familiar'}
        </h4>
        <span style={{ background: '#28c76f', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.5px' }}>
          ATIVO
        </span>
      </div>
      <p style={{ color: '#6e6b7b', fontSize: '14px', margin: '0 0 4px' }}>
        Titular responsável: <strong style={{ color: '#5e5873' }}>{SUBSCRIPTION.titular}</strong>
      </p>
      <p style={{ color: '#6e6b7b', fontSize: '14px', marginBottom: '1.5rem' }}>
        CPF: <strong style={{ color: '#5e5873' }}>{SUBSCRIPTION.cpf}</strong>
      </p>
      <div style={{
        display: 'inline-block', border: '1px solid #d8d6de', borderRadius: '12px',
        padding: '8px 16px', marginTop: '8px', marginBottom: '1.5rem', background: '#fff',
      }}>
        <small style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '2px' }}>Número da Assinatura</small>
        <span style={{ fontWeight: 700, color: '#5e5873', fontSize: '14px' }}>{SUBSCRIPTION.contract}</span>
      </div>

      {/* ── Card do plano ── */}
      <div className="card mb-2 _assinaturas-card" style={{ border: '1px solid rgb(216, 214, 222)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '220px' }}>
              <div style={{
                background: '#ede9ff', borderRadius: '10px', padding: '12px',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                  fill="none" stroke="#7367f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                  <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                  <line x1="12" y1="20" x2="12.01" y2="20"/>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: 700, margin: '0 0 2px', color: '#5e5873', fontSize: '15px' }}>{plan.name}</p>
                <small style={{ color: '#6e6b7b', display: 'block', marginBottom: '6px' }}>{plan.description}</small>
                <strong style={{ color: '#7367f0', fontSize: '16px' }}>{plan.price}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', color: '#aaa' }}>
                Próximo pagamento: <strong style={{ color: '#5e5873' }}>{SUBSCRIPTION.nextPayment}</strong>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MastercardIcon />
                <span style={{ fontSize: '14px', color: '#5e5873', letterSpacing: '2px', fontFamily: 'monospace' }}>
                  {SUBSCRIPTION.cardMasked}
                </span>
              </div>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowAlterarCartao(true)}
                style={{ fontSize: '12px' }}
              >
                Alterar cartão
              </button>
            </div>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #ebe9f1' }}>
            <span style={{
              display: 'inline-block', background: '#e8f0ff', color: '#7367f0',
              fontWeight: 600, fontSize: '12px', padding: '4px 14px', borderRadius: '20px',
            }}>
              Assinante desde {SUBSCRIPTION.since}
            </span>
          </div>
        </div>
      </div>

      {/* ── Dependentes — somente Plano Familiar ── */}
      {planType === 'familiar' && (
        <div className="card mb-2">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="card-title mb-0">Dependentes</h5>
            <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 500 }}>{dependents.length} / 3 cadastrados</span>
          </div>
          <div className="card-body">
            <div style={{
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              background: '#fff8e1', border: '1px solid #ffe082',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#7a5c00',
            }}>
              <AlertTriangle color="#d4a017" size={18} />
              Após a confirmação do cadastro, o dependente não poderá ser alterado. Para realizar alterações, entre em contato com o suporte.
            </div>

            {dependents.map((dep, i) => (
              <div key={i} style={{
                border: '1px solid #e8e8e8', borderRadius: '12px', padding: '14px 16px',
                marginBottom: '10px', background: '#fafafa',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#5e5873', fontSize: '14px' }}>{dep.nome}</span>
                  <span style={{
                    background: '#ede9ff', color: '#7367f0',
                    fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
                  }}>{dep.parentesco}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0, color: '#aaa' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span style={{ fontSize: '11px' }}>Somente via suporte</span>
                </div>
              </div>
            ))}

            {addingDep && (
              <>
              <div style={{
                border: '1px dashed #7367f0', borderRadius: '12px',
                padding: '16px', marginBottom: '12px', background: '#f9f8ff',
              }}>
                <h6 style={{ fontWeight: 600, color: '#5e5873', marginBottom: '14px' }}>Novo dependente</h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Nome completo <strong style={{ color: '#ea5455' }}>*</strong></label>
                      <input className="form-control" type="text" placeholder="Nome completo" maxLength={100}
                        value={newDep.nome} onChange={e => setNewDep(d => ({ ...d, nome: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Data de nascimento <strong style={{ color: '#ea5455' }}>*</strong></label>
                      <input className={`form-control${depDateError ? ' is-invalid' : ''}`} type="text" placeholder="DD/MM/AAAA" inputMode="numeric"
                        value={newDep.dataNasc} onChange={e => { setNewDep(d => ({ ...d, dataNasc: maskDate(e.target.value) })); setDepDateError(''); }} />
                      {depDateError && <div className="invalid-feedback">{depDateError}</div>}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">CPF <strong style={{ color: '#ea5455' }}>*</strong></label>
                  <input
                    className={`form-control${depCpfError ? ' is-invalid' : ''}`}
                    type="text" placeholder="000.000.000-00" inputMode="numeric"
                    value={newDep.cpf}
                    onChange={e => { setNewDep(d => ({ ...d, cpf: maskCPF(e.target.value) })); setDepCpfError(''); }}
                    onBlur={() => { if (newDep.cpf && !isValidCpf(newDep.cpf)) setDepCpfError('CPF inválido.'); }}
                  />
                  {depCpfError && <div className="invalid-feedback">{depCpfError}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Parentesco <strong style={{ color: '#ea5455' }}>*</strong></label>
                  <select className="form-control" value={newDep.parentesco}
                    onChange={e => setNewDep(d => ({ ...d, parentesco: e.target.value }))}>
                    <option value="">Selecione...</option>
                    {PARENTESCO_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Gênero <strong style={{ color: '#ea5455' }}>*</strong></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '6px' }}>
                    {['Masculino', 'Feminino', 'Não-binário'].map(g => (
                      <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: '#5e5873' }}>
                        <input type="radio" name="depGenero" value={g} checked={newDep.genero === g} onChange={() => setNewDep(d => ({ ...d, genero: g }))} />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">E-mail <strong style={{ color: '#ea5455' }}>*</strong></label>
                      <EmailInput placeholder="email@exemplo.com" value={newDep.email} onChange={v => setNewDep(d => ({ ...d, email: v }))} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Telefone <strong style={{ color: '#ea5455' }}>*</strong></label>
                      <PhoneInput countryCode={newDep.phoneCountry} onCountryChange={v => setNewDep(d => ({ ...d, phoneCountry: v }))}
                        value={newDep.telefone} onChange={v => setNewDep(d => ({ ...d, telefone: v }))} placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card mb-2">
                <div className="card-header"><h4 className="card-title mb-0">Endereço</h4></div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">CEP <strong style={{ color: '#ea5455' }}>*</strong></label>
                        <input className="form-control" type="text" placeholder="00000-000" inputMode="numeric"
                          value={newDep.cep} onChange={e => handleDepCepChange(e.target.value)} />
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="form-group">
                        <label className="form-label">Rua <strong style={{ color: '#ea5455' }}>*</strong></label>
                        <input className="form-control" type="text" placeholder="Nome da rua" maxLength={150}
                          value={newDep.rua} onChange={e => setNewDep(d => ({ ...d, rua: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-4 col-md-3">
                      <div className="form-group">
                        <label className="form-label">Número <strong style={{ color: '#ea5455' }}>*</strong></label>
                        <input className="form-control" type="text" placeholder="Nº" inputMode="numeric"
                          value={newDep.numero} onChange={e => setNewDep(d => ({ ...d, numero: e.target.value.replace(/\D/g, '') }))} />
                      </div>
                    </div>
                    <div className="col-8 col-md-9">
                      <div className="form-group">
                        <label className="form-label">Complemento</label>
                        <input className="form-control" type="text" placeholder="Apto, sala..." maxLength={60}
                          value={newDep.compl} onChange={e => setNewDep(d => ({ ...d, compl: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">Bairro <strong style={{ color: '#ea5455' }}>*</strong></label>
                        <input className="form-control" type="text" placeholder="Nome do bairro" maxLength={80}
                          value={newDep.bairro} onChange={e => setNewDep(d => ({ ...d, bairro: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="form-group">
                        <label className="form-label">Cidade <strong style={{ color: '#ea5455' }}>*</strong></label>
                        <input className="form-control" type="text" placeholder="Sua cidade" maxLength={80}
                          value={newDep.cidade} onChange={e => setNewDep(d => ({ ...d, cidade: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Estado <strong style={{ color: '#ea5455' }}>*</strong></label>
                        <input className="form-control" type="text" placeholder="UF" maxLength={2}
                          value={newDep.estado} onChange={e => setNewDep(d => ({ ...d, estado: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') }))} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {depError && <p style={{ color: '#ea5455', fontSize: '12px', margin: '0 0 10px' }}>{depError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button className="btn btn-flat-secondary btn-sm"
                  onClick={() => { setAddingDep(false); setNewDep(EMPTY_DEP); setDepError(''); setDepDateError(''); }}>
                  Cancelar
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleConfirmDep}>
                  Confirmar dependente
                </button>
              </div>
              </>
            )}

            {!addingDep && dependents.length < 3 && (
              <button className="btn btn-outline-primary btn-sm" onClick={() => setAddingDep(true)} style={{ fontSize: '13px' }}>
                + Adicionar dependente
              </button>
            )}
            {dependents.length === 3 && !addingDep && (
              <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>Limite máximo de 3 dependentes atingido.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Abas ── */}
      <div style={{ borderBottom: '2px solid #ebe9f1', display: 'flex', marginBottom: '1.5rem' }}>
        {[
          { key: 'historico', label: 'Histórico de pagamentos' },
          { key: 'gerenciar', label: 'Gerenciar Assinatura' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
            borderBottom: activeTab === key ? '2px solid #7367f0' : '2px solid transparent',
            color: activeTab === key ? '#7367f0' : '#6e6b7b',
            fontWeight: activeTab === key ? 600 : 400,
            fontSize: '14px', marginBottom: '-2px', transition: 'color 0.15s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ══ Aba: Histórico de pagamentos ══ */}
      {activeTab === 'historico' && (
        <div className="card">
          <div className="table-responsive">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(max-content, 1fr))', columnGap: '24px', padding: '0 16px', minWidth: 'max-content', width: '100%' }}>
              {HEADERS.map(h => (
                <div key={h} style={{ fontSize: '11px', letterSpacing: '.5px', color: '#6e6b7b', padding: '12px 0', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'center', borderBottom: '2px solid #ebe9f1' }}>{h}</div>
              ))}
              {MOCK_PAYMENTS.map((p, i) => {
                const rowBorder = i < MOCK_PAYMENTS.length - 1 ? '1px solid #ebe9f1' : 'none';
                const dc = (extra = {}) => ({ fontSize: '13px', color: '#6e6b7b', padding: '12px 0', whiteSpace: 'nowrap', textAlign: 'center', borderBottom: rowBorder, ...extra });
                return (
                  <Fragment key={i}>
                    <div style={dc({ color: '#5e5873', fontWeight: 500 })}>{p.contrato}</div>
                    <div style={dc()}>{p.assinatura}</div>
                    <div style={dc()}>{p.dataGeracao}</div>
                    <div style={dc()}>{p.descricao}</div>
                    <div style={dc({ color: '#5e5873', fontWeight: 600 })}>{p.valor}</div>
                    <div style={{ padding: '12px 0', textAlign: 'center', borderBottom: rowBorder }}><SituacaoBadge s={p.situacao} /></div>
                    <div style={dc()}>
                      {p.notaFiscal
                        ? <a href={p.notaFiscal} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#7367f0', fontWeight: 600 }}>Visualizar</a>
                        : <span style={{ color: '#aaa', fontSize: '12px' }}>—</span>}
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ Aba: Gerenciar Assinatura ══ */}
      {activeTab === 'gerenciar' && (
        <div>
          <div className="card mb-2">
            <div className="card-body">
              <h6 style={{ fontWeight: 600, color: '#5e5873', marginBottom: '14px' }}>Opções da Assinatura</h6>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button className="btn btn-outline-primary" onClick={handleAlterarPlano} style={{ fontSize: '14px', padding: '8px 22px' }}>
                  Alterar Plano
                </button>
                <button className="btn btn-outline-danger" onClick={() => setShowCancelar(true)} style={{ fontSize: '14px', padding: '8px 22px' }}>
                  Cancelar Assinatura
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#aaa', margin: '12px 0 0' }}>
                Somente o Titular pode alterar ou cancelar o plano.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ══ Modal: Alterar cartão ══ */}
      {showAlterarCartao && (
        <Modal title="Alterar cartão" onClose={() => setShowAlterarCartao(false)}
          footer={
            <>
              <button className="btn btn-flat-secondary" onClick={() => setShowAlterarCartao(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => setShowAlterarCartao(false)}>Salvar cartão</button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Nome do Titular <strong style={{ color: '#ea5455' }}>*</strong></label>
            <input className="form-control" type="text" placeholder="Nome no cartão"
              value={cartao.titular} onChange={e => setCartao(c => ({ ...c, titular: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Número do Cartão <strong style={{ color: '#ea5455' }}>*</strong></label>
            <input className="form-control" type="text" placeholder="0000 0000 0000 0000" maxLength={19}
              value={cartao.numero} onChange={e => setCartao(c => ({ ...c, numero: e.target.value }))} />
          </div>
          <div className="row">
            <div className="col-7">
              <div className="form-group">
                <label className="form-label">Vencimento <strong style={{ color: '#ea5455' }}>*</strong></label>
                <input className="form-control" type="text" placeholder="MM/AA" maxLength={5}
                  value={cartao.vencimento} onChange={e => setCartao(c => ({ ...c, vencimento: e.target.value }))} />
              </div>
            </div>
            <div className="col-5">
              <div className="form-group">
                <label className="form-label">CVV <strong style={{ color: '#ea5455' }}>*</strong></label>
                <input className="form-control" type="text" placeholder="000" maxLength={4}
                  value={cartao.cvv} onChange={e => setCartao(c => ({ ...c, cvv: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Parcelas <strong style={{ color: '#ea5455' }}>*</strong></label>
            <select className="form-control" value={cartao.parcelas}
              onChange={e => setCartao(c => ({ ...c, parcelas: e.target.value }))}>
              <option value="">Selecione...</option>
              <option value="1x">{plan.priceLabel}</option>
            </select>
          </div>
        </Modal>
      )}

      {/* ══ Modal: Cancelar assinatura ══ */}
      {showCancelar && (
        <Modal title="Cancelar Assinatura" onClose={() => setShowCancelar(false)}
          footer={
            <>
              <button className="btn btn-flat-secondary" onClick={() => setShowCancelar(false)}>Manter assinatura</button>
              <button className="btn btn-danger" onClick={() => setShowCancelar(false)}>Confirmar cancelamento</button>
            </>
          }
        >
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <AlertTriangle color="#ea5455" size={52} />
            <h5 style={{ color: '#5e5873', fontWeight: 600, margin: '16px 0 12px' }}>
              Atenção: perda de todos os benefícios
            </h5>
            <p style={{ color: '#6e6b7b', fontSize: '14px', marginBottom: 0 }}>
              Ao cancelar sua assinatura você perderá acesso imediato a todas as consultas,
              ao Plantão Médico 24h e a todos os demais benefícios incluídos no seu plano.
            </p>
          </div>
        </Modal>
      )}

      {/* ══ Modal: Aviso — Familiar → Individual ══ */}
      {planoStep === 'warning' && (
        <Modal title="Atenção" onClose={closePlanoModal}
          footer={
            <>
              <button className="btn btn-flat-secondary" onClick={closePlanoModal}>Cancelar</button>
              <button className="btn btn-warning" onClick={() => setPlanoStep('checkout')}>Confirmar</button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0 }}>
              <AlertTriangle color="#ff9f43" size={36} />
            </div>
            <p style={{ color: '#5e5873', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
              Ao mudar para o Plano Individual seus dependentes perderão acesso aos atendimentos médicos,
              e caso seu Plano atual contemple o Clube de Benefícios, somente você – Titular – continuará
              com acesso. Seus atuais beneficiários dependentes não mais aparecerão em sua conta.
            </p>
          </div>
        </Modal>
      )}

      {/* ══ Modal: Checkout — troca de plano ══ */}
      {planoStep === 'checkout' && (
        <Modal
          title={planoDir === 'toFamiliar' ? 'Alterar para Plano Familiar' : 'Alterar para Plano Individual'}
          onClose={closePlanoModal}
          footer={
            <>
              <button className="btn btn-flat-secondary" onClick={closePlanoModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCheckoutConfirm}>Confirmar alteração</button>
            </>
          }
        >
          <div style={{
            border: '1px solid #e0d9ff', borderRadius: '12px', padding: '14px 16px',
            background: '#f9f8ff', marginBottom: '16px',
          }}>
            <p style={{ fontWeight: 700, color: '#5e5873', margin: '0 0 4px', fontSize: '15px' }}>{targetPlan?.name}</p>
            <p style={{ fontSize: '13px', color: '#6e6b7b', margin: '0 0 8px' }}>{targetPlan?.description}</p>
            <strong style={{ color: '#7367f0', fontSize: '17px' }}>{targetPlan?.price}</strong>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#f8f8f8', border: '1px solid #ebe9f1',
            borderRadius: '12px', padding: '12px 14px',
            fontSize: '13px', color: '#5e5873',
          }}>
            <MastercardIcon />
            <span>Cobrança no cartão: <strong>{SUBSCRIPTION.cardMasked}</strong></span>
          </div>
          <p style={{ fontSize: '13px', color: '#6e6b7b', margin: '16px 0 0', lineHeight: 1.7 }}>
            Após a confirmação dos dados.<br />
            Depois de alterado, o novo plano entrará em vigor imediatamente e o valor correspondente será cobrado no próximo ciclo de faturamento.
          </p>
        </Modal>
      )}

      {/* ══ Modal: Sucesso pós-checkout ══ */}
      {planoStep === 'success' && (
        <Modal title="Plano alterado com sucesso!" onClose={handleSuccessClose}
          footer={<button className="btn btn-primary" onClick={handleSuccessClose}>Fechar</button>}
        >
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24"
              fill="none" stroke="#28c76f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginBottom: '16px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {planoDir === 'toFamiliar' ? (
              <p style={{ color: '#6e6b7b', fontSize: '14px', marginBottom: 0 }}>
                Seus dados de acesso permanecem os mesmos. O formulário para cadastrar seus dependentes está disponível abaixo do card de pagamento.
              </p>
            ) : (
              <p style={{ color: '#6e6b7b', fontSize: '14px', marginBottom: 0 }}>
                Plano alterado para Individual. Seus dados de acesso permanecem os mesmos.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
