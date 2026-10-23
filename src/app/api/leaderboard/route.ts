import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface CachedLeaderboardData {
  leaderboard: any;
  isPaused: boolean;
  serverTime: number;
}

let cachedData: CachedLeaderboardData | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 3000; // 3 seconds in-memory TTL prevents Supabase / SQLite overload under 100 teams

export async function GET() {
  const now = Date.now();

  // Return cached result if valid
  if (cachedData && now - lastFetchTime < CACHE_TTL_MS) {
    return NextResponse.json(
      {
        ...cachedData,
        serverTime: now,
      },
      {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=5',
        },
      }
    );
  }

  try {
    const leaderboard = await db.getLeaderboard();
    const isPaused = await db.isEventPaused();

    cachedData = {
      leaderboard,
      isPaused,
      serverTime: now,
    };
    lastFetchTime = now;

    return NextResponse.json(cachedData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=5',
      },
    });
  } catch (err: unknown) {
    console.error('Leaderboard error:', err);

    // If database temporarily errors or times out under peak burst, return last cached snapshot rather than crashing
    if (cachedData) {
      return NextResponse.json(
        {
          ...cachedData,
          serverTime: now,
          warning: 'Serving cached leaderboard due to database pressure.',
        },
        {
          headers: {
            'X-Cache': 'STALE',
          },
        }
      );
    }

    return NextResponse.json({ error: 'Failed to retrieve leaderboard telemetry.' }, { status: 500 });
  }
}
