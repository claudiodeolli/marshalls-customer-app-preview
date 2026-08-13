'use client';

import { fetchViaCEP } from '@/lib/viaCep';
import { useState } from 'react';

function maskCEP(v) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export default function MeusDadosPage() {
  const [cep, setCep]       = useState('');
  const [rua, setRua]       = useState('');
  const [numero, setNumero] = useState('');
  const [compl, setCompl]   = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  async function handleCepChange(raw) {
    setCep(maskCEP(raw));
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 8) {
      const addr = await fetchViaCEP(digits);
      if (addr) {
        setRua(addr.logradouro);
        setBairro(addr.bairro);
        setCidade(addr.cidade);
        setEstado(addr.estado);
      }
    }
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div className="row">
        <div className="col-md-6 mb-2">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Minhas informações pessoais</h4>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Nome completo</label>
                <input className="form-control bg-light" type="text" placeholder="Seu nome completo" disabled />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input className="form-control bg-light" type="email" placeholder="seu@email.com" disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-control" type="text" placeholder="(00) 00000-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input className="form-control bg-light" type="text" placeholder="000.000.000-00" disabled />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-2">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Meu endereço</h4>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">CEP</label>
                <input className="form-control" type="text" placeholder="00000-000" inputMode="numeric"
                  value={cep} onChange={e => handleCepChange(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Rua</label>
                <input className="form-control" type="text" placeholder="Nome da rua"
                  value={rua} onChange={e => setRua(e.target.value)} />
              </div>
              <div className="row">
                <div className="col-5">
                  <div className="form-group">
                    <label className="form-label">Número</label>
                    <input className="form-control" type="text" placeholder="Nº" inputMode="numeric"
                      value={numero} onChange={e => setNumero(e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
                <div className="col-7">
                  <div className="form-group">
                    <label className="form-label">Complemento</label>
                    <input className="form-control" type="text" placeholder="Apto, sala..."
                      value={compl} onChange={e => setCompl(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bairro</label>
                <input className="form-control" type="text" placeholder="Nome do bairro"
                  value={bairro} onChange={e => setBairro(e.target.value)} />
              </div>
              <div className="row">
                <div className="col-8">
                  <div className="form-group">
                    <label className="form-label">Cidade</label>
                    <input className="form-control" type="text" placeholder="Sua cidade"
                      value={cidade} onChange={e => setCidade(e.target.value)} />
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <input className="form-control" type="text" placeholder="UF"
                      value={estado} onChange={e => setEstado(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" style={{ padding: '10px 28px' }}>Atualizar Informações</button>
        </div>
      </div>
    </div>
  );
}
