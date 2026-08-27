// O basePath do Next não chega até o src de <Image> quando images.unoptimized
// está ligado (next.config.mjs): o componente devolve o src intacto, sem
// prefixo. Em Vercel isso não aparece, porque lá o basePath é vazio; no
// GitHub Pages o app vive sob /marshalls-customer-app-preview e o arquivo
// passa a ser procurado na raiz do domínio.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function assetPath(path) {
  return `${BASE_PATH}${path}`;
}
