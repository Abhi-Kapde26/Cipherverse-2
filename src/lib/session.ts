import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { db, TeamRecord, ProgressRecord } from './db';

const SESSION_SECRET = process.env.SESSION_SECRET || 'cold-war-unit-404-super-classified-secret-key-1943';
const COOKIE_NAME = 'janus_session';

export interface SessionData {
  teamId: string;
  teamName: string;
  createdAt: number;
}

export function signSession(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySession(token: string): SessionData | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return decoded as SessionData;
  } catch {
    return null;
  }
}

export function getCurrentSession(): SessionData | null {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function getAuthenticatedTeam(): { team: TeamRecord; progress: ProgressRecord } | null {
  const session = getCurrentSession();
  if (!session) return null;

  const team = db.getTeamById(session.teamId);
  if (!team) return null;

  const progress = db.getProgress(team.id);
  if (!progress) return null;

  return { team, progress };
}

export function setSessionCookie(data: SessionData) {
  const token = signSession(data);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
