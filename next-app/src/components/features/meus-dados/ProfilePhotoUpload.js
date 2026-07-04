'use client';

import { useState, useRef, useCallback } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function ProfilePhotoUpload({ previewUrl, onFileSelect, onRemove }) {
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
