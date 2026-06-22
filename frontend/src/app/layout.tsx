import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans-custom',
});

export const metadata: Metadata = {
  title: 'Pyrobot — Your AI. Your Way.',
  description: 'A personal AI operating system that understands you.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        suppressHydrationWarning is required here — next-themes sets
        the 'dark' class on <html> client-side from localStorage, which
        means the server render and first client render will differ.
        This attribute tells React to expect that specific mismatch
        on this element only, and not warn about it.
      */}
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}