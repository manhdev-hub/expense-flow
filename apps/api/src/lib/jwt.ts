import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: 'EMPLOYEE' | 'MANAGER';
  name: string;
}

export function signAccessToken(
  payload: Omit<AccessTokenPayload, 'iat' | 'exp'>,
  options?: SignOptions
): string {
  const expiresIn = options?.expiresIn ?? env.ACCESS_TOKEN_TTL_SECONDS;
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn,
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'],
  });
  return decoded as AccessTokenPayload;
}

