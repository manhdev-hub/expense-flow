import { AuthProvider } from '@/lib/auth-context';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './page';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LoginPage Component & In-Memory Auth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders login form with inputs and quick-fill buttons', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^sign in$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Manager 1:/i)).toBeInTheDocument();
  });

  it('quick fills demo credentials when clicking quick-fill buttons', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const managerButton = screen.getByText(/Manager 1:/i);
    fireEvent.click(managerButton);

    const emailInput = screen.getByLabelText(
      /email address/i
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /password/i
    ) as HTMLInputElement;

    expect(emailInput.value).toBe('manager1@example.com');
    expect(passwordInput.value).toBe('Password123456!');
  });

  it('submits login form, updates memory state, and NEVER writes tokens to localStorage', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          accessToken: 'mock-access-token-123',
          expiresInSeconds: 900,
          csrfToken: 'mock-csrf-token-456',
          user: {
            id: 'usr-1',
            role: 'MANAGER',
            name: 'Demo Manager 1',
          },
        },
      }),
    });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'manager1@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123456!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    // CRITICAL: Ensure no localStorage or sessionStorage writes occurred
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('csrfToken')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('displays error alert when login fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      }),
    });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong-password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Invalid email or password'
      );
    });
  });
});

