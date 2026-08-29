import { AuthProvider } from '@/lib/auth-context';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('HomePage Component', () => {
  it('renders ExpenseFlow title and Sign In button when unauthenticated', () => {
    render(
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'ExpenseFlow' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /sign in with demo account/i })
    ).toBeInTheDocument();
  });
});
