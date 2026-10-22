import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LEVELS, LEVEL_VARIANTS } from '@/lib/ciphers';
import { SERVER_LEVEL_ANSWERS } from '@/lib/server-ciphers';
import {
  verifyAdminKey,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  isAuthenticatedAdmin,
} from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAuthenticatedAdmin()) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED: High Command clearance required.' },
      { status: 401 }
    );
  }

  const teams = await db.getAllTeams();
  const submissions = await db.getAllSubmissions(150);
  const isPaused = await db.isEventPaused();

  return NextResponse.json({
    teams,
    submissions,
    isPaused,
    levelCount: LEVELS.length,
    variantsCount: LEVEL_VARIANTS.length,
    answers: SERVER_LEVEL_ANSWERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, key, teamId, level, burnLevel, branch, paused } = body;

    // 1. LOGIN ACTION
    if (action === 'login') {
      if (!verifyAdminKey(key)) {
        return NextResponse.json(
          { error: 'UNAUTHORIZED: High Command clearance key rejected.' },
          { status: 401 }
        );
      }

      setAdminSessionCookie();

      const teams = await db.getAllTeams();
      const submissions = await db.getAllSubmissions(150);
      const isPaused = await db.isEventPaused();

      return NextResponse.json({
        success: true,
        teams,
        submissions,
        isPaused,
        levelCount: LEVELS.length,
        variantsCount: LEVEL_VARIANTS.length,
        answers: SERVER_LEVEL_ANSWERS,
      });
    }

    // 2. LOGOUT ACTION
    if (action === 'logout') {
      clearAdminSessionCookie();
      return NextResponse.json({ success: true, message: 'Logged out successfully.' });
    }

    // 3. ALL OTHER ADMIN OPERATIONS REQUIRE VALID ADMIN SESSION COOKIE (DO NOT ACCEPT RAW KEY)
    if (!isAuthenticatedAdmin()) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED: High Command clearance session invalid or expired.' },
        { status: 401 }
      );
    }

    if (action === 'toggle_pause') {
      const targetState = paused !== undefined ? Boolean(paused) : !(await db.isEventPaused());
      await db.setEventPaused(targetState);
      return NextResponse.json({ success: true, isPaused: targetState });
    }

    if (action === 'reset_team') {
      if (!teamId) return NextResponse.json({ error: 'Team ID required.' }, { status: 400 });
      await db.resetTeam(teamId);
      return NextResponse.json({ success: true, message: `Team ${teamId} reset to Round 1.` });
    }

    if (action === 'update_team_level') {
      if (!teamId || level === undefined) return NextResponse.json({ error: 'Team ID and level required.' }, { status: 400 });
      const lvl = Number(level);
      await db.updateProgress(teamId, { current_level: lvl });
      return NextResponse.json({ success: true, message: `Team ${teamId} set to Round ${lvl}.` });
    }

    if (action === 'update_burn_level') {
      if (!teamId || burnLevel === undefined) return NextResponse.json({ error: 'Team ID and burn level required.' }, { status: 400 });
      const bLvl = Number(burnLevel);
      await db.updateProgress(teamId, { burn_level: bLvl });
      return NextResponse.json({ success: true, message: `Team ${teamId} Burn level set to ${bLvl}.` });
    }

    if (action === 'force_branch') {
      if (!teamId || !branch) return NextResponse.json({ error: 'Team ID and branch required.' }, { status: 400 });
      await db.updateProgress(teamId, { branch });
      return NextResponse.json({ success: true, message: `Team ${teamId} branch set to ${branch}.` });
    }

    if (action === 'get_overview') {
      const teams = await db.getAllTeams();
      const submissions = await db.getAllSubmissions(150);
      const isPaused = await db.isEventPaused();
      return NextResponse.json({
        teams,
        submissions,
        isPaused,
        levelCount: LEVELS.length,
        variantsCount: LEVEL_VARIANTS.length,
        answers: SERVER_LEVEL_ANSWERS,
      });
    }

    return NextResponse.json({ error: 'Unknown admin action.' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: 'Server error handling admin request.' }, { status: 500 });
  }
}
