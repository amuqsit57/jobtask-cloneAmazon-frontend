import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Amazon.com. Spend less. Smile more.',
  description:
    'Free shipping on millions of items. Get the best of shopping and entertainment with Prime.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-[#EAEDED]" id="top">
        <Providers>
          {/* Header reads searchParams, so it needs a Suspense boundary. */}
          <Suspense fallback={<div className="h-[100px] bg-[var(--color-nav)]" />}>
            <Header />
          </Suspense>
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
