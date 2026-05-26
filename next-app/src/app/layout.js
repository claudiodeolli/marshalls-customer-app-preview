import './globals.css';
import ThemeInjector from '@/components/layout/ThemeInjector';
import LoadingScreen from '@/components/layout/LoadingScreen';

export const metadata = {
  title: 'MARSHALLS',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt" dir="ltr">
      <head>
        {/* Google Fonts - Montserrat (mesma família do projeto original) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        {/* CSS do Vuexy (copiados do projeto original) */}
        <link rel="stylesheet" href="/css/chunk-vendors.f866b567.css" />
        <link rel="stylesheet" href="/css/app.11caead5.css" />
        <link rel="stylesheet" href="/css/chunk-371a653e.53448e5d.css" />
        <link rel="stylesheet" href="/css/chunk-d0a9a6f8.4dbea570.css" />
      </head>
      <body>
        {/* Tela de carregamento */}
        <LoadingScreen />

        {/* Injeta o CSS do tema ativo — lê sessionStorage 'ctTheme' (padrão: 1) */}
        <ThemeInjector />

        {children}
      </body>
    </html>
  );
}
