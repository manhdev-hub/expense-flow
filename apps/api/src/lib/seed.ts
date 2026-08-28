import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from './password.js';

export const DEFAULT_DEMO_PASSWORD =
  process.env.DEMO_DEFAULT_PASSWORD || 'Password123456!';

export interface SeedConfig {
  defaultPassword?: string;
  manager1Email?: string;
  manager2Email?: string;
  employee1Email?: string;
  employee2Email?: string;
  unassignedEmail?: string;
}

export async function seedUsers(
  prisma: PrismaClient,
  config: SeedConfig = {}
) {
  const password = config.defaultPassword || DEFAULT_DEMO_PASSWORD;
  const passwordHash = await hashPassword(password);

  const manager1Email = config.manager1Email || 'manager1@example.com';
  const manager2Email = config.manager2Email || 'manager2@example.com';
  const employee1Email = config.employee1Email || 'employee1@example.com';
  const employee2Email = config.employee2Email || 'employee2@example.com';
  const unassignedEmail =
    config.unassignedEmail || 'employee_unassigned@example.com';

  // 1. Upsert Manager 1
  const manager1 = await prisma.user.upsert({
    where: { email: manager1Email },
    update: {
      name: 'Demo Manager 1',
      role: Role.MANAGER,
      passwordHash,
      isActive: true,
    },
    create: {
      email: manager1Email,
      name: 'Demo Manager 1',
      role: Role.MANAGER,
      passwordHash,
      isActive: true,
      managerId: null,
    },
  });

  // 2. Upsert Manager 2
  const manager2 = await prisma.user.upsert({
    where: { email: manager2Email },
    update: {
      name: 'Demo Manager 2',
      role: Role.MANAGER,
      passwordHash,
      isActive: true,
    },
    create: {
      email: manager2Email,
      name: 'Demo Manager 2',
      role: Role.MANAGER,
      passwordHash,
      isActive: true,
      managerId: null,
    },
  });

  // 3. Upsert Employee 1 (Assigned to Manager 1)
  const employee1 = await prisma.user.upsert({
    where: { email: employee1Email },
    update: {
      name: 'Demo Employee 1',
      role: Role.EMPLOYEE,
      managerId: manager1.id,
      passwordHash,
      isActive: true,
    },
    create: {
      email: employee1Email,
      name: 'Demo Employee 1',
      role: Role.EMPLOYEE,
      managerId: manager1.id,
      passwordHash,
      isActive: true,
    },
  });

  // 4. Upsert Employee 2 (Assigned to Manager 2)
  const employee2 = await prisma.user.upsert({
    where: { email: employee2Email },
    update: {
      name: 'Demo Employee 2',
      role: Role.EMPLOYEE,
      managerId: manager2.id,
      passwordHash,
      isActive: true,
    },
    create: {
      email: employee2Email,
      name: 'Demo Employee 2',
      role: Role.EMPLOYEE,
      managerId: manager2.id,
      passwordHash,
      isActive: true,
    },
  });

  // 5. Upsert Employee Unassigned (managerId is null)
  const employeeUnassigned = await prisma.user.upsert({
    where: { email: unassignedEmail },
    update: {
      name: 'Demo Employee Unassigned',
      role: Role.EMPLOYEE,
      managerId: null,
      passwordHash,
      isActive: true,
    },
    create: {
      email: unassignedEmail,
      name: 'Demo Employee Unassigned',
      role: Role.EMPLOYEE,
      managerId: null,
      passwordHash,
      isActive: true,
    },
  });

  return {
    manager1,
    manager2,
    employee1,
    employee2,
    employeeUnassigned,
  };
}

