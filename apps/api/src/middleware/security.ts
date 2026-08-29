import { type NextFunction, type Request, type Response } from 'express';
import { env } from '../config/env.js';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js';
import { prisma } from '../lib/prisma.js';
import { hashToken } from '../lib/tokens.js';

export function validateOrigin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const origin = req.headers.origin;

  // If Origin header is provided, it MUST strictly match CLIENT_ORIGIN
  if (origin && origin !== env.CLIENT_ORIGIN) {
    throw new ForbiddenError('Invalid request origin', 'INVALID_ORIGIN');
  }

  next();
}

export async function requireCsrf(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const csrfToken = req.headers['x-csrf-token'];
  const rawRefreshToken = req.cookies?.refreshToken;

  if (!csrfToken || typeof csrfToken !== 'string') {
    throw new ForbiddenError('CSRF token is missing', 'INVALID_CSRF_TOKEN');
  }

  if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
    throw new UnauthorizedError(
      'Refresh token is missing',
      'INVALID_REFRESH_TOKEN'
    );
  }

  const refreshTokenHash = hashToken(rawRefreshToken);
  const csrfTokenHash = hashToken(csrfToken);

  const session = await prisma.refreshSession.findUnique({
    where: { refreshTokenHash },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    throw new UnauthorizedError(
      'Invalid, expired, or revoked refresh session',
      'INVALID_REFRESH_TOKEN'
    );
  }

  if (session.csrfTokenHash !== csrfTokenHash) {
    throw new ForbiddenError('Invalid CSRF token', 'INVALID_CSRF_TOKEN');
  }

  next();
}

