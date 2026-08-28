import { type Request, type Response } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  const requestId = String(req.id || (req.headers['x-request-id'] as string) || '');

  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl || req.url}`,
      requestId,
    },
  });
}
