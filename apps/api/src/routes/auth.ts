import { loginSchema } from '@expense-flow/shared';
import { type CookieOptions, type Request, type Response, Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import { UnauthorizedError, ValidationError } from '../errors/app-error.js';
import { requireAuth } from '../middleware/auth-middleware.js';
import {
  getCurrentUser,
  loginUser,
  logoutSession,
  refreshSession,
} from '../services/auth.service.js';

export const authRouter: Router = Router();

export function getRefreshCookieOptions(): CookieOptions {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/api/v1/auth',
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Max 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test', // Skip in test environment
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts, please try again later',
    },
  },
});

authRouter.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const fields: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const fieldPath = issue.path.join('.') || '_root';
      if (!fields[fieldPath]) {
        fields[fieldPath] = [];
      }
      fields[fieldPath].push(issue.message);
    }
    throw new ValidationError('Invalid login request parameters', { fields });
  }

  const { email, password } = parsed.data;
  const ipAddress = req.ip || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const result = await loginUser(email, password, { ipAddress, userAgent });

  // Set HttpOnly refresh token cookie
  res.cookie('refreshToken', result.rawRefreshToken, getRefreshCookieOptions());

  // Return access token, CSRF token, and user info (without refresh token in body)
  return res.status(200).json({
    data: {
      accessToken: result.accessToken,
      expiresInSeconds: result.expiresInSeconds,
      csrfToken: result.csrfToken,
      user: result.user,
    },
  });
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) {
    throw new UnauthorizedError('Refresh token cookie is missing', 'INVALID_REFRESH_TOKEN');
  }

  const ipAddress = req.ip || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const result = await refreshSession(rawRefreshToken, { ipAddress, userAgent });

  // Set new rotated HttpOnly refresh token cookie
  res.cookie('refreshToken', result.rawRefreshToken, getRefreshCookieOptions());

  return res.status(200).json({
    data: {
      accessToken: result.accessToken,
      expiresInSeconds: result.expiresInSeconds,
      csrfToken: result.csrfToken,
    },
  });
});

authRouter.post('/logout', async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (rawRefreshToken) {
    await logoutSession(rawRefreshToken);
  }

  // Clear refresh token cookie on client
  res.clearCookie('refreshToken', getRefreshCookieOptions());

  return res.status(200).json({
    data: {
      message: 'Logged out successfully',
    },
  });
});

authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user!.id);

  return res.status(200).json({
    data: {
      user,
    },
  });
});
