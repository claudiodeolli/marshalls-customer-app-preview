'use client';

import Image from 'next/image';
import { assetPath } from '@/lib/assetPath';

// Desenhos do Microsoft Fluent Emoji 3D servidos pelo próprio projeto. Como
// caracteres unicode eles mudavam de traço conforme o sistema — Windows,
// macOS, iOS e Android desenham o mesmo codepoint de formas diferentes
// (issue #11). A licença MIT acompanha os arquivos em
// public/icons/fluent-emoji/LICENSE, exigida por redistribuí-los.
//
// O caminho passa por assetPath porque o <Image> não aplica o basePath
// quando images.unoptimized está ligado, e a publicação no GitHub Pages vive
// sob um prefixo.
const ARQUIVOS = {
  calendario: 'calendar_3d.png',
  relogio: 'three_oclock_3d.png',
  circuloVerde: 'green_circle_3d.png',
  aviso: 'warning_3d.png',
  carrinho: 'shopping_cart_3d.png',
  estetoscopio: 'stethoscope_3d.png',
  pessoa: 'bust_in_silhouette_3d.png',
  dinheiro: 'money_bag_3d.png',
  cartao: 'credit_card_3d.png',
  documento: 'page_facing_up_3d.png',
  confirmado: 'check_mark_button_3d.png',
  raio: 'high_voltage_3d.png',
  globo: 'globe_with_meridians_3d.png',
  prancheta: 'clipboard_3d.png',
  comprimido: 'pill_3d.png',
  microscopio: 'microscope_3d.png',
  clipe: 'paperclip_3d.png',
  bloco: 'memo_3d.png',
};

export function iconPath(nome) {
  const arquivo = ARQUIVOS[nome];
  if (!arquivo) throw new Error(`Ícone desconhecido: ${nome}`);
  return assetPath(`/icons/fluent-emoji/${arquivo}`);
}

/** alt vazio de propósito: são decorativos, o texto ao lado já informa. */
export default function EmojiIcon({ name, size = 24, style }) {
  // eager porque são decorativos de 24px e o lazy do next/image passou a usar
  // o .content-wrapper como raiz desde a issue #45: fora da área visível eles
  // não eram buscados, e apareciam pipocando conforme a rolagem.
  return <Image src={iconPath(name)} alt="" width={size} height={size} style={style} loading="eager" />;
}
