import Script from 'next/script';
import './globals.css';
import './mobile-responsive.css';

const BUILD_META_VERSION_TOKEN = Date.now().toString(36);

export const metadata = {
  title: 'CodeQuiz - Aprenda Programacao',
  description: 'CodeQuiz - Quiz de programacao',
  applicationName: 'CodeQuiz',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-180.png'
  },
  appleWebApp: {
    capable: true,
    title: 'CodeQuiz',
    statusBarStyle: 'black-translucent'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-content',
  themeColor: '#151832'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>
        <Script src={`/build-meta.js?v=${BUILD_META_VERSION_TOKEN}`} strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}

