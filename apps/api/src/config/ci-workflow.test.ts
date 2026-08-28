import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Early CI workflow verification', () => {
  const rootDir = resolve(__dirname, '../../../../');
  const workflowPath = resolve(rootDir, '.github/workflows/early-ci.yml');

  it('provides early-ci.yml workflow file on Linux runner', () => {
    expect(existsSync(workflowPath)).toBe(true);

    const content = readFileSync(workflowPath, 'utf-8');

    // Runner & triggers
    expect(content).toContain('runs-on: ubuntu-latest');
    expect(content).toContain('branches: [master, main]');

    // Runtime setup
    expect(content).toContain('version: 11.20.0');
    expect(content).toMatch(/node-version-file:\s*['"]?\.nvmrc['"]?/);
    expect(content).toMatch(/cache:\s*['"]?pnpm['"]?/);

    // Essential foundation steps
    expect(content).toContain('pnpm install --frozen-lockfile');
    expect(content).toContain('pnpm --filter @expense-flow/shared build');
    expect(content).toContain('pnpm --filter @expense-flow/api db:generate');
    expect(content).toContain('pnpm lint');
    expect(content).toContain('pnpm typecheck');
    expect(content).toContain('pnpm test');
    expect(content).toContain('pnpm build');

    // Confirm no premature Playwright or Full CI components
    expect(content).not.toContain('playwright');
    expect(content).not.toContain('services:');
  });
});
