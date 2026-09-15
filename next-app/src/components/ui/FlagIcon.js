'use client';

import Image from 'next/image';
import { assetPath } from '@/lib/assetPath';

// Bandeiras servidas pelo próprio projeto, e não como caractere.
//
// O Windows não desenha bandeiras: a fonte do sistema mostra as duas letras
// do país — "BR", "PT" — no lugar da arte. Era o mesmo problema que motivou a
// #11 nos ícones do card, num lugar bem mais visível (issue #34).
//
// Vêm do Twemoji, e não do Fluent Emoji usado no resto do aplicativo, porque
// o Fluent **não publica bandeiras de países**. A licença CC-BY e a
// atribuição exigida por ela estão em public/icons/flags/.
const PROPORCAO = 4 / 3;

/** codigo: sigla ISO de duas letras, como 'BR'. */
export default function FlagIcon({ codigo, height = 16, style }) {
  if (!codigo) return null;

  return (
    <Image
      src={assetPath(`/icons/flags/${codigo.toLowerCase()}.svg`)}
      alt=""
      width={Math.round(height * PROPORCAO)}
      height={height}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      // Mesmo motivo do EmojiIcon: desde a issue #45 o lazy do next/image usa o
      // contêiner de rolagem como raiz, e a bandeira fora da área visível não
      // era buscada.
      loading="eager"
    />
  );
}
