import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { LocaleProvider } from '@/context/LocaleContext';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Tech Stream',
  description: 'Tech Stream - AI & Tech News Dashboard',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tech Stream',
  },
  formatDetection: {
    telephone: false,
  },
};


import BackgroundImage from '@/components/ui/BackgroundImage';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`antialiased ${jetbrainsMono.variable}`}>
        <LocaleProvider>
          <BackgroundImage />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
