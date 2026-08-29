import { type NextFunction, type Request, type Response } from 'express';
import { UnauthorizedError } from '../errors/app-error.js';
import { verifyAccessToken } from '../lib/jwt.js';

export interface AuthenticatedUser {
  id: string;
  role: 'EMPLOYEE' | 'MANAGER';
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError(
      'Access token is required',
      'UNAUTHORIZED'
    );
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    throw new UnauthorizedError(
      'Access token is missing',
      'UNAUTHORIZED'
    );
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      name: payload.name,
    };
    next();
  } catch {
    throw new UnauthorizedError(
      'Invalid or expired access token',
      'UNAUTHORIZED'
    );
  }
}

