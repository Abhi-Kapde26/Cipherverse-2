import crypto from 'node:crypto';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.SESSION_SECRET || 'cold-war-unit-404-super-classified-secret-key-1943';
export const ADMIN_COOKIE_NAME = 'janus_admin_session';
export const ADMIN_SESSION_DURATION_SEC = 2 * 60 * 60; // 2 hours

export interface AdminSessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Constant-time comparison of the candidate key against the configured ADMIN_KEY / ADMIN_PASSWORD.
 * Uses SHA-256 digests to ensure timingSafeEqual compares equal-length buffers in constant time.
 */
export function verifyAdminKey(candidateKey?: string): boolean {
  const secretKey = process.env.ADMIN_KEY || process.env.ADMIN_PASSWORD;
  if (!secretKey || !candidateKey || typeof candidateKey !== 'string') {
    return false;
  }

  const candidateHash = crypto.createHash('sha256').update(candidateKey).digest();
  const secretHash = crypto.createHash('sha256').update(secretKey).digest();

  return crypto.timingSafeEqual(candidateHash, secretHash);
}

/**
 * Signs and sets a secure httpOnly sameSite=strict admin session cookie.
 */
export function setAdminSessionCookie(): void {
  const now = Date.now();
  const expiresAt = now + ADMIN_SESSION_DURATION_SEC * 1000;
  const payload: AdminSessionPayload = {
    role: 'admin',
    iat: now,
    exp: expiresAt,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  const token = `${payloadBase64}.${signature}`;

  const cookieStore = cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_DURATION_SEC,
  });
}

/**
 * Clears the admin session cookie upon logout.
 */
export function clearAdminSessionCookie(): void {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Verifies the admin session cookie.
 * Ensures the HMAC signature is valid and the session is not expired.
 */
export function isAuthenticatedAdmin(): boolean {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return false;

    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return false;

    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return false;
    }

    const payload: AdminSessionPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf-8')
    );

    if (payload.role !== 'admin') return false;
    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}
