import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createPrismaClient, prisma } from './prisma.js';

describe('Prisma Schema & Database Connection Foundation', () => {
  const rootDir = resolve(__dirname, '../../../../');
  const apiDir = resolve(__dirname, '../../');
  const schemaPath = resolve(apiDir, 'prisma/schema.prisma');
  const webPkgPath = resolve(rootDir, 'apps/web/package.json');

  it('provides complete schema.prisma with models and enums', () => {
    expect(existsSync(schemaPath)).toBe(true);

    const schemaContent = readFileSync(schemaPath, 'utf-8');

    // Datasource & Generator
    expect(schemaContent).toContain('provider = "postgresql"');
    expect(schemaContent).toContain('provider = "prisma-client-js"');

    // Enums
    expect(schemaContent).toContain('enum Role');
    expect(schemaContent).toContain('EMPLOYEE');
    expect(schemaContent).toContain('MANAGER');

    expect(schemaContent).toContain('enum ExpenseCategory');
    expect(schemaContent).toContain('TRAVEL');
    expect(schemaContent).toContain('MEAL');
    expect(schemaContent).toContain('OFFICE');
    expect(schemaContent).toContain('TRAINING');
    expect(schemaContent).toContain('OTHER');

    expect(schemaContent).toContain('enum ExpenseStatus');
    expect(schemaContent).toContain('DRAFT');
    expect(schemaContent).toContain('PENDING');
    expect(schemaContent).toContain('APPROVED');
    expect(schemaContent).toContain('REJECTED');

    expect(schemaContent).toContain('enum AuditEventType');
    expect(schemaContent).toContain('SUBMITTED');
    expect(schemaContent).toContain('REOPENED');

    // Models
    expect(schemaContent).toContain('model User');
    expect(schemaContent).toContain('model Expense');
    expect(schemaContent).toContain('model RefreshSession');
    expect(schemaContent).toContain('model AuditEvent');
  });

  it('ensures managerId and assignedManagerId are nullable in schema', () => {
    const schemaContent = readFileSync(schemaPath, 'utf-8');

    // User.managerId must be optional String?
    expect(schemaContent).toMatch(/managerId\s+String\?/);

    // Expense.assignedManagerId must be optional String?
    expect(schemaContent).toMatch(/assignedManagerId\s+String\?/);

    // Expense.amountVnd must be Int
    expect(schemaContent).toMatch(/amountVnd\s+Int/);
  });

  it('exports singleton PrismaClient instance and factory', () => {
    expect(prisma).toBeDefined();
    expect(typeof createPrismaClient).toBe('function');

    const customClient = createPrismaClient(
      'postgresql://postgres:postgres@localhost:5432/expense_flow_test?schema=public'
    );
    expect(customClient).toBeDefined();
  });

  it('ensures frontend apps/web has no Prisma or database credentials', () => {
    expect(existsSync(webPkgPath)).toBe(true);

    const webPkg = JSON.parse(readFileSync(webPkgPath, 'utf-8'));
    const allDeps = {
      ...webPkg.dependencies,
      ...webPkg.devDependencies,
    };

    expect(allDeps['@prisma/client']).toBeUndefined();
    expect(allDeps['prisma']).toBeUndefined();
  });
});

