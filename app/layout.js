import Script from 'next/script';
import { Fredoka, JetBrains_Mono, Nunito } from 'next/font/google';
import '../src/codequiz/styles/tokens.css';
import '../src/codequiz/styles/base.css';
import '../src/codequiz/styles/animations.css';
import '../src/codequiz/styles/cosmetics.css';

const BUILD_META_VERSION_TOKEN = Date.now().toString(36);

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap'
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-jetbrains',
  display: 'swap'
});

export const metadata = {
  title: 'CodeQuiz — Aprenda programação jogando',
  description: 'Quiz de programação com trilhas, ranking e batalhas PvP em tempo real.',
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
  interactiveWidget: 'resizes-content',
  themeColor: '#120e33'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${nunito.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning>
        <Script src={`/build-meta.js?v=${BUILD_META_VERSION_TOKEN}`} strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
