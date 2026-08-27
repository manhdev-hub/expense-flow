import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('HomePage Placeholder Smoke Test', () => {
  it('renders ExpenseFlow title and placeholder badge in jsdom environment', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1, name: 'ExpenseFlow' })).toBeInTheDocument();
    expect(screen.getByText('Frontend Foundation Placeholder')).toBeInTheDocument();
  });
});

