import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validatePassword, verifyPassword } from './password.js';
import { DEFAULT_DEMO_PASSWORD, seedUsers } from './seed.js';

describe('Idempotent Demo Seed Foundation', () => {
  const apiDir = resolve(__dirname, '../../');
  const seedPath = resolve(apiDir, 'prisma/seed.ts');
  const pkgPath = resolve(apiDir, 'package.json');

  it('provides seed.ts file and valid default demo password', () => {
    expect(existsSync(seedPath)).toBe(true);

    const validation = validatePassword(DEFAULT_DEMO_PASSWORD);
    expect(validation.isValid).toBe(true);
  });

  it('configures db:seed in apps/api/package.json', () => {
    expect(existsSync(pkgPath)).toBe(true);

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    expect(pkg.scripts['db:seed']).toBe('tsx prisma/seed.ts');
  });

  it('verifies seed logic mapping and relations with mock PrismaClient', async () => {
    const mockUsers = new Map<string, any>();

    const mockPrisma: any = {
      user: {
        upsert: async ({ where, update, create }: any) => {
          const email = where.email;
          const existing = mockUsers.get(email);
          if (existing) {
            const updated = { ...existing, ...update, id: existing.id };
            mockUsers.set(email, updated);
            return updated;
          }
          const id = `user-${mockUsers.size + 1}`;
          const created = { id, ...create };
          mockUsers.set(email, created);
          return created;
        },
      },
    };

    // First seed run
    const result1 = await seedUsers(mockPrisma, {
      defaultPassword: 'CustomDemoPassword123!',
    });

    expect(result1.manager1.role).toBe('MANAGER');
    expect(result1.manager1.managerId).toBeNull();

    expect(result1.manager2.role).toBe('MANAGER');
    expect(result1.manager2.managerId).toBeNull();

    expect(result1.employee1.role).toBe('EMPLOYEE');
    expect(result1.employee1.managerId).toBe(result1.manager1.id);

    expect(result1.employee2.role).toBe('EMPLOYEE');
    expect(result1.employee2.managerId).toBe(result1.manager2.id);

    expect(result1.employeeUnassigned.role).toBe('EMPLOYEE');
    expect(result1.employeeUnassigned.managerId).toBeNull();

    expect(mockUsers.size).toBe(5);

    // Verify hashed password is valid Argon2id
    const isPasswordValid = await verifyPassword(
      result1.manager1.passwordHash,
      'CustomDemoPassword123!'
    );
    expect(isPasswordValid).toBe(true);

    // Second seed run (Testing Idempotency)
    const result2 = await seedUsers(mockPrisma, {
      defaultPassword: 'CustomDemoPassword123!',
    });

    expect(mockUsers.size).toBe(5); // Still 5 users, no duplicates
    expect(result2.manager1.id).toBe(result1.manager1.id);
    expect(result2.employee1.id).toBe(result1.employee1.id);
  });
});
