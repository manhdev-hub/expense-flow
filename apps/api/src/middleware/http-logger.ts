import { pinoHttp } from 'pino-http';
import { logger } from '../lib/logger.js';

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => (req as any).id || (req.headers['x-request-id'] as string) || undefined,
});
