import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export type AccessPayload = { sub: string; email: string };

export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function signAccess(payload: AccessPayload): string {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.accessTtlSec,
    algorithm: 'HS256',
  });
}

export function verifyAccess(token: string): AccessPayload {
  const decoded = jwt.verify(token, config.jwtAccessSecret, { algorithms: ['HS256'] });
  if (typeof decoded !== 'object' || decoded === null || !('sub' in decoded) || !('email' in decoded)) {
    throw new Error('Invalid token payload');
  }
  return { sub: String((decoded as { sub: unknown }).sub), email: String((decoded as { email: unknown }).email) };
}

export function signRefreshOpaque(): string {
  return crypto.randomBytes(48).toString('base64url');
}
