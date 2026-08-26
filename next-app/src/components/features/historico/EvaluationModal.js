'use client';
import { MODAL_OVERLAY } from '@/components/ui/modalScale';

import { useState } from 'react';
import Stars from './Stars';

export default function EvaluationModal({ record, onClose, onSave }) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [saving,  setSaving]  = useState(false);

  function handleSave() {
    if (!rating) return;
    setSaving(true);
    setTimeout(() => {
      onSave(record.uuid, { rating, comment });
      setSaving(false);
      onClose();
    }, 400);
  }

  return (
    <div
      style={{ ...MODAL_OVERLAY, zIndex: 1060, padding: '16px' }}
      onClick={onClose}
    >
      <div
        className="_modal-enter"
        style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <h5 style={{ fontWeight: 700, marginBottom: '4px' }}>Avaliar consulta</h5>
        <p style={{ fontSize: '13px', color: '#6e6b7b', marginBottom: '20px' }}>
          Dr(a) {record.professional.name} — {record.professional.specialties[0].name}
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Sua nota</label>
          <Stars value={rating} onChange={setRating} size={32} />
          {!rating && <small style={{ color: '#ea5455', display: 'block', marginTop: '4px' }}>Selecione uma nota para continuar</small>}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Comentário <span style={{ color: '#aaa', fontWeight: 400 }}>(opcional)</span>
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Compartilhe sua experiência..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ resize: 'none', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!rating || saving}>
            {saving ? 'Salvando...' : 'Enviar avaliação'}
          </button>
        </div>
      </div>
    </div>
  );
}
