import { randomBytes } from 'crypto';

import bcrypt from 'bcryptjs';

import { SESSION_DAYS } from './constants';

export { SESSION_COOKIE, ORG_COOKIE, SESSION_DAYS } from './constants';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function getSessionExpiry(): Date {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  return expires;
}
