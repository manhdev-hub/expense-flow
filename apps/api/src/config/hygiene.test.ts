import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Environment & Git hygiene', () => {
  const rootDir = resolve(__dirname, '../../../../');
  const apiDir = resolve(__dirname, '../../');
  const webDir = resolve(rootDir, 'apps/web');

  it('provides safe .env.example files at root, api, and web', () => {
    const rootEnvExample = resolve(rootDir, '.env.example');
    const apiEnvExample = resolve(apiDir, '.env.example');
    const webEnvExample = resolve(webDir, '.env.example');

    expect(existsSync(rootEnvExample)).toBe(true);
    expect(existsSync(apiEnvExample)).toBe(true);
    expect(existsSync(webEnvExample)).toBe(true);

    const rootContent = readFileSync(rootEnvExample, 'utf-8');
    const apiContent = readFileSync(apiEnvExample, 'utf-8');
    const webContent = readFileSync(webEnvExample, 'utf-8');

    // Verify template variables are present
    expect(rootContent).toContain('DATABASE_URL=');
    expect(rootContent).toContain('TEST_DATABASE_URL=');
    expect(apiContent).toContain('DATABASE_URL=');
    expect(apiContent).toContain('TEST_DATABASE_URL=');
    expect(webContent).toContain('NEXT_PUBLIC_API_URL=');

    // Verify dummy local credentials
    expect(rootContent).toContain('postgres:postgres@localhost:5432');
    expect(apiContent).toContain('postgres:postgres@localhost:5432');

    // Verify no actual production secrets or private keys exist in examples
    for (const content of [rootContent, apiContent, webContent]) {
      expect(content).not.toContain('PRIVATE_KEY');
      expect(content).not.toContain('SUPER_SECRET_PROD');
      expect(content).not.toContain('render.com');
    }
  });

  it('ensures .gitignore rules cover critical secrets and build outputs', () => {
    const gitignorePath = resolve(rootDir, '.gitignore');
    expect(existsSync(gitignorePath)).toBe(true);

    const gitignoreContent = readFileSync(gitignorePath, 'utf-8');

    expect(gitignoreContent).toContain('.env');
    expect(gitignoreContent).toContain('node_modules');
    expect(gitignoreContent).toContain('dist');
    expect(gitignoreContent).toContain('.next');
    expect(gitignoreContent).toContain('coverage');
    expect(gitignoreContent).toContain('*.log');
  });

  it('provides docker-compose.yml with local PostgreSQL configuration', () => {
    const composePath = resolve(rootDir, 'docker-compose.yml');
    expect(existsSync(composePath)).toBe(true);

    const composeContent = readFileSync(composePath, 'utf-8');
    expect(composeContent).toContain('postgres:16-alpine');
    expect(composeContent).toContain('5432:5432');
    expect(composeContent).toContain('POSTGRES_DB: expense_flow_dev');
    expect(composeContent).toContain('init-databases.sh');
  });
});

