import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormProps, type UseFormReturn, type FieldValues } from 'react-hook-form';
import { z } from 'zod';

/**
 * Standard convention helper for creating forms validated with Zod schemas.
 * Frontend forms MUST use React Hook Form + Zod resolvers.
 */
export function useZodForm<TSchema extends z.ZodTypeAny, TContext = any>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>, TContext>, 'resolver'>
): UseFormReturn<z.infer<TSchema>, TContext> {
  return useForm<z.infer<TSchema>, TContext>({
    ...options,
    resolver: zodResolver(schema),
  });
}

export { zodResolver, z };

