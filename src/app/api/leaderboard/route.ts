import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leaderboard = db.getLeaderboard();
    const isPaused = db.isEventPaused();
    return NextResponse.json({
      leaderboard,
      isPaused,
      serverTime: Date.now(),
    });
  } catch (err: unknown) {
    console.error('Leaderboard error:', err);
    return NextResponse.json({ error: 'Failed to retrieve leaderboard telemetry.' }, { status: 500 });
  }
}
