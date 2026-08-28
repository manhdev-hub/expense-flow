import pino, { type DestinationStream, type Logger, type LoggerOptions } from 'pino';
import { env } from '../config/env.js';

export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-csrf-token"]',
  'req.headers["set-cookie"]',
  'password',
  'token',
  'refreshToken',
  'csrfToken',
  'secret',
  'DATABASE_URL',
  '*.password',
  '*.token',
  '*.secret',
  '*.refreshToken',
  '*.csrfToken',
  '*.DATABASE_URL',
];

export function createLogger(
  options?: LoggerOptions,
  destination?: DestinationStream
): Logger {
  const pinoOptions: LoggerOptions = {
    level: options?.level ?? env.LOG_LEVEL,
    redact: options?.redact ?? {
      paths: REDACT_PATHS,
      censor: '[REDACTED]',
    },
    ...options,
  };

  return destination ? pino(pinoOptions, destination) : pino(pinoOptions);
}

export const logger = createLogger();

