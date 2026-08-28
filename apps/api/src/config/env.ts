import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  CLIENT_ORIGIN: z.string().min(1).default('http://localhost:3000'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .optional(),
  DATABASE_URL: z
    .string()
    .min(1)
    .default('postgresql://postgres:postgres@localhost:5432/expense_flow_dev?schema=public'),
  TEST_DATABASE_URL: z
    .string()
    .min(1)
    .default('postgresql://postgres:postgres@localhost:5432/expense_flow_test?schema=public'),
});

export type RawEnv = z.input<typeof envSchema>;
export type Env = z.infer<typeof envSchema> & {
  LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
};

export function validateEnv(rawEnv: Record<string, unknown> = process.env): Env {
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`[ExpenseFlow Config] Invalid environment configuration:\n${formattedErrors}`);
  }

  const data = result.data;
  const logLevel =
    data.LOG_LEVEL ?? (data.NODE_ENV === 'test' ? 'silent' : 'info');

  return {
    ...data,
    LOG_LEVEL: logLevel,
  };
}

export const env = validateEnv();

