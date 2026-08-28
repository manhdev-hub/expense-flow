import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Database Migration Workflow Foundation', () => {
  const apiDir = resolve(__dirname, '../../');
  const migrationDir = resolve(apiDir, 'prisma/migrations/20260828000000_init');
  const migrationSqlPath = resolve(migrationDir, 'migration.sql');
  const migrationLockPath = resolve(apiDir, 'prisma/migrations/migration_lock.toml');
  const packageJsonPath = resolve(apiDir, 'package.json');
  const serverPath = resolve(apiDir, 'src/server.ts');

  it('provides committed initial migration.sql with complete DDL', () => {
    expect(existsSync(migrationSqlPath)).toBe(true);

    const sqlContent = readFileSync(migrationSqlPath, 'utf-8');

    // Schema and Enums
    expect(sqlContent).toContain('CREATE TYPE "Role"');
    expect(sqlContent).toContain('CREATE TYPE "ExpenseCategory"');
    expect(sqlContent).toContain('CREATE TYPE "ExpenseStatus"');
    expect(sqlContent).toContain('CREATE TYPE "AuditEventType"');

    // Tables
    expect(sqlContent).toContain('CREATE TABLE "users"');
    expect(sqlContent).toContain('CREATE TABLE "expenses"');
    expect(sqlContent).toContain('CREATE TABLE "refresh_sessions"');
    expect(sqlContent).toContain('CREATE TABLE "audit_events"');

    // Foreign Keys
    expect(sqlContent).toContain('users_managerId_fkey');
    expect(sqlContent).toContain('expenses_ownerId_fkey');
    expect(sqlContent).toContain('expenses_assignedManagerId_fkey');
    expect(sqlContent).toContain('refresh_sessions_userId_fkey');
    expect(sqlContent).toContain('audit_events_expenseId_fkey');
  });

  it('provides migration_lock.toml configured for postgresql provider', () => {
    expect(existsSync(migrationLockPath)).toBe(true);

    const lockContent = readFileSync(migrationLockPath, 'utf-8');
    expect(lockContent).toContain('provider = "postgresql"');
  });

  it('defines db:migrate:deploy and db:migrate:dev scripts in apps/api/package.json', () => {
    expect(existsSync(packageJsonPath)).toBe(true);

    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    expect(pkg.scripts['db:migrate:deploy']).toBe('prisma migrate deploy');
    expect(pkg.scripts['db:migrate:dev']).toBe('prisma migrate dev');
  });

  it('confirms server startup does not run database migrations automatically', () => {
    expect(existsSync(serverPath)).toBe(true);

    const serverContent = readFileSync(serverPath, 'utf-8');
    expect(serverContent).not.toContain('prisma migrate');
    expect(serverContent).not.toContain('migrateDeploy');
    expect(serverContent).not.toContain('db:migrate');
  });
});

