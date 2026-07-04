export default function SituacaoBadge({ s }) {
  const map = {
    'Pago':      { bg: '#e8f5e9', color: '#2e7d32' },
    'Pendente':  { bg: '#fff8e1', color: '#f57f17' },
    'Cancelado': { bg: '#fce4ec', color: '#c62828' },
  };
  const st = map[s] ?? { bg: '#eeeeee', color: '#616161' };
  return (
    <span style={{ background: st.bg, color: st.color, fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
      {s}
    </span>
  );
}
