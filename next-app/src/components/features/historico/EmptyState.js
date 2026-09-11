import { IconInbox } from './icons';

export default function EmptyState() {
  return (
    <div style={{ textAlign: 'center', marginTop: '28px', padding: '42px' }}>
      <IconInbox />
      <p style={{ marginTop: '8px', color: '#888', fontSize: '15px' }}>Nenhum registro encontrado.</p>
    </div>
  );
}
