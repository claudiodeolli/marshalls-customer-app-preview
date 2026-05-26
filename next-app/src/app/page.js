import { redirect } from 'next/navigation';

/* Redireciona a raiz para o painel principal */
export default function RootPage() {
  redirect('/painel');
}
