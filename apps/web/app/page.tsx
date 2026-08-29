'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, user, logoutClient } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-md border border-slate-200 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">ExpenseFlow</h1>
        <p className="text-slate-600 text-sm mb-6">
          Enterprise Expense Claim Management System
        </p>

        {isAuthenticated && user ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-left">
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Logged In Profile
              </div>
              <div className="text-sm font-medium text-slate-900 mt-1">
                {user.name}
              </div>
              <div className="text-xs text-slate-600">
                Role: <span className="font-semibold">{user.role}</span>
              </div>
            </div>
            <button
              onClick={logoutClient}
              className="w-full py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-medium rounded-md transition"
            >
              Sign out (Client)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              You are currently not logged in.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
            >
              Sign In with Demo Account
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
