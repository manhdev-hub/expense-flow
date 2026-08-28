import { type NextFunction, type Request, type Response } from 'express';
import { type ZodType, ZodError } from 'zod';
import { ValidationError } from '../errors/app-error.js';

export interface RequestValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export function validateRequest(schemas: RequestValidationSchemas) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as any;
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as any;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fields: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.') || '_root';
          if (!fields[path]) {
            fields[path] = [];
          }
          fields[path].push(issue.message);
        }
        next(new ValidationError('Request validation failed', { fields }));
        return;
      }
      next(error);
    }
  };
}

