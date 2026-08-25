'use client';

import { useRef, useState } from 'react';

// PDF da issue #2: ao clicar no "Entrar no atendimento" já liberado, perguntar
// se o usuário quer anexar algum arquivo para ser avaliado pelo médico antes
// de seguir para o atendimento.
export default function AttachDocumentsModal({ open, onClose, onContinue }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);

  if (!open) return null;

  function handleContinue() {
    onContinue(files);
    setFiles([]);
  }

  function handleClose() {
    setFiles([]);
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="card mb-0 _modal-enter" style={{ width: '400px', maxWidth: '90vw', borderRadius: '12px' }}>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <h5 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Anexar documentos?</h5>
          <p style={{ color: '#5e5873', marginBottom: '1rem', fontSize: '14px' }}>
            Deseja anexar algum arquivo para ser avaliado pelo médico durante o atendimento?
          </p>

          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={e => setFiles(Array.from(e.target.files ?? []))}
          />
          <button
            className="btn btn-outline-secondary btn-sm"
            style={{ width: '100%', marginBottom: '0.75rem' }}
            onClick={() => inputRef.current?.click()}
          >
            Escolher arquivos
          </button>

          {files.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem', fontSize: '13px', color: '#5e5873' }}>
              {files.map((file, i) => <li key={i}>{file.name}</li>)}
            </ul>
          )}

          <div className="d-flex justify-content-end" style={{ gap: '8px' }}>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleClose}>Voltar</button>
            <button className="btn btn-success btn-sm" onClick={handleContinue}>
              {files.length > 0 ? 'Anexar e entrar' : 'Entrar sem anexar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
