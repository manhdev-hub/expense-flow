import type { Metadata } from 'next';
import { AuthProvider } from '../lib/auth-context';
import { QueryProvider } from '../providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'ExpenseFlow',
  description: 'Enterprise Expense Claim & Approval System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

