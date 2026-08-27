import { describe, expect, it } from 'vitest';
import { makeQueryClient } from './query-client';

describe('QueryClient convention', () => {
  it('creates QueryClient with approved default options', () => {
    const client = makeQueryClient();
    const defaultOptions = client.getDefaultOptions();

    expect(defaultOptions.queries?.staleTime).toBe(60000);
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaultOptions.queries?.retry).toBe(1);
  });
});

