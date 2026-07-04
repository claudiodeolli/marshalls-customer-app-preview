'use client';

import { useState } from 'react';

export default function Stars({ value, onChange, size = 20 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <svg
          key={n}
          xmlns="http://www.w3.org/2000/svg"
          width={size} height={size}
          viewBox="0 0 24 24"
          fill={(hover || value) >= n ? '#f6c90e' : 'none'}
          stroke={(hover || value) >= n ? '#f6c90e' : '#ccc'}
          strokeWidth="1.5"
          style={{ cursor: onChange ? 'pointer' : 'default', flexShrink: 0 }}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}
