'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const VALID = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function ThemeRedirect({ themeId }) {
  const router = useRouter();

  useEffect(() => {
    if (VALID.includes(themeId)) {
      localStorage.setItem('ctTheme', themeId);
    }
    router.replace('/painel');
  }, [themeId, router]);

  return null;
}
