'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { mockAppointments } from '@/data/mockData';

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === '1';
const LS_KEY = 'meus_arquivos';

const TIPOS = [
  { value: 'resultado_exame', label: 'Resultado de exame' },
  { value: 'laudo_medico',    label: 'Laudo médico'       },
  { value: 'foto_imagem',     label: 'Foto/Imagem'        },
  { value: 'outros',          label: 'Outros'             },
];

const ACCEPT = '.jpg,.jpeg,.png,.pdf,.mp4,.mov';
const MAX_MEDIA  = 20 * 1024 * 1024;
const MAX_VIDEO  = 50 * 1024 * 1024;

function nowStr() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} às ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['jpg','jpeg','png','pdf','mp4','mov'].includes(ext))
    return `Formato ".${ext}" não é aceito.`;
  const isVideo = ['mp4','mov'].includes(ext);
  if (file.size > (isVideo ? MAX_VIDEO : MAX_MEDIA))
    return `Arquivo excede o limite de ${isVideo ? '50 MB' : '20 MB'}.`;
  return null;
}

function tipoLabel(v) { return TIPOS.find(t => t.value === v)?.label ?? v; }

function lsLoad() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}

function lsSave(arr) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch {}
}

/* ── Icons ──────────────────────────────────────────────── */
function IconLock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  );
}
function IconUploadCloud() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  );
}
function IconFile() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}
function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  );
}
function IconChevron({ open }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function IconLink() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}
function IconFilter() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function MeusArquivosPage() {
  const router      = useRouter();
  const { user }    = useAuth();
  const fileInputRef = useRef(null);

  const paciente = `${user?.name ?? 'João da Silva'} – Titular`;

  /* upload form */
  const [showForm,     setShowForm]     = useState(false);
  const [titulo,       setTitulo]       = useState('');
  const [tipo,         setTipo]         = useState('');
  const [chosenFile,   setChosenFile]   = useState(null);
  const [dragOver,     setDragOver]     = useState(false);
  const [fileError,    setFileError]    = useState('');
  const [formError,    setFormError]    = useState('');
  const [dataEnvio,    setDataEnvio]    = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [isMobile,     setIsMobile]     = useState(false);

  /* post-upload linking */
  const [lastUploaded,  setLastUploaded]  = useState(null);
  const [linkOpen,      setLinkOpen]      = useState(false);
  const [scheduledApts, setScheduledApts] = useState([]);
  const [linkedApt,     setLinkedApt]     = useState(null);

  /* filter */
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [filterTitulo, setFilterTitulo] = useState('');
  const [filterData,   setFilterData]   = useState('');
  const [filterApplied,setFilterApplied]= useState(false);

  /* file list */
  const [files,         setFiles]         = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    setIsMobile(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
    const all = lsLoad();
    setFiles(all);
    setFilteredFiles(all);
    if (IS_MOCK) {
      setScheduledApts(mockAppointments.filter(a => a.status === 'SCHEDULED'));
    }
  }, []);

  function openForm() {
    setDataEnvio(nowStr());
    setTitulo('');
    setTipo('');
    setChosenFile(null);
    setFileError('');
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setChosenFile(null);
    setFileError('');
    setFormError('');
  }

  function pickFile(file) {
    if (!file) return;
    const err = validateFile(file);
    if (err) { setFileError(err); setChosenFile(null); return; }
    setFileError('');
    setChosenFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  }

  function handleSubmit() {
    if (!titulo.trim())  { setFormError('Informe o título do documento.'); return; }
    if (!tipo)           { setFormError('Selecione o tipo de documento.'); return; }
    if (!chosenFile)     { setFormError('Selecione um arquivo.'); return; }
    setFormError('');
    setSubmitting(true);

    setTimeout(() => {
      const entry = {
        id:       Date.now(),
        titulo:   titulo.trim(),
        tipo,
        paciente,
        arquivo:  { name: chosenFile.name, size: chosenFile.size },
        dataEnvio,
      };
      const updated = [entry, ...lsLoad()];
      lsSave(updated);
      setFiles(updated);
      setFilteredFiles(updated);
      setLastUploaded(entry);
      setLinkOpen(false);
      setLinkedApt(null);
      setSubmitting(false);
      closeForm();
    }, 900);
  }

  function deleteFile(id) {
    const updated = lsLoad().filter(f => f.id !== id);
    lsSave(updated);
    setFiles(updated);
    setFilteredFiles(prev => prev.filter(f => f.id !== id));
    if (lastUploaded?.id === id) setLastUploaded(null);
  }

  function applyFilter() {
    const all = lsLoad();
    const result = all.filter(f => {
      if (filterTitulo && !f.titulo.toLowerCase().includes(filterTitulo.toLowerCase())) return false;
      if (filterData) {
        const [y, m, d] = filterData.split('-');
        if (!f.dataEnvio.startsWith(`${d}/${m}/${y}`)) return false;
      }
      return true;
    });
    setFilteredFiles(result);
    setFilterApplied(true);
    if (typeof window !== 'undefined' && window.innerWidth < 1200) setFilterOpen(false);
  }

  function confirmLink() {
    setLastUploaded(null);
    setLinkOpen(false);
    setLinkedApt(null);
  }

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div style={{ paddingBottom: '1.5rem' }}>

      {/* Intro */}
      <p className="text-muted mb-2" style={{ fontSize: 14 }}>
        Envie e acompanhe seus arquivos para análise médica, como resultados de exames, laudos e outros documentos de saúde.
      </p>

      {/* Security banner */}
      <div style={{
        background: '#fff8f0', border: '1px solid #ffe0b2', borderRadius: 10,
        padding: '14px 16px', marginBottom: '1.25rem',
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <span style={{ color: '#ff9f43', flexShrink: 0, marginTop: 1 }}><IconLock /></span>
        <div style={{ fontSize: 13, color: '#5e5873', lineHeight: 1.75 }}>
          <strong>Seus arquivos são protegidos por criptografia.</strong><br />
          Somente você e os médicos autorizados poderão acessá-los.<br />
          Os arquivos enviados nesta área poderão ser excluídos por você a qualquer momento ou removidos automaticamente após <strong>40 dias</strong>, preservados os registros necessários ao atendimento médico.
        </div>
      </div>

      {/* ── Upload button / form ──────────────────────── */}
      {!showForm ? (
        <button
          onClick={openForm}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '1.25rem', borderRadius: 10, fontWeight: 700, padding: '12px', fontSize: 15 }}
        >
          Enviar novo arquivo
        </button>
      ) : (
        <div className="card mb-3">
          <div className="card-header" style={{ padding: '14px 20px' }}>
            <h5 className="card-title mb-0">Informações do Arquivo</h5>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: '#6e6b7b', marginBottom: '1.25rem' }}>
              Preencha os campos abaixo para enviar um novo arquivo.
            </p>

            {formError && (
              <div className="alert alert-danger" style={{ fontSize: 13, padding: '8px 14px' }}>{formError}</div>
            )}

            {/* Título */}
            <div className="form-group">
              <label className="form-label">Título</label>
              <input
                type="text"
                className="form-control"
                placeholder="Insira um nome para o documento"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
              />
            </div>

            {/* Tipo de documento */}
            <div className="form-group">
              <label className="form-label">Tipo de documento</label>
              <select className="custom-select" value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="">Selecione</option>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Paciente (locked) */}
            <div className="form-group">
              <label className="form-label">Paciente</label>
              <input
                type="text"
                className="form-control"
                value={paciente}
                readOnly
                style={{ background: '#f3f2f7', cursor: 'not-allowed', color: '#6e6b7b' }}
              />
            </div>

            {/* Arquivo — drop zone */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Arquivo
                <span
                  title="Formatos aceitos: JPG/JPEG, PNG, PDF, MP4 e MOV. Limite: 20 MB para imagens e PDFs; 50 MB para vídeos."
                  style={{
                    width: 17, height: 17, borderRadius: '50%',
                    background: '#e0e0e0', color: '#6e6b7b',
                    fontSize: 11, fontWeight: 700, cursor: 'help',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >?</span>
              </label>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? '#4daab6' : chosenFile ? '#28c76f' : '#d8d6de'}`,
                  borderRadius: 10, padding: '28px 16px', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: dragOver ? '#f0fafc' : chosenFile ? '#f0fff6' : '#fafafa',
                }}
              >
                {chosenFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#28c76f' }}><IconFile /></span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#5e5873' }}>{chosenFile.name}</span>
                    <span style={{ fontSize: 12, color: '#b9b9c3' }}>{formatSize(chosenFile.size)}</span>
                    <span style={{ fontSize: 12, color: '#4daab6', textDecoration: 'underline', marginTop: 2 }}>Trocar arquivo</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#b9b9c3' }}><IconUploadCloud /></span>
                    {isMobile ? (
                      <span style={{ fontSize: 14, color: '#6e6b7b' }}>Toque para selecionar</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 14, color: '#6e6b7b' }}>Arraste seus arquivos aqui</span>
                        <span style={{ fontSize: 13, color: '#b9b9c3' }}>ou clique para selecionar</span>
                      </>
                    )}
                    <span style={{ fontSize: 11, color: '#c0bdd0', marginTop: 2 }}>
                      JPG/JPEG, PNG, PDF, MP4, MOV · máx. 20 MB (vídeos: 50 MB)
                    </span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept={ACCEPT} style={{ display: 'none' }} onChange={e => pickFile(e.target.files?.[0])} />
              {fileError && <small style={{ color: '#ea5455', fontSize: 12, marginTop: 4, display: 'block' }}>{fileError}</small>}
            </div>

            {/* Data de envio (locked) */}
            <div className="form-group">
              <label className="form-label">Data de envio</label>
              <input
                type="text"
                className="form-control"
                value={dataEnvio}
                readOnly
                style={{ background: '#f3f2f7', cursor: 'not-allowed', color: '#6e6b7b' }}
              />
            </div>

            {/* Form buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              <button
                onClick={closeForm}
                style={{
                  background: 'none', border: '1.5px solid #ebe9f1', borderRadius: 24,
                  fontWeight: 600, fontSize: 14, color: '#6e6b7b', cursor: 'pointer',
                  padding: '10px', lineHeight: 1.5,
                }}
              >
                ← Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary"
                style={{ borderRadius: 24, fontWeight: 700, padding: '11px', lineHeight: 1.5, border: '1.5px solid transparent' }}
              >
                {submitting ? 'Enviando...' : 'Anexar Arquivo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Post-upload: link to appointment ─────────── */}
      {lastUploaded && (
        <div className="card mb-3" style={{ border: '1.5px solid #c3e6fd', background: '#f0f8ff' }}>
          <div className="card-body" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ color: '#0052ff' }}><IconLink /></span>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#5e5873' }}>
                Anexar este arquivo à uma consulta específica
              </span>
            </div>

            {!linkOpen ? (
              <button
                onClick={() => setLinkOpen(true)}
                style={{
                  background: 'none', border: '1px solid #0052ff', borderRadius: 20,
                  color: '#0052ff', fontWeight: 600, fontSize: 13, padding: '6px 18px', cursor: 'pointer',
                }}
              >
                Procurar minhas consultas agendadas
              </button>
            ) : scheduledApts.length === 0 ? (
              <div>
                <p style={{ color: '#6e6b7b', fontSize: 13, marginBottom: 10 }}>Você não possui consultas agendadas</p>
                <button
                  onClick={() => router.push('/agendamentos')}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: 20 }}
                >
                  Agendar Agora
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {scheduledApts.map(apt => (
                  <div
                    key={apt.uuid}
                    onClick={() => setLinkedApt(apt.uuid === linkedApt ? null : apt.uuid)}
                    style={{
                      border: `1.5px solid ${linkedApt === apt.uuid ? '#0052ff' : '#d0d0d0'}`,
                      borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                      background: linkedApt === apt.uuid ? '#eef3ff' : '#fff',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#5e5873' }}>
                      {apt.specialty?.name} — Dr(a). {apt.professional?.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6b7b', marginTop: 2 }}>
                      {apt.detail?.date} às {apt.detail?.from} · {paciente}
                    </div>
                    {linkedApt === apt.uuid && (
                      <div style={{ fontSize: 12, color: '#0052ff', marginTop: 4, fontWeight: 600 }}>
                        Anexar "{lastUploaded.titulo}" à esta consulta para análise médica ✓
                      </div>
                    )}
                  </div>
                ))}
                {linkedApt && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 }}
                    onClick={confirmLink}
                  >
                    Confirmar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Filter collapsible ────────────────────────── */}
      <div className="card mb-2" style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid #e3f2fd',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <div className="card-body">
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', userSelect: 'none',
              marginBottom: filterOpen ? '1.25rem' : 0,
            }}
            onClick={() => setFilterOpen(o => !o)}
          >
            <h6 style={{ margin: 0, fontWeight: 600, color: 'var(--primary, #0052ff)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconFilter /> Filtrar arquivos
            </h6>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aaa', fontSize: 13 }}>
              {!filterOpen && 'Toque para abrir'}
              <IconChevron open={filterOpen} />
            </span>
          </div>

          {filterOpen && (
            <div className="row" style={{ rowGap: '12px', alignItems: 'flex-end' }}>
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary,#0052ff)', marginBottom: 4 }}>TÍTULO</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Informe o nome do documento"
                  value={filterTitulo}
                  onChange={e => setFilterTitulo(e.target.value)}
                  style={{ borderRadius: 8 }}
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary,#0052ff)', marginBottom: 4 }}>PACIENTE</label>
                <input
                  type="text"
                  className="form-control"
                  value={paciente}
                  readOnly
                  style={{ borderRadius: 8, background: '#f3f2f7', cursor: 'not-allowed', color: '#6e6b7b' }}
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary,#0052ff)', marginBottom: 4 }}>DATA DE ENVIO</label>
                <input
                  type="date"
                  className="form-control"
                  value={filterData}
                  onChange={e => setFilterData(e.target.value)}
                  style={{ borderRadius: 8 }}
                />
              </div>
              <div className="col-12 col-md-2">
                <button
                  onClick={applyFilter}
                  className="btn btn-primary"
                  style={{ width: '100%', height: 38, borderRadius: 8, fontWeight: 700 }}
                >
                  FILTRAR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── File list ────────────────────────────────── */}
      <div style={{ marginTop: '1rem' }}>
        {filteredFiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#b9b9c3', fontSize: 14 }}>
            {filterApplied ? '- Nenhum resultado encontrado -' : '- Resultados aqui -'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredFiles.map(f => (
              <div key={f.id} className="card mb-0" style={{ transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
              >
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ color: 'var(--primary,#0052ff)', flexShrink: 0 }}><IconFile /></span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#5e5873', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.titulo}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#6e6b7b', marginBottom: 2 }}>
                      <strong>Tipo:</strong> {tipoLabel(f.tipo)}
                    </div>
                    <div style={{ fontSize: 13, color: '#6e6b7b', marginBottom: 2 }}>
                      <strong>Paciente:</strong> {f.paciente}
                    </div>
                    <div style={{ fontSize: 13, color: '#6e6b7b', marginBottom: 2 }}>
                      <strong>Arquivo:</strong> {f.arquivo.name} ({formatSize(f.arquivo.size)})
                    </div>
                    <div style={{ fontSize: 12, color: '#b9b9c3', marginTop: 4 }}>
                      Enviado em: {f.dataEnvio}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFile(f.id)}
                    title="Excluir arquivo"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea5455', padding: 6, flexShrink: 0 }}
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
