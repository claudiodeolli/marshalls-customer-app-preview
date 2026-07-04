export function MastercardIcon() {
  return (
    <svg width="34" height="22" viewBox="0 0 34 22">
      <circle cx="13" cy="11" r="10" fill="#eb001b" fillOpacity="0.9"/>
      <circle cx="21" cy="11" r="10" fill="#f79e1b" fillOpacity="0.9"/>
    </svg>
  );
}

export function AlertTriangle({ color = '#ea5455', size = 48 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
