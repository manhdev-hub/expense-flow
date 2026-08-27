import { roles } from '@expense-flow/shared';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-md border border-slate-200 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">ExpenseFlow</h1>
        <p className="text-slate-600 text-sm mb-6">
          Enterprise Expense Claim Management System
        </p>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          Frontend Foundation Placeholder
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400">
          Supported Roles: {roles.join(', ')}
        </div>
      </div>
    </main>
  );
}

