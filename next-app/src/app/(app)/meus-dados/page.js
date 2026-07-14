'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { USER } from '@/data/user';
import PhoneInput from '@/components/features/meus-dados/PhoneInput';
import ProfilePhotoUpload from '@/components/features/meus-dados/ProfilePhotoUpload';
import LGPDSection from '@/components/features/meus-dados/LGPDSection';
import LockedBadge from '@/components/features/meus-dados/LockedBadge';
import Snackbar from '@/components/features/meus-dados/Snackbar';



/* ── Página principal ── */
export default function MeusDadosPage() {
  const [photoFile, setPhotoFile]         = useState(null);
  const [photoUrl, setPhotoUrl]           = useState('');
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [snack, setSnack]                 = useState({ show: false, type: 'success', msg: '' });
  const snackTimerRef                     = useRef(null);

  const [gender, setGender]           = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [phoneCountry, setPhoneCountry] = useState('BR');
  const [emergName, setEmergName]     = useState('');
  const [emergPhone, setEmergPhone]   = useState('');
  const [emergCountry, setEmergCountry] = useState('BR');

  const [cep, setCep]       = useState('');
  const [rua, setRua]       = useState('');
  const [numero, setNumero] = useState('');
  const [compl, setCompl]   = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('profile_photo');
    if (saved) setPhotoUrl(saved);
  }, []);

  function showSnack(type, msg) {
    clearTimeout(snackTimerRef.current);
    setSnack({ show: true, type, msg });
    snackTimerRef.current = setTimeout(() => setSnack(s => ({ ...s, show: false })), 3500);
  }

  function handleFileSelect(file) {
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoUrl('');
    localStorage.removeItem('profile_photo');
    window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { detail: { url: '' } }));
    showSnack('success', 'Foto de perfil removida.');
  }

  function handleSave() {
    if (!gender) {
      showSnack('error', 'Selecione o gênero.');
      return;
    }
    if (!photoFile) {
      showSnack('success', 'Informações atualizadas com sucesso!');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        localStorage.setItem('profile_photo', reader.result);
        window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { detail: { url: reader.result } }));
        showSnack('success', 'Informações atualizadas com sucesso!');
      } catch {
        showSnack('error', 'Não foi possível salvar a foto. Tente uma imagem menor.');
      }
    };
    reader.onerror = () => showSnack('error', 'Erro ao processar a imagem.');
    reader.readAsDataURL(photoFile);
  }

  return (
    <div>
      {/* Texto de apoio + legenda */}
      <div className="mb-2">
        <p style={{ fontSize: '14px', color: '#6e6b7b', marginBottom: '8px' }}>
          Mantenha seus dados pessoais e contato de emergência sempre atualizados.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#6e6b7b' }}>
          <span><strong style={{ color: '#ea5455' }}>*</strong> Campo obrigatório.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Entre em contato com o suporte se precisar alterar.
          </span>
        </div>
      </div>

      {/* Foto de perfil + dados de cadastro */}
      <div className="card mb-2">
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
            {/* Upload de foto */}
            <div style={{ flex: '1 1 300px' }}>
              <h5 style={{ fontWeight: 600, color: '#5e5873', marginBottom: '12px' }}>Foto de perfil</h5>
              <ProfilePhotoUpload previewUrl={photoUrl} onFileSelect={handleFileSelect} onRemove={() => setShowConfirmRemove(true)} />
            </div>

            {/* Data de Cadastro + Número do contrato */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
              <div style={{ background: '#f8f8f8', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '12px 16px', minWidth: '160px' }}>
                <small style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '2px' }}>Data de Cadastro</small>
                <span style={{ fontWeight: 600, color: '#5e5873' }}>01/01/2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Informações pessoais */}
        <div className="col-md-6 mb-2">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Minhas informações pessoais</h4>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">
                  Nome completo <LockedBadge />
                </label>
                <input className="form-control bg-light" type="text" value={USER.name ?? 'João da Silva'} disabled readOnly />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Data de nascimento <LockedBadge />
                </label>
                <input className="form-control bg-light" type="text" value="01/01/1990" disabled readOnly />
              </div>

              <div className="form-group">
                <label className="form-label">
                  CPF <LockedBadge />
                </label>
                <input className="form-control bg-light" type="text" value="000.000.000-00" disabled readOnly />
              </div>

              <div className="form-group">
                <label className="form-label">Gênero <strong style={{ color: '#ea5455' }}>*</strong></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '6px' }}>
                  {['Masculino', 'Feminino', 'Não-binário'].map(g => (
                    <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: '#5e5873' }}>
                      <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">E-mail <strong style={{ color: '#ea5455' }}>*</strong></label>
                <input className="form-control" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Telefone <strong style={{ color: '#ea5455' }}>*</strong></label>
                <PhoneInput
                  countryCode={phoneCountry}
                  onCountryChange={setPhoneCountry}
                  value={phone}
                  onChange={setPhone}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="col-md-6 mb-2">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Meu endereço</h4>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">CEP <strong style={{ color: '#ea5455' }}>*</strong></label>
                <input className="form-control" type="text" placeholder="00000-000" value={cep} onChange={e => setCep(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Rua <strong style={{ color: '#ea5455' }}>*</strong></label>
                <input className="form-control" type="text" placeholder="Nome da rua" value={rua} onChange={e => setRua(e.target.value)} />
              </div>
              <div className="row">
                <div className="col-5">
                  <div className="form-group">
                    <label className="form-label">Número <strong style={{ color: '#ea5455' }}>*</strong></label>
                    <input className="form-control" type="text" placeholder="Nº" value={numero} onChange={e => setNumero(e.target.value)} />
                  </div>
                </div>
                <div className="col-7">
                  <div className="form-group">
                    <label className="form-label">Complemento</label>
                    <input className="form-control" type="text" placeholder="Apto, sala..." value={compl} onChange={e => setCompl(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-8">
                  <div className="form-group">
                    <label className="form-label">Cidade <strong style={{ color: '#ea5455' }}>*</strong></label>
                    <input className="form-control" type="text" placeholder="Sua cidade" value={cidade} onChange={e => setCidade(e.target.value)} />
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <label className="form-label">Estado <strong style={{ color: '#ea5455' }}>*</strong></label>
                    <input className="form-control" type="text" placeholder="UF" value={estado} onChange={e => setEstado(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contato de Emergência */}
      <div className="row mt-1">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">
                Contato de Emergência
                <span style={{ fontSize: '12px', fontWeight: 400, color: '#aaa', marginLeft: '8px' }}>(opcional)</span>
              </h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Nome do contato</label>
                    <input className="form-control" type="text" placeholder="Nome completo" value={emergName} onChange={e => setEmergName(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Telefone do contato</label>
                    <PhoneInput
                      countryCode={emergCountry}
                      onCountryChange={setEmergCountry}
                      value={emergPhone}
                      onChange={setEmergPhone}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão salvar */}
      <div className="row mt-1 mb-3">
        <div className="col-12" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" style={{ padding: '10px 28px' }} onClick={handleSave}>Atualizar Informações</button>
        </div>
      </div>

      {/* LGPD */}
      <LGPDSection />

      {/* Encerrar Conta */}
      <div className="card mt-5" style={{ border: '1px solid #fde8e8' }}>
        <div className="card-body">
          <h6 style={{ fontWeight: 700, color: '#ea5455', marginBottom: '8px' }}>Encerrar Conta</h6>
          <p style={{ fontSize: '13px', color: '#6e6b7b', marginBottom: '6px' }}>Deseja encerrar sua conta?</p>
          <Link href="/encerrar-conta" style={{ fontSize: '13px', color: '#ea5455', textDecoration: 'underline' }}>
            Clique aqui para solicitar a exclusão de todos os seus dados do nosso sistema.
          </Link>
        </div>
      </div>

      {/* Modal de confirmação: remover foto */}
      {showConfirmRemove && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(34,41,47,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
          <div className="_modal-enter" style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: 400, boxShadow: '0 12px 40px rgba(34,41,47,0.25)' }}>
            <div style={{ padding: '18px 24px 16px', borderBottom: '1px solid #ebe9f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0, fontWeight: 600, color: '#5e5873', fontSize: '16px' }}>Remover foto de perfil</h5>
              <button onClick={() => setShowConfirmRemove(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '24px', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ color: '#6e6b7b', fontSize: '14px', margin: 0 }}>
                Tem certeza que deseja remover sua foto de perfil? A inicial do seu nome será exibida no lugar.
              </p>
            </div>
            <div style={{ padding: '0 24px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-flat-secondary" onClick={() => setShowConfirmRemove(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { setShowConfirmRemove(false); handleRemovePhoto(); }}>Remover</button>
            </div>
          </div>
        </div>
      )}

      <Snackbar snack={snack} />
    </div>
  );
}
