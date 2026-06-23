'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { USER } from '@/data/user';

/* ── Lista de países (DDI + emoji de bandeira) ── */
const COUNTRIES = [
  { code: 'BR', name: 'Brasil',               dial: '+55',  flag: '🇧🇷' },
  { code: 'PT', name: 'Portugal',             dial: '+351', flag: '🇵🇹' },
  { code: 'AO', name: 'Angola',               dial: '+244', flag: '🇦🇴' },
  { code: 'MZ', name: 'Moçambique',           dial: '+258', flag: '🇲🇿' },
  { code: 'CV', name: 'Cabo Verde',           dial: '+238', flag: '🇨🇻' },
  { code: 'ST', name: 'São Tomé e Príncipe',  dial: '+239', flag: '🇸🇹' },
  { code: 'GW', name: 'Guiné-Bissau',         dial: '+245', flag: '🇬🇼' },
  { code: 'TL', name: 'Timor-Leste',          dial: '+670', flag: '🇹🇱' },
  { code: 'US', name: 'Estados Unidos',       dial: '+1',   flag: '🇺🇸' },
  { code: 'GB', name: 'Reino Unido',          dial: '+44',  flag: '🇬🇧' },
  { code: 'DE', name: 'Alemanha',             dial: '+49',  flag: '🇩🇪' },
  { code: 'FR', name: 'França',               dial: '+33',  flag: '🇫🇷' },
  { code: 'ES', name: 'Espanha',              dial: '+34',  flag: '🇪🇸' },
  { code: 'IT', name: 'Itália',               dial: '+39',  flag: '🇮🇹' },
  { code: 'CH', name: 'Suíça',               dial: '+41',  flag: '🇨🇭' },
  { code: 'NL', name: 'Países Baixos',        dial: '+31',  flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica',             dial: '+32',  flag: '🇧🇪' },
  { code: 'AT', name: 'Áustria',             dial: '+43',  flag: '🇦🇹' },
  { code: 'SE', name: 'Suécia',              dial: '+46',  flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega',             dial: '+47',  flag: '🇳🇴' },
  { code: 'DK', name: 'Dinamarca',           dial: '+45',  flag: '🇩🇰' },
  { code: 'FI', name: 'Finlândia',           dial: '+358', flag: '🇫🇮' },
  { code: 'PL', name: 'Polônia',             dial: '+48',  flag: '🇵🇱' },
  { code: 'CZ', name: 'República Tcheca',    dial: '+420', flag: '🇨🇿' },
  { code: 'RU', name: 'Rússia',              dial: '+7',   flag: '🇷🇺' },
  { code: 'UA', name: 'Ucrânia',             dial: '+380', flag: '🇺🇦' },
  { code: 'TR', name: 'Turquia',             dial: '+90',  flag: '🇹🇷' },
  { code: 'GR', name: 'Grécia',              dial: '+30',  flag: '🇬🇷' },
  { code: 'CA', name: 'Canadá',              dial: '+1',   flag: '🇨🇦' },
  { code: 'MX', name: 'México',              dial: '+52',  flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina',           dial: '+54',  flag: '🇦🇷' },
  { code: 'CL', name: 'Chile',               dial: '+56',  flag: '🇨🇱' },
  { code: 'CO', name: 'Colômbia',            dial: '+57',  flag: '🇨🇴' },
  { code: 'PE', name: 'Peru',                dial: '+51',  flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela',           dial: '+58',  flag: '🇻🇪' },
  { code: 'UY', name: 'Uruguai',             dial: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguai',            dial: '+595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolívia',             dial: '+591', flag: '🇧🇴' },
  { code: 'EC', name: 'Equador',             dial: '+593', flag: '🇪🇨' },
  { code: 'JP', name: 'Japão',               dial: '+81',  flag: '🇯🇵' },
  { code: 'CN', name: 'China',               dial: '+86',  flag: '🇨🇳' },
  { code: 'KR', name: 'Coreia do Sul',       dial: '+82',  flag: '🇰🇷' },
  { code: 'IN', name: 'Índia',               dial: '+91',  flag: '🇮🇳' },
  { code: 'AU', name: 'Austrália',           dial: '+61',  flag: '🇦🇺' },
  { code: 'NZ', name: 'Nova Zelândia',       dial: '+64',  flag: '🇳🇿' },
  { code: 'ZA', name: 'África do Sul',       dial: '+27',  flag: '🇿🇦' },
  { code: 'NG', name: 'Nigéria',             dial: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Quênia',              dial: '+254', flag: '🇰🇪' },
  { code: 'EG', name: 'Egito',               dial: '+20',  flag: '🇪🇬' },
  { code: 'MA', name: 'Marrocos',            dial: '+212', flag: '🇲🇦' },
  { code: 'IL', name: 'Israel',              dial: '+972', flag: '🇮🇱' },
  { code: 'AE', name: 'Emirados Árabes',     dial: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Arábia Saudita',      dial: '+966', flag: '🇸🇦' },
  { code: 'SG', name: 'Singapura',           dial: '+65',  flag: '🇸🇬' },
];

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/* ── Upload de foto de perfil ── */
function ProfilePhotoUpload({ previewUrl, onFileSelect, onRemove }) {
  const [dragging, setDragging]   = useState(false);
  const [hovering, setHovering]   = useState(false);
  const [error, setError]         = useState('');
  const inputRef = useRef(null);

  function validateAndSelect(file) {
    setError('');
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato inválido. Use JPEG, PNG ou WEBP.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('A imagem deve ter no máximo 5 MB.');
      return;
    }
    onFileSelect(file);
  }

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    validateAndSelect(e.dataTransfer.files[0]);
  }, []);

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
      {/* Avatar preview com overlay de remoção no hover */}
      <div
        style={{
          width: 96, height: 96, borderRadius: '50%',
          background: previewUrl ? 'transparent' : '#e8f0ff',
          border: '2px solid #d8d6de', overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          cursor: previewUrl ? 'pointer' : 'default',
        }}
        onMouseEnter={() => previewUrl && setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Foto de perfil"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              filter: hovering ? 'blur(2px) brightness(0.4)' : 'none',
              transition: 'filter 0.2s',
            }}
          />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
            fill="none" stroke="#7367f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        )}

        {hovering && previewUrl && (
          <button
            type="button"
            onClick={onRemove}
            style={{
              position: 'absolute', inset: 0,
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '4px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>
              Remover<br/>foto
            </span>
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          flex: 1, minWidth: 200, minHeight: 80,
          border: `2px dashed ${dragging ? '#7367f0' : '#d8d6de'}`,
          borderRadius: '8px', padding: '16px 20px',
          background: dragging ? '#f3f0ff' : '#fafafa',
          cursor: 'pointer', textAlign: 'center',
          transition: 'border-color 0.2s, background 0.2s',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="#7367f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ marginBottom: '4px' }}>
          <polyline points="16 16 12 12 8 16"/>
          <line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
        </svg>
        <span style={{ fontSize: '13px', color: '#5e5873', fontWeight: 500 }}>
          Arraste sua foto aqui ou clique para adicionar
        </span>
        <span style={{ fontSize: '11px', color: '#aaa' }}>JPEG, PNG ou WEBP · máx. 5 MB</span>
        {previewUrl && (
          <span style={{ fontSize: '11px', color: '#28c76f', marginTop: '4px' }}>✓ Foto selecionada</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        style={{ display: 'none' }}
        onChange={e => validateAndSelect(e.target.files[0])}
      />

      {error && (
        <p style={{ width: '100%', margin: '4px 0 0', fontSize: '12px', color: '#ea5455' }}>{error}</p>
      )}
    </div>
  );
}

/* ── Seletor de país com DDI ── */
function PhoneInput({ countryCode, onCountryChange, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0];
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  );

  return (
    <div style={{ display: 'flex', position: 'relative' }}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '0 10px', height: '38px',
          border: '1px solid #d8d6de', borderRight: 'none',
          borderRadius: '0.357rem 0 0 0.357rem',
          background: '#f8f8f8', cursor: 'pointer',
          fontSize: '14px', whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        <span>{selected.flag}</span>
        <span style={{ color: '#6e6b7b', fontSize: '13px' }}>{selected.dial}</span>
        <svg width="8" height="5" viewBox="0 0 10 6" fill="none" style={{ marginLeft: '2px' }}>
          <path d="M1 1l4 4 4-4" stroke="#6e6b7b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 9999,
          background: '#fff', border: '1px solid #d8d6de', borderRadius: '8px',
          boxShadow: '0 4px 24px rgba(34,41,47,0.15)', minWidth: '260px',
          maxHeight: '260px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '8px' }}>
            <input
              autoFocus
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar país..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: '13px' }}
            />
          </div>
          <div style={{ overflowY: 'auto' }}>
            {filtered.map(c => (
              <div
                key={c.code}
                onClick={() => { onCountryChange(c.code); setOpen(false); }}
                style={{
                  padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: c.code === countryCode ? '#f3f2f7' : '#fff',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f3f2f7'; }}
                onMouseLeave={e => { e.currentTarget.style.background = c.code === countryCode ? '#f3f2f7' : '#fff'; }}
              >
                <span>{c.flag}</span>
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ color: '#aaa' }}>{c.dial}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ borderRadius: '0 0.357rem 0.357rem 0', flex: 1 }}
        onClick={() => open && setOpen(false)}
      />
    </div>
  );
}

/* ── Collapsible LGPD ── */
function LGPDSection() {
  const [open, setOpen] = useState(false);
  return (
    <div className="card mt-2" style={{ border: '1px solid #e3f2fd' }}>
      <div
        className="card-body"
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#3b5bdb' }}>
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei 13.709, de 14 de agosto de 2018),
            entenda por que coletamos os seus dados.
          </p>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#3b5bdb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        {open && (
          <div style={{ marginTop: '16px', fontSize: '13px', color: '#5e5873', lineHeight: 1.7, borderTop: '1px solid #e3f2fd', paddingTop: '16px' }}>
            <p><strong>Por que coletamos seus dados?</strong></p>
            <p>Coletamos seus dados pessoais com a finalidade de prestar os serviços de saúde contratados, incluindo o agendamento de consultas, emissão de documentos médicos e comunicações relacionadas ao seu atendimento.</p>
            <p><strong>Base legal:</strong> Os dados são tratados com base no consentimento do titular e no cumprimento de obrigação legal ou regulatória, conforme o Art. 7º da Lei nº 13.709/2018.</p>
            <p><strong>Seus direitos:</strong> Você tem direito à confirmação da existência de tratamento, acesso aos dados, correção, anonimização, portabilidade, eliminação e revogação do consentimento, conforme Art. 18 da LGPD.</p>
            <p style={{ marginBottom: 0 }}>Para exercer seus direitos, entre em contato pelo canal de atendimento disponível na plataforma.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Snackbar ── */
function Snackbar({ snack }) {
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

/* ── Ícone de cadeado para campo bloqueado ── */
function LockedBadge() {
  return (
    <span
      title="Entre em contato com o suporte se precisar alterar"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontSize: '11px', color: '#aaa', marginLeft: '8px',
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      Somente via suporte
    </span>
  );
}

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
          <span><strong style={{ color: '#ea5455' }}>*</strong> Campo obrigatório</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Entre em contato com o suporte se precisar alterar
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
              <div style={{ background: '#f8f8f8', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '12px 16px', minWidth: '160px' }}>
                <small style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '2px' }}>Número da assinatura</small>
                <span style={{ fontWeight: 600, color: '#5e5873' }}>0001234</span>
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
                <label className="form-label">Gênero</label>
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
      <div className="card mt-2" style={{ border: '1px solid #fde8e8' }}>
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
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: 400, boxShadow: '0 12px 40px rgba(34,41,47,0.25)' }}>
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
