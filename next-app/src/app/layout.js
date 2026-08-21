import './globals.css';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import ThemeInjector from '@/components/layout/ThemeInjector';
import LoadingScreen from '@/components/layout/LoadingScreen';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata = {
  title: 'MARSHALLS',
};

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function RootLayout({ children }) {
  return (
    <html lang="pt" dir="ltr">
      <head>
        <link rel="icon" href={`${base}/favicon.ico`} />
        {/* Google Fonts - Montserrat (mesma família do projeto original) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        {/* CSS do Vuexy (copiados do projeto original) */}
        <link rel="stylesheet" href={`${base}/css/chunk-vendors.f866b567.css`} />
        <link rel="stylesheet" href={`${base}/css/app.11caead5.css`} />
        <link rel="stylesheet" href={`${base}/css/chunk-371a653e.53448e5d.css`} />
        <link rel="stylesheet" href={`${base}/css/chunk-d0a9a6f8.4dbea570.css`} />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <LoadingScreen />
          <ThemeInjector />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
