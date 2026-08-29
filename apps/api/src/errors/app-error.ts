export interface ErrorDetails {
  fields?: Record<string, string[]>;
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetails;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: ErrorDetails
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: ErrorDetails) {
    super(400, 'BAD_REQUEST', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = 'Unauthorized',
    code = 'UNAUTHORIZED',
    details?: ErrorDetails
  ) {
    super(401, code, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = 'Forbidden',
    code = 'FORBIDDEN',
    details?: ErrorDetails
  ) {
    super(403, code, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: ErrorDetails) {
    super(404, 'NOT_FOUND', message, details);
  }
}

export class ConflictError extends AppError {
  constructor(
    message = 'Conflict occurred',
    code = 'CONFLICT',
    details?: ErrorDetails
  ) {
    super(409, code, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = 'Request validation failed',
    details?: { fields: Record<string, string[]> }
  ) {
    super(422, 'VALIDATION_ERROR', message, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details?: ErrorDetails) {
    super(500, 'INTERNAL_SERVER_ERROR', message, details);
  }
}

