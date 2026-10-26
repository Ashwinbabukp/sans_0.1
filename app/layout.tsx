import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sans – share your quotes',
  description: 'Write, swipe and share quotes on pastel cards.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=Young+Serif&family=Outfit:wght@400;600;700&family=Caveat:wght@600&family=Playfair+Display:ital,wght@1,500&family=Dancing+Script:wght@700&family=Permanent+Marker&family=Special+Elite&family=Bebas+Neue&family=Fredoka:wght@600&family=Noto+Sans+Malayalam:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&family=Noto+Sans+Tamil:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
