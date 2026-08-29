import { env } from '../config/env.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { signAccessToken } from '../lib/jwt.js';
import { verifyPassword } from '../lib/password.js';
import { prisma } from '../lib/prisma.js';
import { generateSecureToken, hashToken } from '../lib/tokens.js';

export interface LoginOptions {
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResult {
  accessToken: string;
  expiresInSeconds: number;
  csrfToken: string;
  rawRefreshToken: string;
  user: {
    id: string;
    role: 'EMPLOYEE' | 'MANAGER';
    name: string;
  };
}

export async function loginUser(
  email: string,
  password: string,
  options: LoginOptions = {}
): Promise<LoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account is inactive', 'ACCOUNT_INACTIVE');
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // 1. Sign 15-minute JWT Access Token
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    name: user.name,
  });

  // 2. Generate raw tokens
  const rawRefreshToken = generateSecureToken();
  const rawCsrfToken = generateSecureToken();

  // 3. Compute SHA-256 hashes
  const refreshTokenHash = hashToken(rawRefreshToken);
  const csrfTokenHash = hashToken(rawCsrfToken);

  // 4. Calculate session expiration date
  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  // 5. Persist RefreshSession in database
  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      csrfTokenHash,
      expiresAt,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    },
  });

  return {
    accessToken,
    expiresInSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
    csrfToken: rawCsrfToken,
    rawRefreshToken,
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
    },
  };
}

