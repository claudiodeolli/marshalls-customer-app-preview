'use client';

import { useRef, useState } from 'react';
import {
  MODAL_OVERLAY, MODAL_CARD, MODAL_BODY, MODAL_TITLE, MODAL_TEXT_MUTED,
  MODAL_ACTIONS, MODAL_BUTTON,
} from '@/components/ui/modalScale';

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
    <div style={{ ...MODAL_OVERLAY, zIndex: 9998 }}>
      <div className="card mb-0 _modal-enter" style={MODAL_CARD}>
        <div className="card-body" style={MODAL_BODY}>
          <h5 style={MODAL_TITLE}>Anexar documentos?</h5>
          <p style={{ ...MODAL_TEXT_MUTED, marginBottom: '1.25rem' }}>
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
            className="btn btn-outline-secondary"
            style={{ ...MODAL_BUTTON, width: '100%' }}
            onClick={() => inputRef.current?.click()}
          >
            Escolher arquivos
          </button>

          {files.length > 0 && (
            <ul style={{ ...MODAL_TEXT_MUTED, listStyle: 'none', padding: 0, margin: '1rem 0 0' }}>
              {files.map((file, i) => <li key={i}>{file.name}</li>)}
            </ul>
          )}

          <div style={MODAL_ACTIONS}>
            <button className="btn btn-outline-secondary" style={MODAL_BUTTON} onClick={handleClose}>Voltar</button>
            <button className="btn btn-success" style={MODAL_BUTTON} onClick={handleContinue}>
              {files.length > 0 ? 'Anexar e entrar' : 'Entrar sem anexar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
