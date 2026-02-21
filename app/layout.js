import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'CodeQuiz - Aprenda Programacao',
  description: 'CodeQuiz - Quiz de programacao com Firebase',
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
  userScalable: false,
  themeColor: '#151832'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>
        <Script src="/build-meta.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
