import { PrismaClient } from '@prisma/client';
import { seedUsers } from '../src/lib/seed.js';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('[ExpenseFlow Seed] Starting idempotent demo seed...');
    const result = await seedUsers(prisma);
    console.log(
      `[ExpenseFlow Seed] Successfully seeded 5 demo accounts:\n` +
        `  - Manager 1: ${result.manager1.email} (${result.manager1.id})\n` +
        `  - Manager 2: ${result.manager2.email} (${result.manager2.id})\n` +
        `  - Employee 1: ${result.employee1.email} -> Manager 1\n` +
        `  - Employee 2: ${result.employee2.email} -> Manager 2\n` +
        `  - Employee Unassigned: ${result.employeeUnassigned.email} -> No Manager`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('[ExpenseFlow Seed] Failed:', e);
  process.exit(1);
});
