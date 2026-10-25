import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CachedLeaderboardData {
  leaderboard: any;
  isPaused: boolean;
  serverTime: number;
}

let cachedData: CachedLeaderboardData | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 3000; // 3 seconds in-memory TTL prevents Supabase / SQLite overload under 100 teams

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(req: Request) {
  const now = Date.now();
  let isSync = false;

  try {
    const { searchParams } = new URL(req.url);
    isSync = searchParams.get('sync') === 'true' || searchParams.get('force') === 'true';
  } catch {
    // URL parse fallback
  }

  // Return cached result if valid and not an explicit sync/force refresh
  if (!isSync && cachedData && now - lastFetchTime < CACHE_TTL_MS) {
    return NextResponse.json(
      {
        ...cachedData,
        serverTime: now,
      },
      {
        headers: {
          'X-Cache': 'HIT',
          ...NO_CACHE_HEADERS,
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
        'X-Cache': isSync ? 'BYPASS' : 'MISS',
        ...NO_CACHE_HEADERS,
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
            ...NO_CACHE_HEADERS,
          },
        }
      );
    }

    return NextResponse.json(
      { error: 'Failed to retrieve leaderboard telemetry.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
