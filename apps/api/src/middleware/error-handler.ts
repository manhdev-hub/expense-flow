import { type NextFunction, type Request, type Response } from 'express';
import { AppError } from '../errors/app-error.js';
import { logger } from '../lib/logger.js';

interface StandardErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId: string;
  };
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = String(req.id || (req.headers['x-request-id'] as string) || '');

  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected internal server error occurred';
  let details: Record<string, unknown> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (
    err instanceof SyntaxError &&
    'status' in err &&
    err.status === 400 &&
    'body' in err
  ) {
    statusCode = 400;
    code = 'MALFORMED_JSON';
    message = 'Malformed JSON in request body';
  } else if (
    typeof err === 'object' &&
    err !== null &&
    ('type' in err || 'status' in err) &&
    ((err as Record<string, unknown>).type === 'entity.too.large' ||
      (err as Record<string, unknown>).status === 413)
  ) {
    statusCode = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request payload exceeds size limit';
  }

  // Safe logging without exposing secrets or untrusted data to clients
  const log = req.log ?? logger;
  if (statusCode >= 500) {
    log.error({ err, requestId, statusCode, code }, message);
  } else {
    log.warn({ err, requestId, statusCode, code }, message);
  }

  const responseBody: StandardErrorEnvelope = {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      requestId,
    },
  };

  res.status(statusCode).json(responseBody);
}
