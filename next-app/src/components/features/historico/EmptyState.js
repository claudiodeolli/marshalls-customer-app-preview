import { IconInbox } from './icons';

export default function EmptyState() {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem', padding: '3rem' }}>
      <IconInbox />
      <p style={{ marginTop: '8px', color: '#888', fontSize: '15px' }}>Nenhum registro encontrado.</p>
    </div>
  );
}
