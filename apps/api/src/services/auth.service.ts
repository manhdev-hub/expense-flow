import { env } from '../config/env.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { signAccessToken } from '../lib/jwt.js';
import { verifyPassword } from '../lib/password.js';
import { prisma } from '../lib/prisma.js';
import { generateSecureToken, hashToken } from '../lib/tokens.js';

export interface SessionOptions {
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

export interface RefreshResult {
  accessToken: string;
  expiresInSeconds: number;
  csrfToken: string;
  rawRefreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'EMPLOYEE' | 'MANAGER';
  managerId: string | null;
}

export async function loginUser(
  email: string,
  password: string,
  options: SessionOptions = {}
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

export async function refreshSession(
  rawRefreshToken: string,
  options: SessionOptions = {}
): Promise<RefreshResult> {
  if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
    throw new UnauthorizedError('Refresh token is required', 'INVALID_REFRESH_TOKEN');
  }

  const refreshTokenHash = hashToken(rawRefreshToken);

  const session = await prisma.refreshSession.findUnique({
    where: { refreshTokenHash },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    throw new UnauthorizedError(
      'Invalid, expired, or revoked refresh token',
      'INVALID_REFRESH_TOKEN'
    );
  }

  if (!session.user.isActive) {
    throw new UnauthorizedError('Account is inactive', 'ACCOUNT_INACTIVE');
  }

  // Token Rotation: Generate new token pair
  const newRawRefreshToken = generateSecureToken();
  const newRawCsrfToken = generateSecureToken();

  const newRefreshTokenHash = hashToken(newRawRefreshToken);
  const newCsrfTokenHash = hashToken(newRawCsrfToken);

  // Update session with new rotated hashes
  await prisma.refreshSession.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: newRefreshTokenHash,
      csrfTokenHash: newCsrfTokenHash,
      lastUsedAt: new Date(),
      ipAddress: options.ipAddress ?? session.ipAddress,
      userAgent: options.userAgent ?? session.userAgent,
    },
  });

  // Sign new 15-minute access token
  const accessToken = signAccessToken({
    sub: session.user.id,
    role: session.user.role,
    name: session.user.name,
  });

  return {
    accessToken,
    expiresInSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
    csrfToken: newRawCsrfToken,
    rawRefreshToken: newRawRefreshToken,
  };
}

export async function logoutSession(rawRefreshToken: string): Promise<void> {
  if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
    return;
  }

  const refreshTokenHash = hashToken(rawRefreshToken);

  const session = await prisma.refreshSession.findUnique({
    where: { refreshTokenHash },
  });

  if (session && !session.revokedAt) {
    await prisma.refreshSession.update({
      where: { id: session.id },
      data: {
        revokedAt: new Date(),
        revokedReason: 'USER_LOGOUT',
      },
    });
  }
}

export async function revokeAllUserSessions(
  userId: string,
  reason = 'SECURITY_REVOCATION'
): Promise<void> {
  await prisma.refreshSession.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
}

export async function getCurrentUser(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      managerId: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('User not found or inactive', 'UNAUTHORIZED');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    managerId: user.managerId,
  };
}
