import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ success: true, message: 'Logged out from Hut 99 terminal.' });
}
