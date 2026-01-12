import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Intel Hub',
  description: 'AI関連ニュースを収集・整理するダッシュボード',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
