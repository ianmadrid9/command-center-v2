import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Command Center',
  description: 'Your projects. Your conversations. Your progress.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <main className="mx-auto max-w-7xl p-6">{children}</main>
      </body>
    </html>
  );
}
